// 百度地图 (iOS V22 / v22.0.40.3) 去除开屏广告
// QX (Quantumult X) 版 v1.0.0 · 2026-10-15
//
// 抓包来源 (HAR): quantumult-x-2026-10-15-095744.har
// 关键发现:
//   - 开屏广告 query/update 请求都打 afd.baidu.com/afd/entry
//   - query (3.5KB)  含 res.splash (频控配置 + cmd/ukey) + res.ad[] (空 list, advisible=0)
//   - update (121KB) 含 res.ad[] 5 条, 含 layout=splash_video, 含 mp4 / jump_url / lottie
//   - 实测这个包 query 响应 splash.style_desc="{}" 已是空, 但 update 响应有完整 splash_video 创意
//
// 改写策略 (defensive, 宁可少改也不要破坏):
//   1. res.ad = []            — 清空广告素材 list
//   2. res.splash.style_desc = "{}"  — splash 样式描述置空 (query 已经是, 兜底)
//   3. res.splash.isCPC = 0   — 保留原值 (本来就是 0, 显式声明)
//   4. 不动 res.splash.cmd / ukey / realTimeLoading / src_ext_info
//      (元数据, app 可能依赖 ukey 做频控, 动了反而触发别的问题)
//
// 已知限制 (v1.0.0):
//   - 只覆盖开屏. 主页顶部横幅 "在？抽个 AirPods5" + 左上角 "古今地图" 待 v1.0.1 主页 HAR
//   - 走 mbd.baidu.com/ccs/v1/start/confsync 端的 71KB 首页配置没改 — 还没分析里头的 ad card 字段
//   - app 升级若 afd endpoint 改名 (e.g. 加版本号 / 改路径), 需重新抓包
//   - plugin 仅 http-response, 若 server 改成 GET 时不下发 (返回 204), plugin 无效

(function () {
  'use strict';

  const url = $request.url;

  // === Version log (QX 日志里能看到, 验证 plugin 是否真的加载) ===
  console.log('[BaiduMapsNoAd] v1.0.0 loaded');

  // http-response 必有 $response, 直接用
  let body;
  try {
    body = JSON.parse($response.body);
  } catch (e) {
    // 非 JSON 响应 (HTML 错误页 / 502 网关页) — 透传, 立即 return 避免下面访问 undefined 崩
    console.log(`[BaiduMapsNoAd] body not JSON, pass through: ${e.message}`);
    $done({});
    return;
  }

  if (!body || typeof body !== 'object') {
    $done({});
    return;
  }

  // errno != 0 → server 报错, 不动 (避免掩盖真实错误)
  if (body.errno !== undefined && body.errno !== 0) {
    console.log(`[BaiduMapsNoAd] errno=${body.errno}, pass through`);
    $done({});
    return;
  }

  let modified = false;

  // === 开屏广告改写: afd.baidu.com/afd/entry?action=query|update ===
  const isSplashEndpoint = /^https?:\/\/afd\.baidu\.com\/afd\/entry\?action=(query|update)/.test(url);

  if (isSplashEndpoint) {
    // res.ad: 广告素材 list (update 时含真实 splash_video, query 时通常空)
    if (body.res && Array.isArray(body.res.ad) && body.res.ad.length > 0) {
      const before = body.res.ad.length;
      body.res.ad = [];
      console.log(`[BaiduMapsNoAd] splash: cleared res.ad (was array[${before}])`);
      modified = true;
    }

    // res.splash: splash 容器对象 (频控 + 样式描述)
    if (body.res && body.res.splash && typeof body.res.splash === 'object') {
      const splash = body.res.splash;

      // style_desc: "广告创意 JSON 字符串", 空 = 没广告
      if (typeof splash.style_desc === 'string' && splash.style_desc !== '{}') {
        console.log(`[BaiduMapsNoAd] splash: cleared splash.style_desc`);
        splash.style_desc = '{}';
        modified = true;
      }

      // isCPC: 0/1, 显式置 0
      if (splash.isCPC !== 0) {
        splash.isCPC = 0;
        modified = true;
      }

      // 不动 splash.cmd / splash.realTimeLoading / splash.ukey / splash.src_ext_info
      // src_ext_info 含 freq.hot_splash_max_count 等频控配置, 保留避免破坏
    }
  }
  // === 其他端点透传 ===

  $done({ body: modified ? JSON.stringify(body) : $response.body });
})();