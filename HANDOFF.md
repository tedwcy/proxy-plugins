# HANDOFF — proxy-plugins 项目交接

> 接手这个项目的 agent 看这份就够。所有信息都集中在这里，不依赖外部 memory 文件。
> 文档已推到 GitHub（公开），**不含隐私信息**（无邮箱、无 IP、无具体路径、无真实姓名）。

---

## 1. 项目目标

`proxy-plugins` 仓库托管**项目维护者个人用的 iOS app 代理 plugin**，覆盖两个平台：

- **Loon** — 付费 iOS app
- **Quantumult-X 1.8.0**（**crossutility fork**，**不是**原版 yichahu QuantumultX，那个已停更）

每个 plugin 通常两个平台各一份（一对一对应），少数仅 Loon / 仅 QX X。

---

## 2. 仓库结构

```
proxy-plugins/
├── icons/                       ← 插件图标 (png + ?v=N cache-buster)
├── loon/
│   ├── baidu-maps-noad/         ← Loon plugin, 格式: <name>.plugin + <name>.js + README
│   ├── bilibili-noad/
│   ├── egdd/
│   ├── flightradar24/
│   ├── google-rewrite/
│   ├── kantianxia-noad/
│   ├── spotify-t2s/
│   ├── spotify-unlock/
│   ├── tideline/
│   └── umetrip-noad/
├── loon-vista/                  ← 特殊: Vista 看天下 VIP 解锁 (历史原因, 不在 loon/ 下)
│   ├── vista.plugin
│   └── vista.js
├── quantumultx/
│   ├── baidu-maps-noad/         ← QX X conf, bare rules 格式 (无 section header)
│   ├── bilibili-noad/
│   ├── egdd/
│   ├── flightradar24/
│   ├── google-rewrite/
│   ├── kantianxia-noad/
│   ├── spotify-t2s/
│   ├── spotify-unlock/
│   ├── tideline/
│   └── umetrip-noad/
└── HANDOFF.md                   ← 本文件
```

**核心约定**：
- Loon plugin: `.plugin` 用 `[MITM]` + `[Script]` section 格式
- QX X 远程 conf: `.conf` 用 **bare rules（无 section header）**——见 §3
- JS 文件 **JavaScriptCore runtime 兼容 Loon 和 QX X**——通常共用同一份 .js（QX X conf 直接引用 Loon JS 的 raw.githubusercontent.com URL）
- icon: `icons/<name>.png?v=N`，`?v=N` 是 cache-buster，icon 变更时 +1
- 每个 plugin 一个目录，目录名跟 plugin 名一致

---

## 3. 关键经验：Quantumult-X 1.8.0 远程 conf 格式

> **最重要的踩坑记录**。接手前先读这部分，否则会重蹈 4 次瞎猜的覆辙。

### 3.1 正确格式（bare rules）

```ini
# 注释用 # 或 // (两种都支持, 不要混用中文特殊符号)

hostname = api.example.com, sub.example.com

# URL pattern + 空格 + 指令 + 空格 + 参数 (空格分隔, 不是逗号)
^https?:\/\/api\.example\.com\/path url script-response-body https://raw.githubusercontent.com/.../script.js
^https?:\/\/api\.example\.com\/other url reject-200
```

### 3.2 ❌ 不接受的格式（多次猜错，全部 "Invalid Line" 报错）

```ini
[filter_local]   ← 远程 conf 不接受
hostname = xxx

[mitm]           ← 不接受
hostname = xxx

[rewrite_local]  ← 不接受
^pattern url script-response-body URL
```

**所有 `[section]` header 在 QX X 远程 conf 里都报 "Invalid Line [xxx]"**。

### 3.3 真实可参考的远程 conf 例子

