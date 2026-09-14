# Baidu Maps 去广告

去掉 Baidu Maps (iOS v21.20.30) 的三种广告：开屏广告、首页左上角圆形图标广告、首页顶部横幅广告。

## 机制

**纯 MITM，零 Script 改写。** 把广告域名加进 Loon MITM 名单 → Loon 拦截 HTTPS → 用 Loon CA 签的假证书给 app → app SSL pin 检测失败 → HTTPS 连接断 → 广告 SDK 静默失败 → 广告位置渲染为空。

不依赖响应内容改写、不需要清 app 缓存（除非本地有旧 splash 创意缓存，见下文）。

## MITM 域名

| 域名 | 拦截的广告类型 |
|---|---|
| `afdconf.baidu.com` | **开屏广告 config server**（返回 `nad_splash_*` 配置） |
| `ecom.map.baidu.com` | AFD 广告框架：首页 in-page 广告 slot（圆形 / 横幅） |
| `integralwall.baidu.com` | 积分墙：广告决策中枢（`/integralwall/interact/check`） |
| `i.qchannel03.cn` | QChannel 第三方广告聚合 SDK（`/center/idpe`, `/combine`） |
| `nsclick.baidu.com` | 广告点击追踪像素（`/v.gif?type=1023`） |
| `usr-api.yunxish.com` | Admaster 第三方广告监测上报（`/report/v1`） |
| `logrcv.yunxish.com` | Admaster log receive（besnew 追踪数据） |

## 抓包实证

抓包来源：iPhone 16 Pro + iOS 21.20.30 + Loon MITM，2 小时内反复开关 app 触发广告生成 513 条网络记录。

关键观察：

1. **首页圆形 + 横幅**：MITM 打开后**立即消失**——证实 SSL pin 机制生效
2. **开屏广告**：第一次抓包时还在显示——因为 splash 用的是 `afdconf.baidu.com`（独立子域名），不在 Ted 原有的 `*.map.baidu.com` MITM 名单里
3. **开屏内容每次启动都变**——证实 splash 创意是网络实时拉的，不是缓存

## ⚠️ 关键：启用后必须冷启动 app

**插件启用后第一次必须先杀掉 app 再冷启动**，否则 splash 仍可能显示（本地缓存了旧 splash 创意）。

操作步骤：
1. Loon 启用 plugin
2. 后台杀掉 Baidu Maps（上滑退出）
3. 重新打开 Baidu Maps

如果 splash 仍顽固显示：
- iOS 设置 → 通用 → iPhone 存储空间 → 百度地图 → **卸载重装**（彻底清沙盒）
- 重新下载 app（数据靠 baidu 账号云同步）

## 安装（URL）

```
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/baidu-maps-noad/baidu-maps-noad.plugin
```

Loon → 配置 → 插件 → 右上 + → 通过 URL 添加插件 → 启用 → MITM hostname 自动接管。

## 与原 baidu-strip-altsvc 区别

`baidu-strip-altsvc` 已撤回（卡顿真凶是 HTTPDNS，不是 Alt-Svc）。本 plugin 是不同问题域——只解决广告，不涉及网络性能。

## 已知限制

- **无响应改写**，纯 MITM SSL pin 失败机制
- 不影响地图核心功能（路径规划 / 导航 / 搜索 / 公交）——这些走 `newclient.map.baidu.com`，未加入 MITM
- MITM `*.baidu.com` 用户可能需要把 `newclient.map.baidu.com` 也加进去（取决于 Loon 配置）
- Baidu 升级 app 后可能改 endpoint（`afdconf` / `ecom` 域名变了 plugin 即失效），但 SSL pin 思路不变
- iOS 越狱设备如装 SSL Kill Switch 等插件，可能绕过 SSL pin，需要单独处理

## 版本

- v1.0.0 · 2026-09-15 00:21 · 初版，基于 92_1789401831273.zip 抓包（513 条记录，2 小时反复开关 app 触发）
- 仅 MITM 域名列表，无 [Script] 段