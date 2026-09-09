# M01 硬件与驱动｜开发

关联 [需求](requirements.md)。产出：HAL 封装、独立诊断固件、已验证硬件表，不在本阶段加入 LLM。

## 1. 装配前核验

从三件产品官方页面下载对应原理图和机械图，核对 M5-Bus 的供电、GND、SDA/SCL 与扩展引脚，确认接口方向和螺丝长度。Bottom3 的 RGB IO 开关按实际主控核验后设置，不能凭相似外形判断。断电装配，先按官方供电路径用单一电源验证，再测试组合充电状态。

| 信号 | 已知起点 | 仍要验证 |
|---|---|---|
| Gamepad3 I²C | 地址 0x08；官方例程使用 M5.In_I2C | 主控实际引脚与底座映射、总线冲突 |
| 屏幕和音频 | 使用 M5Unified 初始化 | 板识别、电源使能、采样率 |
| RGB / 扩展端口 | 底座提供切换和扩展接口 | IO 冲突；首版不用可保持关闭 |
| 电池 | Bottom3 独立电池与开关 | 主控电池百分比是否真实反映底座 |

依据：[Gamepad3 示例](https://docs.m5stack.com/en/arduino/projects/faces/faces_gamepad3)。不要手写猜测的引脚或旧版按键 bitmask。I²C 操作串行化；显示、音频初始化依照对应板库。

## 2. 建立硬件诊断

菜单含 Display、Touch、Keys、Mic/Speaker、Wi-Fi、RTC、Storage、Power。每项只做一件事，结果打印串口。建议采集版本表：IDE、板包、M5Unified、M5GFX、M5Faces、USB 模式、Flash/PSRAM 选项、板 SKU。

八键测试先用官方库读取状态，再由项目 InputService 产生边沿事件。硬件例程只证明“状态可读”，长按语义在 M02 实现。

音频先录 3 秒回放，确认采样率、字节序和通道；双麦输入经驱动转单声道，避免直接把交错双声道数据当单声道上传。串口只打印采样统计，不默认输出完整音频。

## 3. HAL 目标接口（伪接口）

```text
DisplayPort.drawScene(scene) / present()
InputPort.readButtonMask() / readTouch()
AudioPort.beginCapture(format) / readChunk() / endCapture()
AudioPort.playChunk(pcm) / stopPlayback()
ClockPort.utcNow() / isValid() / setUtc()
PowerPort.readStatus() -> batteryPercent? / charging? / source
StoragePort.atomicWrite(key, bytes) / read(key)
```

`?` 表示可以未知。HAL 不产生角色台词、不调用 HTTP、不管理页面。失败返回明确错误，由业务决定降级。

## 4. 开发顺序与故障排查

1. 保存原厂恢复指引，编译并上传显示例程。
2. Gamepad3 官方例程逐键测试；失败检查总线和供电，不循环换 GPIO。
3. 音频、RTC、SD 各自独立测试。
4. 联合初始化，检查资源与引脚冲突；记录可用 heap/PSRAM。
5. 最后测底座独立供电、音频最大常用音量、Wi-Fi 请求时是否复位。

USB 拔掉立刻关机可能是电池开关或供电路径问题，不先归因固件。电量读数不可信则返回 null。RTC 完全断电后的保持能力必须实测；失效时由网络校时，不显示伪造时间。

测试记录必须包含预期、实际、照片/日志和硬件版本。通过后固定工具链，再开始 M02。
