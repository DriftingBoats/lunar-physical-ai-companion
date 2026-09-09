# M09 独立后端｜开发（可选扩展）

关联 [需求](requirements.md)。与当前设备直连路线的 C++ provider 不是同一份代码；只能共用概念和数据结构，不能把 Python 直接烧进设备。

## 建议实现

Python/FastAPI 定义路由，Pydantic 校验输入，SQLite 保存任务和实体。目录按 api/services/providers/storage 分层；长任务先落 jobs，再由单 worker 领取；不要仅用进程内后台任务承诺掉电恢复。

Provider 接口：`transcribe(audio,language)`、`reply(messages,tools)`、`translate(text,source,target)`、`synthesize(text,voice,language)`、`weather(city)`。统一结果包含 data、usage、provider_request_id、latency_ms、error；实际 HTTP 协议由适配器处理。

Mock provider 返回固定文本、预制短音频及固定天气，并支持超时、错误、重复回调注入。真实 provider 以配置选择，启动检查必需字段，但不在每次启动自动发付费测试。

## 任务执行

事务领取 queued job 并设置租约、deadline；每阶段检查取消和总超时；写入工具动作与事件使用幂等约束。worker 重启时将过期 processing 任务标 failed_interrupted，允许用户新请求；已提交业务动作不能重复执行。

并发先限定每设备 1 个音频任务，全服务可配置上限。外部 429 尊重 Retry-After；只在仍有总预算、重试不会重复不可幂等副作用时重试。LLM 输出结构非法则最多一次修复；不拿错误文本当成功。

## 密钥与配置

个人开发用环境变量，持久部署用独立 secret 存储或加密字段，主密钥与数据库分离。网页只显示掩码，不回传原密钥。可自定义 endpoint 的管理员功能限制协议、目标和重定向，防止后端被当网络代理。

日志关联 request_id，内容脱敏；预算统计不能仅靠估算模型输出字数，优先使用 provider usage，无法获取标估算。达到预算停止新 AI 请求，保留本地功能与已有任务查询。

## 发布交付

锁定依赖、迁移脚本、`.env.example`、健康检查、Mock 测试、部署说明、数据导入导出。迁移到独立后端时先从设备导出并校验，再切 authority_epoch；切换成功前设备仍是主本，不能双端同时写同一数据空间。
