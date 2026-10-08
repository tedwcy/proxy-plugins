# kantianxia-noad (Quantumult-X 版)

看天下 (VistaKTX) 去除开屏广告 + 弹窗广告。

## 功能

- 启动广告 `loading_ad2` / `loading_ad` / `splash` / `startup` → `body.ad` (及兼容字段名) = `null`
- 弹窗广告 `adm/get_popup_ad` / `popup/get_popup_ad` / `index/dialog` → `body.popup` (及兼容字段名) = `null`
- 其他端点全透传

## v1.0.3 关键修复 (2026-10-08)

**症状**：plugin 改完能跑，过一段时间失效。HAR 显示 `raw.githubusercontent.com` 请求数 = 0，脚本完全没被 QX X 调用。

**根因**：v1.0.2 的 .conf 通过"插入资源"远程订阅加载，QX X 缓存了 conf 内容。但 QX X 远程 conf 的 regex 解析器有各种微妙兼容性问题（`(\?|$)` 结尾 anchor、嵌套 alternation 等等），加上可能的缓存不同步，导致 pattern 整体不匹配 → .js 不被 fetch → ad 字段原样保留。

**修复**：
1. **pattern 简化**：去掉所有 `(\?|$)` 收尾 anchor，改用纯 prefix match（跟 fr24 / umetrip / ddgksf2013 完全一致的语法）
2. **加 alternation**：在 prefix 内用 `(a|b|c)` 形式合并多 endpoint，避免写多条 rule
3. **加通配子域**：(.*\.)? 兼容 `ktx.cn` / `api.ktx.cn` / `www.ktx.cn` 等
4. **加 hostname 兼容性**：`*.ktx.cn`
5. **加兼容字段名**：body.ad / body.splash / body.startupAd / body.bannerAd / body.popup / body.dialog / body.modal 等
6. **加嵌套兼容**：body.data.ad / body.result.ad 兜底
7. **修 try/catch bug**：JSON.parse 失败后立即 return，不再 continue（避免 body undefined 访问抛 TypeError）
8. **改用 IIFE 包裹**：QX X JSCore 严格模式下更稳
9. **改用本地 .js 路径**：不复用 `loon/kantianxia-noad/kantianxia-noad.js`，避免跨目录引用歧义

## 与 loon 版关系

早期 v1.0.0 ~ v1.0.2 直接引用 Loon 版 `.js`（同一 JavaScriptCore 运行时兼容）。

v1.0.3 起改用本地独立 `.js`（`quantumultx/kantianxia-noad/kantianxia-noad.js`），因为做了 IIFE 包裹 + 修复 try/catch bug + 扩展字段 nullify，跟 Loon 版代码不再一致。

源代码：https://github.com/tedwcy/proxy-plugins/tree/main/quantumultx/kantianxia-noad

## 关联 plugin

- **kantianxia-noad**（本 plugin）：去掉看天下开屏广告 + 弹窗广告
- **vista** (`quantumultx/vista/`)：VIP 解锁

## 安装

把 `kantianxia-noad.conf` 内容粘贴到 Quantumult-X 本地配置，或作为「插入资源」加载 URL：

```
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/kantianxia-noad/kantianxia-noad.conf
```

Quantumult-X 需要开启 MITM（设置 → HTTPS 解密 → 启用），并在 MITM hostname 列表里加 `ktx.cn, *.ktx.cn`。

## ⚠️ 重要：升级必须清缓存

**QX X 加载远程 conf 后会缓存内容，不会自动更新**。升级 v1.0.3 后**必须**手动操作：

1. QX X app → 设置 → 资源 → 找到 `kantianxia-noad` → **删掉**
2. **杀掉 QX X app**（上滑退出）
3. 重启 QX X
4. 重新添加资源 URL（同上 raw.githubusercontent.com 链接）

不这样做，v1.0.3 不会生效。

## 验证生效

QX X 日志里应该看到：

```
[KantianxiaNoAd] v1.0.3 loaded
[KantianxiaNoAd] loading: nullify body.ad (was 3787)
[KantianxiaNoAd] popup: nullify body.popup (was 3788)
```

冷启动看天下 app，开屏广告应该直接消失（loading_ad2 body.ad 被置 null，app 跳过 splash 渲染）。

## 版本

- v1.0.3 · 2026-10-08 · **HAR 诊断修复**：pattern 简化 + 加 alternation + 改本地 .js + 修 try/catch bug + 扩展字段 nullify
- v1.0.2 · 2026-09-28 · 拆成 2 条简单 pattern（去掉 `(\?|$)` 结尾 + 嵌套 alternation，QX X 远程 conf regex 不兼容）
- v1.0.1 · 2026-09-28 · 早期 QX X 版 `.js` 因顶层 `return` 报 `Illegal return statement`，改为直接引用 Loon 版 `.js`
- v1.0.0 · 2026-09-28 · 移植自 Loon 版
