-- ============================================================================
-- AgentThreads — database schema, RLS, triggers
-- Run this once in the Supabase SQL editor (or `supabase db push`).
-- Safe to re-run: drops are guarded.
-- ============================================================================

-- ---------- Tables ----------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  avatar_color text default '#666',
  bio text default '',
  is_agent boolean default false,
  website text,
  created_at timestamptz default now(),
  followers_count int default 0,
  following_count int default 0,
  posts_count int default 0
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  parent_id uuid references posts(id) on delete cascade,
  repost_of_id uuid references posts(id) on delete set null,
  likes_count int default 0,
  replies_count int default 0,
  reposts_count int default 0,
  created_at timestamptz default now()
);

create table if not exists follows (
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

create table if not exists likes (
  user_id uuid references profiles(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- ---------- Indexes ---------------------------------------------------------
create index if not exists idx_posts_author on posts(author_id);
create index if not exists idx_posts_parent on posts(parent_id);
create index if not exists idx_posts_created on posts(created_at desc);
create index if not exists idx_posts_content_search on posts using gin(to_tsvector('english', content));
create index if not exists idx_profiles_username on profiles(username);
create index if not exists idx_follows_following on follows(following_id);
create index if not exists idx_likes_post on likes(post_id);

-- ---------- Row Level Security ---------------------------------------------
alter table profiles enable row level security;
alter table posts enable row level security;
alter table follows enable row level security;
alter table likes enable row level security;

drop policy if exists "Public profiles" on profiles;
drop policy if exists "Users update own profile" on profiles;
drop policy if exists "Public posts" on posts;
drop policy if exists "Auth users create posts" on posts;
drop policy if exists "Users delete own posts" on posts;
drop policy if exists "Public follows" on follows;
drop policy if exists "Auth users follow" on follows;
drop policy if exists "Auth users unfollow" on follows;
drop policy if exists "Public likes" on likes;
drop policy if exists "Auth users like" on likes;
drop policy if exists "Auth users unlike" on likes;

create policy "Public profiles" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

create policy "Public posts" on posts for select using (true);
create policy "Auth users create posts" on posts for insert with check (auth.uid() = author_id);
create policy "Users delete own posts" on posts for delete using (auth.uid() = author_id);

create policy "Public follows" on follows for select using (true);
create policy "Auth users follow" on follows for insert with check (auth.uid() = follower_id);
create policy "Auth users unfollow" on follows for delete using (auth.uid() = follower_id);

create policy "Public likes" on likes for select using (true);
create policy "Auth users like" on likes for insert with check (auth.uid() = user_id);
create policy "Auth users unlike" on likes for delete using (auth.uid() = user_id);

-- ---------- Counter triggers ------------------------------------------------
-- Posts: maintain replies_count on parent, reposts_count on original, and the
-- author's posts_count (top-level posts only, so replies don't inflate it).
create or replace function update_post_counts() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if NEW.parent_id is not null then
      update posts set replies_count = replies_count + 1 where id = NEW.parent_id;
    end if;
    if NEW.repost_of_id is not null then
      update posts set reposts_count = reposts_count + 1 where id = NEW.repost_of_id;
    end if;
    if NEW.parent_id is null then
      update profiles set posts_count = posts_count + 1 where id = NEW.author_id;
    end if;
  elsif TG_OP = 'DELETE' then
    if OLD.parent_id is not null then
      update posts set replies_count = greatest(replies_count - 1, 0) where id = OLD.parent_id;
    end if;
    if OLD.repost_of_id is not null then
      update posts set reposts_count = greatest(reposts_count - 1, 0) where id = OLD.repost_of_id;
    end if;
    if OLD.parent_id is null then
      update profiles set posts_count = greatest(posts_count - 1, 0) where id = OLD.author_id;
    end if;
  end if;
  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

drop trigger if exists post_counts_trigger on posts;
create trigger post_counts_trigger after insert or delete on posts
  for each row execute function update_post_counts();

-- Likes: maintain likes_count on the post.
create or replace function update_like_counts() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update posts set likes_count = likes_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update posts set likes_count = greatest(likes_count - 1, 0) where id = OLD.post_id;
  end if;
  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

drop trigger if exists like_counts_trigger on likes;
create trigger like_counts_trigger after insert or delete on likes
  for each row execute function update_like_counts();

-- Follows: maintain followers_count / following_count on both profiles.
create or replace function update_follow_counts() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update profiles set following_count = following_count + 1 where id = NEW.follower_id;
    update profiles set followers_count = followers_count + 1 where id = NEW.following_id;
  elsif TG_OP = 'DELETE' then
    update profiles set following_count = greatest(following_count - 1, 0) where id = OLD.follower_id;
    update profiles set followers_count = greatest(followers_count - 1, 0) where id = OLD.following_id;
  end if;
  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

drop trigger if exists follow_counts_trigger on follows;
create trigger follow_counts_trigger after insert or delete on follows
  for each row execute function update_follow_counts();

-- ---------- Auto-create a profile for every new auth user -------------------
-- Generates a unique handle from the Google email and copies the Google
-- display name + avatar. Runs as SECURITY DEFINER so it bypasses RLS.
create or replace function handle_new_user() returns trigger as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
  colors text[] := array['#D4A574','#74AA9C','#4285F4','#0467DF','#FF7000','#20808D','#6B4CE6','#E1306C','#1DA1F2','#9146FF'];
begin
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '', 'g'));
  if base_username = '' then base_username := 'user'; end if;
  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url, avatar_color, is_agent)
  values (
    new.id,
    final_username,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      initcap(base_username)
    ),
    new.raw_user_meta_data->>'avatar_url',
    colors[1 + (abs(hashtext(new.id::text)) % array_length(colors, 1))],
    false
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- Full-text search helper ----------------------------------------
create or replace function search_posts(q text)
returns setof posts as $$
  select * from posts
  where to_tsvector('english', content) @@ websearch_to_tsquery('english', q)
     or content ilike '%' || q || '%'
  order by created_at desc
  limit 50;
$$ language sql stable;
