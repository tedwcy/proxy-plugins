# google-rewrite (QuantumultX 版)

Google 搜索去区域跳转提示。

## 功能

把以下区域版本重定向到 `google.com`（`google.com.hk` → `google.com/ncr`）：
- `google.cn` / `g.cn` → `https://www.google.com`
- `www.google.co.jp` → `https://www.google.com`
- `www.google.google.com.hk` → `https://www.google.com/ncr`

`/ncr` = No Country Redirect，主动声明"不要按 IP 推本地版"。

## 安装

把 `google-rewrite.conf` 的两段内容复制到你的 QuantumultX 配置里：

```ini
[filter_local]
hostname = *.google.com.hk, *.google.co.jp, *.google.cn, *.g.cn

[rewrite]
^https?:\/\/(www\.)?(g|google)\.cn https://www.google.com 302
^https?:\/\/www\.google\.co\.jp https://www.google.com 302
^https?:\/\/www\.google\.com\.hk\/ https://www.google.com/ncr 302
```

QuantumultX 需要开启 MITM 才能让 `[rewrite]` 在 HTTPS 上生效。

## 与 Loon 版关系

这是 `loon/google-rewrite/google-rewrite.plugin` v1.0.0 的 QuantumultX 移植版。

源代码：https://github.com/tedwcy/proxy-plugins/tree/main/quantumultx/google-rewrite

## 版本

- v1.0.0 · 2026-09-28 · 移植自 Loon 版