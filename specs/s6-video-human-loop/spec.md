# S6 Video Human-loop Spec

## Goal

用户能为镜头创建视频片段生成任务，导出视频提示词包，回传外部生成的视频文件，并绑定回原 Shot。

## Scope

- Create GenerationTask `gen_type=video`.
- Reuse human-loop prompt package and upload flow.
- Video file validation.
- Video task status shown in React Flow node.

## Acceptance

- 视频任务有独立 task_id。
- 支持从 keyframe file 引用生成视频提示词。
- 回传视频通过校验后生成 GeneratedFile。
- 失败可重传、重试或取消。

## Out of Scope

- 真实视频 API。
- 音轨独立 TTS。
- 最终合成导出。
