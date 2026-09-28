# kantianxia-noad (QuantumultX 版)

看天下 (VistaKTX) 去除开屏广告 + 弹窗广告。

## 功能

- 启动广告 `loading_ad2` → `body.ad = null`
- 弹窗广告 `get_popup_ad` → `body.popup = null`
- 其他端点全透传
- 不影响地图、文章、用户等数据接口
- 与 `loon-vista/` VIP 解锁插件可叠加

## 安装

把 `kantianxia-noad.conf` 的两段内容复制到你的 QuantumultX 配置里：

```ini
[filter_local]
hostname = ktx.cn

[http_response]
^https?:\/\/ktx\.cn\/v3\/api\/(index\/loading_ad2|adm\/get_popup_ad)(\?|$) script-path=https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/kantianxia-noad/kantianxia-noad.js, requires-body=true, tag=看天下去广告, timeout=10
```

QuantumultX 需要开启 MITM。

## 与 Loon 版关系

移植自 `loon/kantianxia-noad/kantianxia-noad.plugin`，脚本代码原样移植。

源代码：https://github.com/tedwcy/proxy-plugins/tree/main/quantumultx/kantianxia-noad

## 版本

- v1.0.0 · 2026-09-28 · 移植自 Loon 版