# 页面清单

来源：`prototype/design-model.json`

| 页面ID | 页面 | 目标 | 主要操作 | 状态 | 优先级 |
| --- | --- | --- | --- | --- | --- |
| home | 首页/创作页 | 开始创作 | 输入, 上传, 开始 | default, empty | P0 |
| chat | 创意聊天台 | 灵感到剧本 | 发送, 确认剧本 | default, loading | P0 |
| canvas | 制作画布 | 制作主界面 | 编辑, 生成, 重试 | default, generating, failed | P0 |
| assets | 资产节点/资产库 | 管理角色场景道具 | 上传, 编辑, 入库 | default, empty | P0 |
| storyboard | 分镜脚本节点 | 校对分镜 | 改字段, 调序, 重生 | default, error | P0 |
| keyframes | 分镜图节点 | 关键帧预览 | 批量生成, 单张重生 | default, generating | P0 |
| videos | 视频片段节点 | 管理片段 | 回填, 重试, 变速 | waiting_upload, completed, failed | P0 |
| export | 合成导出节点 | 导出成片 | 预览, 导出 | default, completed | P0 |
