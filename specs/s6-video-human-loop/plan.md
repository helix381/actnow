# S6 Plan

## Frontend

- Video node displays waiting_upload/completed/failed.
- Prompt package panel includes keyframe/reference assets.
- Upload dialog accepts video files and manifest.

## Backend

- Reuse GenerationTask flow with `gen_type=video`.
- Validate video extension, size, task state, and optional manifest.
- Store GeneratedFile with file_type `video`.
- Append events.

## Dependencies

- S5 keyframe file optional but recommended.
- S3/MinIO storage.
