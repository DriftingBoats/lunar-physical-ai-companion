# M11 网络与设备｜开发

关联 [需求](requirements.md)。完整首版流程见 [直连基线](../../09-设备直连开发基线.md)。

## 网络状态

NetworkService 管理 disconnected / connecting / lan_ready / internet_ready；每个 provider 另有 ready / failed 状态。连接重试建议 1、2、4、8、30 秒上限加抖动，不能每帧重连。请求失败不触发反复擦除 Wi-Fi 配置。

AI 使用 HTTPS、证书验证和正确时间，不用 insecure 模式解决证书问题。先做可信校时，再发带密钥请求；无法校时或证书失败时保留离线功能。网络恢复不自动重发已取消的旧语音，不自动收费补生成所有故事。

本地管理通道：独立随机 SoftAP 密码、屏幕配对码、限时会话、写操作 token；外部 Wi-Fi 管理要使用可信配对密钥建立加密通道，不能把 provider secret 经普通开放 LAN 明文传输。首版可限制敏感配置仅 USB 或隔离配网通道；生产支持局域网敏感编辑前完成证书/配对通道专项验证。

## 存储与诊断

NVS 保存小配置和令牌，SD 保存媒体、有界历史缓存和 outbox，关键提醒留内部持久化副本。诊断显示网络分层、存储空闲、运行时间、重启原因、固件/资源版本、最近错误，不默认显示密钥。设备持有用户自己的服务密钥，不能在分发固件中放所有人共用的厂商密钥。

## 固件更新

首个原型 USB 烧录，稳定后再 OTA。按照 [Espressif OTA 文档](https://docs.espressif.com/projects/esp-idf/en/stable/esp32s3/api-reference/system/ota.html) 设计两个 OTA 应用槽及 OTA 数据分区；确切大小由编译结果与 16MB 总预算确定，不提前填未经验证的分区表。

更新清单含 hardware_id、version、min_protocol、image_bytes、sha256、签名、兼容 schema 范围。校验可用空间和稳定供电→写非活动分区→完整校验→重启自检→标记有效。自检检查配置和基本外设，不要求互联网必须在线，避免离线误回滚。

Arduino 预构建 bootloader 未必启用所需回滚；必须验证构建选项和故障路径。未验证时只开放有线恢复，不把“写了第二分区”当作已实现回滚。OTA 来源可为电脑手动上传签名文件或静态 HTTPS 发布地址，不需要全功能音频中转后端。

## 备份恢复与蜂窝扩展

完整记忆由云服务和 PWA 导出；设备导出只含本地配置及有限副本。导出时标 schema、revision、companion_id、authority_epoch、删除标识和资源哈希。恢复前预览且校验，保留旧快照，凭据单独重新配置；清空设备不代表撤销已经存在的外部服务密钥，需要用户在服务商处管理。

蜂窝接口统一成 NetworkTransport，但 UART/USB 驱动、供电峰值、天线和可用引脚必须实测。先以 USB 稳定供电跑模块，再测电池、温升、掉线与累计费用，不按 600mAh 推算宣称全天续航。
