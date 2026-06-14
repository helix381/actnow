# S5 Data Model

## Tables

- generation_tasks
- prompt_packages
- generated_files
- agent_events

## Key Rules

- PostgreSQL stores task truth.
- BullMQ/Redis may execute package preparation and future API generation, but is not the truth source.
- One task can have multiple file versions, default max 5 pending TQ10.
