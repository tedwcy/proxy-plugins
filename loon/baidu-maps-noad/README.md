# Baidu Maps 去广告

去掉 Baidu Maps (iOS v21.20.30) 的广告：开屏广告、首页左上角圆形图标、首页顶部横幅、**首页顶部文字通知条**。

##机制（v1.1.0，混合策略）

**两路并用**：

1. **MITM SSL pin 失败**（适用于 7 个域名）：让广告 SDK 静默失败
2. **响应改写**（1 个端点）：富文本接口必须清空 `data.posts.content`

### MITM 域名（SSL pin 失败机制）

| 域名 | 拦截的广告类型 | 机制 |
|---|---|---|
| `afdconf.baidu.com` | **开屏广告 config server** | pin 失败 → splash 没 config |
| `ecom.map.baidu.com` | AFD 广告框架：首页 in-page 广告 slot | pin 失败 → 圆形 / 横幅 |
| `integralwall.baidu.com` | 积分墙：广告决策中枢 | pin 失败 → 积分墙不显示 |
| `newclient.map.baidu.com` | 主 API 域名（必经），MITM 是 [Script] 改写的前提 | HTTPS 中转 |
| `i.qchannel03.cn` | QChannel 第三方广告聚合 SDK | pin 失败 |
| `nsclick.baidu.com` | 广告点击追踪像素 | pin 失败 |
| `usr-api.yunxish.com` | Admaster 第三方广告监测上报 | pin 失败 |
| `logrcv.yunxish.com` | Admaster log receive | pin 失败 |

### 响应改写（[Script] 段）

| URL | 改写策略 | 机制 |
|---|---|---|
| `newclient.map.baidu.com/feed/govui/rich_content` | `data.posts.content = []` | 清空首页顶部富文本广告条（"点击测测你的精神状态..."等） |

改写后顶部文字条消失，不影响主页布局（`homepage_talos_style`、`conf`、`themes` 等字段保留）。

## 抓包实证

抓包来源：iPhone 16 Pro + iOS 21.20.30 + Loon MITM，2 小时内反复开关 app 触发广告生成 513 条网络记录。

| 广告类型 | 关键端点 | 测试结果 |
|---|---|---|
| 开屏 | `afdconf.baidu.com/afd/platform`（599B config）| v1.0.0+ 消除 ✓ |
| 首页圆形图标 | `integralwall.baidu.com/interact/check` + `ecom.map.baidu.com/ad-ops/afd/entry` | v1.0.0+ 消除 ✓ |
| 顶部横幅 | 同上 + `newclient.map.baidu.com/client/crossmarketing/` binary | v1.0.0+ 消除 ✓ |
| **顶部文字通知条** | `newclient.map.baidu.com/feed/govui/rich_content` 富文本 | **v1.1.0+ 消除 ✓**（新增） |

## ⚠️ 启用后必须冷启动 app

插件启用 / 更新后第一次必须先杀掉 app 再冷启动，否则 splash 仍可能显示（本地缓存了旧 splash 创意）。

操作步骤：
1. Loon 启用 plugin
2. 后台杀掉 Baidu Maps（上滑退出）
3. 重新打开 Baidu Maps

如果 splash 仍顽固显示：
- iOS 设置 → 通用 → iPhone 存储空间 → 百度地图 → **卸载重装**（彻底清沙盒）
- 重新登录账号（数据走云同步）

## 安装 / 更新

```
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/baidu-maps-noad/baidu-maps-noad.plugin
```

**首次安装**：Loon → 配置 → 插件 → 右上 + → 通过 URL 添加插件。

**版本升级（v1.0.0 → v1.1.0）**：
- 长按已装的 `Baidu Maps 去广告` 插件 → **更新**（in-place，保留 entry，刷新 MITM 名单 + 脚本）
- **不要**先删除再加——会重复 entry（icon 缓存还要手动清）

## 与原 baidu-strip-altsvc 区别

`baidu-strip-altsvc` 已撤回（卡顿真凶是 HTTPDNS，不是 Alt-Svc）。本 plugin 是不同问题域——只解决广告。

## 已知限制

- 不影响地图核心功能（路径规划 / 导航 / 搜索 / 公交）
- v1.1.0 才开始清空顶部文字条；v1.0.0 没这条规则（如果 Ted 还在用 v1.0.0 请按上面"版本升级"操作）
- Baidu 升级 app 后可能改 endpoint（`afdconf` / `ecom` / `rich_content` path 等），plugin 可能失效，需重新抓包
- iOS 越狱设备如装 SSL Kill Switch 等插件，可能绕过 SSL pin

## 版本

- v1.1.0 · 2026-09-15 00:30 · 新增 `newclient.map.baidu.com/feed/govui/rich_content` 改写，清空顶部文字条；icon cache-buster → v2
- v1.0.0 · 2026-09-15 00:21 · 初版，纯 MITM（7 域名）
- 仅 MITM + 一段 [Script]，无 [URL Rewrite]