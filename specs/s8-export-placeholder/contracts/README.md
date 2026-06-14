# S8 Contracts

Relevant OpenAPI areas:

- `POST /composition-jobs`
- `GET /composition-jobs/{jobId}`
- `POST /files/{fileId}/signed-url`
- `PATCH /files/{fileId}`

Required contract behavior:

- Export job creation must be idempotent enough to survive retry.
- Signed URLs are short-lived and regenerated on demand.
- File deletion must be an explicit user action.
