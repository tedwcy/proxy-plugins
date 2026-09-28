# umetrip-noad (QuantumultX 版)

航旅纵横 (iOS) 去掉启动时的开屏广告。

## 机制

**MITM + protobuf 响应改写**。`umestartup.umetrip.com` 返回的是 gzip + protobuf 格式的设备配置，里面内嵌一段完整的 JSON 配置 blob。JSON 里有几个广告控制字段，做**等长度字符串替换**（保持 protobuf 字符串字段 varint 长度不变，结构合法）：

| 替换前 | 替换后 | 作用 |
|---|---|---|
| `"adBlackList":"0"` | `"adBlackList":"1"` | 启用广告黑名单 |
| `"advertImageTimeout":"2000"` | `"advertImageTimeout":"0000"` | 图片立即超时（不下载） |
| `"advertTotalTimeout":"2500"` | `"advertTotalTimeout":"0000"` | 广告整体立即超时 |

## 为什么是等长度替换

JSON 嵌在 protobuf 的一个 string 字段里。字符串长度变了 → protobuf varint 长度前缀变了 → 整个 protobuf 结构被破坏 → app 解析失败。**同长度替换 → protobuf 结构保持 → app 能正常解析，只是广告行为改变**。

## 安装

把 `umetrip-noad.conf` 的两段内容复制到你的 QuantumultX 配置里：

```ini
[filter_local]
hostname = umestartup.umetrip.com

[http_response]
^https?:\/\/umestartup\.umetrip\.com\/ script-path=https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/umetrip-noad/umetrip-noad.js, requires-body=true, tag=umetrip-noad, timeout=10
```

QuantumultX 需要开启 MITM（设置 → HTTPS 解密 → 启用）。

启用后**杀掉 + 冷启动航旅纵横 app**。

## 已知限制

- `adBlackList` 的 `"0"`/`"1"` 具体语义未实测（可能是 boolean 也可能是列表 ID）
- 如果 3 个字段改了都不生效，说明 splash 内容来自其他 endpoint，需要重新抓包
- 卸载重装 app 后配置 cache 会清空，需要重新抓一次 umestartup 响应让 plugin 介入
- 航旅纵横升级后 protobuf schema 可能变，需要重新适配

## 与 Loon 版关系

这是 `loon/umetrip-noad/umetrip-noad.plugin` v1.0.0 的 QuantumultX 移植版。

源代码：https://github.com/tedwcy/proxy-plugins/tree/main/quantumultx/umetrip-noad

## 版本

- v1.0.0 · 2026-09-28 · 移植自 Loon 版