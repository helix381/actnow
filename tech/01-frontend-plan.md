# 前端规划

## 页面与路由

| 页面/路由 | 来源 | 用户任务 | 关键状态 | 依赖接口 | 优先级 |
| --- | --- | --- | --- | --- | --- |
| `/` 或 workspace home stage | `workspace.html`、PRD 4.3/6a | 输入灵感、上传剧本、进入创作 | empty、ready、transitioning、upload_failed | project create、script intake、upload | P0 |
| workspace chat stage | `workspace.html`、PRD 6a/6e | 与 Agent 对话，收敛剧本和创作设置 | thinking、streaming、draft_ready、needs_clarification | agent sessions/messages、script draft | P0 |
| workspace canvas/sidebar stage | `workspace.html`、Canvas PRD | 在聊天侧栏 + 画布之间切换，制作全流程 | fullscreen、sidebar、focus_ball、dirty、saving | project detail、canvas state、agent command | P0 |
| canvas assets frame | PRD 6b、Canvas C5 | 管理角色、场景、道具、参考图、全景资产 | empty、draft、locked、uploading、failed | assets CRUD、file upload、generation tasks | P0 |
| storyboard frame | PRD 6c、Canvas C5 | 校对分镜脚本、调顺序、重生成 | generated、editing、dirty、error | scenes/shots CRUD、agent rewrite | P0 |
| keyframes frame | PRD 6c | 生成/回填分镜图，逐镜预览 | prompt_ready、generating、human_loop、done、failed | generation task、prompt package、upload result | P0 |
| videos frame | PRD 6c | 生成/回填视频片段，处理失败重试 | waiting_upload、generating、completed、failed | generation task、upload result、file versions | P0 |
| export frame | PRD 6d | 预览、合成、导出成片 | waiting_assets、composing、completed、failed | composition jobs、download URL | P0 |
| my works stage | `workspace.html`、PD-9 | 查看项目、资产、模板 | loading、empty、list、filtering | projects list、assets list、templates list | P1 |

## 组件分层

| 组件 | 所属页面 | 职责 | 输入 | 输出事件 | 状态来源 |
| --- | --- | --- | --- | --- | --- |
| AppWorkspace | 全局 | 管理 home/chat/canvas/myworks stage 与 rail | currentProject、session | stage.change | global store |
| AgentPanel | chat/canvas | 消息流、输入框、模式切换、上下文提示 | AgentThread、selectedTarget | message.send、mode.change、command.confirm | API + global store |
| CanvasShell | canvas | pan/zoom、选择、框选、右键、小地图、资产抽屉 | CanvasDocument | node.select、node.move、edge.create | local + API snapshot |
| StepFrame | canvas | 五步骤 Frame 容器，承载组件卡片 | FrameState | frame.resize、frame.collapse | canvas state |
| ComponentCard | canvas | 资产/分镜/分镜图/视频/合成重型功能单元 | domain entity + task status | action.click、task.create、upload.open | API |
| SimpleCard | canvas | 图片/视频/文本/参考素材自由卡片 | File/Asset | card.link、asset.save | local + API |
| GenerationStatusBadge | 多处 | 统一展示生成状态 | GenerationTask.status | retry、cancel、openPrompt | API |
| PromptPackagePanel | keyframes/videos | 展示/导出提示词包、复制参数、下载 manifest | PromptPackage | prompt.copy、package.export | API |
| UploadReturnDialog | keyframes/videos | 回传文件、manifest、校验错误 | task_id、accepted types | result.upload | API |
| AssetDrawer | canvas | 浏览/收藏/拖入资产 | assets list | asset.drag、asset.insert | API |

## 前端状态

| 状态 | 范围 | 来源 | 持久化 | 失败处理 |
| --- | --- | --- | --- | --- |
| `workspace.stage` | 全局 UI | 用户操作 | 是，project UI prefs | 回到上次有效 stage |
| `agent.mode` | Agent 面板 | 用户切换 | 是 | 保持上下文，不丢消息 |
| `canvas.viewport` | 画布 | pan/zoom | 是，节流保存 | 保存失败只提示，不阻塞操作 |
| `canvas.selection` | 画布 | 用户选择 | 否 | 页面刷新清空 |
| `entity.dirty` | 表单/节点 | 用户编辑 | 否，本地暂存 | 离开前提醒 |
| `GenerationTask.status` | 业务状态 | 后端 | 是 | 统一错误码、可重试/取消/回传 |
| `upload.progress` | 上传 | 前端 + 后端签名 | 否 | 失败可重传 |
| `agent.streaming` | 消息流 | SSE/WebSocket/polling | 消息落库 | 中断后可恢复 thread |

## 动效与交互实现约束

- 原型已有 FLIP 转场、stage 切换、抽屉、toast、modal、生成中脉冲、拖拽/pan/zoom/连线等交互痕迹。
- 生产实现只保留服务工作流所需动效；装饰动效不进入 P0 阻塞项。
- 动画属性限定 `transform` / `opacity`；输入、滚动、pan/zoom 不叠加重动画。
- 必须支持 `prefers-reduced-motion`，reduced-motion 下保留状态表达但取消非必要动画。
- 画布固定尺寸元素必须有稳定宽高和响应式约束，避免拖拽/状态变化造成布局跳动。

## 原型到实现差异

| 原型位置 | 当前表现 | 实现要求 | 是否回写 PRD/spec |
| --- | --- | --- | --- |
| `workspace.html` 单一工作区 | home/chat/canvas/myworks 通过 stage 切换 | 前端路由可仍是一页，但业务状态必须来自后端 project/session | 是，进入 tech/spec |
| 聊天/画布三态 | 全屏、侧边栏、悬浮球 | 状态不丢失，消息 thread 与选中对象上下文一致 | 是 |
| 画布引擎 | HTML 原型模拟 pan/zoom/拖拽/连线 | 生产正式按 React Flow 推进；tldraw 备选，react-konva 不进 MVP 主路线 | 是 |
| 生成状态 | 演示态 badge/脉冲 | 后端 GenerationTask 为唯一真源 | 是 |
| 提示词回传 | 原型展示 task_id/回填入口 | 必须接 prompt package、manifest、文件校验、版本入库 | 是 |
| `design-model.json` | UTF-8 JSON 有效，但属于早期页面流/画布中间模型 | 页面流不采用，当前不作为工程真源 | 是 |
