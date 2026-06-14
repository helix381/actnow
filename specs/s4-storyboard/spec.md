# S4 Storyboard Spec

## Goal

用户能生成、查看、编辑和排序分镜脚本。分镜结果写入 Scene/Shot，Agent 修改必须通过 ActNow Harness 事件记录。

## Scope

- Storyboard generation request.
- Shot list editing.
- Shot ordering.
- Agent tool call event logging.

## Acceptance

- 分镜生成后出现 shot 列表。
- 用户能编辑 shot description/camera/emotion/duration。
- 保存后刷新不丢。
- Agent 修改产生 ToolCall 和 AgentEvent。

## Out of Scope

- 复杂镜头语言评分。
- 自动生成最终视频。
