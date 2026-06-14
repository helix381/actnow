# S2 Plan

## Frontend

- Chat stage mode switch opens canvas/sidebar state.
- React Flow renders five main frame-like nodes.
- Load CanvasDocument from workspace aggregate.

## Backend

- Implement `POST /projects/{projectId}/script/lock`.
- Store locked script version.
- Create Episode/Scene/Shot minimal data.
- Create CanvasDocument with React Flow nodes/edges.

## Dependencies

- S1 project and thread.
- Database tables: script_drafts, episodes, scenes, shots, canvas_documents.
