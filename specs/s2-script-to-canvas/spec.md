# S2 Script To Canvas Spec

## Goal

用户从聊天阶段进入制作画布时，系统锁定当前剧本版本，创建基础 Scene/Shot 结构，并初始化 React Flow 画布文档。

## Scope

- 锁定 ScriptDraft。
- 生成或确认 Episode、Scene、Shot。
- 创建 CanvasDocument。
- React Flow 节点引用业务对象，不成为业务真源。

## Acceptance

- 首次进入画布后可看到五步骤工作流节点。
- Scene/Shot 数据可由 API 读取。
- Canvas nodes 的 `data.ref` 指向 Project/Scene/Shot/Asset/GenerationTask。
- 重复调用按 script version 幂等处理。

## Out of Scope

- 完整分镜质量优化。
- 复杂自动布局。
