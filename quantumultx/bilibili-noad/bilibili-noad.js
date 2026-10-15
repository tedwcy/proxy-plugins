// Bilibili 去开屏广告 + ban 广告追踪 — QX (Quantumult X) 版
// v1.0.2 · 2026-10-15 09:50
//
// 抓包来源: quantumult-x-2026-10-15-021759.har (iOS)
//   /x/v2/splash/list   → data.list[71] (splash 库存) + data.show[28] (当前激活)
//   /x/v2/splash/show   → data.show (上报用激活列表)
//
// 目标端点 (都是 app.bilibili.com):
//   /x/v2/splash/list         → 清空 data.list + data.show
//   /x/v2/splash/show         → 清空 data.show
//   /x/v2/splash/brand/list   → 不动 (节日主题是合法 UI)
//   /x/v2/splash/event/list2  → 不动 (事件埋点)
//
// 策略:
//   - 清空 data.list 和 data.show, app 没有 splash 可显示
//   - JSON 解析失败 / 非 success code → 透传

console.log('[BilibiliNoAd] v1.0.2 loaded');

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

  // B站 API: code !== 0 表示业务错误, 不要瞎改
  if (body.code !== undefined && body.code !== 0) {
    $done({});
    return;
  }

  if (!body.data || typeof body.data !== 'object') {
    $done({});
    return;
  }

  let modified = false;

  // data.list — splash 库存数组 (在 /list 端点)
  if (Array.isArray(body.data.list) && body.data.list.length > 0) {
    console.log('[BilibiliNoAd] clear data.list: ' + body.data.list.length + ' → 0');
    body.data.list = [];
    modified = true;
  }

  // data.show — 当前激活的 splash 列表 (在 /list 和 /show 端点都有)
  if (Array.isArray(body.data.show) && body.data.show.length > 0) {
    console.log('[BilibiliNoAd] clear data.show: ' + body.data.show.length + ' → 0');
    body.data.show = [];
    modified = true;
  }

  if (!modified) {
    $done({});
    return;
  }

  $done({ body: JSON.stringify(body) });
})();
