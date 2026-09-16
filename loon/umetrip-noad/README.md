# Umetrip 去开屏广告

去掉航旅纵横 (iOS) 启动时的开屏广告。

## 机制

**MITM + protobuf 响应改写**。`umestartup.umetrip.com` 返回的是 gzip + protobuf 格式的设备配置，里面内嵌一段完整的 JSON 配置 blob。JSON 里有几个广告控制字段，做**等长度字符串替换**（保持 protobuf 字符串字段 varint 长度不变，结构合法）：

| 替换前 | 替换后 | 作用 |
|---|---|---|
| `"adBlackList":"0"` | `"adBlackList":"1"` | 启用广告黑名单 |
| `"advertImageTimeout":"2000"` | `"advertImageTimeout":"0000"` | 图片立即超时（不下载） |
| `"advertTotalTimeout":"2500"` | `"advertTotalTimeout":"0000"` | 广告整体立即超时 |

## 抓包分析

抓包来源：iPhone + iOS + Loon MITM，386 条网络记录。

**关键发现**：

1. `umestartup.umetrip.com` 是设备配置下发端点（19 次调用），**返回的是 gzip + protobuf**
2. Protobuf 字段里嵌了一段完整 JSON（5000+ 字节），含 DNS 白名单、域名列表、各种开关
3. JSON 里有 3 个广告相关字段（`adBlackList`、`advertImageTimeout`、`advertTotalTimeout`），都是字符串格式
4. 没有 SSL Pinning（Loon MITM 成功，response 正常返回）

**为什么不直接 MITM-only**：

- 抓包显示 SSL Pin 失败机制在这条端点**不生效**（response 正常返回）
- 必须**改写响应**才能改变广告行为

**为什么是等长度替换**：

- JSON 嵌在 protobuf 的一个 string 字段里
- 字符串长度变了 → protobuf varint 长度前缀变了 → 整个 protobuf 结构被破坏 → app 解析失败
- 同长度替换 → protobuf 结构保持 → app 能正常解析，只是广告行为改变

## MITM 域名

```
umestartup.umetrip.com
```

**只 MITM 这一个域名**——其他 umetrip 子域名（umehome / opactivity / appmsg 等）继续走原网络，不影响 app 正常功能。

## 安装

```
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/umetrip-noad/umetrip-noad.plugin
```

Loon → 配置 → 插件 → 右上 + → 通过 URL 添加插件 → 启用。

启用后**杀掉 + 冷启动航旅纵横 app**（上滑彻底退出后重开），让 app 重新拉一次配置。

## 已知限制

- `adBlackList` 的 `"0"`/`"1"` 具体语义未实测确认（可能是 boolean 也可能是列表 ID）
- 如果 3 个字段改了都不生效，说明 splash 内容来自其他 endpoint，需要重新抓包
- 卸载重装 app 后配置 cache 会清空，需要重新抓一次 umestartup 响应让 plugin 介入
- 航旅纵横升级后 protobuf schema 可能变，需要重新适配

## 版本

- v1.0.0 · 2026-09-16 22:20 · 初版，基于 102_1789567600869.zip 抓包（386 条记录，iOS）