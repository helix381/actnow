# Database Spec

## Schema 真源

- Planning truth source: this file plus `tech/04-data-and-state.md`.
- Implementation truth source after backend starts: `prisma/schema.prisma`.
- Database: PostgreSQL.
- ORM: Prisma.
- Demo mode: single demo user, but keep `users` and `workspaces` compatible with future login.

## Migration 规则

- Every schema change must create a Prisma migration.
- Migration names use `YYYYMMDDHHMM_<scope>`, for example `202606121030_generation_tasks`.
- Local/dev can reset seed data. Staging/prod must migrate forward.
- Breaking migrations must be linked to a feature spec or change package.
- Seed must create one demo user and one sample project path for S1/S2 smoke tests.

## Core Tables

| Table | Purpose | Key Fields | Relations | Status |
| --- | --- | --- | --- | --- |
| users | Future login and demo identity | id, name, email, role, status | 1-n workspaces/projects | draft |
| workspaces | Future team/user container | id, owner_user_id, name, mode | 1-n projects | draft |
| projects | Main project/workbench truth source | id, workspace_id, owner_user_id, title, route, current_stage, settings, status | 1-n episodes/assets/tasks/threads | draft |
| episodes | Short drama/comic episode unit | id, project_id, title, order, script_version, status | 1-n scenes | draft |
| script_drafts | Script draft and locked versions | id, project_id, episode_id, version, content, source, locked_at | n-1 project/episode | draft |
| scenes | Story scenes | id, episode_id, title, order, location_asset_id, status | 1-n shots | draft |
| shots | Storyboard shot truth source | id, scene_id, order, description, camera_json, emotion, duration, status, version | n-m assets/character_forms | draft |
| characters | Character identity | id, project_id, name, profile_json, status | 1-n character_forms | draft |
| character_forms | Character form/reference state | id, character_id, label, reference_asset_id, attributes_json, status | n-1 character | draft |
| assets | Uploaded/generated/reference assets | id, project_id, type, name, uri, metadata_json, source, status | referenced by shots/tasks/files | draft |
| shot_asset_refs | Shot-to-asset references | id, shot_id, asset_id, role | n-m shots/assets | draft |
| shot_character_form_refs | Shot-to-character-form references | id, shot_id, character_form_id, role | n-m shots/forms | draft |
| canvas_documents | React Flow canvas state | id, project_id, nodes_json, edges_json, viewport_json, version, status | 1-1 project | draft |
| generation_tasks | Generation state truth source | id, project_id, target_type, target_id, gen_type, backend_mode, status, prompt_package_id, retry_count, error_code | 1-n generated_files | draft |
| prompt_packages | Human-loop/API prompt package | id, task_id, prompt, references_json, parameters_json, manifest_json, version | 1-1 generation_task | draft |
| generated_files | Generated/uploaded outputs | id, task_id, file_type, uri, version, is_current, checksum, model_meta_json, status, deleted_at | n-1 generation_task | draft |
| agent_threads | ActNow Harness thread | id, project_id, mode, status, focus_type, focus_id, summary | 1-n messages/events | draft |
| agent_messages | Human/agent messages | id, thread_id, role, content, model_meta_json | n-1 thread | draft |
| agent_events | Append-only Harness event log | id, thread_id, task_id, event_type, actor, payload_json, created_at | n-1 thread/task | draft |
| tool_calls | Tool call records | id, thread_id, event_id, tool_name, input_json, output_json, status, error_code | n-1 thread/event | draft |
| human_approvals | Human approval checkpoints | id, thread_id, target_type, target_id, reason, status, decision_json | n-1 thread | draft |
| runtime_resources | Runtime capabilities/resources | id, project_id, type, name, config_json, status | n-1 project | draft |
| workflow_templates | Combination buttons / lightweight skills | id, project_id, name, trigger_scope, steps_json, version, status | n-1 project | draft |
| composition_jobs | Export/composition jobs | id, project_id, episode_id, status, output_file_id, error_code | n-1 project | P1 draft |
| audit_logs | Security and data change audit | id, project_id, actor_type, actor_id, action, target_type, target_id, payload_json | n-1 project | P1 draft |

## Indexes

| Table | Index | Reason |
| --- | --- | --- |
| projects | workspace_id, updated_at | Project list and recent work |
| scenes | episode_id, order | Story order |
| shots | scene_id, order | Storyboard order |
| assets | project_id, type | Asset drawer filters |
| generation_tasks | project_id, status | Task dashboard and polling/SSE hydration |
| generation_tasks | target_type, target_id | Find task bound to shot/asset/node |
| generated_files | task_id, version | File version lookup |
| agent_events | thread_id, created_at | Event stream |
| tool_calls | thread_id, status | Tool execution tracking |

## Notes

- PostgreSQL is the truth source. Redis/BullMQ is only the execution queue.
- Do not use database polling as the formal queue strategy.
- React Flow node ids must reference business objects through `data.ref`, not become the business truth source.
- Generated files are retained until user deletion. Current version is selected through `is_current`.
