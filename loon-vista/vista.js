// Vista 看天下 (VistaKTX) SVIP 解锁
// v1.0.12 · 2026-08-13 17:08
// 关键策略 (基于 Ted 第 5 次登出态抓包 2026-08-13 08:00):
//   1. http-request: GET 请求去掉 ktxToken (保留用户信息端点),让 server 当登出态
//   2. http-response: 翻 VIP 相关 flag,避免 UI 显示订阅 banner
//   评论/收藏等 POST 请求不动 ktxToken,所以评论功能不受影响
//
// Ted 5 次真实抓包时间线:
//   - 22:51 / 22:57: 初步解构
//   - 07:08 / 07:14: 登入态 (content 3678 = 试看)
//   - 08:00: 登出态 (content 6073 = 全文, 全 free flag)

const url = $request.url;

// === Version log (Ted 验证用:Loon 脚本日志里能看到) ===
console.log('[Vista] v1.0.12 loaded');

if (typeof $response === 'undefined') {
  const method = $request.method;

  // 保留 ktxToken 的端点 (需要登录态)
  // vip/       : VIP 信息
  // subscription/ : 订阅状态
  // my/        : "我的" 个人中心
  // user/      : 用户相关 (评分等)
  const keepKtxToken = /^https?:\/\/ktx\.cn\/v3\/api\/(vip|subscription|my|user)\//;

  // 其他 GET 请求都剥 (POST 评论/点赞保留)
  if (method === 'GET' && !keepKtxToken.test(url)) {
    // URL 参数剥掉 ktxToken=...
    // ⚠️ Bug 修复 (2026-08-13 16:55): ktxToken 是第一参数时不能简单用
    //   ([?&])ktxToken=... 把 ? 也吃掉了,会变成
    //   /get_content&columnId=1 (缺 ?) → server 400/404
    // 正确逻辑: ?ktxToken=X&... 保持 ? + 删 ktxToken; &ktxToken=X 删
    const newUrl = url
      .replace(/\?ktxToken=[^&]*&?/, (m) => m.endsWith('&') ? '?' : '')
      .replace(/&ktxToken=[^&]*/g, '')
      .replace(/[?&]$/, '');

    // Header 也剥 (server 两边都查)
    const newHeaders = {};
    for (const k in $request.headers) {
      if (k.toLowerCase() !== 'ktxtoken') {
        newHeaders[k] = $request.headers[k];
      }
    }

    $done({ url: newUrl, headers: newHeaders });
  } else {
    $done({});
  }
} else {
  // === http-response: VIP flag 翻 0→1 ===
  // (content 端点 server 已返 free flag,这步是 no-op;vip/my 等端点有用)
  const body = $response.body;
  if (!body) {
    $done({});
  } else {
    const newBody = body
      // VIP 身份字段
      .replace(/"isVip":0/g, '"isVip":1')
      .replace(/"isActive":0/g, '"isActive":1')
      .replace(/"isMiniVip":0/g, '"isMiniVip":1')
      .replace(/"expireVip":1/g, '"expireVip":0')
      .replace(/"endTime":\d{13}/g, '"endTime":4100726622000')
      .replace(/"isLogin":1/g, '"isLogin":0')           // app 误以为未登录,少触发 paywall
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
  }
}
