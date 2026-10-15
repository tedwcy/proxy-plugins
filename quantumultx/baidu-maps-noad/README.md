# baidu-maps-noad (QX / Quantumult X 版)

百度地图 (iOS V22 / v22.0.40.3) 去广告插件的 QX 版本。

## 功能

| 广告 | 状态 | 说明 |
|---|---|---|
| 开屏广告 (splash) | ✓ v1.0.0 | 改写 `afd.baidu.com/afd/entry` 响应, 清空 `res.ad` + `splash.style_desc` |
| 主页顶部横幅 "在？抽个 AirPods5" | ✗ 待 v1.0.1 | 需主页完整 HAR, 估计在 `mbd.baidu.com/ccs/v1/start/confsync` 71KB 配置里 |
| 主页左上角 "古今地图" | ✗ 待 v1.0.1 | 同上 |

## 改写机制 (v1.0.0)

**双保险: script-response-body 改写 + MITM hostname 备用**。

- **改写**:`afd.baidu.com/afd/entry?action=query|update` 响应里把 `res.ad` 置 `[]`、`splash.style_desc` 置 `"{}"`。
  - 保留 `splash.cmd` / `ukey` / `realTimeLoading` / `src_ext_info`, 避免破坏 app 依赖
- **MITM 兜底**:hostname 包含 `afd.baidu.com` + `mbd.baidu.com`, 即使脚本挂掉, SSL pin 失败仍能让 SDK 静默

## 抓包来源

HAR: `har/quantumult-x-2026-10-15-095744.har` (15:00 北京时间 13:19, 用户截图后到手机开 MITM 抓取)

HAR 关键发现 (13 条请求, 主要是冷启动 + 开屏广告拉取):
- `afd.baidu.com/afd/entry?action=query` (3.5KB) — splash 配置容器, 含 `res.splash` (频控) + `res.ad[]` (空 list)
- `afd.baidu.com/afd/entry?action=update` (121KB) — splash 创意增量, 含 `res.ad[0]` 完整 `splash_video` (含 mp4 + jump_url + lottie)
- `mbd.baidu.com/ccs/v1/start/confsync` (71KB) — 首页所有模块配置, **未分析** (待 v1.0.1 主页完整包)
- `dss0.bdstatic.com/.../cae-legoup-video-target/*.mp4` — 实际 splash 视频素材

## 安装

```
https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/quantumultx/baidu-maps-noad/baidu-maps-noad.conf
```

QX → 设置 → 配置 → 编辑 → 顶部 + → 资源 → 粘贴 URL。

或者把 .conf 内容贴到本地配置的 `[filter_local]` 段。

QX 需开启 MITM (设置 → HTTPS 解密 → 启用)。

## ⚠️ 升级 / 启用后必走流程

1. **杀掉 QX app** (上滑退出)
2. 重启 QX, 重新添加资源 URL (否则 QX 缓存旧 conf, 见 handoff §3.6)
4. **杀掉百度地图 app** (上滑退出)
5. 重新打开百度地图 (否则 splash 可能命中 app 本地缓存)

如果 splash 仍顽固显示: iOS 设置 → 通用 → iPhone 存储空间 → 百度地图 → 卸载重装 (彻底清沙盒)。

## 版本历史

| 版本 | 日期 | 备注 |
|---|---|---|
| **v1.0.0** | 2026-10-15 | 初版. 仅覆盖开屏 (splash). 主页顶部横幅 + 左上角"古今地图"待 v1.0.1. 完整重建, 不沿用之前 v1.3.0 Loon/QX 旧版 (旧版 splash 在 QX 上失效, 见 handoff §7) |

## 已知限制

- v1.0.0 只去开屏. 主页顶部横幅 + 左上角入口下次抓包再说
- 不影响地图核心功能 (路径规划 / 导航 / 搜索 / 公交 / 街景)
- 百度升级 app 后可能改 endpoint (`afd.baidu.com` 路径 / 字段), plugin 可能失效, 需重新抓包
- iOS 越狱设备如装 SSL Kill Switch 等插件, 可能绕过 SSL pin

## 待办 (v1.0.1 路线图)

1. 用户抓**主页加载完成后**的完整 HAR (覆盖: 冷启动 + splash 展示 + 跳过 splash + 主页渲染 + 看到顶部横幅 + 左上角卡片)
2. 分析 `mbd.baidu.com/ccs/v1/start/confsync` 71KB 响应里"横幅" / "古今地图" 对应的 ad card 字段
3. 写改写规则, bump v1.0.1

## 上游 / 致谢

抓包 + 端点分析: tedwcy, 2026-10-15

## ⚠️ 免责声明

本插件仅供个人学习、研究使用。请勿用于商业用途。所有广告商标 / 内容版权归原作者所有。如有侵权, 请联系 ted1992@live.cn 处理。