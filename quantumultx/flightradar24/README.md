# flightradar24 (QX / Quantumult X 版)

Flightradar24 (iOS) Gold 订阅解锁。

## 功能

- 365 天历史回放
- 去除广告
- 无限追踪
- 需先用免费账户登录

## 安装

把 `flightradar24.conf` 的两段内容复制到你的 QX 配置里：

```ini
[filter_local]
hostname = mobile.flightradar24.com

[http_response]
^https?:\/\/mobile\.flightradar24\.com\/mobile\/(user-session|\w{9}) script-path=https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/flightradar24/flightradar24.js, requires-body=true, tag=flightradar24, timeout=10
```

QX 需要开启 MITM。

## 与 Loon 版关系

移植自 `loon/flightradar24/flightradar24.plugin`，脚本原样可移植。

源代码：https://github.com/tedwcy/proxy-plugins/tree/main/quantumultx/flightradar24

## 版本

- v1.0.0 · 2026-09-28 · 移植自 Loon 版