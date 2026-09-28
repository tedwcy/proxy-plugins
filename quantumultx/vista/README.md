# vista (Quantumult-X 版)

Vista 看天下杂志 (iOS) VIP 解锁的 Quantumult-X 版本。

## 功能

- 全文阅读解锁
- 首页 banner 解锁
- 电纸刊按钮解锁
- 去红点处理（由 server 决定，plugin 已尽力）
- PDF 5 页根因：OSS PDF 文件本身只有 6 页 /Type/Page 对象（详见 MEMORY.md），不是 plugin 能解决的，需要 VIP 真实订阅

## 与 loon 版关系

直接复用 `loon-vista/vista.js`（同一 JavaScriptCore 运行时兼容）。

源代码：https://github.com/tedwcy/proxy-plugins/tree/main/quantumultx/loon-vista

## 关联 plugin

- **kantianxia-noad** (`quantumultx/kantianxia-noad/`)：去掉看天下开屏广告 + 弹窗广告
- **vista**（本 plugin）：给 VIP 权限
- 两个 plugin 可叠加，开屏广告清理 + VIP 解锁互不干扰

## 安装

把 `vista.conf` 内容粘贴到 QX X 本地配置（设置 → 配置 → 编辑），或作为「插入资源」加载 URL。

URL：`https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/vista/vista.conf`

QX X 需要开启 MITM（设置 → HTTPS 解密 → 启用）。

## 版本

- v1.0.19 · 2026-09-28 · 移植自 Loon 版
