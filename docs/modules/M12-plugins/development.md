# M12 插件框架｜开发

关联 [需求](requirements.md)。固件中建立静态 registry，不做动态装载可执行代码。

## manifest 与生命周期

```json
{"id":"translator","version":1,"title":"翻译","required_capabilities":["microphone","speaker"],"online_features":["new_translation"],"config_schema_version":1}
```

伪接口：`onEnter(context)`、`onInput(event)`、`onTick(now)`、`render(canvas)`、`onExit(reason)`。context 只暴露受控音频、存储和请求服务，不给任意跨模块状态写权限。在线功能与整个插件分开声明，因此离线历史仍可浏览。

配置含 enabled、language_pairs、允许的局部键映射，保存前做 schema 校验和冲突检测。保留 Start、退出与设备恢复手势；翻译长按 B 与短按 B 可共存，因为输入层提供不同事件。

进入插件前检查能力；onExit 必须取消对应 session、停止音频、释放缓存和焦点。禁用正在运行的插件与用户主动退出走同一清理路径，防止菜单移除了仍有声音。

## 扩展步骤

新插件先写需求、输入表和离线行为→加入 manifest 和静态 registry→实现生命周期→补配置 schema 和迁移→添加退出及异常测试→发布固件。不要仅把页面注册进菜单而漏掉资源清理。

验收使用 mock 插件故意超时、请求不存在能力和退出中回调，确认其他页面不受影响。
