// 看天下 (VistaKTX / com.vistastory.VistaKTX) 去除开屏广告 + 弹窗广告
// Quantumult-X 版 v1.0.3 · 2026-10-08
//
// 从 loon/kantianxia-noad/kantianxia-noad.js v1.0.0 移植, 改动:
//   1. 用 IIFE 包裹 (QX X JSCore 严格模式更稳, 避开顶层 return 等坑)
//   2. JSON.parse 失败 → 立即 $done({}) return, 不再 continue
//   3. ad / popup 字段名扩展: 兼容 body.ad / body.popup / body.splash / body.startupAd
//      / body.bannerAd / body.splashAd / body.launchAd 多种可能命名
//   4. 任何 ad 字段: 非 null 即置 null (包括 {} / [] / 0 / "")
//   5. 顶层 body.ad 不存在时, 也尝试 body.data.ad / body.result.ad (server 套娃结构兜底)
//
// 抓包来源 (跟 Loon 版同源):
//   2026-10-08 11:19 HAR 显示 loading_ad2 / get_popup_ad 端点未变, body shape 未变
//   但 raw.githubusercontent.com 0 次 fetch, 脚本完全没被调用
//   v1.0.3 简化 pattern + 加 tag + 改用本地 .js 路径, 配合用户清缓存流程
//
// 已知限制 (跟 Loon 版相同):
//   - 若 app 未来在 loading_ad2 加新字段, 需扩展 nullify 列表
//   - 若 server 改返回 shape (e.g. 整体加 data:{} 包裹), 需适配
//   - plugin 仅 http-response, 若 server 改成 GET 时不下发 (返回 204), plugin 无效

(function () {
  'use strict';

  const url = $request.url;

  // === Version log (QX X 日志里能看到, 验证 plugin 是否真的加载) ===
  console.log('[KantianxiaNoAd] v1.0.3 loaded');

  // http-response 必有 $response, 直接用
  let body;
  try {
    body = JSON.parse($response.body);
  } catch (e) {
    // 非 JSON 响应 (HTML 错误页 / 502 网关页) — 透传, 立即 return 避免下面访问 undefined 崩
    console.log(`[KantianxiaNoAd] body not JSON, pass through: ${e.message}`);
    $done({});
    return;
  }

  if (!body || typeof body !== 'object') {
    $done({});
    return;
  }

  let modified = false;

  // === 启动广告端点: loading_ad2 / loading_ad / splash ===
  const isLoadingAd = /^https?:\/\/(.*\.)?ktx\.cn\/v3\/api\/(index\/loading_ad|index\/splash|index\/startup)/.test(url);
  // === 弹窗广告端点: get_popup_ad / popup / dialog ===
  const isPopupAd = /^https?:\/\/(.*\.)?ktx\.cn\/v3\/api\/(adm\/get_popup|popup\/get_popup|index\/dialog)/.test(url);

  if (isLoadingAd) {
    // 启动广告: nullify 一切可能的 ad 字段名
    // 兼容: body.ad, body.splash, body.startupAd, body.bannerAd, body.splashAd, body.launchAd
    // 兼容嵌套: body.data.ad, body.result.ad
    const candidates = [
      ['ad', 'splash', 'startupAd', 'bannerAd', 'splashAd', 'launchAd'],
      ['data.ad', 'data.splash', 'data.startupAd', 'data.bannerAd', 'data.splashAd'],
      ['result.ad', 'result.splash', 'result.startupAd']
    ];
    for (const group of candidates) {
      for (const path of group) {
        const parts = path.split('.');
        let cur = body;
        let ok = true;
        for (let i = 0; i < parts.length - 1; i++) {
          if (cur == null || typeof cur !== 'object' || !(parts[i] in cur)) {
            ok = false;
            break;
          }
          cur = cur[parts[i]];
        }
        if (!ok) continue;
        const leaf = parts[parts.length - 1];
        if (leaf in cur && cur[leaf] !== null) {
          const was = cur[leaf];
          const wasId = (was && typeof was === 'object' && was.id) || (Array.isArray(was) ? `array[${was.length}]` : typeof was);
          console.log(`[KantianxiaNoAd] loading: nullify body.${path} (was ${wasId})`);
          cur[leaf] = null;
          modified = true;
        }
      }
    }
  } else if (isPopupAd) {
    // 弹窗广告: nullify popup / dialog / modal / sheet
    const candidates = [
      ['popup', 'dialog', 'modal', 'sheet', 'popupAd', 'dialogAd'],
      ['data.popup', 'data.dialog', 'data.modal', 'data.popupAd'],
      ['result.popup', 'result.dialog']
    ];
    for (const group of candidates) {
      for (const path of group) {
        const parts = path.split('.');
        let cur = body;
        let ok = true;
        for (let i = 0; i < parts.length - 1; i++) {
          if (cur == null || typeof cur !== 'object' || !(parts[i] in cur)) {
            ok = false;
            break;
          }
          cur = cur[parts[i]];
        }
        if (!ok) continue;
        const leaf = parts[parts.length - 1];
        if (leaf in cur && cur[leaf] !== null) {
          const was = cur[leaf];
          const wasId = (was && typeof was === 'object' && was.id) || (Array.isArray(was) ? `array[${was.length}]` : typeof was);
          console.log(`[KantianxiaNoAd] popup: nullify body.${path} (was ${wasId})`);
          cur[leaf] = null;
          modified = true;
        }
      }
    }
  }
  // === 其他端点透传 (get_init / get_configs / app_index_220 / etc.) ===

  $done({ body: modified ? JSON.stringify(body) : $response.body });
})();
