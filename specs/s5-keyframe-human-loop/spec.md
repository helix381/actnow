# S5 Keyframe Human-loop Spec

## Goal

用户能为镜头创建分镜图生成任务，导出提示词包，在外部工具生成图片后回传，并绑定回原 Shot。

## Scope

- Create GenerationTask `gen_type=keyframe`.
- Create PromptPackage.
- Human-loop status `waiting_upload`.
- Upload validation and GeneratedFile version.

## Acceptance

- 每个 keyframe task 有 task_id。
- Prompt package 包含 prompt、参考资产、参数和 manifest。
- 回传文件必须绑定 task_id。
- 校验通过后任务进入 `completed`，GeneratedFile 关联 Shot。

## Out of Scope

- 真实图像 API。
- 自动图像质量评估。
