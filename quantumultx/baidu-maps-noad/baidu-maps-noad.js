// 百度地图 (iOS V22 / v22.0.40.3) 去除开屏广告 + 主页顶部横幅 + 左上角广告入口
// QX (Quantumult X) 版 v1.1.0 · 2026-10-15
//
// 抓包来源 (HAR): quantumult-x-2026-10-15-134411.har (4.5 分钟, 104 请求, 反复冷启动)
// + 134411 之前的 quantumult-x-2026-10-15-095744.har (冷启动 + splash 拉取)
//
// 关键发现:
//   - 开屏广告 query/update 都打 afd.baidu.com/afd/entry, plugin v1.0.0 已拦
//   - 主页顶部横幅 + 古今地图 都来自 newclient.map.baidu.com/client/phpui2/?qt=ads
//     (zip bundle 内 hardcode 的 URL, JS 启动后直接 fetch)
//   - 用户 HAR 里 0 个 *.map.baidu.com 请求 — 核心 API 走 mTLS 强 SSL pin, QX MITM 不接管
//     (afd.baidu.com / mbd.baidu.com 没强 pin, 所以抓到了)
//   - v1.0.0 hostname 缺 *.map.baidu.com, banner/古今地图 不生效
//   - 即使 hostname 加了, mTLS 强 pin 也可能让 plugin 失效, 但 SSL pin 失败仍能让 SDK 静默
//
// 改写策略 (defensive, 宁可少改也不要破坏):
//   === afd.baidu.com/afd/entry (开屏) ===
//   1. res.ad = []              — 清空广告素材 list
//   2. res.splash.style_desc = "{}"  — splash 样式描述置空
//   3. res.splash.isCPC = 0
//   4. res.splash.empty_ext_info (update 时有) 强制置为空, 避免 server 缓存广告的 empty_ad=0 标记
//   5. 不动 splash.cmd / ukey / realTimeLoading / src_ext_info
//
//   === newclient.map.baidu.com/client/phpui2/?qt=ads (主页广告) ===
//   因为没抓到实际响应样本, 走"清空一切可能字段" 策略:
//   1. body.data = [] 或 body.data = {}  — 兜底 (具体字段名未知)
//   2. body.result = [] / {}
//   3. body.content = [] / {}
//   4. body.ads = []  — 直接命名兜底
//   5. body.errno = 0 (保留, 防 app 报"网络错误"阻塞整个请求)
//
//   === govui/cross_list_recommend, govui/aimode/query_rec, llm-render/get_ai_card ===
//   主页推荐 / AI 卡片 — 同样走"清空一切可能字段" 策略
//
// 已知限制 (v1.1.0):
//   - *.map.baidu.com 走 mTLS 强 SSL pin, 即使 hostname 加进 QX MITM,
//     也可能 QX 无法接管 (app 端能联通). 这种情况 plugin 失效, 只能等未来
//     百度放开 pin 或有绕过 pin 的方法
//   - plugin 仅 http-response, 若 server 改成 GET 时不下发 (返回 204), plugin 无效
//   - phpui2 响应字段名是猜的, 实际可能叫 data.result / data.list / etc.
//     用 IIFE + 错误处理兜底, 即使清错字段也只是没生效, 不会崩
//   - govui 端点可能也返回非广告内容 (比如真实推荐), 误清可能影响主页
//     用了"清空 data 数组, 保留 errno=0" 兜底, app 看到空 list 会渲染空位而不是报错

