// Baidu Maps 去广告 — 响应改写
// v1.1.0 · 2026-09-15 00:30
//
// 目标端点: newclient.map.baidu.com/feed/govui/rich_content
// 抓包来源: 92_1789401831273.zip
// 内容: 富文本 (text banner, article list) — 首页顶部"点击测测你的精神状态..."等广告条
//
// 策略:
//   - JSON 解析失败或非 JSON → 透传 (避免破坏正常响应)
//   - data.posts.content 清空 → 顶部文字条消失
//   - 其他字段保留 (conf, themes, homepage_talos_style 等不动, 避免破坏主页布局)
//
// 安全:
//   - 只读 $response.body, 不写 $request
//   - 改写后 size 变小, 但 Content-Length 由 Loon 自动重算
//   - 非匹配端点不触发 (URL regex 限定)

(function () {
  const url = $request.url || '';
  let body;
  try {
    body = JSON.parse($response.body);
  } catch (e) {
    // 非 JSON 响应 → 透传
    console.log(`[BaiduMapsNoAd] body not JSON, pass through: ${e.message}`);
    $done({});
    return;
  }

  if (!body || typeof body !== 'object' || !body.data || typeof body.data !== 'object') {
    $done({});
    return;
  }

  let modified = false;

  // 1. 富文本顶部 banner: data.posts.content
  if (body.data.posts && Array.isArray(body.data.posts.content) && body.data.posts.content.length > 0) {
    const beforeCount = body.data.posts.content.length;
    body.data.posts.content = [];
    console.log(`[BaiduMapsNoAd] clear data.posts.content: ${beforeCount} → 0`);
    modified = true;
  }

  if (!modified) {
    $done({});
    return;
  }

  $done({ body: JSON.stringify(body) });
})();