// Vista 看天下 (VistaKTX) SVIP 解锁
// 基于 Ted 真实抓包 (2026-08-12 22:51)
// 真实 host: ktx.cn (短域名)
// 关键 endpoint: /v3/api/vip/get_vip_info_and_recommend_mags, /v3/api/vip/get_vip_price_info, /v3/api/my/home/get_home_center
// 真实字段: isVip, isActive, isMiniVip, expireVip, endTime (在顶层 + vipInfo 里)

const body = $response.body;
if (!body) { $done({}); return; }

const newBody = body
  // 顶层字段
  .replace(/"isVip":0/g, '"isVip":1')
  .replace(/"isActive":0/g, '"isActive":1')
  .replace(/"isMiniVip":0/g, '"isMiniVip":1')
  // expireVip: 注意原版 Vister.js 有 bug (改成 iexpireVip),我们直接改成 0
  .replace(/"expireVip":1/g, '"expireVip":0')
  // endTime: 1704383999000 (2024-01) -> 4100726622000 (2100+)
  .replace(/"endTime":\d{13}/g, '"endTime":4100726622000');

$done({ body: newBody });
