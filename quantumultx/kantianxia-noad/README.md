# kantianxia-noad (Quantumult-X 版)

看天下 (VistaKTX) 去除开屏广告 + 弹窗广告。

## 功能

- 启动广告 `loading_ad2` → `body.ad = null`
- 弹窗广告 `get_popup_ad` → `body.popup = null`
- 其他端点全透传

## 与 loon 版关系

直接复用 Loon 版 `.js`（同一 JavaScriptCore 运行时兼容）。

源代码：https://github.com/tedwcy/proxy-plugins/tree/main/quantumultx/kantianxia-noad

## 关联 plugin

- **kantianxia-noad**（本 plugin）：去掉看天下开屏广告 + 弹窗广告
- **vista** (`quantumultx/vista/`)：VIP 解锁

## 安装

把 `kantianxia-noad.conf` 内容粘贴到 Quantumult-X 本地配置，或作为「插入资源」加载 URL：

```
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/kantianxia-noad/kantianxia-noad.conf
```

Quantumult-X 需要开启 MITM（设置 → HTTPS 解密 → 启用）。

## 版本

- v1.0.2 · 2026-09-28 · **拆成 2 条简单 pattern**（去掉 `(\?|$)` 结尾 + 嵌套 alternation，QX X 远程 conf regex 不兼容）
- v1.0.1 · 2026-09-28 · 早期 QX X 版 `.js` 因顶层 `return` 报 `Illegal return statement`，改为直接引用 Loon 版 `.js`

## 关键教训

**Quantumult-X 远程 conf 的 regex 解析器比 Loon 严格得多**：

| ✓ QX X 兼容 | ✗ QX X 不兼容 |
|---|---|
| 简单 `^pattern` 开头 | 复杂的 `(\?\|$)` 结尾 |
| 嵌套 alternation `\|` 在 group 里 | 嵌套 alternation + 结尾 anchor 组合 |
| 纯 prefix match | regex 需要 end anchor `$` |

写新 QX X 远程 conf 时，**先用 fr24 / ddgksf2013 这种工作 pattern 当模板**，避开复杂的 regex 特性。
