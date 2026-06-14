# S1 Workspace Chat Spec

## Goal

用户输入灵感后创建 ActNow demo 项目，并进入单一 `workspace.html` 的聊天工作区。系统创建 Project、默认 AgentThread，并返回可继续对话的工作区聚合数据。

## Scope

- 创建 demo project。
- 单用户 demo 模式，不做登录。
- 创建默认 AgentThread。
- 发送第一条用户消息。
- 返回 Agent 接收状态；真实回复可先由文本代理或 mock 完成。

## User Flow

1. 用户在首页输入灵感或上传文本。
2. 前端调用 `POST /api/projects`。
3. 后端创建 Project、AgentThread、第一条 AgentMessage。
4. 前端切换到 chat stage。
5. 前端通过 `/agent/threads/{threadId}/events` 获取消息和状态。

## Acceptance

- 用户无需登录即可创建 demo project。
- 刷新页面后 project/workspace 能恢复。
- AgentThread 和第一条用户消息已落库。
- 失败时不进入空白页，显示错误并允许重试。

## Out of Scope

- 正式登录/注册。
- 多用户协作。
- 图像/视频生成。
