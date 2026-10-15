// Bilibili 去开屏广告 + ban 广告追踪 — QX (Quantumult X) 版
// v1.0.5 · 2026-10-15 23:25
//
// 抓包来源:
//   - quantumult-x-2026-10-15-225209.har (切微信回 B 站的完整抓包)
//   现象: 5 次 splash/list 都 list=0/show=0 (已清), 但 B 站仍显示开屏广告
//   结论: 开屏广告来自 B 站 app 本地素材数据库, splash/list 已拦不到
//
// 目标端点 (都是 app.bilibili.com):
//   /x/v2/splash/list         → 清空 data.list + data.show + data.keep_ids
//   /x/v2/splash/show         → 清空 data.show
//   /x/v2/splash/brand/list   → 不动 (节日主题是合法 UI)
//   /x/v2/splash/event/list2  → 不动 (事件埋点)
//
// 策略:
//   - 清空 data.list (新素材元数据) + data.show (下次冷启动候选)
//   - 重新启用清 data.keep_ids — 经过实测, 这是客户端"本地已下载素材 id 列表"的唯一信号
//     (B 站用这 39 个 id 标识本地缓存的素材, 客户端用它们决定切回 app 时显示什么广告)
//     清空后客户端应认为这些素材已失效, 切回 app 时无广告可显示
//   - JSON 解析失败 / 非 success code → 透传

console.log('[BilibiliNoAd] v1.0.5 loaded');

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

  // data.list — splash 库存数组 (在 /list 端点), 含预下载素材元数据
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

  // data.keep_ids — 客户端本地已下载的素材 id 列表 (39 个 int64)
  // 关键: 清空后客户端会从本地缓存删除这些素材, 切回 app 时无可用广告
  if (Array.isArray(body.data.keep_ids) && body.data.keep_ids.length > 0) {
    console.log('[BilibiliNoAd] clear data.keep_ids: ' + body.data.keep_ids.length + ' → 0');
    body.data.keep_ids = [];
    modified = true;
  }

  if (!modified) {
    $done({});
    return;
  }

  $done({ body: JSON.stringify(body) });
})();