(function () {
  'use strict';

  const url = $request.url;

  // === Version log (QX 日志里能看到, 验证 plugin 是否真的加载) ===
  console.log('[BaiduMapsNoAd] v1.1.0 loaded');

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

  // === 端点路由 ===
  const isSplashEndpoint = /^https?:\/\/afd\.baidu\.com\/afd\/entry\?action=(query|update)/.test(url);
  const isHomeAdsEndpoint = /^https?:\/\/newclient\.map\.baidu\.com\/client\/phpui2\/\?qt=ads/.test(url);
  const isHomeRecommendEndpoint = /^https?:\/\/newclient\.map\.baidu\.com\/(govui\/(cross_list_recommend|aimode\/query_rec)|llm-render\/get_ai_card)/.test(url);

  // === 1. 开屏广告改写: afd.baidu.com/afd/entry?action=query|update ===
  if (isSplashEndpoint) {
    // res.ad: 广告素材 list (update 时含真实 splash_video, query 时通常空)
    if (body.res && Array.isArray(body.res.ad) && body.res.ad.length > 0) {
      const before = body.res.ad.length;
      body.res.ad = [];
      console.log(`[BaiduMapsNoAd] splash: cleared res.ad (was array[${before}])`);
      modified = true;
    }

    // res.splash: splash 容器对象 (频控 + 样式描述 + empty_ext_info)
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

      // empty_ext_info (v1.0.0 漏的): update 时存在, base64 编码含 empty_ad 标志
      // 即使 ad=[] / style_desc="{}", 若 empty_ext_info 解码后 empty_ad=0,
      // app 仍可能展示 splash (因为 server 下发了"非空"标记)
      // 强制置空字符串, 触发 app 走"无广告" 路径
      if (typeof splash.empty_ext_info === 'string' && splash.empty_ext_info.length > 0) {
        console.log(`[BaiduMapsNoAd] splash: cleared splash.empty_ext_info (was ${splash.empty_ext_info.length} chars)`);
        splash.empty_ext_info = '';
        modified = true;
      }

      // 不动 splash.cmd / splash.realTimeLoading / splash.ukey / splash.src_ext_info
      // src_ext_info 含 freq.hot_splash_max_count 等频控配置, 保留避免破坏
    }
  }

  // === 2. 主页广告卡片改写: newclient.map.baidu.com/client/phpui2/?qt=ads ===
  if (isHomeAdsEndpoint) {
    // 没抓到实际响应样本, 走"清空一切可能字段" 策略
    // 关键: 不能让 errno != 0 (那样 app 看到错误可能阻塞整个请求)
    // 用 IIFE + 字段遍历, 找到 list/array 字段清空
    const clearedPaths = [];

    // body.data.* (常见结构: body.data.result / body.data.list)
    if (body.data && typeof body.data === 'object') {
      const d = body.data;
      // 清空 list 风格的字段
      for (const key of ['result', 'list', 'cards', 'items', 'ads', 'content', 'data']) {
        if (Array.isArray(d[key]) && d[key].length > 0) {
          clearedPaths.push(`data.${key}[${d[key].length}]`);
          d[key] = [];
          modified = true;
        } else if (d[key] && typeof d[key] === 'object' && !Array.isArray(d[key])) {
          // 字典类型也清空 (key-value ad 列表)
          const keys = Object.keys(d[key]);
          if (keys.length > 0) {
            clearedPaths.push(`data.${key}{${keys.length}keys}`);
            d[key] = {};
            modified = true;
          }
        }
      }
    }

    // body.result / body.list / body.cards (顶层)
    for (const key of ['result', 'list', 'cards', 'items', 'ads', 'content']) {
      if (Array.isArray(body[key]) && body[key].length > 0) {
        clearedPaths.push(`${key}[${body[key].length}]`);
        body[key] = [];
        modified = true;
      } else if (body[key] && typeof body[key] === 'object' && !Array.isArray(body[key])) {
        const keys = Object.keys(body[key]);
        if (keys.length > 0) {
          clearedPaths.push(`${key}{${keys.length}keys}`);
          body[key] = {};
          modified = true;
        }
      }
    }

    if (clearedPaths.length > 0) {
      console.log(`[BaiduMapsNoAd] home ads: cleared ${clearedPaths.join(', ')}`);
    }
  }

  // === 3. 主页推荐 / AI 卡片改写 ===
  if (isHomeRecommendEndpoint) {
    const clearedPaths = [];

    // body.data (推荐列表通常在 data)
    if (body.data && typeof body.data === 'object') {
      for (const key of ['result', 'list', 'cards', 'items', 'recommend', 'content']) {
        if (Array.isArray(body.data[key]) && body.data[key].length > 0) {
          clearedPaths.push(`data.${key}[${body.data[key].length}]`);
          body.data[key] = [];
          modified = true;
        }
      }
    }

    // 顶层
    for (const key of ['result', 'list', 'cards', 'items', 'recommend', 'content']) {
      if (Array.isArray(body[key]) && body[key].length > 0) {
        clearedPaths.push(`${key}[${body[key].length}]`);
        body[key] = [];
        modified = true;
      }
    }

    if (clearedPaths.length > 0) {
      console.log(`[BaiduMapsNoAd] home recommend: cleared ${clearedPaths.join(', ')}`);
    }
  }

  $done({ body: modified ? JSON.stringify(body) : $response.body });
})();