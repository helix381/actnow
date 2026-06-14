# 视觉 QA 记录 · ActNow

> 验证方式：本地 `python -m http.server` + Playwright 实机渲染（截图 + `getBoundingClientRect`/事件派发 evaluate）。
> 高保真页位于 `pages/`，设计系统与骨架在 `design-system/` 与根目录。

## 验收结果

| 项 | 结果 | 说明 |
| --- | --- | --- |
| design-system/DESIGN.md / MASTER.md / reference-intake.md | ✅ | ActNow 自有「暗色电影感工作台」thesis，已与用户确认 |
| design-model.json（暗色 tokens） | ✅ | 深底 #0d0e12 + 靛蓝主色 + 制作五阶段分组色 + 生成态渐变 |
| theme.css 暗色基线 | ✅ | input/sidebar/node.active 亮色已调暗；面板无投影、阴影仅给内容缩略图 |
| pages/home.html（首页/创作） | ✅ 桌面 + ✅ 375px 移动 | 电影感入口 + 路线卡 + 大输入框 + 设置条 + 发现瀑布流 |
| pages/chat.html（创意聊天台） | ✅ 桌面 | 启发式选项发散 → 右侧《雾隐山河》三幕草稿 → 确认剧本；全屏/悬浮窗两态实测 |
| pages/studio.html（制作画布） | ✅ 桌面 | 无限画布全套交互（见下）；agent 左 / 资产库右弹出 / 液态玻璃浮岛 |
| 闭环 home→chat→studio | ✅ | 开始创作→chat、确认剧本→studio、项目卡/rail→互通 |
| mobile 375px（chat/studio） | ⚠️ 部分 | home 实测无溢出；chat/studio 移动端走 media 隐藏 agent/draft，未逐屏实测 |
| reduced-motion | ✅ 设计覆盖 | theme.css 有 `prefers-reduced-motion` 降级；生成态脉冲/spinner 在降级下保留状态色文字 |
| 第三方素材风险 | ✅ 无 | 所有缩略图用 CSS 渐变模拟，无第三方图片/品牌/字体外链（Inter 仅 font stack 回退） |

## studio 画布交互（均 Playwright evaluate 实测生效）

pan 平移 · 滚轮缩放(光标锚点, ±5%/格) · 拖标题移动节点(缩放补偿) · 连线实时重绘 · 适应画布 · 整理布局 · 小地图(含视口框) · 节点选中 · Shift 框选批量 · 折叠/展开 · 右键节点类型菜单(6类型+操作) · 端口拉线建节点 · 删除 · 复制 · **撤销/重做(快照栈 + Ctrl+Z/Y)**。

## 发现并修复的问题

| # | 页面 | 问题 | 根因 | 修复 |
| --- | --- | --- | --- | --- |
| 1 | home | 大输入框与设置条重叠、note 错位 | `.settings .note` 用 `flex-basis:100%` 在 `align-items:center` 容器里错位到上方 | note 移出 settings flex，改独立块 `.settings-note` |
| 2 | studio | 节点缩到 35%、偏上、下方大留白 | board 高度塌缩到 241px | `grid sparse` 把 agent 挤到第 2 行；加 `grid-row:1` 锁单行 + `grid-template-rows:minmax(0,1fr)` + 初始 fit 改 rAF |
| 3 | studio | 拖线在空白松手不弹节点菜单 | mousedown(端口)+mouseup(空白) 在共同祖先 board 补发 click，全局 click 把刚弹的菜单秒关 | 弹菜单放进 `setTimeout(…,0)`，让 click 先跑完再弹 |
| 4 | studio | 滚轮缩放一格幅度过大 / 拖拽选中文字 | 步长 ±10% + 无 user-select 限制 | 步长降到 ±5%；`.studio user-select:none`(输入框除外) + 拖拽 preventDefault |
| 5 | chat | 顶栏三态点了没反应、全屏退不出 | 只切了按钮高亮没切布局，且默认错标全屏 | 三态先做实，再按用户要求简化为「全屏/悬浮窗」两态，可互切退出 |
| 6 | 基线 | 早期亮色残留、starter 冗余文件 | 脚本默认亮色模板 | theme.css 调暗 + 删除 starter-index/wireframe |

## 剩余风险 / 注意

- **theme.css 有手工暗色补丁**（input/sidebar/node.active/面板阴影）：勿对工作区盲目重跑 `--regen-html`，否则覆盖；如需改 token，改 design-model.json 后手工合补丁。
- **移动端**：chat/studio 在 <980/1100px 隐藏 agent/draft，移动体验属 Roadmap，未逐屏实测。
- **二级详情页未做**：3D 导播台(360°设机位) / 合成时间线(轨道编辑) / 分镜图全屏编辑 等节点双击详情，目前为占位按钮。
- **数据为演示态**：生成状态、队列、task_id 等为静态示意，非真实后端。
