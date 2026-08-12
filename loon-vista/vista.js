// Vista 看天下 (VistaKTX) SVIP 解锁
// 基于 Ted 真实抓包 (2026-08-12 22:51 + 22:57)
// 真实 host: ktx.cn
// 真实 endpoint:
//   - /v3/api/article/article_detail2 (article.isFree:0 = 付费文章)
//   - /v3/api/featured/column/get_content?columnId=1 (列表 isFree:0)
//   - /v3/api/vip/get_vip_info_and_recommend_mags
//   - /v3/api/vip/get_vip_price_info
//   - /v3/api/my/home/get_home_center
// 关键字段:
//   - isVip, isActive, isMiniVip, expireVip, endTime (顶级 + vipInfo 里)
//   - isFree (article.isFree / featuredColumnInfos[].isFree)  ← 关键!
//   - subscriptionVip.endTime

const body = $response.body;
if (!body) { $done({}); return; }

let newBody = body
  // VIP 状态字段
  .replace(/"isVip":0/g, '"isVip":1')
  .replace(/"isActive":0/g, '"isActive":1')
  .replace(/"isMiniVip":0/g, '"isMiniVip":1')
  // expireVip: 原版 Vister.js 有 bug (改成 iexpireVip),我们直接改成 0 = 未过期
  .replace(/"expireVip":1/g, '"expireVip":0')
  // 关键!article_detail2 / featured column 列表里都有 isFree:0 (= 付费内容)
  .replace(/"isFree":0/g, '"isFree":1')
  // 永久到期时间 (1704383999000 = 2024-01 → 4100726622000 = 2100)
  .replace(/"endTime":\d{13}/g, '"endTime":4100726622000');

$done({ body: newBody });
