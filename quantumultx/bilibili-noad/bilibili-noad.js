// Bilibili 去开屏广告 + ban 广告追踪 — QX (Quantumult X) 版
// v1.0.4 · 2026-10-15 22:55
// (回滚: 不再清 data.keep_ids — keep_ids 语义不是本地素材清单, 清掉可能影响 B 站正常逻辑)
//
// 抓包来源 (按时间过滤最新段, 见 AGENTS.md §1 "QX 抓包文件 bug"):
//   - quantumult-x-2026-10-15-021759.har (冷启动 splash/list 结构)
//   - quantumult-x-2026-10-15-134411-1.har (后台返回时 splash/list 重复拉)
//
// 目标端点 (都是 app.bilibili.com):
//   /x/v2/splash/list         → 清空 data.list + data.show
//   /x/v2/splash/show         → 清空 data.show
//   /x/v2/splash/brand/list   → 不动 (节日主题是合法 UI)
//   /x/v2/splash/event/list2  → 不动 (事件埋点)
//
// 策略:
//   - 清空 data.list (新素材元数据) + data.show (下次冷启动候选)
//   - data.keep_ids 不动 — 经过分析 (HAR 对比 + GKD 实现) 它不是"本地素材清单",
//     真实"返回 app 时显示的开屏广告"来源尚不明确, 需要新抓包确认
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

  if (!modified) {
    $done({});
    return;
  }

  $done({ body: JSON.stringify(body) });
})();

