# Project Constitution

## Principles

| Principle | Rule | Why |
| --- | --- | --- |
| Spec before implementation | P0 功能先有 `specs/<feature>/spec.md` | 保证需求可追溯 |
| Evidence before completion | 完成声明必须有验证证据 | 防止口头完成 |
| Small reviewable changes | 复杂变更先进入 `tech/changes/<change-id>/` | 降低回写风险 |

## Spec Persistence Model

默认：Flow-back（MVP 快速迭代）。进入多人协作或上线后重新确认是否切换为 Flow-forward 或 Living spec。
