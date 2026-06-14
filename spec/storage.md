# Storage Spec

## Object Storage

Use S3-compatible object storage. Local/dev can use MinIO under Docker Compose. Production can move to any S3-compatible provider without changing business data.

| File Type | Bucket/Directory | Key Rule | Metadata | Access | Lifecycle |
| --- | --- | --- | --- | --- | --- |
| Uploaded scripts | `uploads/scripts/` | `projects/{project_id}/scripts/{file_id}.{ext}` | asset_id, project_id, checksum | private signed URL | keep |
| Reference images | `uploads/references/` | `projects/{project_id}/references/{asset_id}/{file_name}` | asset_id, type, checksum | private signed URL | keep |
| Panorama assets | `assets/panoramas/` | `projects/{project_id}/panoramas/{asset_id}/{version}.{ext}` | asset_id, projection, model_meta | private signed URL | keep |
| Keyframe results | `generated/keyframes/` | `projects/{project_id}/tasks/{task_id}/v{version}.{ext}` | task_id, shot_id, checksum, model_meta | private signed URL | keep until user deletes |
| Video results | `generated/videos/` | `projects/{project_id}/tasks/{task_id}/v{version}.{ext}` | task_id, shot_id, checksum, model_meta | private signed URL | keep until user deletes |
| Exported films | `exports/` | `projects/{project_id}/exports/{export_id}/v{version}.{ext}` | export_id, episode_id, checksum | private signed URL | keep until user deletes |
| Prompt package downloads | DB primary, optional JSON export | `projects/{project_id}/prompt-packages/{task_id}/v{version}.json` | task_id, prompt_package_id | private signed URL | follow task |

## Upload / Download

- API may use direct multipart upload for MVP.
- Later optimization can move to pre-signed upload URLs.
- Downloads must use signed URLs, not public buckets.
- Upload validation must check project ownership, task state, file type, file size, and optional manifest mapping.

## Human-loop Manifest

```json
{
  "task_id": "task_xxx",
  "files": [
    {
      "file_name": "shot-001.png",
      "target": { "type": "shot", "id": "shot_xxx" },
      "version": 1
    }
  ]
}
```

## Rules

- Generated files are never the state truth source. `generated_files` table is.
- Generated images, videos, and exports are kept by default until the user actively deletes them.
- The current version is selected by user confirmation, not implicit overwrite.
- When versions become too many, the product should suggest local archive/download packaging; files can be uploaded again later if needed.
- Object keys should not encode mutable business names.
- If upload validation fails, keep no business binding and return a validation error.
