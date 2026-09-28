// kantianxia-noad — 看天下 (VistaKTX / com.vistastory.VistaKTX) 去开屏广告 + 弹窗广告
// v1.0.0 · 2026-09-28
// 移植自 loon/kantianxia-noad/kantianxia-noad.js
//
// 抓包来源: 64_1787799245656.zip (2026-08-27 10:54 Beijing, iOS 26.6, app v3.7.8)
//
// 关键策略:
//   1. /v3/api/index/loading_ad2 (启动广告) → body.ad = null
//      - server 成功响应 shape: {status:1, msg:"success", ad:{...}, isGrey:0}
//      - app 通常 truthy 检查 `if (response.ad) { 渲染 }`,null 直接跳过
//      - 保留 status:1 + msg:"success" + isGrey:0
//   2. /v3/api/adm/get_popup_ad (弹窗广告) → body.popup = null
//      - popup/get_popups 端点本来 popups:[],不动
//   3. 其他 ktx.cn 端点全透传
//   4. MITM hostname = ktx.cn,与 sister 插件 loon-vista/ (VIP 解锁) 完全兼容
//
// 已知限制:
//   - 若 app 未来加新字段 (banner2/video_ad 等),需扩展 nullify 列表
//   - 若 server 改返回 shape,需适配
//   - plugin 仅 http-response;若 server 改成 GET 时不下发,plugin 无效

const url = $request.url;

// === Version log ===
console.log('[KantianxiaNoAd] v1.0.0 loaded');

let body;
try {
  body = JSON.parse($response.body);
} catch (e) {
  console.log(`[KantianxiaNoAd] body not JSON, pass through: ${e.message}`);
  $done({});
}

let modified = false;

// === 1. 启动广告: loading_ad2 → nullify ad ===
if (/^https?:\/\/ktx\.cn\/v3\/api\/index\/loading_ad2(\?|$)/.test(url)) {
  if (body && 'ad' in body && body.ad !== null) {
    const adId = (body.ad && body.ad.id) || 'n/a';
    console.log(`[KantianxiaNoAd] loading_ad2: nullify ad (was id=${adId})`);
    body.ad = null;
    modified = true;
  }
}
// === 2. 弹窗广告: adm/get_popup_ad → nullify popup ===
else if (/^https?:\/\/ktx\.cn\/v3\/api\/adm\/get_popup_ad(\?|$)/.test(url)) {
  if (body && 'popup' in body && body.popup !== null) {
    const popupId = (body.popup && body.popup.id) || 'n/a';
    console.log(`[KantianxiaNoAd] get_popup_ad: nullify popup (was id=${popupId})`);
    body.popup = null;
    modified = true;
  }
}
// === 3. 其他端点透传 ===

if (!modified) {
  $done({});
  return;
}

$done({ body: modified ? JSON.stringify(body) : $response.body });