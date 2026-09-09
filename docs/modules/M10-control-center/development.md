# M10 PWA 管理端｜开发

关联 [需求](requirements.md)。建议TypeScript/React/Vite，构建为HTTPS静态网页，同源代理记忆/配置API的会话入口。首版不做原生iPhone App，Windows可开发。

## 页面和状态

pages分DeviceHome、Character、Brain、Memory、Plugins、DeviceSettings；Reminder管理作为子页。api层统一认证、错误、revision与分页，服务状态不混入组件随意猜测。

保存配置→云返回desired_revision→显示待设备应用→设备ack applied后显示已生效。保存失败保留草稿；409展示最新与本地改动供选择。source_type不可编辑；删除后显示设备缓存是否待清理。

模型密钥只写输入，保存后清空字段，GET掩码；不写localStorage或日志。云端加密保存，只给授权设备其自身配置。试听只有用户点击才发请求，结果区分音色不支持与网络失败。

## PWA配置

Memory增加retention_tier、source、subject、日期与重要性筛选，详情分别展示现实/故事时间、valid_to与expired/superseded状态。分数旁给简短理由，展开才出现分项；“长期保存”“不再主动提及”“删除”是不同操作，不共用一个开关。

“我们之间”读取relationship_state和证据条目，用户可确认称呼/关系与纠正推断；缺证据时标待确认。Character显示learning proposals，接受后生成新preset版本并等待设备ACK。主动回忆设置由云保存并撤销候选，设备同步后显示已应用；离线修改只存草稿，不假承诺即时停止其他设备。

manifest定义id、name、short_name、start_url、scope、display=standalone、theme_color、background_color和192/512图标；另提供Apple touch icon。路径按实际部署子目录一致配置，不能start_url越scope。HTTPS用于正式部署。

service worker预缓存带hash的静态壳；导航network-first并离线回退；私密API默认network-only，不缓存POST和凭据。需要离线草稿时用按用户分区的IndexedDB，只存必要表单，不缓存API key。退出或换账号清理该用户草稿和私密缓存，并告知未提交草稿会丢失。

有更新时提示“新版本可用”，用户完成/保存草稿后刷新；不要无条件skipWaiting在用户编辑中强刷。静态缓存带版本，激活后清旧版。API响应含协议版本，客户端不兼容时提示更新而不乱写数据。

PWA安装基础与manifest见 [MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)。iOS不依赖beforeinstallprompt弹安装窗，页面给手动添加指引；添加主屏幕不等于获得原生BLE或永久后台权限。

## 配网与设备绑定

云PWA与设备本地配网页是两个入口。首次用户手动连设备随机密码SoftAP→打开设备显示的本地地址→配置家庭Wi-Fi→设备接入云服务显示配对码→回PWA登录认领→设备实体A确认。热点切换会断开浏览器原网络，设备屏幕给下一步指引。

云HTTPS网页不要直接fetch本地HTTP设备接口，避免混合内容和跨域限制；配网通过单独顶层本地页面完成。添加到主屏幕只针对云PWA，不将临时热点地址当日常App地址。

## 离线和同步

首版离线只保存草稿，不自动后台提交修改；重新打开且联网后提示用户提交，带原base_revision做冲突检查。删除、恢复、固件命令等操作要求在线确认结果，不能只靠浏览器后台同步承诺执行。

命令一旦云端保存，设备何时拉取与PWA是否常驻无关。设备每30秒建议检查配置（与同步合并），网页显示last_seen和desired/applied；3分钟无心跳显示离线。大资源上传限量、显示进度、失败保留旧角色。

## 响应式和验收

建议触摸目标至少44px，页面适配安全区域和虚拟键盘；不依赖hover。360/390/768px与桌面检查表单、长名称、中泰文本和弹窗。六个管理模块移动端可用菜单收纳，避免拥挤底栏。

测试Safari普通/主屏幕登录态、授权回调、深层刷新、上传导出、断网草稿、换账号、SW升级、权限拒绝。关闭所有页面后设备语音和云记忆仍工作。发布交付包含构建命令、锁文件、manifest、图标、SW、路由回退和API环境配置；当前没有代码或部署成果。

## Ombre Brain 参考补充

用GET /memories/{id}/evidence按权限分页读取片段，默认4KiB。展示事件/摘要/原话/角色反思区别；情绪缺失显示未标注，不能当中性。低活跃展示读取surface_state，不改生命周期。 共同约束见 [13 记忆实现方案](../../13-Ombre-Brain参考与记忆实现方案.md)。
