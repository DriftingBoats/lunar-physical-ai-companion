# M03 角色与资源｜开发

关联 [需求](requirements.md)，数据和接口见总文档 04/05。

## 1. 预设结构示例

```json
{
  "schema_version":1,
  "preset_id":"lunar",
  "version":1,
  "display_name":"Lunar",
  "identity":"由用户提供并确认的角色身份",
  "personality":{"activity":0.5,"warmth":0.7,"independence":0.6},
  "speaking_style":{"reply_length":"short","custom_text":""},
  "boundaries":[],
  "system_prompt":"",
  "voice":{"profile_id":"voice_profile_demo","languages":["zh-CN"]},
  "asset_pack_id":"pack_demo_01",
  "fallback_animation":"idle"
}
```

这是结构示例，不是对 Lunar 性格或声音特征的事实判断。数值统一 0–1，回复长度 short/medium/long；输入长度受限，非法字段拒绝，不让配置撑爆设备内存。

## 2. 资源包

manifest 包含 pack_id、version、min_firmware_version、canvas、files（path/bytes/sha256）、animations（帧路径、时长、循环、锚点）、固定 audio clips。上传时校验路径不得穿越目录、帧数/文件大小/格式和总解压大小。

制作流程：整理认可原稿→统一角色比例与锚点→输出动作帧→电脑预览→转换设备资源→实机测帧率与透明边缘→生成 manifest。源文件保留透明 PNG；设备初版使用可验证的 PNG 解码或 RGB565+透明遮罩，基准测试后固定一种，不让运行时猜格式。

背景和角色分层；每个动作先做少量关键帧。不要让 AI 在每次运行时生成新角色图片。固定提示音放小资源包，TTS 结果走媒体缓存，不混入永久角色包。

## 3. 切换事务

网页保存草稿→云配置服务校验并发布不可变版本→desired_revision 增加→设备下载到 staging→逐文件校验→试加载 idle 和基础音效→等待当前对话/录音结束→切换 active 指针→ack applied。

任何失败保留旧指针和配置，ack rejected 带具体原因。重启检查 active manifest 完整性；旧资源在新版本稳定后才清理。当前 job 固定使用开始时角色版本，不在一句话中途换音色。旅行未结束时推迟激活新角色至返程结束，控制中心显示等待原因。

## 4. 提示构建

Core 组合：程序约束与工具协议→当前角色设定→用户偏好→带来源的记忆→当前话语。生成文本不直接决定数据库来源字段。世界边界用枚举/校验器执行，不能只靠提示词。

## 5. 验收

使用第二个占位预设验证没有 Lunar 硬编码；试缺文件、错 hash、版本不兼容、SD 满、下载断网、中途重启。对比 config desired/applied，保证页面显示真实状态。正式形象与音色验收由用户试听/看动作后记录，开发者只记录技术通过不能替代角色认可。
