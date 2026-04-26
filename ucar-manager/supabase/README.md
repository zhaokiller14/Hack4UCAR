# Supabase Database Notes

This directory contains Supabase migration files and schema documentation.

## Files

- `migrations/`: SQL migrations managed by Supabase CLI.
- `SCHEMA.md`: Table-level schema notes for UCAR Manager.

## Upload + AI Ingestion Backend Contract

The backend upload operation persists metadata to `raw_uploads` after uploading file bytes to S3.

Route:
- `POST /api/uploads/raw`

Auth and authorization:
- Requires authenticated user.
- Role guard is applied in route code.
- Institution-scoped roles can only upload for their own `institution_id`.

Input (`multipart/form-data`):
- `file` (required)
- `institution_id` (required)
- `domain` (optional)

Side effects:
1. Upload file bytes to S3-compatible storage.
2. Insert metadata row into `raw_uploads`.

AI integration status:
- TODO placeholders are intentionally left for triggering extraction endpoints and updating extraction lifecycle tables (`extracted_records`).
