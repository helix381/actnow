# AIGC-Platform 协作推进经验记忆

记录时间：2026-06-12  
定位：这不是正式 skill，也不是工具包，而是一份给后续自己和 AI 接力用的 memory 文档。  
范围：从产品定型、PRD、原型、技术规划，到 Docker 本地启动跑通。

## 1. 当前推进位置

项目已经从“产品想法和原型探索”推进到“工程底座可以本地跑起来”。

已验证：

- 前端入口：`http://localhost:4173`
- API health：`http://localhost:3000/api/health`
- Docker Compose：frontend / api / worker / PostgreSQL / Redis / MinIO 都能启动
- API：healthy
- Frontend：healthy
- Postgres / Redis / MinIO：healthy
- worker：能连接 Redis 并消费健康队列
- `npm.cmd run build --workspaces --if-present`：通过
- `npm.cmd run test --workspaces --if-present`：通过

这说明当前不是“只有原型”的阶段了，可以继续做真实功能和前后端联调。

## 2. 最早补的四个骨架

一开始最该补的不是页面，而是：

- 数据模型
- 人在环生成交付格式
- Agent 编排
- 异步状态

原因：AIGC 平台不是普通内容工具。它有剧本、分镜、角色、资产、生成任务、生成文件、版本和引用关系。如果这些对象不先定，页面、API、画布、资产复用都会漂。

核心对象曾经收敛为：

- Project
- Route
- Episode
- Scene
- Shot
- Character
- CharacterForm
- Prop
- Asset
- GenerationTask
- GeneratedFile
- WorkflowTemplate

Storyboard、Keyframe 更适合先看成派生对象，不一定一开始就作为独立核心真源。

## 3. 人在环的真实含义

这里说“人在环”，真实动机是省钱和开发便利：图像/视频不直接接真实 API，而是平台导出提示词，用户拿去公司或外部工具生成，再把结果回传。

后来确认：

- 这个可以叫 human-in-the-loop / 人在环。
- 但当前它不是正式商业终局，只是 MVP 和开发期策略。
- 文本走公司代理。
- 图像/视频走人在环。
- 未来可以替换成真实图像/视频 API。

它带来的工程要求：

- prompt package
- task_id
- 外部生成结果回传绑定
- 上传校验
- 错传、失败、重传处理
- 状态：prompt_ready、waiting_upload、generating、failed、completed、canceled、retrying

## 4. PM skill 链路经验

实际验证下来，几个 PM skill 应该分工，而不是一个 skill 全包：

- `PM-Make`：产品定型，问清楚核心场景、MVP、页面、关键对象、高风险流程。
- `Make-PRD`：把定型内容分模块写成 PRD。
- `Make-Prototype`：把 PRD 和设计参考转成设计系统、design-model、HTML 原型、视觉 QA。
- `PM-TechTeam`：把 PRD/原型转成前后端规划、API、数据状态、部署、spec、并行工程计划。

经验：PM-Make 不应该写完整字段表；Make-PRD 才细化需求；PM-TechTeam 才进入 API、DB、队列、部署和工程协作。

## 5. PRD 和原型的真源关系

用户确认：

- PRD 是初版。
- 原型制作过程中已经改了很多地方。
- 当前以原型为准。

所以后续工程不能只照 PRD。更合理的规则：

- 原型是当前交互和视觉真源。
- PRD 是初始产品意图真源。
- 技术规划要识别两者差异。
- 需要回写 PRD 的内容，应该走变更记录，不要静默污染主文档。

后来页面流 HTML 文件不采用，所以给相关 HTML 文件名补了“弃用”。

## 6. Make-Prototype 的经验

最初 Make-Prototype 太薄，只像“初始化 HTML 原型”。后来补成完整链路：

- 参考吸收层
- `DESIGN.md`
- `MASTER.md`
- `design-model.json`
- HTML 画布 / workbench / wireframe
- 动效规则
- 视觉 QA
- 审查点

重要判断：

- 设计参考不能让 AI 自己乱套，要先给候选，再由用户确认。
- `design-md` 全部应该归档进 LifeOS，长期作为设计资源。
- Make-Prototype 初版只内置 getdesign.md 每类排行前三，一共 27 个风格参考。
- 以后用户可以挑自己喜欢的风格再进 skill。

动效规则：

- 优先使用 `transform` 和 `opacity`。
- 支持 `prefers-reduced-motion`。
- React 动效要 cleanup。
- ScrollTrigger 这类强滚动绑定要限制。
- 原型里的动效确认要进 MVP。

## 7. 技术概念解释经验

用户第一次接触后端，不能直接堆术语，需要用设计师能理解的方式解释。

已经解释过：

