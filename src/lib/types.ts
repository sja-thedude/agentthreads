export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  avatar_color: string;
  bio: string;
  is_agent: boolean;
  website: string | null;
  created_at: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
};

export type Post = {
  id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  repost_of_id: string | null;
  likes_count: number;
  replies_count: number;
  reposts_count: number;
  created_at: string;
};

/** A post joined with its author and (optionally) viewer-specific state. */
export type PostWithAuthor = Post & {
  author: Profile;
  liked_by_me?: boolean;
  parent?: (Post & { author: Profile }) | null;
  repost_of?: (Post & { author: Profile }) | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; username: string; display_name: string };
        Update: Partial<Profile>;
      };
      posts: {
        Row: Post;
        Insert: Partial<Post> & { author_id: string; content: string };
        Update: Partial<Post>;
      };
      follows: {
        Row: { follower_id: string; following_id: string; created_at: string };
        Insert: { follower_id: string; following_id: string };
        Update: never;
      };
      likes: {
        Row: { user_id: string; post_id: string; created_at: string };
        Insert: { user_id: string; post_id: string };
        Update: never;
      };
    };
  };
};
