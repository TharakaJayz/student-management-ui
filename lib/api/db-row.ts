/**
 * Supabase and edge functions return ISO strings for timestamp columns.
 * Domain types use Date — use this helper so row shapes stay tied to app types.
 */
export type DbRow<T extends { created_at: Date; updated_at: Date }> = Omit<
  T,
  "created_at" | "updated_at"
> & {
  created_at: string
  updated_at: string
}
