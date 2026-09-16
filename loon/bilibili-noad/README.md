# Bilibili 去开屏广告

去掉 Bilibili (iOS v9.12.0+) 启动时的开屏广告（全屏图片 + 倒计时跳过按钮）。

## 机制

**MITM + 响应改写**。`app.bilibili.com/x/v2/splash/list` 返回 splash 广告配置（库存 + 当前激活列表），插件把这两个数组清空 → app 没有 splash 可显示 → 直接进入首页。

| 端点 | 处理 | 说明 |
|---|---|---|
| `/x/v2/splash/list` | **清空 `data.list` + `data.show`** | splash 库存 + 当前激活 |
| `/x/v2/splash/show` | **清空 `data.show`** | 激活列表（上报用）|
| `/x/v2/splash/brand/list` | 不动 | 节日主题（元旦/中秋），合法 UI |
| `/x/v2/splash/event/list2` | 不动 | 事件埋点 ping |

`brand/list` 故意保留——B站用它展示元旦、中秋等节日主题皮肤，不是广告。如果哪天发现 brand 也成了广告位，再加进脚本。

## 抓包实证

抓包来源：iPhone + iOS + Loon MITM，369 条网络记录。

**关键发现**：

1. `app.bilibili.com` 没有 SSL Pinning（Loon CA 证书直接 MITM 成功），所以**纯 MITM 不会让 splash 失败**，必须**改写响应**
2. splash 列表接口 `/x/v2/splash/list` 返回 256KB——25 个 splash 库存 + 7 个当前激活
3. 实际显示逻辑：app 启动 → 调 splash/list → 拿当前激活的 7 个 → 显示 → 用户点击"跳过"或倒计时结束 → 调 splash/show 上报

**所以清空 `data.list` 和 `data.show` 就够**——app 拿到空列表直接走"无 splash"分支。

## MITM 域名

```
app.bilibili.com
```

**只 MITM 了一个域名**——bilibili 的其他资源走 `i0.hdslb.com`（视频/图片 CDN），MITM 它会破坏视频播放，所以**不加入**。

## 安装

```
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/bilibili-noad/bilibili-noad.plugin
```

Loon → 配置 → 插件 → 右上 + → 通过 URL 添加插件。

启用后**必须冷启动 Bilibili app**（上滑彻底退出后重开），否则 app 可能继续显示已 cache 的 splash。

## 已知限制

- 不影响其他 B站功能（视频播放、评论、动态等）
- B站升级 app 后可能改 endpoint（splash/list path 等），plugin 可能失效，需重新抓包
- 卸载重装 B站 app 会清掉 splash 缓存，重新抓 splash——plugin 仍然生效

## 版本

- v1.0.0 · 2026-09-16 22:01 · 初版，基于 101_1789567167780.zip 抓包（369 条记录，iOS 9.12.0）