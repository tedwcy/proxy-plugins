# egdd (QuantumultX 版)

儿歌点点 (iOS) VIP 解锁。

## 功能

解锁 VIP（修改 `endtime`、`vip`、`vip_day`、`is_vip`、`nickname` 等字段），需先登录免费账户。

## 安装

把 `egdd.conf` 的两段内容复制到你的 QuantumultX 配置里：

```ini
[filter_local]
hostname = gateway.ergediandian.com

[http_response]
^https?:\/\/gateway\.ergediandian\.com\/dduser\/user\/center\/set script-path=https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/egdd/egdd.js, requires-body=true, tag=egdd, timeout=10
```

QuantumultX 需要开启 MITM。

## 与 Loon 版关系

移植自 `loon/egdd/egdd.plugin`，脚本原样可移植（Loon/QX JavaScriptCore 运行时兼容）。

源代码：https://github.com/tedwcy/proxy-plugins/tree/main/quantumultx/egdd

## 版本

- v1.0.0 · 2026-09-28 · 移植自 Loon 版