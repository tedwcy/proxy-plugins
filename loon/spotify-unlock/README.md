# Spotify Premium Unlock(独立维护版)

从 [`app2smile/rules`](https://github.com/app2smile/rules) fork,独立维护的 Spotify 部分解锁插件。

## 工作原理

通过 MITM 拦截 Spotify 客户端的几个关键 endpoint,修改响应里的 `accountAttributes` map,让 Spotify 后端相信当前设备是 premium 用户。

### 当前覆盖的 endpoint

| Endpoint | 类型 | 用途 |
|---|---|---|
| `/bootstrap/v1/bootstrap` | response (protobuf) | Spotify 启动时拉取设备/账户配置,patch 后让 app 以为有 premium |
| `/user-customization-service/v1/customize` | response (protobuf) | 用户级配置(广告、播放限制等),patch 关闭 ads/free-tier 标记 |
| `/artistview/v1/artist` | request (URL rewrite) | iOS 平台标记改为 iPad,绕过某些 iOS-only 限制 |
| `/album-entity-view/v2/album` | request (URL rewrite) | 同上 |

## 与 app2smile 上游的关系

- **v1.0.0** = 直接 fork `app2smile/rules` 最新 commit (e2c6f34, 2026-02-25),改动仅在文件名/打包
- 未来 v1.x.y = 当 Ted 抓到新 endpoint 校验时,我们加 patch;**会 backport 给上游**如果有意义
- 重大不兼容变更(比如 Spotify 接口大改)才升 v2.x

### attribution

`spotify-proto.js` 和 `spotify-json.js` 都基于 [app2smile/rules](https://github.com/app2smile/rules) 的代码(MIT 协议)。改动记录见 commit message。

## 已知问题

### "播放 4 秒就停"(典型 premium 校验缺口)

**症状**:能播 4 秒后 Spotify 客户端上报 `/track-error/v1/errors` 并暂停。

**根因**:app2smile 的脚本只 patch 了 `bootstrap` + `customize`,但 Spotify 实际还查其他 endpoint 做服务端校验,常见嫌疑:
- `/playback-settings/.../WriteContentValue`
- `/playback-settings/.../GetDeviceSettings` / `GetAllStoredContentValues`
- 未来可能更多

**修复方法**:Ted 在重现问题时抓包,找到缺失的校验 endpoint,加进 MITM + patch 列表。

### "音质不能设置为超高"

这是 Spotify 服务端校验,**当前脚本无法绕过**。需要真有 premium 账号或等 Spotify 改协议。

## 维护流程

1. Ted 用本插件遇到问题(4 秒停 / 报错 / 新限制)
2. Ted 用 Loon 抓包,导出 tarball
3. agent 分析找出缺失的 endpoint
4. 加 patch 到 `spotify-proto.js` 或新建 `spotify-xxx.js`
5. 更新 `.plugin` 的 `#!desc=` 版本号 + 时间
6. commit + push
7. Ted 在 Loon 里**删除旧插件 → 重新装**(`https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/spotify-unlock/spotify-unlock.plugin`)
8. 等 30 秒 raw.githubusercontent.com 缓存过期

## Loon 配置(自动装)

通过上面 `.plugin` URL 安装即可。手动模式:

```
[Mitm]
hostname = spclient.wg.spotify.com, *spclient.spotify.com

[Script]
http-request ^https:\/\/(spclient\.wg\.spotify\.com|.*-spclient\.spotify\.com(:443)?)\/(artistview\/v1\/artist|album-entity-view\/v2\/album)\/ script-path=https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/spotify-unlock/spotify-json.js, timeout=10, tag=spotifyJson
http-response ^https:\/\/(spclient\.wg\.spotify\.com|.*-spclient\.spotify\.com(:443)?)\/(bootstrap\/v1\/bootstrap|user-customization-service\/v1\/customize)$ script-path=https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/spotify-unlock/spotify-proto.js, requires-body=true, binary-body-mode=true, timeout=10, tag=spotifyProto
```

## 测试覆盖

- v1.0.0 = 直接 fork app2smile 验证 baseline 等效
- 后续 v1.x.y 增加 endpoint 后需 Ted 实机验证 + 单测脚本(用 Loon 抓包的原始响应做 fixture)
