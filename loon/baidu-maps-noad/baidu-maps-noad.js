// Baidu Maps 去广告 — 响应改写
// v1.2.0 · 2026-09-15 00:36
//
// 抓包来源: 92_1789401831273.zip + 94_1789403329698.zip
//
// 目标端点 (都是 newclient.map.baidu.com):
//   1. /feed/govui/rich_content  → data.posts.content (首页笔记/文章列表, 含 HBTI 推广文章)
//   2. /cms/page/def             → data.cards       (首页顶部 banner popup, title="HBTI测试")
//
// 策略:
//   - 两个端点的广告字段都清空
//   - 保留 conf / themes / homepage_talos_style / location 等字段 (避免破坏主页布局)
//   - JSON 解析失败或非 JSON → 透传 (不破坏正常响应)
//   - 只读 $response.body, 不写 $request
//   - URL regex 在 .plugin 里限定, 这里只做内容判断

(function () {
  let body;
  try {
    body = JSON.parse($response.body);
  } catch (e) {
    console.log(`[BaiduMapsNoAd] body not JSON, pass through: ${e.message}`);
    $done({});
    return;
  }

  if (!body || typeof body !== 'object') {
    $done({});
    return;
  }

  let modified = false;

  // 1. /cms/page/def — 顶部 banner popup (CMS 卡片堆栈)
  if (body.data && Array.isArray(body.data.cards) && body.data.cards.length > 0) {
    const before = body.data.cards.length;
    body.data.cards = [];
    console.log(`[BaiduMapsNoAd] clear data.cards: ${before} → 0  (cms/page/def banner)`);
    modified = true;
  }

  // 2. /feed/govui/rich_content — 笔记/文章列表 (含 HBTI 推广文章)
  if (body.data && body.data.posts && Array.isArray(body.data.posts.content) && body.data.posts.content.length > 0) {
    const before = body.data.posts.content.length;
    body.data.posts.content = [];
    console.log(`[BaiduMapsNoAd] clear data.posts.content: ${before} → 0  (rich_content notes)`);
    modified = true;
  }

  if (!modified) {
    $done({});
    return;
  }

  $done({ body: JSON.stringify(body) });
})();