---
name: style_route
description: 画风适配——realistic/2d_korean/3d_animation 关键词取向
inject_when: intent in ["storyboard_breakdown","generation_prep"]
---

| meta.style | style_route | integrated_prompt 关键词取向 |
|------------|-------------|------------------------------|
| realistic | realistic | 写实系：胶片质感/自然光/手持感/真实肤质 |
| 2d_korean | 2d_korean | 韩漫扁平系：清晰线条/大色块/强情绪色/网点高光 |
| 3d_animation | 3d_animation | CG渲染系：景深/体积光/材质细节/次表面散射 |

integrated_prompt 必须在末尾追加 style_route 对应关键词。
