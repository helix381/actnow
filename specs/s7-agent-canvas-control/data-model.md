# S7 Data Model

## AgentEvent

- `id`
- `project_id`
- `thread_id`
- `event_type`
- `actor`
- `target_ref`
- `payload`
- `created_at`

## ToolCall

- `id`
- `project_id`
- `agent_event_id`
- `tool_name`
- `target_ref`
- `args`
- `approval_state`
- `result`
- `created_at`
- `executed_at`

## TargetRef

`TargetRef` is a structured reference, not a free text label.

- `type`: `project | episode | scene | shot | asset | generation_task`
- `id`
- `display_name`
- `path`

## State Rules

- `proposed`: Agent has prepared a tool call but no write has happened.
- `requires_confirmation`: User must approve before execution.
- `approved`: User approved the exact target and operation.
- `executed`: Tool call completed and result was written.
- `failed`: Tool call failed and can be retried or revised.
