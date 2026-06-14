# S5 Plan

## Frontend

- Keyframe node shows task status.
- Prompt package panel supports copy/export.
- Upload dialog supports files and optional manifest.

## Backend

- Implement `POST /generation-tasks`.
- Generate prompt package.
- Validate upload by task state, file type, count, manifest.
- Store generated_files.
- Append generation and upload events.

## Dependencies

- S3 assets.
- S4 shots.
- BullMQ/Redis available for task execution path.
