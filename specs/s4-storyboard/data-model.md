# S4 Data Model

## Tables

- scenes
- shots
- script_drafts
- agent_events
- tool_calls

## Key Rules

- Shot order is scoped by scene.
- Agent changes must be traceable through ToolCall and AgentEvent.
- Text model output is not the truth source until written to shots.
