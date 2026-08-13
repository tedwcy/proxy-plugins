// Vista 看天下 (VistaKTX) SVIP 解锁
// 关键策略 (基于 Ted 第 5 次登出态抓包 2026-08-13 08:00):
//   1. http-request: content 端点 (article/magazine/featured) 去掉 ktxToken,
//                   让 server 当登出态,返回 full content + free flags
//   2. http-response: 其他端点 (vip/my 等) 翻 VIP flag,避免 UI 显示订阅 banner
// 评论/收藏等需要登录态的端点不动 ktxToken,所以评论功能不受影响
//
// Ted 4 次真实抓包时间线:
//   - 22:51 / 22:57: 初步解构
//   - 07:08 / 07:14: 登入态 (content 3678 = 试看)
//   - 08:00: 登出态 (content 6073 = 全文, 全 free flag)

const url = $request.url;

// === http-request: content 端点 GET 请求去掉 ktxToken ===
if (typeof $response === 'undefined') {
  const method = $request.method;
  // 只处理 GET (POST 评论/点赞等不动)
  if (method === 'GET' &&
      /^https?:\/\/ktx\.cn\/v3\/api\/(article|magazine|featured)\//.test(url)) {
    // URL 参数里去掉 ktxToken=...
    const newUrl = url
      .replace(/([?&])ktxToken=[^&]*/g, '')
      .replace(/[?&]$/, '');

    // Header 里也去掉 ktxToken (server 两边都查)
    const newHeaders = {};
    for (const k in $request.headers) {
      if (k.toLowerCase() !== 'ktxtoken') {
        newHeaders[k] = $request.headers[k];
      }
    }

    $done({ url: newUrl, headers: newHeaders });
    return;
  }
  $done({});
  return;
}

// === http-response: VIP 相关 flag 翻 0→1,避免 UI 显示订阅 banner ===
// (content 端点 server 已返回 free flag,这步是 no-op;其他端点有用)
const body = $response.body;
if (!body) { $done({}); return; }

const newBody = body
  // VIP 身份字段
  .replace(/"isVip":0/g, '"isVip":1')
  .replace(/"isActive":0/g, '"isActive":1')
  .replace(/"isMiniVip":0/g, '"isMiniVip":1')
  .replace(/"expireVip":1/g, '"expireVip":0')
  .replace(/"endTime":\d{13}/g, '"endTime":4100726622000')
  .replace(/"isLogin":1/g, '"isLogin":0')           // app 误以为未登录,少一些 paywall 触发
  // 内容付费字段
  .replace(/"isFree":0/g, '"isFree":1')
  .replace(/"isfree":0/g, '"isfree":1')             // 小写! 整本杂志
  .replace(/"isFreeMag":0/g, '"isFreeMag":1')
  .replace(/"isBuyMag":0/g, '"isBuyMag":1')
  .replace(/"isBuyArticle":0/g, '"isBuyArticle":1')
  .replace(/"isPreview":0/g, '"isPreview":1')
  // 价格
  .replace(/"price":\d+/g, '"price":0')
  .replace(/"originalPrice":\d+/g, '"originalPrice":0')
  .replace(/"isNew":0/g, '"isNew":1');

$done({ body: newBody });
