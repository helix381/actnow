# ActNow Platform

ActNow is currently moving from PRD/prototype/spec planning into an implementation monorepo.

## Current Truth Sources

- Prototype reference: `prototype/pages/workspace.html`
- Product and canvas PRD: `prd/`
- Engineering plan: `tech/`
- API/data/storage/events specs: `spec/`
- Feature specs: `specs/`

## Workspaces

- `apps/web`: React frontend.
- `apps/api`: NestJS API.
- `apps/worker`: async workers.
- `packages/db`: Prisma and database access.
- `packages/shared`: shared contracts and enums.

## Local Commands

Use `npm.cmd` on Windows PowerShell if script execution blocks `npm`.

```powershell
npm.cmd install
npm.cmd run dev:web
npm.cmd run dev:api
npm.cmd run dev:worker
```
