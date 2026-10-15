// Bilibili 去开屏广告 — QX (Quantumult X) 版
// v1.0.4 · 2026-10-15 22:40
//
// 抓包来源 (按时间过滤最新段, 见 AGENTS.md §1 "QX 抓包文件 bug"):
//   - quantumult-x-2026-10-15-021759.har (冷启动 splash/list 结构)
//   - quantumult-x-2026-10-15-134411-1.har (后台返回时 splash/list 重复拉)
//
// 目标端点 (都是 app.bilibili.com):
//   /x/v2/splash/list         → 清空 data.list + data.show + data.keep_ids
//   /x/v2/splash/show         → 清空 data.show + data.keep_ids
//   /x/v2/splash/brand/list   → 不动 (节日主题是合法 UI)
//   /x/v2/splash/event/list2  → 不动 (事件埋点)
//
// 策略:
//   - 清空 data.list (新素材元数据) + data.show (下次冷启动候选)
//   - 关键: 同时清空 data.keep_ids (39 个之前已下载素材的 id)
//     B 站客户端的 keep_ids 语义 = "这 39 个素材你本地有, 别删, 后台回来可以继续用"
//     清空后客户端会从本地缓存删除这 39 个素材, 切回 app 时无可用素材
//   - JSON 解析失败 / 非 success code → 透传

console.log('[BilibiliNoAd] v1.0.4 loaded');

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

  // data.keep_ids — 已下载到本地的素材 id 列表
  // 清空后客户端会把这些素材从本地缓存删掉, 切回 app 时没有可显示的开屏
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

