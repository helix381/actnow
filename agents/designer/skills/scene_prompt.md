---
name: scene_prompt
description: 场景提示词规范——vibe扩展 + 材质 + 空间描述
inject_when: intent == "design_prompt"
---

## vibe 扩展规则

assets.locations[].vibe 是场景基调的唯一来源。

扩展方式：vibe关键词 + 材质描述 + 空间布局 + 光线基调 + 无人物 + 全景

## 禁止

- 禁动态光影/天气（那是分镜/摄影的变量，不是场景设定）
- 禁人物描述（场景设定图无人物）
- 禁抽象氛围词（"神秘感"/"压迫感"→ 用具体材质/光线替代）

## 格式

场景提示词 = vibe关键词 + 材质 + 空间布局 + 光线基调 + 无人物 + 广角全景 + 高细节
