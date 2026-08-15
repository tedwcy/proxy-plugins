// tideline.js — 91porn.com 去广告 / 反追踪脚本
// v1.0.0 · 2026-08-16
//
// 覆盖:
//   1) jquery.cookie.js     — 删除 anti-adblock 重定向 (co.epac.to → h.i7p.work/v.php)
//   2) overHang.min5.js     — 中止确认弹窗 (是/否 prompt)
//   3) m.js                 — 中止 jsjiami 混淆脚本 (疑似广告/追踪)
//   4) indexonly.js         — 删除 fxOnload 内嵌的 alert('this is on load')
//   5) HTML 页面 (index.php / view_video.php / /)
//                          — 注入 CSS 隐藏 pre-roll 广告层 + 推广图
//   6) fans.91selfie.com/*  — 直接返回 1x1 透明 GIF (来自 /fans/ 的推广素材)
//
// 注: 抓包中没有看到 HTML 主页响应(只有 JS/CSS/图片),所以用 CSS 兜底
//     覆盖页面上动态生成的广告 DOM。CSS 是最后一道防线。

(() => {
    const url = $request.url || "";
    const body = $response.body || "";

    // (6) fans.91selfie.com/* — 返回 1x1 透明 GIF
    if (/^https?:\/\/fans\.91selfie\.com\//.test(url)) {
        $done({
            status: "HTTP/1.1 200 OK",
            headers: {
                "Content-Type": "image/gif",
                "Cache-Control": "public, max-age=86400"
            },
            body: "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        });
        return;
    }

    let newBody = body;

    // (1) jquery.cookie.js — 去掉 anti-adblock 重定向
    if (/\/jquery\.cookie\.js(\?|$)/.test(url)) {
        newBody = newBody.replace(
            /if\s*\(\s*document\.referrer\.split\(['"]\/['"]\)\[2\]\s*==\s*["']co\.epac\.to["']\s*\)\s*window\.top\.location\.href\s*=\s*["']http:\/\/h\.i7p\.work\/v\.php["']\s*;?/g,
            "/* tideline: anti-adblock redirect removed */"
        );
    }

    // (2) overHang.min5.js — 中止确认弹窗 (是/否 prompt)
    if (/\/overHang\.min5\.js(\?|$)/.test(url)) {
        newBody = "$.fn.overHang=function(){return this;};";
    }

    // (3) m.js — 中止 jsjiami 混淆脚本 (页面里以 (window) 收尾的执行器)
    if (/\/m\.js(\?|$)/.test(url)) {
        newBody = "/* tideline: m.js (jsjiami obfuscated) disabled */";
    }

    // (4) indexonly.js — 删除调试用的 fxOnload alert
    if (/\/indexonly\.js(\?|$)/.test(url)) {
        newBody = newBody.replace(
            /function\s+fxOnload\s*\(\s*\)\s*\{\s*alert\s*\(\s*['"]this is on load['"]\s*\)\s*;?\s*\}/g,
            "function fxOnload(){}"
        );
    }

    // (5) HTML 页面 — 注入 CSS 隐藏 pre-roll / 推广元素
    if (/\.php(?:$|\?)/.test(url) || /\/$/.test(url) || /\.html?$/.test(url)) {
        const css =
            '<style id="tideline-css">' +
            // pre-roll 视频广告 + 弹层
            '.vjs-preroll,.preroll-blocker,.preroll-skip-button,.vjs-preroll-info,' +
            '.vjs-overlay,.vjs-overlay-center,.vjs-overlay-bottom,.vjs-overlay-close,' +
            '.vjs-sharing-overlay,.vjs-sharing-container,.vjs-sharing-close-button,' +
            '.vjs-ad-playing,.vjs-limit-overlay,.vjs-over,.vjs-fade,' +
            // related videos 网格
            '.vjs-grid,#tabRelatedVideos,.related-videos,[class*="related-video"]' +
            '{display:none!important;visibility:hidden!important;opacity:0!important;' +
            'pointer-events:none!important;width:0!important;height:0!important}' +
            // 推广图片/iframe 兜底 (即使请求成功也视觉隐藏)
            'img[src*="fans.91selfie.com"],img[src*="/fans/"],' +
            'iframe[src*="fans.91selfie.com"],iframe[src*="co.epac.to"],' +
            'iframe[src*="i7p.work"]' +
            '{display:none!important;visibility:hidden!important;width:0!important;height:0!important}' +
            // 通用广告容器 (保守,只匹配明显广告词)
            '[class*="banner"],[id*="banner"],[class*="advert"],[id*="advert"]' +
            '{display:none!important}' +
            '</style>';

        if (/<\/head>/i.test(newBody)) {
            newBody = newBody.replace(/<\/head>/i, css + '</head>');
        } else if (/<body[\s>]/i.test(newBody)) {
            newBody = newBody.replace(/(<body[\s>])/i, '$1' + css);
        } else if (newBody.length > 0) {
            newBody = css + newBody;
        }
    }

    $done({ body: newBody });
})();
