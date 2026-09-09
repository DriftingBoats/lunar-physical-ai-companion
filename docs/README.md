# 开发文档导航

版本 v0.3 · 2026-09-09。面向新手与后续开发人员。**当前仅完成需求和开发设计，代码、云服务、PWA和实机测试尚未实现。**

已确认：通用可换角色，Lunar默认；Core直连云端STT/LLM/TTS；云端主记忆与检索；Core有限缓存；PWA管理端可添加主屏幕。虚构故事与真实经历分开。

## 新手阅读顺序

1. [01 新手上手](01-新手上手.md)：准备什么、第一次如何测试。
2. [02 总体架构](02-总体架构.md)：各部分负责什么、模型在哪里运行。
3. [03 开发路线](03-开发路线与任务清单.md)：每一步做完什么才继续。
4. 开发某模块时，先读需求，再读同目录开发说明。

## 总体文档

| 文档 | 用途 |
|---|---|
| [04 接口契约](04-接口契约.md) | 云记忆、配置、同步、配对与错误协议 |
| [05 数据模型](05-数据模型与同步.md) | 云主库、缓存、版本、删除、备份 |
| [06 联调与发布](06-联调测试与发布.md) | 必测用例、指标、发布与排错 |
| [07 决策与资料](07-待确认事项与资料来源.md) | 已确认、待实测、官方资料 |
| [08 架构比较](08-手机存储与通信方案.md) | 为什么选云端，其他方案的代价 |
| [09 Core直连AI](09-设备直连开发基线.md) | 音频和模型运行位置、provider接入 |
| [11 云端记忆](11-云端记忆服务开发基线.md) | 轻量记忆服务的实施基线 |
| [12 人格、关系与分层记忆](12-人格关系与分层记忆系统.md) | 长短期与临时事件、时间、关系、重要性评分及主动回忆 |
| [13 Ombre Brain 参考与实施](13-Ombre-Brain参考与记忆实现方案.md) | 证据引用、情绪归属、自省、活跃度及分阶段检索实现 |
| [14 自主生活与小旅行](14-自主生活与小旅行总览.md) | 出发、外出、返程、纪念物与记忆的体验总览，关联M06需求和开发 |

## 主方案模块

| 模块 | 需求 | 开发 | PRD对应 |
|---|---|---|---|
| M01 硬件与驱动 | [需求](modules/M01-hardware/requirements.md) | [开发](modules/M01-hardware/development.md) | 5、15、26、33 |
| M02 固件/屏幕/按键 | [需求](modules/M02-firmware-ui/requirements.md) | [开发](modules/M02-firmware-ui/development.md) | 6–8、14–18、28 |
| M03 角色与资源 | [需求](modules/M03-character/requirements.md) | [开发](modules/M03-character/development.md) | 22、29、通用设定 |
| M04 语音对话 | [需求](modules/M04-voice/requirements.md) | [开发](modules/M04-voice/development.md) | 14、23 |
| M05 中泰翻译 | [需求](modules/M05-translation/requirements.md) | [开发](modules/M05-translation/development.md) | 18 |
| M06 生活/小旅行 | [需求](modules/M06-life-trips/requirements.md) | [开发](modules/M06-life-trips/development.md) | 9–11 |
| M07 天气/时间/提醒 | [需求](modules/M07-world-reminders/requirements.md) | [开发](modules/M07-world-reminders/development.md) | 12–13、28 |
| M08 记忆规则/缓存 | [需求](modules/M08-memory/requirements.md) | [开发](modules/M08-memory/development.md) | 19、24 |
| M10 PWA管理端 | [需求](modules/M10-control-center/requirements.md) | [开发](modules/M10-control-center/development.md) | 20–26、29 |
| M11 配网/设备/升级 | [需求](modules/M11-device-network/requirements.md) | [开发](modules/M11-device-network/development.md) | 26–29 |
| M12 插件框架 | [需求](modules/M12-plugins/requirements.md) | [开发](modules/M12-plugins/development.md) | 17、25、30 |
| M14 云端记忆服务 | [需求](modules/M14-cloud-memory/requirements.md) | [开发](modules/M14-cloud-memory/development.md) | 5、19、24 |

## 可选参考，不作为当前任务前置

- [M09 全功能独立后端需求](modules/M09-backend/requirements.md) / [开发](modules/M09-backend/development.md)：未来需要中转全部音频或复杂编排才使用。
- [M13 iPhone主库需求](modules/M13-iphone-memory/requirements.md) / [开发](modules/M13-iphone-memory/development.md)、[原方案细节](10-iPhone记忆中心与检索.md)：备用本地化路线，不是当前主库。
- [早期后端方案](optional/backend/README.md)：历史备选设计。
- [架构调整前PRD](archive/PRD-20260909-架构调整前.md)：仅供追溯；当前PRD见项目根目录。

## 文档约定

需求=要达到什么；开发=如何实现；验收=怎样证明。所有阈值为建议初始值，待实测；未执行不能勾选通过。后续改变协议或上限时，同步修改总契约、模块和测试。用户最新确认优先，旧可选方案不能覆盖当前主线。
