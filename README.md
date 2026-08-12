# proxy-plugins

Loon / Surge / Shadowrocket / 其他代理工具的插件和重写脚本集合。

## 目录约定

```
loon/           ← Loon 插件和脚本
  <script>/     ← 每个脚本一个子目录(可能有多个文件)
    <script>.js       ← 主脚本文件 (Loon plugin script-path 用这个)
    <script>.plugin   ← Loon 配置文件(直接复制粘贴用)
    README.md         ← 脚本说明(可选)
```

未来会扩展:
```
surge/          ← Surge 模块
shadowrocket/   ← Shadowrocket 重写
stash/          ← Stash 重写
```

## Loon 端用法

把 Loon plugin 的 `script-path` 指向 jsdelivr CDN URL:

```
script-path=https://cdn.jsdelivr.net/gh/tedwcy/proxy-plugins@main/loon/<script>/<script>.js
```

## 当前脚本

- `loon/flightradar24/` - Flightradar24 移动端 VIP 解锁 (基于 ddgksf2013 QX 脚本改写)
