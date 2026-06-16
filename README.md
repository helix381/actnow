# ActNow Platform

ActNow 是面向短剧/漫画 AIGC 的 B2B 企业级工作流平台。

## 真相来源

| 资源 | 路径 |
|------|------|
| 产品/工程全部 PRD | `prd/整理后/`（索引见 `prd/整理后/00-index.md`）|
| 产品原型（UX 仲裁） | `prototype/workspace.html` |
| Canvas 专项 PRD | `prd/Canvas/PRD-Canvas.md` |
| Agent 系统提示词 | `agents/director/system.md` + `agents/director/skills/` |
| 数据库真相 | `packages/db/prisma/schema.prisma` |

> **注意**：`tech/`、`spec/`、`specs/`、`shaping/`、`经验/` 已全部归档进 `prd/整理后/`，原始目录已删除。
> 所有后续改动必须记录在 `prd/整理后/` 对应子 PRD 中。

## 工程目录

- `apps/web`：React 前端（开发入口 localhost:4173，Windows 保留端口 5173 不可用）
- `apps/api`：NestJS API
- `apps/worker`：异步 Worker
- `packages/db`：Prisma + 数据库访问
- `packages/shared`：共享契约与枚举

## 本地命令（Windows PowerShell）

```powershell
npm.cmd install
npm.cmd run dev:web
npm.cmd run dev:api
npm.cmd run dev:worker
```
