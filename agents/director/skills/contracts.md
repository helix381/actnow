---
name: contracts
description: G2 Step 2 · 五大契约——Mix / Rules / Arc / Pressure / Structure + 弧光5轨道
inject_when: genesis_step == "create"
---

## Mix Contract
- logline：20-30字，主角身份+核心机制+最直接代价，禁抽象修辞
- des：主角行动目标，电报体<=15字
- cst：不可逆核心代价，<=15字（物理/关系/身份，禁"心理受挫"）
- prms：商业承诺数组，每条可拍+可重复+可升级，必含：反转类x1 + 压迫升级类x1 + 关系裂变类x1

## Rules Contract
- world：2-5条规则，格式"触发条件->可见结果"，至少1条反常识
- phys：物理铁律（表层伪装->承压时显现破坏痕迹，不可逆损耗）
- red_herring：{fake_villain, fake_purpose, fake_disaster} — crisis前主角推演必须在此掩体内
- anomaly_matrix：底层真相的异象如何用局内人视角降维表达（禁写终极真相词汇）
- taboos：2-5条禁区，触发即惩罚且可视化，至少1条与主角欲望强绑定

## Arc Contract
- flaw：初始缺陷（导致策略失败的具体缺陷，禁"善良/热血"泛词）
- turn：旧策略->新策略的触发类型
- stages：[S1表象期, S2误判期, S3偏执补天期, S4觉醒破局期, S5终局清算期]
  - S4 只在 crisis_ep 触发；S5 只在 climax

### 弧光5轨道选择

根据题材/冲突类型选择弧光轨道：

| 轨道 | 核心驱动力 | 适用题材 | 觉醒方式 |
|------|-----------|---------|---------|
| A 认知反转型 | 对现实的错误认知 | 悬疑/末世/穿越/信息差 | 看见真相 |
| B 能力错判型 | 对自身能力的误判 | 逆袭/打脸/成长 | 发现真正力量 |
| C 关系错认型 | 对人际关系的误判 | 虐恋/宫斗/家庭 | 识破真面目 |
| D 天真灰度型 | 天真->接受灰度 | 权谋/职场/商战 | 接受世界不完美 |
| E 命运摆弄型 | 被命运操控->夺回主动权 | 宿命/轮回/命运 | 主动选择 |

选定后记录 logic.arc_track_type，贯穿 G3 全程。

## Pressure Contract
- src：核心压力源
- methods：4-8条手段，含制度类+资源类+关系类各>=1条，每条可拍
- continuity：压力无法消失的机制理由（1-2句，可检验）

## Structure Contract
- nodes：{ep1:1, paywall_ep, midpoint, crisis, climax}
- node_tasks：
  - ep1：规则+代价上桌，金手指预告，前15秒用公式A或B
  - paywall_ep：首次不可逆损耗，集尾停危机前一帧，严禁完结感
  - midpoint：主角基于 red_herring 发起最大行动，不揭终极真相
  - crisis：伪解答崩溃，核心资源清零，此刻才允许揭底牌
  - climax：清算终极真凶，ep1 镜像呼应
