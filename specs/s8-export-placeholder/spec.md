# S8 Export Placeholder Spec

## Goal

用户能在素材基本齐备后看到成片合成导出的入口、任务状态和下载占位，MVP 先跑通导出链路，不要求真实复杂剪辑引擎。

## Scope

- Export frame / panel in prototype workspace.
- CompositionJob creation from selected episode or scene range.
- Export status: `pending`, `queued`, `rendering`, `completed`, `failed`, `canceled`.
- Placeholder generated export file.
- Signed URL preview/download.

## Acceptance

- 用户能选择一个 Episode 创建导出任务。
- 任务状态能从 pending 进入 completed 或 failed。
- completed 后生成 `GeneratedFile` 类型的 export 文件。
- 下载链接使用签名 URL。
- 源图、源视频、成片文件默认保留，除非用户主动删除。

## Out of Scope

- 专业时间线编辑器。
- 多轨音频混音。
- 真实云剪辑集群。
- 自动删除历史版本。
