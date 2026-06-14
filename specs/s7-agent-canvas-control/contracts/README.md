# S7 Contracts

Relevant OpenAPI areas:

- `POST /agent/threads/{threadId}/messages`
- `GET /projects/{projectId}/canvas`
- `PATCH /shots/{shotId}`
- `POST /generation-tasks`

Required contract behavior:

- Agent commands must return proposed operations before writes.
- Tool execution must require an approval token or approved tool call id.
- API responses must include changed target refs for frontend refresh.
