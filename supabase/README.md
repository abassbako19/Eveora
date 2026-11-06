# Existing Eveora Supabase project

This app is being connected to the user's existing Supabase project. Inspection confirmed that
`public.profiles` already exists with these columns:

- `id` (uuid)
- `display_name` (text, required)
- `country` (text, optional)
- `created_at` (timestamp with time zone)
- `username` (text, optional)

The existing project also already has owner-scoped SELECT, INSERT, and UPDATE RLS policies
and an `auth.users` trigger named `on_auth_user_created`. That trigger reads
`raw_user_meta_data.display_name` and creates/updates the matching profile row.

**Do not run a new profile-table schema migration for this starter.** It would conflict with
the existing table and could break signup. The signup page now supplies `display_name` to
match the existing trigger. No existing tables, policies, triggers, users, or rows are changed
by this application starter.
