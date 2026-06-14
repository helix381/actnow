# S5 Quickstart

1. Complete S4 and pick a `shot_id`.
2. POST `/api/generation-tasks` with `gen_type=keyframe`, `backend_mode=human_loop`.
3. GET `/api/generation-tasks/{taskId}/prompt-package`.
4. POST `/api/generation-tasks/{taskId}/uploads` with one image.
5. Confirm task is `completed`.
