/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL (or use `SUPABASE_URL` with `envPrefix`). */
  readonly VITE_SUPABASE_URL?: string;
  readonly SUPABASE_URL?: string;
  /** Public anon key (or use `SUPABASE_ANON_KEY` / `SUPABASE_PUBLISHABLE_KEY`). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly SUPABASE_ANON_KEY?: string;
  readonly SUPABASE_PUBLISHABLE_KEY?: string;
  /** If set, `/` redirects to `/{handle}` for the public feed. */
  readonly VITE_DEFAULT_CREATOR_HANDLE?: string;
  /** Optional: higher Microlink rate limits for auto thumbnails (see microlink.io) */
  readonly VITE_MICROLINK_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
