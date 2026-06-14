# S7 Agent Canvas Control Spec

## Goal

用户能通过对话指令驱动 React Flow 画布：定位目标镜头/场景/资产，生成可审查的操作计划，并在用户确认后修改画布或创建生成任务。

## Scope

- Agent command intake from workspace chat.
- Target resolution for Project / Episode / Scene / Shot / Asset / GenerationTask.
- ActNow Harness event log for intent, tool call, approval, execution and result.
- Tool calls for shot update, asset binding and regeneration task creation.
- Frontend confirmation card and focused canvas refresh.

## Acceptance

- 输入“把第 8 镜改得更压迫一点，只重生成这一镜”后，系统能定位第 8 镜并生成确认卡。
- 用户确认后只修改目标 Shot，并创建对应 `GenerationTask`。
- React Flow 对应节点状态刷新，其他镜头不被误改。
- 所有 Agent 决策、工具调用和结果进入 `AgentEvent` 日志。
- 高风险操作必须进入 `requires_confirmation`，不能静默执行。

## Out of Scope

- 多 Agent 复杂调度 UI。
- 长期记忆检索优化。
- LangGraph / LangChain / 第三方 Harness 接入。
- 自动调用真实图像/视频 API。
