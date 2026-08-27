// 看天下 (VistaKTX / com.vistastory.VistaKTX) 去除开屏广告 + 弹窗广告
// v1.0.0 · 2026-08-27 10:56
//
// 抓包来源: 64_1787799245656.zip (2026-08-27 10:54 Beijing, iOS 26.6, app v3.7.8)
//
// 关键策略 (基于真实抓包):
//   1. /v3/api/index/loading_ad2 (启动广告) → body.ad = null
//      - server 成功响应 shape: {status:1, msg:"success", ad:{...}, isGrey:0}
//      - 抓包实际返回的是推广第708期杂志的开屏图 (bannerUrl → oss.ktx.cn)
//      - app 通常 truthy 检查 `if (response.ad) { 渲染 }`,null 直接跳过
//      - 保留 status:1 + msg:"success" + isGrey:0,避免 app 误判接口失败
//   2. /v3/api/adm/get_popup_ad (弹窗广告) → body.popup = null
//      - server 成功响应 shape: {status:1, msg:"success", popup:{...}}
//      - 抓包实际返回的是同一期708的弹窗 (imgUrl → oss.ktx.cn, redirectUrl 深链)
//      - popup/get_popups 端点本来 popups:[],不动
//   3. 其他 ktx.cn 端点全透传 (get_init / get_configs / app_index_220 /
//      last_mag_2 / remind_subscription_time / application_score / article/* /
//      featured/* / my/* / user/* / vip/* / subscription/* / notice/* / ver/*)
//   4. MITM hostname = ktx.cn,与 sister 插件 loon-vista/ (VIP 解锁) 完全兼容
//      - loon-vista/ 走 regex 改 VIP flag (isVip/isFree/expireVip 等),不动这两个端点
//      - 两个插件可同时开启,顺序无要求
//   5. 第三方 SDK (dutils.com 隐私 / zztfly.com 推送 / sms.mob.com SMS)
//      都不是广告源,不动 — 拦截会破坏推送/合规上报
//
// 已知限制:
//   - 若 app 未来在 loading_ad2 加新字段 (banner2/video_ad/native_ad 等),
//     需扩展 nullify 列表
//   - 若 server 改返回 shape (e.g. ad 用 list 或用 bannerUrl 顶层),
//     需适配
//   - plugin 仅 http-response;若 server 改成 GET 时不下发 (返回 204),plugin 无效

const url = $request.url;

// === Version log (Ted 验证用:Loon 脚本日志里能看到) ===
console.log('[KantianxiaNoAd] v1.0.0 loaded');

// http-response 必有 $response,直接用
let body;
try {
  body = JSON.parse($response.body);
} catch (e) {
  // 非 JSON 响应 (HTML 错误页 / 502 网关页) — 透传,避免破坏错误显示
  console.log(`[KantianxiaNoAd] body not JSON, pass through: ${e.message}`);
  $done({});
}

let modified = false;

// === 1. 启动广告: loading_ad2 → nullify ad ===
if (/^https?:\/\/ktx\.cn\/v3\/api\/index\/loading_ad2(\?|$)/.test(url)) {
  if ('ad' in body && body.ad !== null) {
    const adId = (body.ad && body.ad.id) || 'n/a';
    console.log(`[KantianxiaNoAd] loading_ad2: nullify ad (was id=${adId})`);
    body.ad = null;
    modified = true;
  }
}
// === 2. 弹窗广告: adm/get_popup_ad → nullify popup ===
else if (/^https?:\/\/ktx\.cn\/v3\/api\/adm\/get_popup_ad(\?|$)/.test(url)) {
  if ('popup' in body && body.popup !== null) {
    const popupId = (body.popup && body.popup.id) || 'n/a';
    console.log(`[KantianxiaNoAd] get_popup_ad: nullify popup (was id=${popupId})`);
    body.popup = null;
    modified = true;
  }
}
// === 3. 其他端点透传 (get_init / get_configs / app_index_220 / etc.) ===

$done({ body: modified ? JSON.stringify(body) : $response.body });