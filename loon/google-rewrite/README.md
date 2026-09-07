# Google Rewrite

去掉 Google 搜索结果里的"跳转到本地版本"提示。

## 拦截端点

- `https?://(www.)?(g|google).cn` → `https://www.google.com`
- `https://www.google.co.jp` → `https://www.google.com`
- `https://www.google.com.hk/` → `https://www.google.com/ncr`

## 机制

基于 Loon `[URL Rewrite]`，对匹配 URL 直接 302 重定向：

- `google.cn` / `g.cn` / `google.co.jp` → `google.com`（直接用主域名）
- `google.com.hk` → `google.com/ncr`（ncr = No Country Redirect，主动声明"不要按 IP 跳本地版"）

三个规则都用 302（temporary redirect），不污染浏览器 / app 的 HSTS 缓存。

## MITM hostname

`*.google.com.hk, *.g.cn, *.google.cn, *.google.co.jp`

只对四个区域域名启用 MITM，其他 Google 服务（gmail / maps / youtube / drive 等）不受影响。

## 安装（URL）

```
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/google-rewrite/google-rewrite.plugin
```

Loon → 配置 → 插件 → 右上 + → 通过 URL 添加插件。

## 与原 plugin 差异

基于 [zqzess/rule_for_quantumultX](https://github.com/zqzess/rule_for_quantumultX) 的 `Loon/Plugin/Rewrite.plugin`，完全保留原始重定向规则与 MITM hostname 列表。

唯一调整：
- `#!name` / `#!desc` / `#!homepage` / `#!icon` 改为 Ted 仓库惯例
- 去掉原 plugin 中被注释掉的"非强制跳转"备选（保持强制跳转配置）

## 已知限制

- `google.com.hk` 用强制跳转（匹配根路径），如果 Ted 有时需要直访 google.com.hk 看本地结果，建议在 plugin 详情里暂时禁用这条规则
- 不影响其他 Google 服务域名（gmail / maps / drive 等仍按各自区域走）
- 仅 iOS Loon 验证。其他代理工具（Surge / Quantumult X / Shadowrocket）的 `[URL Rewrite]` 语法基本兼容，但需测试

## 版本

- v1.0.0 · 2026-09-07 14:48 · 初版，基于 [zqzess/rule_for_quantumultX](https://github.com/zqzess/rule_for_quantumultX) 仓库 Loon/Plugin/Rewrite.plugin