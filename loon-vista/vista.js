// Vista 看天下 (VistaKTX) SVIP 解锁
// v1.0.15 · 2026-08-14 12:03
// 关键策略 (基于 Ted 多次真实抓包):
//   1. http-request: GET 请求去掉 ktxToken (保留用户信息端点),让 server 当登出态
//      popup/adm 加入保留名单 — 完全无 token server 返 400 会触发 app 弹窗异常
//   2. http-response: 翻 VIP 相关 flag,避免 UI 显示订阅 banner / 红点 / PDF 试用
//      v1.0.13: 清空 recommentMag 对象 — article_detail2 顶层 recommentMag.isfree:0 触发底部"开通VIP"banner
//      v1.0.14: 反转 isNew — magazine/all_mag_page_3 + mag/pdf/get_mag_pdf_list 的 magList[0].isNew:1 触发底部 tab 红点
//      v1.0.15: 翻 isPreview + 清空 pwd — mag/pdf/get_mag_pdf 中 magPdf.isPreview:1 触发电纸刊页"10 解锁整本"按钮,
//               magPdf.pwd 是 PDF 加密密码,免费 PDF 应为空,置空才能让 app 正确渲染 PDF
//   3. plugin regex v1.0.15 修正: mag\/pdf\/show_pdf → mag\/pdf\/ 覆盖所有 mag/pdf/ 端点
//      (v1.0.14 漏列 get_mag_pdf_list / get_mag_pdf,导致红点和 isPreview 未生效 — 2026-08-14 复盘)
//   评论/收藏等 POST 请求不动 ktxToken,所以评论功能不受影响
//
// Ted 8 次真实抓包时间线:
//   - 22:51 / 22:57 (08-12): 初步解构
//   - 07:08 / 07:14 (08-13): 登入态 (content 3678 = 试看)
//   - 08:00 (08-13): 登出态 (content 6073 = 全文, 全 free flag)
//   - 11:14 (08-14): 首页文章底部 banner 复发 → recommentMag 未清 (v1.0.13 修复)
//   - 11:49 (08-14): "全部杂志" tab 红点 + 电纸刊页"开通VIP"按钮 → 红点 v1.0.14 修复,按钮待 A/B 方案
//   - 12:00 (08-14): 红点 + 按钮都没修 → 发现 plugin regex 漏列 mag/pdf/ 端点 (v1.0.15 全覆盖)

const url = $request.url;

// === Version log (Ted 验证用:Loon 脚本日志里能看到) ===
console.log('[Vista] v1.0.17 loaded (red-dot fix ACTIVE — if you see v1.0.12, Loon cache stale)');

if (typeof $response === 'undefined') {
  const method = $request.method;

  // 保留 ktxToken 的端点 (需要登录态)
  // vip/           : VIP 信息
  // subscription/  : 订阅状态
  // my/            : "我的" 个人中心
  // user/          : 用户相关 (评分等)
  // popup/         : 弹窗配置 (无 token server 返 400,会触发 app 弹窗逻辑异常)
  // adm/           : 广告位 (同上)
  const keepKtxToken = /^https?:\/\/ktx\.cn\/v3\/api\/(vip|subscription|my|user|popup|adm)\//;

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
      .replace(/"isPreview":1/g, '"isPreview":0')  // 翻电纸刊按钮 — article 的 isPreview:1 跟 PDF 的 isPreview:1 都会翻,article 全文免费不受影响
      // 价格
      .replace(/"price":\d+/g, '"price":0')
      .replace(/"originalPrice":\d+/g, '"originalPrice":0')
      .replace(/"isNew":1/g, '"isNew":0')
      // v1.0.16: 不再清空 pwd — 实测清空后 PDF 只显示 5 页 (zip 头部 fallback),
      // pwd 是 PDF 文件的真实解密 hash,app 必须用原始密码去解密 OSS 上的 PDF 文件
      // 清空 recommentMag 推荐杂志对象
      // article_detail2 响应顶层有这个字段,isfree:0 触发文章底部"开通VIP"banner
      // 该对象在当前 server 返回里只有平铺字段(无嵌套 dict),[^{}]+ 安全覆盖整段
      // 风险: 未来若 server 在 recommentMag.articleList: [{...}] 加嵌套数组,regex 会切到一半
      //       但 recommentMag 跟完整 mag 对象结构不同(只用压缩字段),触发概率极低
      .replace(/"recommentMag":\{[^{}]+\}/g, '"recommentMag":null');

    $done({ body: newBody });
  }
}
