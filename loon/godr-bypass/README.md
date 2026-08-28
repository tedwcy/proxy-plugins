# godr (GO DaVinci) - 离线会员解锁

拦截 `godr.cc/api/V1/godr/membership.php?action=check` 的响应，把 `allowed: false` 改 `true` 并伪装 `userType` 到所需 tier，实现 godr (GO DaVinci Resolve) 插件的离线会员功能解锁。

## 拦截端点

```
^https?:\/\/godr\.cc\/api\/V1\/godr\/membership\.php\?action=check
```

匹配所有 `?action=check&feature=X` 请求。

## 改写策略

1. `body.allowed` 强制 `false → true`（功能解锁）
2. `body.userType` 提到 `requiredUserTypes` 的最高级（subtitle: 10/11 → 11），避免 UI 二次校验失败
3. `body.message` 改 `"已解锁"`

## 透传端点（不动）

- `login.php`：真实登录走，让现有会员状态（userType:6）继续有效
- `preview/*`、`index.php?path=cat/list`、`notice.php`、`version.php`、`time-limits`

## MITM hostname

`godr.cc`

## 安装（URL）

```
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/godr-bypass/godr-bypass.plugin
```

Loon → 配置 → 插件 → 右上 + → 通过 URL 添加插件。

## 已知限制

- 仅 `?action=check` 端点。若 server 改 shape（allowed 改字符串、加 HMAC 签名、改用 status code 区分）需要适配
- 已知 feature: subtitle 已验证。若 server 加新 feature 检查（audio_clone / funasr 等），`?action=check` pattern 自动覆盖
- premium 资源下载若另走独立 URL，需新增 pattern

## 版本

- v1.0.0 · 2026-08-28 22:13 · 初版