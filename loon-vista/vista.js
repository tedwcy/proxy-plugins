// Vista 看天下 (VistaKTX) SVIP 解锁
// 基于 Ted 真实抓包 (2026-08-12 22:51 + 22:57 + 08-13 07:08)
// 真实 host: ktx.cn
// 关键发现: article.mag.isfree: 0 (小写) + isFreeMag: 0 + isBuyMag: 0
//         + columnList[].articles[].isFreeMag: 0 (列表里的杂志字段)
// 全部都改 0 → 1,价格 0,购买状态 1

const body = $response.body;
if (!body) { $done({}); return; }

let newBody = body
  // === VIP 身份字段 (已 work, 用户页面 2099 年到期) ===
  .replace(/"isVip":0/g, '"isVip":1')
  .replace(/"isActive":0/g, '"isActive":1')
  .replace(/"isMiniVip":0/g, '"isMiniVip":1')
  .replace(/"expireVip":1/g, '"expireVip":0')
  .replace(/"endTime":\d{13}/g, '"endTime":4100726622000')

  // === 内容付费字段 (本次重点!) ===
  // 大写 isFree: 文章本身免费状态
  .replace(/"isFree":0/g, '"isFree":1')

  // 关键! 小写 isfree: 整本杂志是否免费 (article.mag.isfree)
  .replace(/"isfree":0/g, '"isfree":1')

  // 整本杂志是否免费 (isFreeMag: 0 = 收费)
  .replace(/"isFreeMag":0/g, '"isFreeMag":1')

  // 杂志是否已购买 (isBuyMag: 0 = 没买)
  .replace(/"isBuyMag":0/g, '"isBuyMag":1')

  // 文章是否已购买 (isBuyArticle: 0 = 没买)
  .replace(/"isBuyArticle":0/g, '"isBuyArticle":1')

  // 价格 0 (让 app 误以为免费)
  .replace(/"price":\d+/g, '"price":0')
  .replace(/"originalPrice":\d+/g, '"originalPrice":0')

  // isNew 等其他
  .replace(/"isNew":0/g, '"isNew":1');

$done({ body: newBody });
