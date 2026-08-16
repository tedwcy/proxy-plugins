# proxy-plugins

Loon / Surge / Shadowrocket / 其他代理工具的插件和重写脚本集合。

## ⚠️ 免责声明

**本仓库所有脚本收集自网络,仅供学习交流使用。**

如有侵权(版权、API 滥用、平台政策等),请通过以下方式联系,将在 **24 小时内** 删除对应内容:

- **邮箱**: `ted1992@live.cn`
- **GitHub Issue**: [tedwcy/proxy-plugins/issues](https://github.com/tedwcy/proxy-plugins/issues)

请提供:
1. 涉及的具体脚本 / 文件名
2. 侵权依据 (原文链接 / 投诉来源)
3. 你的身份证明 (原作者 / 代理人 / 平台)

脚本原作者归属以各 `.plugin` 文件的 `#!homepage=` 字段为准,本仓库仅作 Loon 适配与维护。

## 目录约定

```
icons/            ← 插件用到的图标 (PNG)
loon/             ← Loon 插件
  <script>/       ← 每个脚本一个子目录
    <script>.js       ← 主脚本 (Loon script-path 用)
    <script>.plugin   ← Loon 配置文件 (从 URL 安装用)
loon-vista/       ← 历史偏差: vista 插件放在这(不服从 loon/<script>/ 约定)
```

未来扩展: `surge/`, `shadowrocket/`, `stash/` 等子目录,每个脚本独立子目录。

## URL 策略

**统一使用 `raw.githubusercontent.com` 直连**,不走 jsdelivr CDN:
- 实时同步,无 cache 延迟
- 每次 push 后 plugin 立即看到新内容(无 purge 步骤)
- Ted 装 plugin URL 和 script-path URL 都用 raw

**Loon 装 plugin URL 模板**:
```
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/<script>/<script>.plugin
```

**Plugin 里 script-path URL 模板**:
```
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/<script>/<script>.js
```

**图标 URL 模板**:
```
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/icons/<name>.png
```

> **注意**: raw.githubusercontent.com 有速率限制(匿名 60 req/h per IP)。
> Loon 装 plugin 时拉一次(几乎无感)。
> Loon 每次拦截响应时也会拉 script-path 一次(Loon 内部缓存短时间,通常没问题)。
> 频繁触发某个被拦截接口可能触发 rate limit,但实际场景下极少。

## Loon plugin 字段规范

| 字段 | 用途 | 格式 |
|------|------|------|
| `#!name=` | 显示名 | 简洁中文 |
| `#!desc=` | **统一格式** | `v1.0.X · YYYY-MM-DD HH:MM · 功能说明 + 注意事项` |
| `#!homepage=` | 原脚本来源 | GitHub / TG / 其他 |
| `#!icon=` | 图标 (推荐) | HTTPS URL, 来自 `icons/` 目录 |

**版本号 + 时间戳规范** (2026-08-13 立):
- 格式：`v1.0.X · YYYY-MM-DD HH:MM · 功能描述`
- 每次 commit 改 `.js` 或 `.plugin` → patch (X) +1
- `.js` 顶部加 `console.log('[PluginName] v1.0.X loaded')` 让 Ted 在 Loon 脚本日志中验证**实际跑的版本**(desc 看到 ≠ 已加载,日志看到才稳)
- 目的：一天内多次更新时 Ted 能一眼确认"我装的是最新版"

**更新流程**: 原脚本有更新时,version bump (X +1),更新 desc 时间戳,提交 + push。

## 当前脚本

| Plugin | URL | 基于 |
|---|---|---|
| `loon/flightradar24/` | Flightradar24 移动端 VIP 解锁 | ddgksf2013 QX 脚本 |
| `loon/egdd/` | 儿歌点点 VIP 解锁 | 89996462 QX 脚本 |
| `loon-vista/` | Vista 看天下 VIP 解锁 | 自研(基于真实抓包) |

## 工作流

```
[你] 贴 URL 或脚本原文
   ↓
[我]
   1. 抓取 + 解混淆 + 改写
   2. 写到 loon/<script>/<script>.{js,plugin}
   3. 复制图标到 icons/<name>.png (iTunes Search API)
   4. git commit + push
   ↓
[你] Loon → 插件 → 从 URL 安装 → 填 plugin URL
   下次原生作者更新 → 我重做 → 你重装即可
```

## 侵权投诉模板

收到后会优先处理:

```
收件人: ted1992@live.cn
主题: [proxy-plugins 侵权投诉] <script 名>

正文:
- 投诉人: <姓名 / 公司>
- 联系方式: <邮箱>
- 涉及脚本: <plugin / 路径,例如 loon/flightradar24/>
- 侵权依据: <原文链接 / 版权证明 / 平台投诉 ID>
- 要求: <删除 / 修改 / 注明出处>
- 时间: <YYYY-MM-DD>
```

Ted 会在 24 小时内核实并删除 / 修改。

---

## Spotify 繁简转换 (spotify-t2s)

把 Spotify 的繁体中文歌词本地转成简体中文。**0 外部 API、0 配额、0 secret**。

文件: [`loon/spotify-t2s/spotify-t2s.js`](loon/spotify-t2s/spotify-t2s.js) (~122 KB)

### 工作原理

Hook Spotify `color-lyrics/v2/track/` (返回 protobuf 二进制),只在 `lyrics.language === 'z2'` (繁体) 时,用 OpenCC tw2s 把每行 words 转简体,然后改 `language = 'z1'` 返回。其他语言 (en/ja/ko/z1) 完全 pass-through。

### Loon 配置

```
[Mitm]
hostname = spclient.wg.spotify.com

[Script]
http-response ^https:\/\/spclient\.wg\.spotify\.com\/color-lyrics\/v2\/track\/ script-path=https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/spotify-t2s/spotify-t2s.js, requires-body=true, binary-body-mode=true, timeout=10, tag=Spotify繁简转换
```

### Surge 配置

```
[MITM]
hostname = %APPEND% spclient.wg.spotify.com

[Script]
spotify-t2s = type=http-response,pattern=^https:\/\/spclient\.wg\.spotify\.com\/color-lyrics\/v2\/track\/,requires-body=1,binary-body-mode=1,max-size=0,script-path=https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/spotify-t2s/spotify-t2s.js
```

### 已知限制

- tw2s 是**字形级**转换(`軟體→软体`,不是 `软件`)。如要台湾→大陆用语替换,改字典即可
- 失败时 Loon 日志会显示 `Spotify繁简转换异常` + 异常 message
