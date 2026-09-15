# Baidu Maps 去广告

去掉 Baidu Maps (iOS v21.20.30) 的部分广告：
- ✓ **开屏广告**（冷启动时全屏图片）
- ✓ **首页左上角圆形图标广告**
- ✓ **首页顶部横幅广告**
- ✗ 首页顶部文字通知条（**app 内部 cache + HTML webview 双重渲染，无法通过 MITM 拦截**）

## 机制（v1.3.0 = v1.0.0 行为回退）

**纯 MITM，零 Script 改写。** 把广告域名加进 Loon MITM 名单 → Loon 拦截 HTTPS → 用 Loon CA 签的假证书给 app → app SSL pin 检测失败 → HTTPS 连接断 → 广告 SDK 静默失败 → 广告位置渲染为空。

不依赖响应内容改写、不需要清 app 缓存。

## MITM 域名（SSL pin 失败机制）

| 域名 | 拦截的广告类型 |
|---|---|
| `afdconf.baidu.com` | **开屏广告 config server**（返回 `nad_splash_*` 配置） |
| `ecom.map.baidu.com` | AFD 广告框架：首页 in-page 广告 slot（圆形 / 横幅）|
| `integralwall.baidu.com` | 积分墙：广告决策中枢（`/integralwall/interact/check`）|
| `i.qchannel03.cn` | QChannel 第三方广告聚合 SDK（`/center/idpe`, `/combine`）|
| `nsclick.baidu.com` | 广告点击追踪像素（`/v.gif?type=1023`）|
| `usr-api.yunxish.com` | Admaster 第三方广告监测上报（`/report/v1`）|
| `logrcv.yunxish.com` | Admaster log receive（besnew 追踪数据）|

## ⚠️ 启用后必须冷启动 app

插件启用 / 更新后第一次必须先杀掉 app 再冷启动，否则 splash 可能仍显示（本地缓存旧 splash 创意）。

操作步骤：
1. Loon 启用 plugin
2. 后台杀掉 Baidu Maps（上滑退出）
3. 重新打开 Baidu Maps

如果 splash 仍顽固显示：iOS 设置 → 通用 → iPhone 存储空间 → 百度地图 → **卸载重装**（彻底清沙盒）。

## 安装

```
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/baidu-maps-noad/baidu-maps-noad.plugin
```

Loon → 配置 → 插件 → 右上 + → 通过 URL 添加插件。

## 版本历史

| 版本 | 状态 | 备注 |
|---|---|---|
| **v1.3.0** (2026-09-15 12:15) | **当前版本** | 回退到 v1.0.0 行为。v1.1/v1.2 尝试改写顶部 banner / 笔记列表，因 app 缓存 + HTML webview 双重原因无法生效。Ted 接受当前状态（开屏 + 圆形消失就够）|
| v1.2.0 (2026-09-15 00:36) | 撤回 | 加 `/cms/page/def` + `/feed/govui/rich_content` [Script] 改写。分析错 endpoint——`/cms/page/def` 是点击后的详情页而非 banner 源；`/feed/govui/rich_content` 是笔记列表（含 HBTI 文章但不是顶部 banner）|
| v1.1.0 (2026-09-15 00:30) | 撤回 | 加 `/feed/govui/rich_content` [Script] 改写。找错 endpoint——以为是顶部 banner 源，实际是笔记列表|
| v1.0.0 (2026-09-15 00:21) | 撤回（行为合并入 v1.3.0）| 初版，纯 MITM（7 域名）。处理 splash / 圆形 / 横幅 ✓ |

## 已知限制

- 顶部文字 banner（"点击测测你的精神状态..."）无法去除，**实测两种拦截路径都失败**：
  - HTTP 改写：banner 内容在 app 进程内 cache，HTTP 响应被改后已渲染的 UI 不会重画
  - HTML webview 拦截：banner 文案实际从 `newclient.map.baidu.com/feed/govui/rich_content` 的 notes 列表中取**一条**（含 `articleInfo.articleList[0].title: "点击测测你的精神状态..."`），与点击 banner 跳转的 `map.baidu.com/vercel/spore/...&fr=xiaohuangtiao` HTML 页面是两条不同的链路。app 把 banner 文案**预渲染进 view controller**后再调 rich_content，太晚
- 不影响地图核心功能（路径规划 / 导航 / 搜索 / 公交）
- Baidu 升级 app 后可能改 endpoint（`afdconf` / `ecom` 等域名），plugin 可能失效，需重新抓包
- iOS 越狱设备如装 SSL Kill Switch 等插件，可能绕过 SSL pin

## 抓包实证

抓包来源：iPhone 16 Pro + iOS 21.20.30 + Loon MITM，2 小时内反复开关 app 触发广告生成 513 条 + 重新抓包 427 条网络记录。

关键观察：

1. **首页圆形 + 横幅**：MITM 打开后**立即消失**——证实 SSL pin 机制生效
2. **开屏广告**：第一次抓包时还在显示——因为 splash 用的是 `afdconf.baidu.com`（独立子域名），不在 Ted 原有的 `*.map.baidu.com` MITM 名单里
3. **开屏内容每次启动都变**——证实 splash 创意是网络实时拉的，不是缓存
4. **顶部文字 banner**：MITM 加 [Script] 改写 `data.posts.content = []` 后仍显示——app 在调 rich_content 之前已渲染 banner view