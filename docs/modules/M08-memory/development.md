# M08 记忆规则与设备缓存｜开发

关联 [需求](requirements.md)。**完整主本和检索在云端；Core只处理有限缓存和outbox；PWA负责管理。** [数据模型](../../05-数据模型与同步.md)、[M14云服务](../M14-cloud-memory/development.md) 是字段与存储依据。

## 写入

设备完成可信交互→结构化事件落outbox→云服务验证来源→规则筛选值得留存→事务保存事件、记忆、同步变更→ACK。trip.returned强制fictional_trip；手动录入user_reported；真实设备交互只能描述被事件证明的事实。

AI筛选或摘要不决定来源。Profile只引用用户自述或确认事实，禁止虚构故事证据；每项有evidence_ids可纠正。新增记忆与全部聊天记录不同，不默认保存所有原文或音频。

## 检索

Core调用 /memories/query；服务先用户权限、删除过滤、source scope，再日期/关键词/标签检索。中文要验证分词/索引，不用默认英语配置假装完成。最多5条/8KiB返回，带来源和证据。

现实查询scope=real排除故事；问小旅行可scope=story；混合查询也保留分组。向模型传递来源字段，不能拼成无来源段落。语义索引后续可加，规则不变。

## 设备缓存

≤100条且≤128KiB，Profile≤8KiB；条目过长保留摘要和云ID。缓存只扫描自身固定上限，不把云库全量下载。2秒查询截止，离线或超时用缓存；明确追问完整历史时如实说明范围，不能假装查过全部。

outbox≤200条/256KiB；满时暂停自动生成旅行、提示同步，不覆盖未确认事件。SD缺失时降级缓存，关键提醒仍内部存储。

## 编辑删除与恢复

PWA编辑带revision，source_type不可改；删除事务先过滤查询、再清索引/摘要/依赖事实和下发设备墓碑。设备离线显示待同步删除。旧备份、重建摘要、旧缓存重连都应用deletion_ledger。

换设备重新配对，逻辑companion不变；主库恢复/迁移增加authority_epoch，设备重取有限快照并保留未确认outbox。缓存不能恢复全部历史，云和逻辑导出都需恢复演练。

## 验收

三类正反例、1万条主库/Core内存恒定、无证据问答、故事污染、编辑冲突、删除后重连、旧备份恢复、满outbox、重复ACK、换角色与设备。

## 分层与关系执行层

新增 RetentionPolicy、TemporalResolver、ImportanceScorer、ConsolidationWorker、RelationshipRepository 和 RecallPlanner，规则唯一来源为 [分层记忆规格](../../12-人格关系与分层记忆系统.md)。它们在云端处理完整历史；Core 只提供有效时间、当前焦点、实际角色版本和有限缓存。

云端先持久化允许事件再ACK，评分/整理异步执行，不阻塞同步和2秒检索。评分任务携带memory_id、revision、model_version与score_version；重复任务不累计分数，旧revision结果不覆盖新编辑。短期到期前触发整理；提醒、outbox和用户固定项使用独立保留规则。

检索加retention_tier、subject、时态有效性与epistemic_status过滤，排序分离relevance/importance/recency。按历史日期检索时允许superseded版本，当前事实不混入旧值。derived_from记录摘要、关系判断和主动候选对证据的依赖，删除/纠正后级联失效。

新增MemoryService缓存失效消息处理与RecallController：Core在前台空闲检查候选、在线验证版本/权限/有效期后显示邀请；A确认播放，B跳过。全局关闭、勿扰、睡眠、正在录音及候选过期均禁止打断。展示回执按plan_id去重，重启不补播。
