# AGENTS.md — proxy-plugins 工作指引 (OpenCode 时代)

本文件给 OpenCode 接手 agent 看。**更完整的历史背景、commit 列表、调试原理** 都在本地 `./HANDOFF.md` (网络副本: `https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/HANDOFF.md`)。

本文档**不是** handoff 的全文复述——只列"不看就会踩坑"的高信号事实 + 当前环境的具体工作流。

**仓库宪法是 `./README.md`**, 涉及 plugin 字段规范、URL 策略、侵权投诉邮箱。开工前**先读 README 再读 handoff**, 然后读本文件。

---

## 0. 项目是啥

`proxy-plugins` = 个人用的 iOS 代理 plugin 仓库, 主要两个目标平台:

- **Loon** (付费 iOS app, `.plugin` 文件, `[MITM]` + `[Script]` section 格式)
- **QX 1.8.0** (全称 Quantumult X, `crossutility` fork, **不是** 已停更的 yichahu 原版 QX, `.conf` 文件, **bare rules 无 section header**, 见 §3)

JS 通常两边共用 (JavaScriptCore runtime), QX conf 通过 raw.githubusercontent.com URL 引用 Loon 同一份 `.js`。

README 还提到未来扩展到 `surge/`、`shadowrocket/`、`stash/` —— **不是只能 Loon/QX**。

---

## 1. 当前工作环境

- **工作目录**: `/home/ted/DS918_TMP/opencode/proxy-plugins/`
- **Git remote**: `https://github.com/tedwcy/proxy-plugins.git` (已配 origin)
- **commit author**: `tedwcy` (具体邮箱由用户后续指明)
- **HAR 文件**: 放项目内 `har/` 子目录 (有 `.gitignore`, 永远不入版本库)
- **不再依赖** OpenClaw / `~/.openclaw/` / `github_helper.sh` —— 用户已完全卸载 OpenClaw, 当前只用 OpenCode (接手 agent 别假设有这些老环境的东西)

### ⚠️ Git safe.directory

clone 完成后首次 `git status` 会报 `dubious ownership`。**先跑**:

```bash
git config --global --add safe.directory /home/ted/DS918_TMP/opencode/proxy-plugins
```

否则所有 git 命令都失败。

### Git push 凭据

本环境**不**预置 GitHub 凭据 (无 SSH key、无 `~/.git-credentials`、无 PAT 环境变量, 老的 `~/.openclaw/secrets/github.json` 已随 OpenClaw 一起卸载).

**首次需要 push 时, 必须向用户索取以下任一**:

1. **GitHub PAT (推荐, 最快)**: 用户贴 token, 临时设到 remote URL 推完再清
2. **SSH private key**: 写到 `~/.ssh/github_ed25519`, `chmod 600`, 加到 `~/.ssh/config` 配 `Host github.com`, 改 `git remote set-url origin git@github.com:tedwcy/proxy-plugins.git`

PAT 临时推送流程:

```bash
# 1. 用户提供 token
TOKEN="github_pat_xxxxx"

# 2. 临时写入 remote URL
git remote set-url origin "https://x-access-token:${TOKEN}@github.com/tedwcy/proxy-plugins.git"

# 3. push
git push origin main

# 4. 立即清掉 token
git remote set-url origin "https://github.com/tedwcy/proxy-plugins.git"
```

**⚠️ 推送完务必把 remote URL 改回不带 token 的形式**——不要让 token 长期驻留在 `.git/config` 里。SSH 方式没有这个风险, 长期用更安全。

### HAR 文件边界

`har/` 在 `.gitignore` 里, 永远不入 git commit。

---

## 2. 标准工作流

### 改 / 加 / 删 plugin 之前的复述规则 (用户长期约定)

- **小操作 (本地 commit / push / 改 plugin)** —— agent 自己跑, **跑前复述完整命令**, 等绿灯或确认
- **不可逆 / 高风险操作 (删 plugin、改名、清旧资源)** —— 让用户自己跑
- **不替用户评估版权 / 合规 / TOS / 反爬 / 平台政策**——这些是用户决定的事, agent 不在他已决定要做的事上 moralizing

### Git 命令 (标准用法, 不再走任何 helper)

