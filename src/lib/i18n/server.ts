import { cookies } from "next/headers";
import { LOCALES, type Locale } from "./dictionaries";

const STORAGE_KEY = "agentthreads-locale";

/** Reads the locale pinned in the cookie (set client-side), defaulting to en. */
export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(STORAGE_KEY)?.value as Locale | undefined;
  return value && (LOCALES as readonly string[]).includes(value) ? value : "en";
}
