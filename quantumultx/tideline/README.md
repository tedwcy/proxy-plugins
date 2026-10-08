# tideline (QX / Quantumult X 版)

91porn.com 页面精简 + 屏蔽推广元素（视频页 + 首页 + 弹窗 + 第三方追踪域名）。

## 功能

- **首页 / 视频页**：删除推广条 / JuicyAds / smartpop / 快手 pre-roll
- **JS 文件**：直接返空 JS
- **fans.91selfie.com**：返 1x1 透明 GIF
- **poweredby.jads.co**：返空 JS
- **go.rmhfrtnd.com**：返空 HTML（smartpop iframe）
- **s1.kwai.net**：返最小 mp4（pre-roll 视频广告）

## 安装

把 `tideline.conf` 的四段内容复制到你的 QX 配置里：

```ini
[filter_local]
hostname = 91porn.com, fans.91selfie.com, poweredby.jads.co, go.rmhfrtnd.com, s1.kwai.net

[http_response]
^https?:\/\/91porn\.com\/js\/(jquery\.cookie|overHang\.min5|indexonly|m2?)\.js script-path=https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/tideline/tideline.js, requires-body=true, tag=91porn-js, timeout=10

[http_response]
^https?:\/\/91porn\.com\/(index\.php|view_video\.php)?(\?|$|/) script-path=https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/tideline/tideline.js, requires-body=true, tag=91porn-html, timeout=10

[http_response]
^https?:\/\/(fans\.91selfie\.com|poweredby\.jads\.co|go\.rmhfrtnd\.com|s1\.kwai\.net)\/ script-path=https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/tideline/tideline.js, requires-body=true, tag=91porn-adnet, timeout=10
```

QX 需要开启 MITM。

## 与 Loon 版关系

移植自 `loon/tideline/tideline.plugin`，脚本代码原样可移植。`loon/tideline/tideline.js` 和本目录的 `tideline.js` 是同一份逻辑。

源代码：https://github.com/tedwcy/proxy-plugins/tree/main/quantumultx/tideline

## 已知限制

- `la.btc620.com` 是真实视频 CDN，**不要加进 MITM / 不要替换**
- 若 91porn 改版导致 regex 不匹配，需重新抓包

## 版本

- v1.1.0 · 2026-09-28 · 移植自 Loon 版