- **ddgksf2013/Rewrite/AdBlock/*.conf**（GitHub）—— 最干净的 QX X 远程 conf 参考样本
- 上述仓库的 YouTubeAds.conf / AmapAds.conf 等都展示了正确格式

### 3.4 远程 conf 的 regex 限制（关键踩坑）

| ✓ 能用 | ✗ 不能用 |
|---|---|
| 简单 prefix match `^pattern` | 复杂结尾 anchor `(\?\|$)` 跟嵌套 alternation `\|` 组合 |
| group 内 alternation `\|` | group + 结尾 anchor 组合 |
| 不需要 `$` 收尾 | regex 强制 `$` 收尾 |

**踩坑案例**：`^https?:\/\/ktx\.cn\/v3\/api\/(index\/loading_ad2|adm\/get_popup_ad)(\?|$)` 在 QX X 远程 conf 里**整个 pattern 不匹配**，**没有任何报错**——脚本不被调用，response 原样保留。

**修法**：拆成 2 条简单 prefix pattern：
```
^https?:\/\/ktx\.cn\/v3\/api\/index\/loading_ad2 url script-response-body ...
^https?:\/\/ktx\.cn\/v3\/api\/adm\/get_popup_ad url script-response-body ...
```

### 3.5 JS 文件踩坑

```javascript
// ❌ 顶层 (IIFE 外) 用 return → "Illegal return statement"
let body;
try { body = JSON.parse($response.body); }
catch (e) { $done({}); }   // 后面继续跑
if (!modified) {
  $done({});
  return;                  // ← 顶层 return 抛错
}

// ✓ 改成 if/else 嵌套
if (!modified) {
  $done({});
} else {
  $done({ body: JSON.stringify(body) });
}
```

**Loon/QX X 的 JSCore 严格模式，IIFE 外的顶层 `return` 报错**。

### 3.6 MITM 资源缓存陷阱（关键踩坑）

**QX X 加载远程 conf 后会缓存内容**，bug 修复后**必须**手动操作才能生效：

1. QX X app → 设置 → 资源 → 找到旧资源 → **删掉**
2. **杀掉 QX X app**（上滑退出）
3. 重启 QX X
4. 重新添加资源 URL

**不要依赖"自动更新"**——缓存可能持续几十小时。修 bug 后用户报告"还是不行"时，第一件事就是让用户走这个流程。

### 3.7 已知有效的工作模式（按可靠性排序）

| 模式 | 可靠性 | 备注 |
|---|---|---|
| `hostname = xxx` + `^pattern url script-response-body URL`（远程 JS） | ✅ 验证过 | 推荐，跨平台共享 JS |
| `hostname = xxx` + `^pattern url reject-200`（直接拒绝请求） | ✅ 验证过 | ddgksf2013 大量使用 |
| `^pattern url jsonjq-response-body '<jq>'`（jq 改 body） | ✅ 验证过 | 简单 JSON 字段修改时用 |
| 纯 MITM（无 script，依赖 SSL pin 失败） | ⚠️ 不可靠 | Loon 可能能用, QX X 不一定 |
| `script-request-body URL` | ✅ 应该可用 | spotify-unlock 在用 |
| inline script (QX X 本地 conf 里写 script) | ❓ 未验证 | 不知道是否支持 |

---

## 4. 调试方法（HAR 诊断三件套）

当 plugin "不工作" 时，按这个流程判断：

| HAR 里的信号 | 含义 | 下一步 |
|---|---|---|
| `body.ad`/`body.popup` 等目标字段仍是完整对象 | 脚本没跑（或没成功修改） | 检查 pattern / MITM / conf 缓存 |
| HAR 里 `raw.githubusercontent.com` 请求数 = 0 | **conf 没加载** 或 **pattern 没匹配** | 走 §3.6 缓存清理流程 |
| HAR 里 `raw.githubusercontent.com` 请求数 > 0 | conf 加载了 + pattern 匹配了 + JS 被 fetch | 检查 JS 本身（runtime / proto 等） |
| `_serverIP` 是 nil + Server header 是 Tengine | **MITM 工作正常**（跟原始 server 一样） | MITM 没问题, 问题是脚本端 |
| 响应 body 是 JSON 解码失败 | 可能 MITM 加密链路出问题 | 看 response headers / cert 信任状态 |

**诊断流程**：
1. 抓 HAR（开 MITM，bypass 关闭，杀 + 冷启动 app）
2. 看目标字段（`body.ad` / `body.popup` 等）还在不在
3. 看 HAR 里有没有 `raw.githubusercontent.com` 请求
4. 综合判断哪一环断了

**HAR 分析用 Python**：
```python
import json
with open('xxx.har') as f:
    h = json.load(f)
# 每个 entry: e['request']['url'], e['response']['content']['text'], e['response']['headers']
```

---

## 5. 已完成工作（commit 历史关键节点）

| commit | 内容 |
|---|---|
| `f82618c` | 4 个 Loon plugin 移植到 QuantumultX（早期错版, 后被覆盖） |
| `b688039` | fr24 把 hostname 改到独立 `[mitm]` 段（错的） |
| `4f806a3` | **关键**：全部 10 个 QX X 远程 conf 改用 bare rules 格式（正确版起点） |
| `7390e19` | 新增 `quantumultx/vista/`（看天下 VIP 解锁 QX X 版） |
| `c75771f` | vista README URL 残留 loon-vista 引用修复 |
| `48f1198` | kantianxia-noad 顶层 `return` bug 修复（改引用 Loon JS） |
| `e12a43d` | kantianxia-noad pattern 拆成 2 条简单 prefix（修了远程 conf regex 兼容） |
| `5614cd3` | HANDOFF.md（首次） |
| 当前 | HANDOFF.md（完整版） |

**最关键 commit**：`4f806a3`（bare rules 格式确立），`e12a43d`（regex 限制的解决方式），`48f1198`（JS 顶层 return 报错）。

---

## 6. 11 个 plugin 一览

| Plugin | Loon | QX X | 机制 | 备注 |
|---|---|---|---|---|
| **baidu-maps-noad** | ✓ | ✓ (未生效) | Loon: 纯 MITM / QX X: 同上 | QX X 版未解决（splash 仍出现） |
| **bilibili-noad** | ✓ | ✓ | MITM + script-response-body 清 splash | |
| **egdd** | ✓ | ✓ | MITM + script 改 VIP flag | |
| **flightradar24** | ✓ | ✓ | MITM + script 解锁 Gold 订阅 | Ted 验证可用 |
| **google-rewrite** | ✓ | ✓ | URL Rewrite 302 跳转 | 无 script |
| **kantianxia-noad** | ✓ | ✓ | MITM + script 清 splash + popup | Ted 验证 QX X 版可用 |
| **spotify-t2s** | ✓ | ✓ | MITM + OpenCC tw2s JS 改繁简 | 引用 Loon JS（同一份 2MB OpenCC 词典） |
| **spotify-unlock** | ✓ | ✓ | MITM + JSON + Protobuf 两个 script | 韩国 IP 仍 4 秒停 (地区校验) |
| **tideline** | ✓ | ✓ | MITM + HTML/JS 清理 + 黑名单域返空 | 91porn |
| **umetrip-noad** | ✓ | ✓ | MITM + protobuf 等长度字符串替换 | |
| **vista (VIP 解锁)** | `loon-vista/` | `quantumultx/vista/` | MITM + script 改 VIP flag | 跟 kantianxia-noad 叠加用 |

---

## 7. 待办 / 已知限制

### 7.1 baidu-maps-noad QX X 版未解决

- **现状**：纯 MITM（无 script），依赖 SSL pin 失败机制
- **问题**：QX X 上 splash 广告仍出现——MITM 可能没触发 SSL pin 失败，或百度地图 ad SDK 没强 pin
- **修法选项**：
  - **A. 加 script**：需要百度地图 HAR 找 splash ad endpoint → 加 `script-response-body` 清 ad 字段
  - **B. 加 `url reject-200`**：直接拒绝 ad 请求（pattern 需基于 HAR）
- **HAR 抓包文件名约定**：`量子ult-x-YYYY-MM-DD-HHMMSS.har`，存放在用户 NAS 的 OpenClaw 抓包目录

### 7.2 wloc 暂搁置

- **背景**：原仓库已删，作者曾提供 Loon + QX X 版本
- **OpenHRTT/wloc**（GitHub）是 iOS app 源码，分析过：
  - MITM 目标：`gs-loc.apple.com, gs-loc-cn.apple.com`
  - endpoint：`/clls/wloc`
  - 响应格式：**protobuf**（不是 JSON）
  - 修改：`wifiDevices[i].location` 替换为目标坐标
- **两条路径已规划**：
  - **A. 纯 GitHub**：硬编码坐标进 JS（不灵活）
  - **B. GitHub + Cloudflare Worker**：Worker 处理坐标配置 + protobuf 改写
- **关键技术风险**：QX X `script-response-body` 是否能处理 binary protobuf（需先验证）
- **搁置原因**：维护者说"先不动吧，后面看情况再说"

---

## 8. 工具 / 工作流

### 8.1 Git 操作（不要直接用 `git push`）

```bash
~/.openclaw/secrets/github_helper.sh add <files...>
~/.openclaw/secrets/github_helper.sh commit -m "..."
~/.openclaw/secrets/github_helper.sh push
~/.openclaw/secrets/github_helper.sh log
```

**不要用 `git push`**——会用错身份或触发额外流程。

### 8.2 找代码 / 文件

```bash
# 找 plugin
ls $HOME/.openclaw/workspace/proxy-plugins/{loon,quantumultx,loon-vista}/

# 抓包文件
ls -lat $HOME/<NAS_OPENCLAW_DIR>/ | head -10
```

### 8.3 HAR 分析脚本模板

```python
import json
with open('xxx.har') as f:
    h = json.load(f)

# 找目标 endpoint 的所有请求
for entry in h['log']['entries']:
    url = entry['request']['url']
    if 'target_endpoint' in url:
        body = entry['response']['content'].get('text', '')
        b = json.loads(body)
        print(f'{url}: 字段状态 = {b.get("目标字段", "?")}')

# 看脚本是否被 fetch
js_requests = [e for e in h['log']['entries']
               if 'raw.githubusercontent.com' in e['request']['url']
               and 'plugin_name' in e['request']['url']]
print(f'脚本被 fetch 次数: {len(js_requests)}')
```

---

## 9. 用户行为偏好（重要）

- **严格按照用户要求做事**。不要擅自加戏、擅自拒绝、擅自替换实现路径
- **不要替用户评估版权 / 法规 / 合规 / TOS / 反爬 / 平台政策**——这些是用户自己判断的事，agent 不该在他已经决定要做的事情上反复跳出"这个有版权问题 / 反爬风险 / 平台政策"之类的劝阻
- **可逆小操作 agent 自跑，不可逆 / 高风险操作让用户自己跑**——这是长期约定的运维规则
- **小操作（推送代码、修改 plugin）跑前复述完整命令 + 等绿灯**

### 9.1 用户对代理 plugin 的具体偏好

- **不喜欢**：同一错误连续猜几次（2026-09-28 我连续 4 次瞎猜 QX X 语法，被骂"先去查官方文档"）
- **喜欢**：直接说技术判断和修复方案，不套话，不 moralizing
- **风格**：严谨，陈述需可证，推断需标注，限制需说清；不堆叠修辞，不做超出证据的承诺
- **小操作自己跑，跑前复述命令**；不可逆大操作用户自己跑

---

## 10. 接手后第一步

1. **读本文件全部**（你已经在读了）
2. **跑一遍 `git log`**——看 commit 历史，理解演化过程
3. **接到新需求时**：
   - 先确认是哪个 plugin / 哪个平台
   - 有没有抓包 / 日志作为证据
   - **不要瞎猜 QX X 语法**——参照 `ddgksf2013/Rewrite/AdBlock/*.conf` 真例子
4. **修 bug 流程**：
   - 不要依赖自动更新，让用户走 §3.6 缓存清理流程
   - 让用户抓新 HAR
   - 用 §4 诊断三件套定位
5. **写新 plugin 流程**：
   - 先看现有 11 个 plugin 中最相似的当模板
   - Loon 跟 QX X conf 格式完全不同（§3）
   - JS 通常两边共用，QX X conf 通过 raw.githubusercontent.com URL 引用

---

## 11. 注意事项 / 踩坑汇总

- **不要直接用 `git push`** —— 用 github_helper.sh
- **不要替用户评估版权 / 合规 / 反爬 / 平台政策**
- **不要连续猜同一个错误**——先查真实例子
- **不要在 QX X 远程 conf 里用 `[section]` header**——全裸规则
- **不要用 `(\?|$)` 结尾 + 嵌套 alternation**——拆成多条简单 pattern
- **不要在 JS 顶层 (IIFE 外) 用 `return`**——抛 Illegal return statement
- **不要依赖自动更新**——修 bug 后必须删旧资源 + 重启 + 重加

---

最后更新：2026-10-07

---

## 附录 A：完整 plugin URL 列表（2026-10-07 现状）

```
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/HANDOFF.md

# Loon plugin
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/baidu-maps-noad/baidu-maps-noad.plugin
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/bilibili-noad/bilibili-noad.plugin
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/egdd/egdd.plugin
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/flightradar24/flightradar24.plugin
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/google-rewrite/google-rewrite.plugin
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/kantianxia-noad/kantianxia-noad.plugin
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/spotify-t2s/spotify-t2s.plugin
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/spotify-unlock/spotify-unlock.plugin
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/tideline/tideline.plugin
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/umetrip-noad/umetrip-noad.plugin

# Loon Vista (特殊目录)
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon-vista/vista.plugin

# Quantumult-X conf (bare rules 格式)
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/baidu-maps-noad/baidu-maps-noad.conf
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/bilibili-noad/bilibili-noad.conf
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/egdd/egdd.conf
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/flightradar24/flightradar24.conf
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/google-rewrite/google-rewrite.conf
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/kantianxia-noad/kantianxia-noad.conf
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/spotify-t2s/spotify-t2s.conf
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/spotify-unlock/spotify-unlock.conf
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/tideline/tideline.conf
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/umetrip-noad/umetrip-noad.conf
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/vista/vista.conf
```

---

## 附录 B：plugin 替换 / 删除流程

修改或删除现有 plugin 时：

1. **修改**：改完后 commit + push，**告诉用户"修好了，请按 §3.6 流程清缓存"**——QX X 缓存不会自动清
2. **删除**：跟用户确认（不可逆操作），git rm + commit + push，README 也要更新
3. **重命名**：先跟用户确认（改名会破坏现有 QX X 资源订阅 URL），git mv + commit + push

---

## 附录 C：调试时让用户提供什么

碰到 plugin 不工作时，按顺序要用户提供：

1. **当前 QX X app 版本**（确认是 1.8.0+ crossutility fork，不是老 QuantumultX）
2. **当前 .conf 的 raw.githubusercontent.com URL**（确认他们用的是最新版本）
3. **最新 HAR 抓包**（冷启动 app + 开 MITM + 关 bypass），按 §4 看诊断信号
4. **QX X 资源日志**（如果能看到）——脚本是否被 fetch、是否报错

避免问"你用的是哪个版本"之类的模糊问题——直接要 URL。