```bash
cd /home/ted/DS918_TMP/opencode/proxy-plugins
git status
git add <files>
git commit -m "<conventional 风格>"
git push
```

### 改 plugin 流程

1. 定位 plugin 目录 (`loon/<name>/` 或 `quantumultx/<name>/`)
2. 改完本地 commit
3. **改完 push 后, 必须提示他走 §5 的缓存清理流程** —— QX 不会自动更新
4. 让用户抓新 HAR (冷启动 app + 开 MITM + 关 bypass) 放 `har/`, 用 §4 诊断

### 写新 plugin 流程

1. 看现有 11 个 plugin 中最相似的当模板
2. Loon 和 QX conf **格式完全不同** (见 §3)
3. JS 通常两边共用
4. 必读 README §"Loon plugin 字段规范": `#!name=`、`#!desc=` 统一 `v1.0.X · YYYY-MM-DD HH:MM · 功能描述`、`#!icon=` HTTPS URL; `.js` 顶部加 `console.log('[PluginName] v1.0.X loaded')`

### 删 / 改名 plugin

不可逆, **跟用户确认**。删之前 README 也要同步改。

---

## 3. QX conf 格式 (最容易踩坑, 接手必读)

完整踩坑表见 handoff §3, 这里只列**硬规则**:

### ✓ 正确格式 (bare rules)

```ini
# 注释用 # 或 //, 别混中文特殊符号
hostname = api.example.com, sub.example.com

# URL pattern + 空格 + 指令 + 空格 + 参数 (空格分隔, 不是逗号)
^https?:\/\/api\.example\.com\/path url script-response-body https://raw.githubusercontent.com/.../script.js
^https?:\/\/api\.example\.com\/other url reject-200
```

### ❌ 错的格式 (远程 conf 全报 "Invalid Line")

任何 `[filter_local]` / `[mitm]` / `[rewrite_local]` 这种 **section header 在 QX 远程 conf 里都不接受**。

### Regex 限制 (没报错但 pattern 不匹配, 极坑)

| ✓ 能用 | ✗ 不能用 |
|---|---|
| 简单 prefix `^pattern` | 复杂结尾 anchor `(\?\|$)` 跟嵌套 alternation `\|` 组合 |
| group 内 alternation `\|` | group + 结尾 anchor 组合 |
| 不需要 `$` 收尾 | regex 强制 `$` 收尾 |

**踩坑案例**: `^https?:\/\/ktx\.cn\/v3\/api\/(index\/loading_ad2|adm\/get_popup_ad)(\?|$)` —— QX 远程 conf 里**整个 pattern 不匹配, 无任何报错**, 脚本不被调用, response 原样保留。

**修法**: 拆成多条简单 prefix pattern (commit `e12a43d` 是先例)。

### 参考样本

