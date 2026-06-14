# S8 Data Model

## CompositionJob

- `id`
- `project_id`
- `episode_id`
- `source_scope`
- `status`
- `settings`
- `output_file_id`
- `error`
- `created_at`
- `updated_at`

## GeneratedFile Extension

- `kind`: `image | video | export | prompt_package`
- `is_current`
- `deleted_at`
- `storage_key`
- `signed_url` is never stored as truth; it is issued on demand.

## Lifecycle Rules

- Generated exports are retained until the user actively deletes them.
- Multiple export versions can coexist.
- The active version is selected by user confirmation.
- Local archive packaging is a recommendation, not an automatic deletion policy.
