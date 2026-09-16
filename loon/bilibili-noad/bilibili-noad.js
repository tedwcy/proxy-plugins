// Bilibili 去开屏广告 — 响应改写
// v1.0.0 · 2026-09-16 22:01
//
// 抓包来源: 101_1789567167780.zip (369 条网络记录, iOS 9.12.0 build=91200100)
//
// 目标端点 (都是 app.bilibili.com):
//   /x/v2/splash/list      → data.list (splash 库存, 25 项) + data.show (当前激活, 7 项)
//   /x/v2/splash/show      → data.show (激活列表, 用于上报)
//   /x/v2/splash/brand/list → 节日主题 (元旦/中秋), 合法 UI 不动
//   /x/v2/splash/event/list2 → 事件埋点 ping, 不动
//
// 策略:
//   - 清空 data.list 和 data.show, app 没有 splash 可显示
//   - 保留 brand/list (节日主题是合法 UI, 不是广告)
//   - JSON 解析失败或非 success code → 透传
//   - 只读 $response.body, 不写 $request

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
    console.log(`[BilibiliNoAd] clear data.list: ${body.data.list.length} → 0`);
    body.data.list = [];
    modified = true;
  }

  // data.show — 当前激活的 splash 列表 (在 /list 和 /show 端点都有)
  if (Array.isArray(body.data.show) && body.data.show.length > 0) {
    console.log(`[BilibiliNoAd] clear data.show: ${body.data.show.length} → 0`);
    body.data.show = [];
    modified = true;
  }

  if (!modified) {
    $done({});
    return;
  }

  $done({ body: JSON.stringify(body) });
})();