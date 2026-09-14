# Baidu Maps 去广告

去掉 Baidu Maps (iOS v21.20.30) 的广告：开屏广告、首页左上角圆形图标、首页顶部横幅、**首页顶部文字通知条 + 笔记列表里的推广文章**。

## 机制（v1.2.0，混合策略）

**两路并用**：

1. **MITM SSL pin 失败**（适用于 8 个域名）：让广告 SDK 静默失败
2. **响应改写**（2 个端点）：富文本 / CMS 接口清空广告字段

### MITM 域名（SSL pin 失败机制）

| 域名 | 拦截的广告类型 | 机制 |
|---|---|---|
| `afdconf.baidu.com` | **开屏广告 config server** | pin 失败 → splash 没 config |
| `ecom.map.baidu.com` | AFD 广告框架：首页 in-page 广告 slot | pin 失败 → 圆形 / 横幅 |
| `integralwall.baidu.com` | 积分墙：广告决策中枢 | pin 失败 → 积分墙不显示 |
| `newclient.map.baidu.com` | 主 API 域名，是 [Script] 改写的前提 | HTTPS 中转 |
| `i.qchannel03.cn` | QChannel 第三方广告聚合 SDK | pin 失败 |
| `nsclick.baidu.com` | 广告点击追踪像素 | pin 失败 |
| `usr-api.yunxish.com` | Admaster 第三方广告监测上报 | pin 失败 |
| `logrcv.yunxish.com` | Admaster log receive | pin 失败 |

### 响应改写（[Script] 段）

| URL | 改写策略 | 机制 |
|---|---|---|
| `newclient.map.baidu.com/feed/govui/rich_content` | `data.posts.content = []` | 清空首页笔记/文章列表（含 HBTI 推广） |
| `newclient.map.baidu.com/cms/page/def` | `data.cards = []` | 清空首页顶部 banner popup（HBTI 测试） |

改写后顶部文字条 + 笔记列表里的推广文章都不见，**不影响**主页布局（`conf` / `themes` / `homepage_talos_style` / `location` 保留）。

## 抓包实证（513+427 = 940 条记录）

| 广告类型 | 关键端点 | 状态 |
|---|---|---|
| 开屏 | `afdconf.baidu.com/afd/platform` | v1.0.0+ 消除 ✓ |
| 首页圆形 / 横幅 | `integralwall.baidu.com/interact/check` + `ecom.map.baidu.com/ad-ops/afd/entry` | v1.0.0+ 消除 ✓ |
| 顶部文字 banner | **`newclient.map.baidu.com/cms/page/def`** | **v1.2.0+ 消除 ✓**（v1.1.0 没干掉，找错 endpoint 了） |
| 笔记列表推广 | `newclient.map.baidu.com/feed/govui/rich_content` | **v1.2.0+ 清空**（v1.1.0 没生效，可能是 [Script] 没刷新） |

**v1.1.0 → v1.2.0 关键发现**：

`/feed/govui/rich_content` 不是顶部 banner 的源——它是**笔记列表**接口（`posts.title: "返回了9条笔记"`），里面 9 条推荐包括那篇 HBTI 文章。**真正驱动顶部 banner 的是 `/cms/page/def`**——`cardConfigInfo.title: "HBTI测试"` + `shareInfo.text: "HBTI·十六型史格测试上线！测测你的精神状态最像哪位古人～"`，和 Ted 截图文字一字不差。

## ⚠️ 升级到 v1.2.0 必须**重新安装**（不是 Update）

v1.1.0 → v1.2.0 加了第二个 endpoint 的 [Script] 规则，**长按 Update 可能不重新加载 [Script] 段**（Loon 已知行为）。

正确流程：
1. Loon → 配置 → 插件列表
2. **长按 "Baidu Maps 去广告" → 删除**（不是更新）
3. **重新通过 URL 添加插件**：
   ```
   https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/baidu-maps-noad/baidu-maps-noad.plugin
   ```
4. 后台杀掉 Baidu Maps（上滑彻底退出）
5. 冷启动 Baidu Maps

如果选"更新"而 [Script] 没刷新，Loon 脚本日志里**看不到** `[BaiduMapsNoAd]` 开头的日志。

## ⚠️ 启用后必须冷启动 app

插件启用 / 更新后第一次必须先杀掉 app 再冷启动，否则 splash 仍可能显示（本地缓存旧 splash 创意）。

如果 splash 仍顽固显示：iOS 设置 → 通用 → iPhone 存储空间 → 百度地图 → **卸载重装**（彻底清沙盒）。

## 安装

```
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/baidu-maps-noad/baidu-maps-noad.plugin
```

Loon → 配置 → 插件 → 右上 + → 通过 URL 添加插件。

## 已知限制

- 不影响地图核心功能（路径规划 / 导航 / 搜索 / 公交）
- v1.2.0 才清空顶部 banner 和笔记列表推广；v1.0.0/v1.1.0 没这俩规则
- Baidu 升级 app 后可能改 endpoint（`cms/page/def` path 等），plugin 可能失效，需重新抓包
- iOS 越狱设备如装 SSL Kill Switch 等插件，可能绕过 SSL pin

## 版本

- v1.2.0 · 2026-09-15 00:36 · **修正顶部 banner 源——找错 endpoint 了，banner 来自 `/cms/page/def` 不是 `/feed/govui/rich_content`**；同时清两个端点
- v1.1.0 · 2026-09-15 00:30 · 新增 `/feed/govui/rich_content` 改写（但找错端点）
- v1.0.0 · 2026-09-15 00:21 · 初版，纯 MITM（8 域名），处理 splash / 圆形 / 横幅