# proxy-plugins

Loon / Surge / Shadowrocket / 其他代理工具的插件和重写脚本集合。

## 目录约定

```
icons/            ← 插件用到的图标 (PNG, 512x512 或 144x144)
loon/             ← Loon 插件
  <script>/       ← 每个脚本一个子目录
    <script>.js       ← 主脚本 (Loon script-path 用)
    <script>.plugin   ← Loon 配置文件 (从 URL 安装用)
```

未来扩展: `surge/`, `shadowrocket/`, `stash/` 等子目录,每个脚本独立子目录。

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
