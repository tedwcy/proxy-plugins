# HANDOFF — proxy-plugins 项目交接

> 接手这个项目的 agent 看这份就够。

---

## 1. 项目目标

`proxy-plugins` 仓库托管 Ted 个人用的 **iOS app 代理 plugin**，两个平台：

- **Loon** (`loon/` + `loon-vista/`) — Loon 是付费 iOS app
- **Quantumult-X 1.8.0** (`quantumultx/`) — Quantumult-X 是 crossutility fork，**不是**原版 yichahu QuantumultX（已停更）

---

## 2. 仓库结构

```
proxy-plugins/
├── icons/                       ← 插件图标 (png + ?v=N cache-buster)
├── loon/
│   ├── baidu-maps-noad/         ← 10 个 plugin, 每个目录 .plugin + .js + README
│   ├── bilibili-noad/
│   ├── egdd/
│   ├── flightradar24/
│   ├── google-rewrite/
│   ├── kantianxia-noad/
│   ├── spotify-t2s/
│   ├── spotify-unlock/
│   ├── tideline/
│   └── umetrip-noad/
├── loon-vista/                  ← 特殊: Vista 看天下 VIP 解锁 (不在 loon/ 下, 历史原因)
│   ├── vista.plugin
│   └── vista.js
├── quantumultx/
│   ├── baidu-maps-noad/         ← 10 个 QX X 版 conf, 结构跟 loon 对应
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
- Loon 用 `[MITM]` + `[Script]` section headers
- QX X 远程 conf 用 **bare rules（无 section header）**——见 §3
- JS 文件 JavaScriptCore runtime 兼容，**两边共用同一份 .js**

---

## 3. 关键经验：QX-X 1.8.0 远程 conf 格式

> **最重要的踩坑记录**。接手前先读这部分，否则会重蹈 4 次瞎猜的覆辙。

### 3.1 正确格式（bare rules）

```ini
# 注释用 # 或 // (两种都行)
# 注释里别写中文特殊符号, 跟 QX X 解析器偶尔冲突

hostname = api.example.com, sub.example.com

# URL pattern + 空格 + 指令 + 空格 + 参数
^https?:\/\/api\.example\.com\/path url script-response-body https://raw.githubusercontent.com/.../script.js
^https?:\/\/api\.example\.com\/other url reject-200
```

### 3.2 ❌ 不接受的格式（多次猜错）

```ini
[filter_local]   ← QX X 1.8.0 远程 conf 不接受, 报 "Invalid Line [filter_local]"
hostname = xxx

[mitm]           ← 同样不接受
hostname = xxx

