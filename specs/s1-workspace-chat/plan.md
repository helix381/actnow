# S1 Plan

## Frontend

- Home input form calls `POST /api/projects`.
- Stage changes from home to chat after project response.
- Agent panel reads `agent_thread.id`.
- Support loading, error, retry states.

## Backend

- Seed or resolve demo user.
- Create Project with route and initial settings.
- Create AgentThread with status `idle`.
- Persist initial user AgentMessage.
- Append `agent.message.created` event.

## API

- `POST /api/projects`
- `GET /api/projects/{projectId}/workspace`
- `POST /api/agent/threads/{threadId}/messages`
- `GET /api/agent/threads/{threadId}/events`

## Dependencies

- PostgreSQL schema.
- Text model proxy can be mock in first pass.
