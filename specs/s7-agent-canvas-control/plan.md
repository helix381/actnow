# S7 Plan

## Implementation Order

1. Define Agent intent and target reference schema.
2. Add Harness event append/read service.
3. Implement tool call planner for shot update and regeneration task creation.
4. Build frontend confirmation card.
5. Bind confirmed execution result to React Flow node refresh.

## Engineering Notes

- Treat the canvas database state as truth, not the chat text.
- Every operation must carry `project_id`, `target_ref`, `tool_name`, `approval_state` and `event_id`.
- User confirmation is required before writing Shot content or creating a generation task.
- Failed tool calls should write an event and return a recoverable UI state.

## Verification

- Run command against a seeded project with at least 8 shots.
- Confirm only the target shot changes.
- Confirm `AgentEvent` order: intent received -> target resolved -> tool proposed -> user approved -> tool executed -> canvas refreshed.