- PostgreSQL：结构化数据库，适合当业务真源。
- Redis：高速临时记忆和队列支撑，不适合当长期业务真源。
- BullMQ：基于 Redis 的任务队列，让慢任务交给 worker。
- Worker：后台工人，处理生成、转码、上传校验等慢任务。
- LangGraph / LangChain：偏 Agent 编排框架，不一定适合作为本项目产品真源。
- Harness：这里吸收成 ActNow 自己的运行结构和事件日志，不盲目照搬外部框架。

最后确认：

- React Flow 作为正式画布方向。
- 不用数据库轮询做正式 MVP 方案。
- 做 ActNow 自己的 Harness 数据结构和事件日志。
- MVP 是 demo 单用户模式，先不做登录。
- 文本走公司代理。
- 图像/视频人在环。
- 单机 Docker Compose 部署。

## 8. React Flow / tldraw / react-konva 判断

这个项目的画布不是画画软件，而是结构化生产画布。

判断：

- tldraw 更适合自由绘图、白板、手绘标注。
- react-konva 更底层，适合自定义图形引擎，但工程量更大。
- React Flow 更适合节点、边、状态、任务流、分镜结构、Agent 操作链路。

所以当前用 React Flow 更合理。

## 9. PM-TechTeam 的价值

发现 PRD 和原型没有系统规划后端事项，所以做了 `PM-TechTeam`。

它的核心不是写代码，而是帮 PM 把产品材料转成工程可执行计划：

- 前端规划
- 后端规划
- API contract
- 数据与状态
- 集成计划
- delivery slices
- open questions
- engineering governance
- parallel execution plan
- spec
- feature specs
- Docker / deployment

关键思想：

- 产品工作要考虑串行/并行。
- 工程 cowork 也要考虑串行/并行。
- AI-native 产品还要考虑 API 调用的并行/串行、上下游依赖、响应速度、队列、流式反馈和用户体验。

## 10. 从 Agent/cowork 项目学到的东西

学习过的方向：

- spec-kit：spec 驱动、任务分解、计划到实现。
- deer-flow：长任务 Agent runtime、多角色协作、消息流。
- oh-my-codex / oh-my-claudecode：Codex/Claude 工作台、hooks、代理团队。
- ws-workspace / collab-public：人和 Agent 协作工作区。
- ironclaw / clawmetry / hermes-hudui：安全网关、可观测、HUD。
- cc-connect / smux：远程协作、终端多会话、agent-to-agent 通信。
- gstack / agency-agents / danghuangshang：角色分工和组织编排。

最后吸收的不是照搬某个框架，而是：

- 长任务要有 runtime / event log。
- 多 Agent 要有角色边界。
- 并行任务要有 shared contract。
- subagent 不能各写各的 schema。
- 需要 task packet。
- 需要 serial gate 和 merge gate。
- 高风险远程控制能力默认禁用，除非用户明确授权。

## 11. 开工条件判断

曾经问过：原型没完全做完能不能开工？提示词没准备完能不能开工？

最后判断：可以开工，但要满足：

- P0 主流程明确。
- 真源规则明确：当前以原型为准。
- 技术主线明确：React Flow + 后端栈 + Docker Compose。
- MVP 边界明确：demo 单用户。
- 文本、图像、视频生成边界明确。
- 数据对象和高风险状态已有草案。
- 未确认问题集中记录，不散落在代码里。

不必等所有提示词写完，因为图像/视频 MVP 可以先做人回传链路。  
也不必等登录，因为登录不是当前 MVP 验证重点。

## 12. 工程骨架的真实意义

用户提醒过：骨架很简陋，很多组件功能没做。

这个判断是对的。当前骨架主要是为了验证：

- 前端能启动。
- 后端能启动。
- API 能响应。
- DB / Redis / MinIO 能连。
- worker 能跑。
- Docker Compose 能拉起来。
- monorepo build/test 能过。

它不是最终前端适配完成，也不是完整产品功能完成。

## 13. Docker 安装和排障经验

Docker 是这轮最大环境阻塞。

安装经验：

- Docker Desktop GUI 没让用户选安装位置。
- 后来通过命令行安装到 `H:\Docker`。
- 即使安装在 H 盘，Windows 和 Docker 仍可能在 C 盘留下 WSL、程序数据、用户配置、缓存。

旧安装冲突：

```text
The --installation-dir flag (H:\Docker) must match existing installation (C:\Users\...\AppData\Local\Programs\Docker\Docker)
```

说明旧安装还在注册信息里。处理思路：

- 关闭 Docker Desktop。
- 关闭残留 installer。
- 卸掉旧安装。
- 再命令行安装到 H 盘。

Docker Engine 一直转：

```text
Starting the Docker Engine...
```

用户提供 cnblogs 文章后，吸收出的办法：

- 不上来就重装。
- 先 `wsl --terminate docker-desktop`。
- 杀 Docker 相关进程。
- 重启 Docker Desktop。

