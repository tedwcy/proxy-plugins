# kantianxia-noad (Quantumult-X 版)

看天下 (VistaKTX) 去除开屏广告 + 弹窗广告。

## 功能

- 启动广告 `loading_ad2` → `body.ad = null`
- 弹窗广告 `get_popup_ad` → `body.popup = null`
- 其他端点全透传
- 不影响地图、文章、用户等数据接口

## 与 loon 版关系

直接引用 Loon 版 `.js`（同一 JavaScriptCore 运行时兼容）。

源代码：https://github.com/tedwcy/proxy-plugins/tree/main/quantumultx/kantianxia-noad

## 关联 plugin

- **kantianxia-noad**（本 plugin）：去掉看天下开屏广告 + 弹窗广告
- **vista** (`quantumultx/vista/`)：VIP 解锁
- 两个 plugin 可叠加，开屏广告清理 + VIP 解锁互不干扰

## 安装

把 `kantianxia-noad.conf` 内容粘贴到 Quantumult-X 本地配置（设置 → 配置 → 编辑），或作为「插入资源」加载 URL。

URL：`https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/kantianxia-noad/kantianxia-noad.conf`

Quantumult-X 需要开启 MITM（设置 → HTTPS 解密 → 启用）。

## 版本

- v1.0.1 · 2026-09-28 · 早期 QX X 版 `.js` 因顶层 `return` 报 `Illegal return statement`，改为直接引用 Loon 版 `.js`
