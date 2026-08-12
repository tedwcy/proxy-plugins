# proxy-plugins

Loon / Surge / Shadowrocket / 其他代理工具的插件和重写脚本集合。

## 目录约定

```
loon/           ← Loon 插件
  <script>/     ← 每个脚本一个子目录
    <script>.js       ← 主脚本 (Loon script-path 用)
    <script>.plugin   ← Loon 配置文件 (从 URL 安装用)
```

未来扩展: `surge/`, `shadowrocket/`, `stash/` 等子目录,每个脚本独立子目录。

## Loon plugin 字段规范

| 字段 | 用途 | 格式 |
|------|------|------|
| `#!name=` | 显示名 | 简洁中文 |
| `#!desc=` | **统一格式** | `YYYY-MM-DD · 原脚本作者` |
| `#!author=` | 转写者 | `原作者 (Loon port)` |
| `#!homepage=` | 原脚本来源 | GitHub / TG / 其他 |
| `#!icon=` | 图标 (可选) | HTTPS URL |

**desc 格式示例**:
- `2026-08-12 · ddgksf2013` (FR24)
- `2026-08-12 · 89996462` (egdd)

**更新流程**: 原脚本有更新时,直接把 `desc` 里日期改为新转换日期,提交。

## 当前脚本

- `loon/flightradar24/` - Flightradar24 移动端 VIP 解锁 (基于 ddgksf2013 QX 脚本)
- `loon/egdd/` - 儿歌点点 VIP 解锁 (基于 89996462 QX 脚本)
