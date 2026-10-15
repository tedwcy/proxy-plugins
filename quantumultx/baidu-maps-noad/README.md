# baidu-maps-noad (QX / Quantumult X 版)

百度地图 (iOS V22 / v22.0.40.3) 去广告插件的 QX 版本。

## 功能

| 广告 | 状态 | 端点 / 改写字段 |
|---|---|---|
| 开屏广告 (splash) | ✓ v1.0.0+ | `afd.baidu.com/afd/entry?action=query|update` — 清空 `res.ad` + `splash.style_desc` + `splash.empty_ext_info` |
| 主页顶部横幅 "在？抽个 AirPods5" | ✓ v1.1.0 | `newclient.map.baidu.com/client/phpui2/?qt=ads` — 清空 `data.result/list/cards/items` + 顶层 `result/list/cards/items` |
| 主页左上角 "古今地图" 广告入口 | ✓ v1.1.0 | 同上 (`user_home_icon` 类型) |
| 主页推荐 / AI 卡片 (防御性) | ✓ v1.1.0 | `newclient.map.baidu.com/govui/{cross_list_recommend,aimode/query_rec}` + `llm-render/get_ai_card` |

## 改写机制 (v1.1.0)

**三保险: script-response-body 改写 + MITM 通配 hostname + SSL pin 兜底**。

- **开屏改写** (afd.baidu.com):
  - `res.ad = []`
  - `splash.style_desc = "{}"`
  - `splash.isCPC = 0`
  - `splash.empty_ext_info = ""` (v1.1.0 新增, 强制触发 app 走"无广告" 路径)
- **主页改写** (newclient.map.baidu.com): 因为没抓到实际响应样本,走"清空一切可能字段"策略 — 找到 list/array 字段就清空,字典型也清空
- **MITM 兜底** (v1.1.0 新增): hostname 含 `*.map.baidu.com` 通配,**即使脚本挂掉, SSL pin 失败仍能让 SDK 静默**

## 抓包来源

HAR: `har/quantumult-x-2026-10-15-134411.har` (4.5 分钟, 104 请求, 反复冷启动)

HAR 关键发现 (v1.0.0 → v1.1.0 升级触发):
- `afd.baidu.com/afd/entry` 18 次 — splash 配置 (`ad: []` + `empty_ext_info` base64) — v1.0.0 已拦
- `mbd.baidu.com/ccs/v1/start/confsync` 15 次 — 首页全量配置 — 暂未直接改写, 但被 hostname 兜底
- `pms-cdn.bdstatic.com/searchbox/aps/*.zip` 17 次 — 主页 RN bundle (含 `HomePopup/` 资源)
- **`newclient.map.baidu.com` 0 次** — ⚠️ 核心 API 走 mTLS 强 SSL pin, QX MITM 不接管
- zip `index.ios.bundle` (882KB) 提到 36 个 `newclient.map.baidu.com` endpoint, 含 `phpui2/?qt=ads` (主页 ad 卡片)

v1.0.0 hostname 缺 `*.map.baidu.com`, 是 v1.0.0 主页 banner/古今地图 不生效的根本原因。
v1.1.0 修复: hostname 加 `*.map.baidu.com` 通配。

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
3. **杀掉百度地图 app** (上滑退出)
4. 重新打开百度地图 (否则 splash 可能命中 app 本地缓存)

如果 splash 仍顽固显示: iOS 设置 → 通用 → iPhone 存储空间 → 百度地图 → 卸载重装 (彻底清沙盒)。

## 版本历史

| 版本 | 日期 | 备注 |
|---|---|---|
| **v1.1.0** | 2026-10-15 | hostname 加 `*.map.baidu.com` 通配 (核心 bug 修复); 新增主页 banner + 古今地图 改写 (`newclient.map.baidu.com/client/phpui2/?qt=ads`); 新增 empty_ext_info 清空 (v1.0.0 漏的, 解释"偶尔还有开屏") |
| v1.0.0 | 2026-10-15 | 初版. 仅覆盖开屏 (splash). 用户实测 4.5 分钟内反复冷启动, 仍然看到开屏 + 主页 banner + 古今地图 (HAR 里 0 个 `*.map.baidu.com` 请求, 说明 v1.0.0 hostname 漏了核心域) |

## 已知限制

- v1.1.0 假设百度地图 V22 改写后主页 ad card 字段名在 `data.result/list/cards` 之类 (因为没抓到 `phpui2/?qt=ads` 实际响应样本, 134411 HAR 里这个 endpoint 0 次). 如果实际字段名不一样, plugin 改写可能无效 (但 hostname 兜底仍能让 SSL pin 失败)
- 走 `*.map.baidu.com` 的 mTLS 强 SSL pin 可能让 plugin 失效 (app 端能联通), 这种只能等未来绕过
- 不影响地图核心功能 (路径规划 / 导航 / 搜索 / 公交 / 街景)
- 百度升级 app 后可能改 endpoint, plugin 可能失效, 需重新抓包
- iOS 越狱设备如装 SSL Kill Switch 等插件, 可能绕过 SSL pin

## 待办 (v1.2.0 路线图)

1. 用户**抓取包含 newclient.map.baidu.com 请求的 HAR** (重点: 看到主页 banner + 古今地图 时)
   - 当前 HAR 0 个 `*.map.baidu.com` 请求, 是因为 mTLS 强 pin 还是 MITM 没接管? 待验证
2. 分析 `client/phpui2/?qt=ads` 实际响应字段名, 把"清空一切可能字段" 改成"清空确切字段" (降低误清风险)
3. 如果 mTLS 强 pin 是问题, 评估能不能用 mTLS 解密方案 / Loon 替代

## 上游 / 致谢

抓包 + 端点分析: tedwcy, 2026-10-15

## ⚠️ 免责声明

本插件仅供个人学习、研究使用。请勿用于商业用途。所有广告商标 / 内容版权归原作者所有。如有侵权, 请联系 ted1992@live.cn 处理。