- **ddgksf2013/Rewrite/AdBlock/*.conf** (GitHub) —— 最干净的 QX 远程 conf 参考

**不要凭印象写 QX 语法**, 不确定就先翻这个仓库或现有 10 个 conf 当样本。

### JS 文件踩坑

**JSCore 严格模式, IIFE 外顶层 `return` 抛 `Illegal return statement`**。

```javascript
// ❌ 顶层 return → 报错
if (!modified) { $done({}); return; }

// ✅ 改 if/else 嵌套
if (!modified) { $done({}); }
else { $done({ body: JSON.stringify(body) }); }
```

---

## 4. 调试 (HAR 诊断三件套)

plugin "不工作"时, 按 handoff §4 的诊断信号定位:

| HAR 信号 | 含义 | 下一步 |
|---|---|---|
| `body.ad` / `body.popup` 等目标字段仍是完整对象 | 脚本没跑 (或没成功修改) | 检查 pattern / MITM / conf 缓存 |
| HAR 里 `raw.githubusercontent.com` 请求数 = 0 | conf 没加载 / pattern 没匹配 | 走 §5 缓存清理 |
| HAR 里 `raw.githubusercontent.com` 请求数 > 0 | conf 加载 + pattern 匹配 + JS 被 fetch | 检查 JS 本身 |
| `_serverIP` 是 nil + Server header 是 Tengine | MITM 工作正常 | 问题在脚本端 |
| 响应 body 是 JSON 解码失败 | 可能 MITM 加密链路出问题 | 看 response headers / cert 信任 |

HAR 文件放在项目内 `har/` 子目录。Python 分析:

```python
import json
with open('har/quantumult-x-2026-10-08-xxxxxx.har') as f:
    h = json.load(f)
for e in h['log']['entries']:
    if 'target_endpoint' in e['request']['url']:
        b = json.loads(e['response']['content'].get('text', ''))
        print(f"{e['request']['url']}: 字段 = {b.get('目标字段')}")
js_fetched = [e for e in h['log']['entries']
              if 'raw.githubusercontent.com' in e['request']['url']]
print(f"脚本被 fetch 次数: {len(js_fetched)}")
```

完整模板见 handoff §8.3。

---

## 5. QX 缓存陷阱 (修 bug 后必走流程)

QX 加载远程 conf 后会缓存内容, **不要依赖自动更新**。修 bug 后:

1. QX app → 设置 → 资源 → 找到旧资源 → **删掉**
2. **杀掉 QX app** (上滑退出)
3. 重启 QX
4. 重新添加资源 URL

**用户报告"还是不行"时, 第一件事就是让他走这个**。缓存可能持续几十小时。

---

## 6. 用户偏好 (长期约定, 必读)

- **不喜欢**: 同一错误连续猜几次 (QX 语法连续 4 次瞎猜被骂过 "先去查官方文档")
- **喜欢**: 直接说技术判断和修复方案, 不套话, 不 moralizing
- **风格**: 严谨, 陈述需可证, 推断需标注, 限制需说清; 不堆叠修辞, 不做超出证据的承诺
- **README 风格**: 全中文, "⚠️ 免责声明" + 侵权投诉邮箱 `ted1992@live.cn` 是必写项 (新增 plugin / 大改结构时同步更新 README)

---

## 7. 当前 plugin 状态 (11 个)

完整表见 handoff §6。**唯一已知未解决**的:

- **baidu-maps-noad QX 版** —— splash 广告仍出现
  - 现状: 纯 MITM, 依赖 SSL pin 失败机制 (在 QX 上不触发)
  - 修法选项: (A) 加 `script-response-body` 清 ad 字段 (需 HAR); (B) 加 `url reject-200` 直接拒绝 ad 请求 (pattern 基于 HAR)

碰到这个 plugin 不工作, **先抓 HAR**, 不要瞎猜 endpoint。

### 目录结构例外

- `loon-vista/` 不服从 `loon/<script>/` 约定, 历史偏差 — **别动这目录**。
- 10 个 `loon/<name>/` 和 10 个 `quantumultx/<name>/` 一一对应 (加上 `quantumultx/vista/` ↔ `loon-vista/`, 共 11 对)。

---

## 8. 不要做的事 (汇总)

- ❌ 假设有 `~/.openclaw/` 或 `github_helper.sh` —— OpenClaw 已卸载, 凭据必须由用户临时提供
- ❌ 把 GitHub PAT 长期留在 `git remote -v` 或 `.git/config` 里 —— 推完立即清掉
- ❌ 在 QX 远程 conf 里写 `[section]` header
- ❌ 用 `(\?|$)` 结尾 + 嵌套 alternation 的 regex pattern
- ❌ 在 JS 顶层 (IIFE 外) 用 `return`
- ❌ 依赖 QX 自动更新 (修 bug 后必须让用户走 §5)
- ❌ 替用户评估版权 / 合规 / 反爬 / 平台政策
- ❌ 连续猜同一个错误 (先查 ddgksf2013 / 现有 conf 样本)
- ❌ 改 plugin 不 bump patch 版本号 (README §"版本号规范" 是硬要求)
- ❌ 把 HAR 误 commit 进 git (`har/` 不进版本库)
- ❌ 跳过 README 直接动手 — 仓库宪法在那

---

## 9. 接手第一步

1. 读完本文件 (AGENTS.md)
2. 读 `./README.md` (仓库宪法)
3. 读 `./HANDOFF.md` (完整背景 + 调试原理)
4. 跑 `git log --oneline -n 20` 看演化过程
5. 接到新需求先确认: 哪个 plugin / 哪个平台 / 有没有抓包
6. 有疑问先问用户, 不要连续猜