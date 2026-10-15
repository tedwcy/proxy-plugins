// Bilibili 去开屏广告 — QX (Quantumult X) 版
// v1.0.6 · 2026-10-15 23:40
//
// 抓包来源:
//   - quantumult-x-2026-10-15-225209.har (切微信回 B 站, 完整抓包)
//   关键发现: B 站 "返回 app 时的开屏广告" 来源 = /x/resource/peak/download
//   响应里 data.resource[2].type = "brand_splash", 包含 24 个预下载图片 URL
//   B 站客户端下载这些图到本地, 切回 app 时从本地随机挑一个显示
//   清空 brand_splash 列表后, 客户端下载不到任何"返回 app 开屏"素材
//
// 目标端点 (都是 app.bilibili.com):
//   /x/v2/splash/list           → 清空 data.list + data.show + data.keep_ids
//   /x/v2/splash/show           → 清空 data.show
//   /x/resource/peak/download   → 清空 data.resource[].type="brand_splash".list
//   /x/v2/splash/brand/list     → 不动 (节日主题是合法 UI, 不是广告)
//   /x/v2/splash/event/list2    → 不动 (事件埋点, 不动)
//
// 策略:
//   - splash/list 清空 list + show + keep_ids (拦截冷启动 splash 广告)
//   - /x/resource/peak/download 清空 brand_splash (拦截"返回 app"时显示的开屏)
//   - JSON 解析失败 / 非 success code → 透传

console.log('[BilibiliNoAd] v1.0.6 loaded');

(function () {
  let body;
  try {
    body = JSON.parse($response.body);
  } catch (e) {
    $done({});
    return;
  }

  if (!body || typeof body !== 'object') {
    $done({});
    return;
  }

  if (body.code !== undefined && body.code !== 0) {
    $done({});
    return;
  }

  if (!body.data || typeof body.data !== 'object') {
    $done({});
    return;
  }

  let modified = false;

  // ===== splash/list 或 splash/show 端点 (原 v1.0.5 逻辑) =====
  if (Array.isArray(body.data.list) && body.data.list.length > 0) {
    console.log('[BilibiliNoAd] clear data.list: ' + body.data.list.length + ' → 0');
    body.data.list = [];
    modified = true;
  }

  if (Array.isArray(body.data.show) && body.data.show.length > 0) {
    console.log('[BilibiliNoAd] clear data.show: ' + body.data.show.length + ' → 0');
    body.data.show = [];
    modified = true;
  }

  if (Array.isArray(body.data.keep_ids) && body.data.keep_ids.length > 0) {
    console.log('[BilibiliNoAd] clear data.keep_ids: ' + body.data.keep_ids.length + ' → 0');
    body.data.keep_ids = [];
    modified = true;
  }

  // ===== /x/resource/peak/download 端点 (v1.0.6 新加) =====
  // 遍历 data.resource[], 找 type="brand_splash" 的清空它的 list
  if (Array.isArray(body.data.resource)) {
    for (let i = 0; i < body.data.resource.length; i++) {
      const r = body.data.resource[i];
      if (r && r.type === 'brand_splash' && Array.isArray(r.list) && r.list.length > 0) {
        console.log('[BilibiliNoAd] clear peak/download brand_splash[' + i + '].list: ' + r.list.length + ' → 0');
        r.list = [];
        modified = true;
      }
    }
  }

  if (!modified) {
    $done({});
    return;
  }

  $done({ body: JSON.stringify(body) });
})();



