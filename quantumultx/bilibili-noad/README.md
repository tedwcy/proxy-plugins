# bilibili-noad (QuantumultX 版)

B站 (iOS v9.12.0+) 去掉启动时的开屏广告（全屏图片 + 倒计时跳过按钮）。

## 机制

**MITM + 响应改写**。`app.bilibili.com/x/v2/splash/list` 返回 splash 广告配置（库存 + 当前激活列表），脚本把这两个数组清空 → app 没有 splash 可显示 → 直接进入首页。

| 端点 | 处理 | 说明 |
|---|---|---|
| `/x/v2/splash/list` | **清空 `data.list` + `data.show`** | splash 库存 + 当前激活 |
| `/x/v2/splash/show` | **清空 `data.show`** | 激活列表（上报用）|
| `/x/v2/splash/brand/list` | 不动 | 节日主题（元旦/中秋），合法 UI |
| `/x/v2/splash/event/list2` | 不动 | 事件埋点 ping |

`brand/list` 故意保留——B站用它展示元旦、中秋等节日主题皮肤，不是广告。

## 安装

把 `bilibili-noad.conf` 的两段内容复制到你的 QuantumultX 配置里：

```ini
[filter_local]
hostname = app.bilibili.com

[http_response]
^https?:\/\/app\.bilibili\.com\/x\/v2\/splash\/(list|show)(\?|$) script-path=https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/bilibili-noad/bilibili-noad.js, requires-body=true, tag=bili-splash, timeout=10
```

QuantumultX 需要开启 MITM（设置 → HTTPS 解密 → 启用）。

启用后**杀掉 + 冷启动 B站 app**。

## 验证生效

Loon 脚本日志应该看到：

```
[BilibiliNoAd] clear data.list: 25 → 0
[BilibiliNoAd] clear data.show: 7 → 0
```

QuantumultX 类似——在 QuantumultX 日志里找 `bili-splash` tag 的输出。

## 与 Loon 版关系

这是 `loon/bilibili-noad/bilibili-noad.plugin` v1.0.0 的 QuantumultX 移植版。脚本文件直接可移植（两平台 JavaScriptCore 运行时一致），主要差别是 config 段格式。

源代码：https://github.com/tedwcy/proxy-plugins/tree/main/quantumultx/bilibili-noad

## 已知限制

- 不影响其他 B站功能（视频播放、评论、动态等）
- B站升级 app 后可能改 endpoint，plugin 可能失效，需重新抓包
- 卸载重装 B站 app 会清掉 splash 缓存，重新抓 splash——plugin 仍然生效

## 版本

- v1.0.0 · 2026-09-28 · 移植自 Loon 版