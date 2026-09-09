# M07 时间、天气与提醒｜开发

关联 [需求](requirements.md)。Core 调用外部 LLM 解析自然语言、调用天气 API；Core 校验并负责本地定时，云服务同步管理记录。

## 1. 时钟

启动读 RTC，验证合理范围；联网从可信时间服务校时并更新 RTC。设备同时维护 wall clock（日期时间）和 monotonic clock（按键/超时），不能混用。首次配置由用户确认时区，PWA 可修改时区设置。

提醒存 due_at UTC 与原始 timezone。用户切换时区时，已有一次性提醒仍保持同一绝对时刻，界面转换前地显示；如要随前地墙钟调整，必须显式编辑。处理不存在或重复的夏令时时间需要确认，不能随意选一个。

RTC 无效时显示未校时，保留提醒但不按猜测时间触发；联网后评估错过的提醒。重启错过 ≤24 小时的未完成提醒合并显示一次“错过的提醒”，更旧记录只留管理列表；不补播所有声音。

## 2. 天气

WeatherProvider 返回 condition 枚举、temperature_c、city、observed_at、fetched_at、timezone。枚举映射 sunny/cloudy/rain/snow/unknown；模型不能制造真实天气数据。Core 每 30 分钟建议刷新并保存缓存；30 分钟是节流建议，不是强制每帧请求。

城市配置变化清除旧城市可见天气，等待新结果；错误可显示无天气场景。未来允许机机定位时需单独获取权限，本版机动城市即可。

## 3. 提醒状态与确认

```text
stored_cloud -> applied_device -> due -> completed
due -> snoozed -> due
stored_cloud/applied_device/due/snoozed -> cancelled
```

设备语音创建：Core 本地持久化即在本机生效，再同步云记录。PWA 创建：云端 stored_cloud，设备下载原子保存并 ack 后变 applied_device；未 ack 显示“已保存，设备连接后生效”。

每次 complete/snooze 有唯一 event_id，先落本地再更改显示。到点触发记录 delivery_id，防止重启重复弹同一通知；用户未处理仍可在列表找到。completed/cancelled 优先于旧 snooze，详见同步冲突规则。

录音时提醒排队；网络等待时可以取消旧语音焦点展示提醒。通知声音受音量和静音设置影响，屏幕提示仍展示。设备关机无法保证响铃；机机可作为另一个提醒终端，但默认不双端同时响，需选择主提醒设备。

## 4. 开发步骤与验收

先用固定时间创建提醒→注入时钟触发→实现 A/B→断电恢复→再接自然语言。测试 19:00 前后、跨日、时区变化、两条同时到达、离线完成后同步、PWA关闭/云记忆不可用、存储失败不得答“好”。天气用固定 provider 和过期时钟测试后才接真实 API。
