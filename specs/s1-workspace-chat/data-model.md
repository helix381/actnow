# S1 Data Model

## Tables

- users
- workspaces
- projects
- agent_threads
- agent_messages
- agent_events

## Key Rules

- Demo mode creates or reuses `DEMO_USER_ID`.
- Project `current_stage` starts as `chat`.
- AgentThread `focus_ref` starts at project level.
- First user input is stored as an AgentMessage and event.
