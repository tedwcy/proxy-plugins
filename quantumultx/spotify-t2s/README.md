# spotify-t2s (QuantumultX 版)

Spotify 繁体歌词 → 简体中文（完整歌词 + 底部预览）。

## 安装

把 `spotify-t2s.conf` 的两段内容复制到你的 QuantumultX 配置里：

```ini
[filter_local]
hostname = spclient.wg.spotify.com, *-spclient.spotify.com

[http_response]
^https?:\/\/(spclient\.wg\.spotify\.com|.*-spclient\.spotify\.com(:443)?)\/color-lyrics\/v2\/track\/ script-path=https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/spotify-t2s/spotify-t2s.js, requires-body=true, binary-body-mode=true, tag=Spotify繁简转换, timeout=10
```

QuantumultX 需要开启 MITM。

## 与 Loon 版关系

**直接引用 Loon 版 JS**，避免重复上传 2MB OpenCC 词典：
- `loon/spotify-t2s/spotify-t2s.js` （完整功能脚本）

两个平台的 JavaScriptCore 运行时兼容。

源代码：https://github.com/tedwcy/proxy-plugins/tree/main/quantumultx/spotify-t2s

## 版本

- v1.0.5 · 2026-09-28 · 移植自 Loon 版
