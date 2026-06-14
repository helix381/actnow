# 前后端规划输入

| 项 | 内容 |
| --- | --- |
| 产品名 | ActNow / AIGC-Platform |
| 产品类型 | AI Native 视频/短剧/漫剧创作平台 |
| 规划日期 | 2026-06-11 |
| 当前阶段 | PRD 初版 + Canvas 专项 PRD + 高保真 HTML 原型后，进入 PM-TechTeam 工程规划 draft |
| 本轮结论 | 可以开工。先产出工程骨架、接口边界、数据/状态、联调切片、部署与 cowork 并行计划，不锁死最终研发排期。 |

## 输入来源

| 来源 | 路径/说明 | 已读 | 关键结论 |
| --- | --- | --- | --- |
| 主 PRD | `prd/PRD.md` | 是 | 已覆盖产品定位、P0 范围、Harness 架构、技术栈建议、数据模型、生成任务状态机、人在环交付协议、Agent 编排、异常与运营。 |
| 画布专项 PRD | `prd/Canvas/PRD-Canvas.md` | 是 | 制作画布的坐标系、Frame、卡片体系、端口/连线、组合技按钮、状态联动和待决问题已单独成册。 |
| 原型增量 | `prd/_prototype-deltas.md` | 是 | 原型相对 PRD 产生多项变更，尤其是单一 `workspace.html`、聊天/画布三态、Frame + 两层卡片范式，部分仍待并入 PRD。 |
| 原型页面 | `prototype/pages/workspace.html` 等 | 是 | 已有多页面和单一工作区原型；包含转场、画布态、生成态、资产抽屉、组合技、拖拽/pan/zoom 相关交互痕迹。 |
| 原型设计系统 | `prototype/design-system/DESIGN.md`、`MASTER.md` | 是 | 已定义暗色电影感、tokens、组件状态、motion 规则、reduced-motion、视觉 QA gate。 |
| 原型 QA | `prototype/visual-qa.md` | 是 | 已记录视觉与交互验证；同时明确生成状态、队列、回传等仍为演示态。 |
| 中间模型 | `prototype/design-model.json` | 是 | UTF-8 JSON 有效，但属于早期页面流/画布中间模型；页面流不采用，当前不作为工程真源。 |
| Shaping | `shaping/*.md` | 是 | 早期问题、页面流、范围、技术选型和高风险项为 PRD 提供背景参考。 |

## 本次规划范围

- 前端规划：单一 workspace、聊天/画布三态、React Flow 主画布、组件拆分、状态管理、上传/回传、生成态、错误态、动效实现约束。
- 后端规划：NestJS 服务模块、PostgreSQL/Prisma、S3 兼容对象存储、生成任务队列、外部模型适配、Agent runtime、鉴权账号。
- API 契约：项目/剧本/资产/分镜/生成任务/文件/Agent 会话/提示词包/回传 manifest 的前后端契约。
- 数据与状态：Project、Episode、Scene、Shot、Character、CharacterForm、Asset、GenerationTask、GeneratedFile、WorkflowTemplate 等对象关系和状态机。
- 联调切片：按端到端创作路径拆 P0 研发切片，优先打通“输入灵感 -> 剧本 -> 资产/分镜 -> 提示词包 -> 回传 -> 合成占位”。
- 工程治理：Git、spec 真源、变更包、PR 模板、环境变量、数据库迁移、部署/Docker、验证清单。
- cowork 并行计划：拆前端、后端、API、数据、Agent、部署、QA 的并行/串行边界和 task packet。

## 已确认工程约束

- 前后端统一 TypeScript 优先。
- 前端建议 React + TypeScript，生产画布正式按 React Flow 推进；tldraw 备选，react-konva 不进 MVP 主路线。
- 后端建议 Node.js + NestJS。
- ORM/数据库建议 Prisma + PostgreSQL。
- 对象存储建议 S3 兼容 + CDN。
- Agent 编排先做 ActNow 自己的 Harness 数据结构和事件日志；LangGraph 仅作为后续可替换执行器。
- 文本模型走公司 OpenAI 兼容代理。
- 图像/视频开发期走人在环，后续保留真实 API 和样例模式。
- 部署需要补 Docker/服务器/环境变量/迁移/对象存储/队列/日志方案。

## 本轮不直接处理

- 不直接修改 `prd/PRD.md` 和 `prd/Canvas/PRD-Canvas.md`。
- 不重写 HTML 原型。
- 不补完整提示词正文，只定义提示词包、任务绑定和回传协议。
- 不决定正式品牌名。
- 不把 Roadmap 路线扩成 MVP。
- 不把原型动效当作生产实现，后续需要前端工程化复核。

## 规划状态

本轮为 `draft`。可进入工程规划，但未达到“可直接研发排期”状态；必须先完成 `tech/01-09`、`spec/`、P0 `specs/` 和 `completion-check.md`。