[rewrite_local]  ← 同样不接受
^pattern url script-response-body URL
```

**所有 `[section]` header 在 QX X 远程 conf 里都报 "Invalid Line"**。

### 3.3 真实可参考的 remote conf 例子

- **ddgksf2013/Rewrite/AdBlock/*.conf** (GitHub) — 这是最干净的 QX X 远程 conf 参考样本
- 我已成功参照其格式转换 10 个 plugin (commits `4f806a3` 之后所有 conf)

### 3.4 远程 conf 的 regex 限制（重要）

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

### 3.6 MITM 资源缓存陷阱

**QX X 加载远程 conf 后会缓存内容**，bug 修复后**必须**手动操作才能生效：

1. QX X app → 设置 → 资源 → 找到旧资源 → **删掉**
2. **杀掉 QX X app**（上滑退出）
3. 重启 QX X
4. 重新添加资源 URL

**不要依赖"自动更新"**——缓存可能持续几十小时。

---

## 4. 调试方法（HAR 诊断三件套）

当 plugin "不工作" 时，按这个流程判断：

| HAR 里的信号 | 含义 | 下一步 |
|---|---|---|
| `body.ad`/`body.popup` 等仍是完整对象 | 脚本没跑 | 检查 pattern / MITM / conf 缓存 |
| HAR 里 `raw.githubusercontent.com` 请求数 = 0 | **conf 没加载**或 **pattern 没匹配** | 删旧资源 + 重新添加 + 重启 app |
| HAR 里 `raw.githubusercontent.com` 请求数 > 0 | conf 加载了 + pattern 匹配了 | 检查 JS 本身（runtime / proto 等） |
| `_serverIP` 是 nil + Server header 是 Tengine | **MITM 工作正常**（跟原始 server 一样） | MITM 没问题, 问题是脚本端 |

**诊断流程**：
1. 抓 HAR（开 MITM，bypass 关闭，杀 + 冷启动 app）
2. 看 `body.ad`/`body.popup` 等目标字段还在不在
3. 看 HAR 里有没有 `raw.githubusercontent.com` 请求
4. 综合判断哪一环断了

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

**最关键 commit**：`4f806a3`（bare rules 格式确立），`e12a43d`（regex 限制的解决方式）。

---

## 6. 待办 / 已知限制

### 6.1 baidu-maps-noad QX X 版未解决

- **现状**：纯 MITM（无 script），依赖 SSL pin 失败机制
- **问题**：QX X 上 splash 广告仍出现——MITM 可能没触发 SSL pin 失败，或百度地图 ad SDK 没强 pin
- **修法选项**：
  - **A. 加 script**：需要百度地图 HAR 找 splash ad endpoint → 加 `script-response-body` 清 ad 字段
  - **B. 加 `url reject-200`**：直接拒绝 ad 请求（pattern 需基于 HAR）

### 6.2 wloc 暂搁置

- **背景**：原 Yu9191/wloc 仓库已删，作者提供过 Loon + QX X 版本
- **OpenHRTT/wloc**（GitHub）是 iOS app 源码，分析过：
  - MITM 目标：`gs-loc.apple.com, gs-loc-cn.apple.com`
  - endpoint：`/clls/wloc`
  - 响应格式：**protobuf**（不是 JSON）
  - 修改：`wifiDevices[i].location` 替换为目标坐标
- **两条路径已规划**：
  - **A. 纯 GitHub**：硬编码坐标进 JS（不灵活）
  - **B. GitHub + Cloudflare Worker**：Worker 处理坐标配置 + protobuf 改写
- **关键技术风险**：QX X `script-response-body` 是否能处理 binary protobuf（需先验证）
- **未做原因**：Ted 决定 "先不动吧，后面看情况再说"

### 6.3 MEMORY.md 已有部分记录

`~/.openclaw/workspace/MEMORY.md` §Loon plugin 实战经验 / §中国 app 主流广告架构 等段已有相关条目。接手时**先读 MEMORY.md**。

---

## 7. 工具 / 工作流

### 7.1 Git 操作（不要直接用 `git push`）

```bash
~/.openclaw/secrets/github_helper.sh add <files...>
~/.openclaw/secrets/github_helper.sh commit -m "..."
~/.openclaw/secrets/github_helper.sh push
~/.openclaw/secrets/github_helper.sh log
```

**不要用 `git push`**——会用错身份或触发额外流程。

### 7.2 抓包文件位置

- **HAR 文件**：Ted 抓完后放在 `/home/ted/DS918_TMP/OpenClaw/`
- 命名约定：`量子ult-x-YYYY-MM-DD-HHMMSS.har` (QX X 抓包) / `数字_时间戳.zip` (Loon 抓包)
- HAR 分析用 Python `json.load` 读 `h['log']['entries']`，每个 entry 有 `request.url`, `response.content.text`, `response.headers` 等

### 7.3 找代码 / 文件

```bash
# 找 plugin
ls /home/ted/.openclaw/workspace/proxy-plugins/{loon,quantumultx,loon-vista}/

# 抓包文件
ls -lat /home/ted/DS918_TMP/OpenClaw/ | head -10
```

---

## 8. 接手后第一步

1. **读 MEMORY.md** (`~/.openclaw/workspace/MEMORY.md`)——里面有跨 session 的关键经验
2. **看 §3（QX-X 1.8.0 远程 conf 格式）**——这是最容易被踩的坑
3. **跑一遍 `git log`**——看 commit 历史，理解演化过程
4. 接到 Ted 新需求时**先确认**：
   - 哪个 plugin？
   - 哪个平台（Loon / QX X / 两个都要）？
   - 有什么抓包 / 日志作为证据？
   - 然后再写代码，**不要瞎猜**

---

## 9. 联系上下文（Ted 的偏好）

- **风格偏好**：严谨，陈述需可证，推断需标注，限制需说清；不堆叠修辞，不做超出证据的承诺
- **不要套话 / 不要 moralizing** —— 直接说技术判断和修复方案
- **小操作自己跑，跑前复述命令**；不可逆大操作 Ted 自己跑
- **不喜欢**：同一错误连续猜几次（2026-09-28 我连续 4 次瞎猜 QX X 语法，被骂"先去查官方文档"）→ **新工作先去查真实例子，不要先猜**

---

最后更新：2026-10-07
