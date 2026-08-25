# 百度地图 Alt-Svc 剥离 (Baidu Map Alt-Svc Strip)

Loon 插件，删除百度地图 app 响应里的 `Alt-Svc: h3=...` 头，解决 **开 Loon 全局 Reject-QUIC 时百度地图搜索框输入卡顿** 的问题。

## 现象

- Loon 开启全局 Reject-QUIC（或 REJECT-QUIC 规则）
- 百度地图 app 搜索框每个按键明显卡 5-10 秒
- 进 Loon 的 MITM 抓包模式立刻正常
- 关闭抓包恢复卡顿

## 根因

百度地图服务端在响应里通告 H3/QUIC，缓存 30 天:

```
Alt-Svc: h3="qclient.map.baidu.com:443"; ma=2592000
Alt-Svc: h3="sofire-h3.baidu.com:443"; ma=2592000, h3-29=...
```

iOS 的 `URLSession` / `CFNetwork` 看到后就优先尝试 QUIC：

```
按键 → CFNetwork 看 Alt-Svc → 发 QUIC 包 → Loon 丢 UDP 443
      → 等 QUIC 握手超时 (5-10s) → 回落 TCP/TLS → 请求成功
```

搜索框每按键一次（"镇远古镇" 4 字 ≈ 32s 卡顿）。MITM 模式下 Loon 强制走 TCP，所以绕过这个等超时。

## 修复

剥掉响应里的 `Alt-Svc` 头，iOS 死心不试 QUIC，每次按键直接走 TCP，回到 Loon 关掉的状态（TCP 本身不慢，慢的是"先试 QUIC → 超时 → 回 TCP"）。

## 装机

在 Loon 里：

1. 插件 → 从 URL 安装
2. 粘贴：`https://raw.githubusercontent.com/tedwcy/proxy-plugins/main/loon/baidu-strip-altsvc/baidu-strip-altsvc.plugin`
3. 启用 MITM + 安装 Loon CA（首次）

然后打开百度地图搜索框测试，应该立即变快。

## 范围

- **MITM hostname**：`*.baidu.com, baidu.com`（覆盖所有 baidu 域名）
- **URL 匹配**：`https?://*baidu.com/*`
- **实际改写**：仅 `alt-svc` / `Alt-Svc` / `ALT-SVC` 三种大小写形式的响应头，body 不动
- **白名单 host**：脚本内部再过一道 `BAIDU_HOSTS` 数组，只剥 map 相关域名，避免误伤其他 baidu 服务（贴吧/网盘/搜索等）

## 卸载

Loon → 插件 → 长按插件 → 删除。MITM hostname 自动撤销。

## 备选方案

如果不想装这个插件，最粗暴的办法：Loon 设置 → 网络 → **关掉 Reject QUIC**。但这会改变所有 app 的 QUIC 行为（QUIC 本身比 TCP 快，但被运营商/proxy 干扰时不稳）。

## 一般化教训

**Alt-Svc + iOS CFNetwork + Reject-QUIC = 卡顿三件套**。任何 app 如果服务端主动通告 H3，而 Loon 全局丢 QUIC，都会踩这个坑。快速判断：抓包搜响应里有 `Alt-Svc: h3=`。快速修：写 response 脚本删 Alt-Svc（比关 Reject-QUIC 更精准）。
