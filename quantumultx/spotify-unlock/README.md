# spotify-unlock (QX / Quantumult X 版)

Spotify Premium Unlock — 部分解锁。

## 功能

- 解锁 Premium 状态 (artist/album 详情, bootstrap config, user customization)

## 安装

把 `spotify-unlock.conf` 的三段内容复制到你的 QX 配置里：

```ini
[filter_local]
hostname = spclient.wg.spotify.com, *-spclient.spotify.com

[http_request]
^https?:\/\/(spclient\.wg\.spotify\.com|.*-spclient\.spotify\.com(:443)?)\/(artistview\/v1\/artist|album-entity-view\/v2\/album)\/ script-path=https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/spotify-unlock/spotify-json.js, timeout=10, tag=spotifyJson

[http_response]
^https?:\/\/(spclient\.wg\.spotify\.com|.*-spclient\.spotify\.com(:443)?)\/(bootstrap\/v1\/bootstrap|user-customization-service\/v1\/customize)$ script-path=https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/spotify-unlock/spotify-proto.js, requires-body=true, binary-body-mode=true, timeout=10, tag=spotifyProto
```

QX 需要开启 MITM。

## 与 Loon 版关系

**直接引用 Loon 版 JS**（同一份脚本，Loon/QX 平台通用）：
- `loon/spotify-unlock/spotify-json.js` （JSON 响应处理）
- `loon/spotify-unlock/spotify-proto.js` （Protobuf 响应处理）

源代码：https://github.com/tedwcy/proxy-plugins/tree/main/quantumultx/spotify-unlock

## 已知限制

- 韩国 IP 仍可能 4 秒停（app 后端地区校验，需要美区 IP）— 详见 MEMORY.md `Spotify 4秒停的根本原因` 条目
- 出现新校验端点时，参考公开抓包更新脚本（`loon/spotify-unlock/` 里看最新 Loon 版）

## 版本

- v1.0.3 · 2026-09-28 · 移植自 Loon 版
