# baidu-maps-noad (QuantumultX 版)

百度地图 (iOS v21.20.30) 去广告插件的 QuantumultX 版本。

## 功能

去掉三类广告：
- ✓ 开屏广告（冷启动时全屏图片）
- ✓ 首页左上角圆形广告图标
- ✓ 首页顶部横幅广告
- ✗ 首页顶部文字通知条（app cache + HTML webview 双重渲染，MITM 无法去除 — 同 Loon 版）

## 机制

**纯 MITM SSL pin 失败**。把广告域名加入 QuantumultX 的 MITM 名单：
- QuantumultX 用自己的 CA 签发证书给 app
- app SSL pin 检测失败 → HTTPS 连接断 → 广告 SDK 静默失败 → 广告位置渲染为空

## MITM 域名

| 域名 | 拦截的广告类型 |
|---|---|
| `afdconf.baidu.com` | 开屏广告 config server |
| `ecom.map.baidu.com` | AFD 广告框架（圆形 / 横幅） |
| `integralwall.baidu.com` | 积分墙（广告决策中枢）|
| `i.qchannel03.cn` | QChannel 第三方广告聚合 SDK |
| `nsclick.baidu.com` | 广告点击追踪像素 |
| `usr-api.yunxish.com` | Admaster 监测上报 |
| `logrcv.yunxish.com` | Admaster log receive |

## 安装

把 `baidu-maps-noad.conf` 的 `[filter_local]` 段内容复制到你的 QuantumultX 配置里：

```ini
[filter_local]
hostname = ecom.map.baidu.com, integralwall.baidu.com, afdconf.baidu.com, i.qchannel03.cn, nsclick.baidu.com, usr-api.yunxish.com, logrcv.yunxish.com
```

QuantumultX 需要开启 MITM（设置 → HTTPS 解密 → 启用）。

启用后**杀掉 + 冷启动百度地图 app**（上滑彻底退出后重开）。

## 与 Loon 版关系

这是 `loon/baidu-maps-noad/baidu-maps-noad.plugin` v1.3.0 的 QuantumultX 移植版。功能、MITM 域名、机制完全相同。

源代码：https://github.com/tedwcy/proxy-plugins/tree/main/quantumultx/baidu-maps-noad

## 版本

- v1.3.0 · 2026-09-28 · 移植自 Loon 版