// Vista 看天下 SVIP 解锁 - Loon 原生 API
// 来源: lutqhysky Vister.js (明文, 无 magicJS)
// 原理: 字符串替换 改 user info 端点里的 isVip/isFree/isBuy/endTime 等字段
// 目标域名: open3.vistastory.com

const body = $response.body;
if (!body) { $done({}); return; }

let newBody = body
  .replace(/isFree":0/g, 'isFree":1')
  .replace(/isBuyMag":0/g, 'isBuyMag":1')
  .replace(/isMiniVip":0/g, 'isMiniVip":1')
  .replace(/isActive":0/g, 'isActive":1')
  .replace(/isVip":0/g, 'isVip":1')
  .replace(/isBuyArticle":0/g, 'isBuyArticle":1')
  .replace(/expireVip":1/g, 'expireVip":0')
  .replace(/endTime":\d{13}/g, 'endTime":4100726622000');

$done({ body: newBody });
