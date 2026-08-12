// Vista 看天下 (VistaKTX) SVIP 解锁
// 基于 Ted 第 3/4 次真实抓包 (2026-08-13 07:08 + 07:14)
// 关键发现 (本次):
//   - article.content / contentShort 长度 3678 (= 试看版)
//   - 关键字段: isPreview: 0 (= 试看) → 1 (= 完整)
//   - isFree/isFreeMag/isfree/isBuyMag/isBuyArticle (前次已加, 保留)
// 真正工作: 改 isPreview 0→1 + isFreeMag 0→1 + isfree 0→1 + isBuyMag 0→1

const body = $response.body;
if (!body) { $done({}); return; }

let newBody = body
  // === VIP 身份字段 ===
  .replace(/"isVip":0/g, '"isVip":1')
  .replace(/"isActive":0/g, '"isActive":1')
  .replace(/"isMiniVip":0/g, '"isMiniVip":1')
  .replace(/"expireVip":1/g, '"expireVip":0')
  .replace(/"endTime":\d{13}/g, '"endTime":4100726622000')

  // === 内容付费字段 (前次已加) ===
  .replace(/"isFree":0/g, '"isFree":1')
  .replace(/"isfree":0/g, '"isfree":1')           // 小写! 整本杂志
  .replace(/"isFreeMag":0/g, '"isFreeMag":1')
  .replace(/"isBuyMag":0/g, '"isBuyMag":1')
  .replace(/"isBuyArticle":0/g, '"isBuyArticle":1')

  // === 本次新增: 试看标志 ===
  // 关键! isPreview: 0 = 试看版, 1 = 完整版
  // 改后 client 拿到的 content/contentShort 会被认为是"完整版"渲染
  .replace(/"isPreview":0/g, '"isPreview":1')

  // 价格
  .replace(/"price":\d+/g, '"price":0')
  .replace(/"originalPrice":\d+/g, '"originalPrice":0')
  .replace(/"isNew":0/g, '"isNew":1');

$done({ body: newBody });
