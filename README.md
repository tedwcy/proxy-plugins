# proxy-plugins

Loon / Surge / Shadowrocket / 其他代理工具的插件和重写脚本集合。

## 目录约定

```
icons/            ← 插件用到的图标 (PNG)
loon/             ← Loon 插件
  <script>/       ← 每个脚本一个子目录
    <script>.js       ← 主脚本 (Loon script-path 用)
    <script>.plugin   ← Loon 配置文件 (从 URL 安装用)
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
| `#!desc=` | **统一格式** | `YYYY-MM-DD · 功能说明 + 注意事项` |
| `#!homepage=` | 原脚本来源 | GitHub / TG / 其他 |
| `#!icon=` | 图标 (推荐) | HTTPS URL, 来自 `icons/` 目录 |

**desc 格式示例**:
- `2026-08-12 · 解锁 Gold 订阅 (365 天历史/去广告/无限追踪),需先用免费账户登录` (FR24)
- `2026-08-12 · 解锁 VIP (全内容/去广告),需先登录免费账户` (egdd)

**更新流程**: 原脚本有更新时,desc 日期改为新转换日期,提交。

## 当前脚本

- `loon/flightradar24/` - Flightradar24 移动端 VIP 解锁 (基于 ddgksf2013 QX 脚本)
- `loon/egdd/` - 儿歌点点 VIP 解锁 (基于 89996462 QX 脚本)

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