这个办法最后有效。

## 14. Docker Hub DNS 问题

构建时拉不下 `node:22-alpine`，不是 Docker 坏了，而是 DNS 解析异常。

当时发现 `auth.docker.io` 解析到了不对的 IP。最后通过 hosts 临时修复：

```text
# ACTNOW_DOCKER_DNS_START
104.18.43.178 auth.docker.io
23.21.112.49 registry-1.docker.io
104.16.98.215 production.cloudflare.docker.com
# ACTNOW_DOCKER_DNS_END
```

之后 `docker pull node:22-alpine` 成功。

注意：hosts 方案是当时有效的临时办法，以后 IP 可能变，需要重新验证。

## 15. Windows 保留端口

前端容器最初暴露 `5173:5173`，失败：

```text
ports are not available: exposing port TCP 0.0.0.0:5173
bind: An attempt was made to access a socket in a way forbidden by its access permissions.
```

`netstat` 看不到占用。后来用：

```powershell
netsh interface ipv4 show excludedportrange protocol=tcp
```

发现 `5173` 在 Windows excluded port range 里。

最终改成：

```yaml
ports:
  - "4173:5173"
```

并同步 `.env`：

```env
APP_URL=http://localhost:4173
```

以后不要随手改回 `5173`。

## 16. Docker 构建踩坑

Rollup optional dependency：

```text
Cannot find module @rollup/rollup-linux-x64-musl
```

最终在 `apps/web/Dockerfile` 加：

```dockerfile
RUN npm install --no-save @rollup/rollup-linux-x64-musl@4.61.1
```

Prisma / Alpine / OpenSSL：

```dockerfile
RUN apk add --no-cache openssl
```

workspace build 顺序：

```dockerfile
RUN npm run db:generate && npm run build --workspace packages/shared && npm run build --workspace packages/db && npm run build --workspace apps/api
```

`tsbuildinfo` 污染镜像：

API 运行时报：

```text
Error: Cannot find package '/app/node_modules/@actnow/shared/dist/index.js'
```

原因是 `packages/shared/tsconfig.tsbuildinfo` 被复制进镜像，但 `dist` 没有，TypeScript 以为已构建就没产物。

最终 `.dockerignore` 加：

```gitignore
*.tsbuildinfo
**/*.tsbuildinfo
dist
**/dist
node_modules
**/node_modules
```

并无缓存重建：

```powershell
docker compose down
docker compose build --no-cache api worker frontend
docker compose up -d
```

## 17. PowerShell / npm 经验

PowerShell 跑 `npm` 被拦：

```text
npm.ps1 cannot be loaded because running scripts is disabled on this system
```

解决办法：

```powershell
npm.cmd run build --workspaces --if-present
npm.cmd run test --workspaces --if-present
```

## 18. 最终可用验证顺序

```powershell
$env:Path='H:\Docker\resources\bin;' + $env:Path
docker version
docker compose version
docker compose config
docker compose down
docker compose build --no-cache api worker frontend
docker compose up -d
docker compose ps -a
docker compose logs --no-color --tail=160 api worker frontend
Invoke-WebRequest -UseBasicParsing http://localhost:3000/api/health
Invoke-WebRequest -UseBasicParsing http://localhost:3000/api/health/dependencies
Invoke-WebRequest -UseBasicParsing http://localhost:4173
```

最终验证结果：

- API：healthy
- Frontend：healthy
- Postgres：healthy
- Redis：healthy
- MinIO：healthy
- worker：Up
- API health 返回 ok
- frontend 返回 200

## 19. 后续继续项目时要记住

当前不是产品完成，而是工程底座跑通。

接下来应该继续：

- 以前端原型为准，对齐真实页面和组件。
- 把 React Flow 画布接入真实业务对象。
- 完善 API 和数据模型。
- 实现 GenerationTask / GeneratedFile / AgentEvent 等核心对象。
- 实现人在环 prompt package 和回传绑定。
- 把原型动效迁入 MVP。
- 继续保持 Docker Compose 可启动。
- 每做一段都更新验证证据。

## 20. 给后续 AI 的提醒

如果后续 AI 接手：

1. 先读这份经验记忆。
2. 再读 `tech/implementation-kickoff.md` 和 `tech/completion-check.md`。
3. 当前前端入口是 `http://localhost:4173`，不是 `5173`。
4. 不要把人在环误解成正式商业终局，它现在主要是省成本和开发期方案。
5. 不要把初版 PRD 当最新真源，当前原型优先级更高。
6. 不要引入登录、K8s、多租户、正式云部署，除非用户重新确认。
7. 不要用数据库轮询当正式 workflow 架构。
8. 继续用证据说话：build、test、compose、health、logs。
