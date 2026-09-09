# M13 iPhone 记忆中心｜开发

> **可选历史方案，非当前主线。用户最终选择云端主记忆与 PWA；以下仅在未来明确重启 iPhone 主库路线时使用。**

关联 [需求](requirements.md)。实现前需准备 Mac/Xcode、iPhone 真机与签名环境，当前 Windows 只做固件和协议测试。[Xcode 官方说明](https://developer.apple.com/xcode/)

## 1. 应用分层

SwiftUI Views→ViewModel→MemoryRepository / SearchService / SyncCoordinator→SQLite / CoreBluetooth。数据库操作放后台串行 actor/队列，UI 更新回主线程；禁止蓝牙回调直接全库扫描。

建议文件职责：MemoryRecord、MemoryRepository、MemorySearchService、BluetoothCentral、MessageAssembler、SyncCoordinator、CachePlanner、BackupService、SettingsStore。公开接口便于注入 FakeBluetooth 和内存测试库。

## 2. 存储与检索

先落主表与迁移，开启外键和事务；事件唯一约束负责去重。全文索引与主库在一致事务或带 index_revision 的任务里维护。搜索先筛来源与删除状态，再对标题、关键词、日期和内容评分，最后裁到条数/字节上限。

中文匹配需验证“曼谷”“拿快递”等词组，不假设按空格切词有效；记录原始 Unicode，查询归一化不改变存储原文。长记录返回经过确定性裁剪或已有摘要，附 ID 与来源。首版不自动调用模型重写每次检索结果，避免额外延迟和语义漂移。

## 3. 蓝牙与生命周期

手机 central 扫描项目固定 service UUID，用户选择后设备屏幕确认绑定；只接受授权设备。重连后先 hello 检查 epoch、版本与上限。GATT notification 订阅、分片重组和应用 ACK 分离，具体消息见接口契约。

开启确有用途的 bluetooth-central 后台模式和状态恢复；记录 app_state 与检索耗时。恢复时重新打开数据库，若受文件保护暂不可读返回 NOT_READY。不能用循环静音播放等方式假维持后台，不能保证用户强制退出后仍能检索。

调用系统 API 前处理蓝牙授权和开关状态。网络不是这条 BLE 记忆链路的必要条件；手机无互联网但 App 活跃时仍能查本地库。Core 云语音是否可用另由设备 Wi-Fi 判断。

## 4. 同步事务

收到 events.push→校验每项大小、事件类型和来源→BEGIN→INSERT event if absent→创建/更新归档和 change→COMMIT→ACK。若一批部分无效，逐项返回 accepted/rejected，不能把未落库项目放 accepted。

手机提交记忆删除时写 deletion_ledger 和 sync change，检索立即排除。CachePlanner 按固定预算输出快照；先下发删除，再发增量和替换快照。Core ack applied 前显示待同步。

主本恢复或换手机：预览备份→导入事务→增加 epoch→设备实体确认→保留未确认 outbox 并重放→刷新缓存；旧 epoch 的晚到查询不能被使用。

## 5. 管理界面和备份

记忆卡显示来源、日期与角色版本，详情可查看证据摘要；编辑不改变来源。删除可撤销只在明确设计的本地窗口内实现，不能与已发布墓碑冲突；首版可直接确认删除而不做撤销。

导出数据包包含 schema、主库逻辑数据、版本和删除标识；使用文件分享/保存面板。默认不导出配对密钥和服务商 key，不依赖 App 卸载后数据仍在。恢复先检测包大小、版本、哈希及冲突，再导入。

## 6. 验收交付

数据库单测、重复事件/删除/迁移测试、1万条中文与少量泰文检索测试；手机真机 BLE 前后台矩阵、强制退出及重启测试、备份恢复录像。固件用电脑 Mock 可验证相同协议，但 iPhone 发布前仍需真实设备结果。
