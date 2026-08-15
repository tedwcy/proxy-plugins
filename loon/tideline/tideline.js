// tideline.js — 91porn.com 去广告 / 反追踪脚本
// v1.1.0 · 2026-08-16
//
// 视频页新增覆盖 (基于 37 号抓包):
//   · 6 个顶部 cont6 推广条 + 5 个中段 ad_img 链接 + 2 个右侧栏 ad_img
//   · 4 处 JuicyAds (<!-- JuicyAds v3.1 -->...<!--JuicyAds END-->) 块
//   · 1 处 smartpop iframe (go.rmhfrtnd.com, 300x250)
//   · player.preroll({s1.kwai.net}) 快手 pre-roll 视频广告
//   · /js/m2.js 第二个 jsjiami 混淆脚本
//
// 通用策略: 直接从 DOM 删节点 (不只是 CSS 隐藏) — 避免"空位"残留
//
// 注:
//   · la.btc620.com 是真实视频 CDN (strencode2 URL-encoded),
//     **不要碰**,不要加进 MITM,不要替换
//   · 91porn.com 主站其他页面 (index.php 等) 也享受 HTML 清理

(() => {
    const url = $request.url || "";
    const body = $response.body || "";

    // ============ 块级: MITM 黑名单域直接返空 ============

    // (A) fans.91selfie.com — 返回 1x1 透明 GIF
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

    // (B) poweredby.jads.co — JuicyAds JS, 空响应即可
    if (/^https?:\/\/poweredby\.jads\.co\//.test(url)) {
        $done({
            status: "HTTP/1.1 200 OK",
            headers: { "Content-Type": "application/javascript" },
            body: "/* tideline */"
        });
        return;
    }

    // (C) go.rmhfrtnd.com — JuicyAds smartpop iframe, 空 HTML
    if (/^https?:\/\/go\.rmhfrtnd\.com\//.test(url)) {
        $done({
            status: "HTTP/1.1 200 OK",
            headers: { "Content-Type": "text/html" },
            body: ""
        });
        return;
    }

    // (D) s1.kwai.net — 快手 pre-roll 视频广告
    if (/^https?:\/\/s1\.kwai\.net\//.test(url)) {
        $done({
            status: "HTTP/1.1 204 No Content",
            headers: {},
            body: ""
        });
        return;
    }

    // ============ 块级: JS 文件单独处理 ============

    // jquery.cookie.js — 剥离 anti-adblock 重定向
    if (/\/jquery\.cookie\.js(\?|$)/.test(url)) {
        const newBody = body.replace(
            /if\s*\(\s*document\.referrer\.split\(['"]\/['"]\)\[2\]\s*==\s*["']co\.epac\.to["']\s*\)\s*window\.top\.location\.href\s*=\s*["']http:\/\/h\.i7p\.work\/v\.php["']\s*;?/g,
            "/* tideline: anti-adblock redirect removed */"
        );
        $done({ body: newBody });
        return;
    }

    // overHang.min5.js — 中止确认弹窗
    if (/\/overHang\.min5\.js(\?|$)/.test(url)) {
        $done({ body: "$.fn.overHang=function(){return this;};" });
        return;
    }

    // m.js / m2.js — jsjiami 混淆脚本,整体废弃
    if (/\/m2?\.js(\?|$)/.test(url)) {
        $done({ body: "/* tideline: m/m2.js disabled */" });
        return;
    }

    // indexonly.js — 移除调试 alert
    if (/\/indexonly\.js(\?|$)/.test(url)) {
        const newBody = body.replace(
            /function\s+fxOnload\s*\(\s*\)\s*\{\s*alert\s*\(\s*['"]this is on load['"]\s*\)\s*;?\s*\}/g,
            "function fxOnload(){}"
        );
        $done({ body: newBody });
        return;
    }

    // ============ 块级: HTML 页面 DOM 清理 ============

    if (!/\.php(?:$|\?)/.test(url) && !/\/$/.test(url) && !/\.html?$/.test(url)) {
        // 不是 HTML 页面,原样返回
        $done({ body });
        return;
    }

    let newBody = body;

    // (1) 干掉 player.preroll({...}) pre-roll 视频广告
    newBody = newBody.replace(
        /player\.preroll\s*\(\s*\{[\s\S]*?\}\s*\)\s*;/g,
        '/* tideline: preroll removed */'
    );

    // (2) 干掉 JuicyAds 块 (<!-- JuicyAds v3.1 --> ... <!--JuicyAds END-->)
    newBody = newBody.replace(
        /<!--\s*JuicyAds[^>]*-->[\s\S]*?<!--\s*JuicyAds END\s*-->/g,
        ''
    );

    // (3) 干掉顶部 cont6 推广条 (<div class="cont6" id="cont3">...</div>)
    newBody = newBody.replace(
        /<div class="cont6" id="cont3">[\s\S]*?<\/div>\s*/g,
        ''
    );

    // (4) 收尾: 清掉空 <div align=center></div> 包装 (顶部 6 条 + 页面底部残留)
    newBody = newBody.replace(
        /<div align=center>\s*<\/div>/g,
        ''
    );

    // (5) 干掉内联推广图链接
    //     <a ... target="_blank"><img class="ad_img" ...></a><br><br>...
    //     顺便吃掉后面的 <br> (避免"广告去除后的空位")
    newBody = newBody.replace(
        /<a [^>]*target="_blank"[^>]*>\s*<img class="ad_img"[^>]*>\s*<\/a>(?:\s*<br\s*\/?>\s*)*/g,
        ''
    );

    // (6) 干掉 smartpop iframe
    newBody = newBody.replace(
        /<iframe[^>]*src=["']https?:\/\/go\.rmhfrtnd\.com\/[^"']*["'][^>]*><\/iframe>(?:\s*<br\s*\/?>\s*)*/g,
        ''
    );

    // (7) 收尾: 把残留的 <br> 簇 (2+ 连发) 折成单个 <br>
    //     处理 (3) (5) (6) 边界外的多余 <br>
    newBody = newBody.replace(
        /(<br\s*\/?>\s*){2,}/g,
        '<br>'
    );

    // (8) 注入 CSS 兜底 (万一 DOM 结构变了,某些广告没被上面规则命中)
    const css =
        '<style id="tideline-css">' +
        // pre-roll 视频广告 / 弹层 / sharing
        '.vjs-preroll,.preroll-blocker,.preroll-skip-button,.vjs-preroll-info,' +
        '.vjs-overlay,.vjs-overlay-center,.vjs-overlay-bottom,.vjs-overlay-close,' +
        '.vjs-sharing-overlay,.vjs-sharing-container,.vjs-sharing-close-button,' +
        '.vjs-ad-playing,.vjs-limit-overlay,.vjs-over,.vjs-fade,' +
        // related-videos 网格 (本身是功能,但常被广告混进,留 CSS 关掉视觉干扰)
        '.vjs-grid{' +
        'display:none!important;visibility:hidden!important;opacity:0!important;' +
        'pointer-events:none!important;width:0!important;height:0!important}' +
        // JuicyAds ins 占位 (data-width/data-height 是 JuicyAds 特征)
        'ins[id][data-width][data-height]{display:none!important;height:0!important}' +
        // 推广图/iframe 兜底
        'img[src*="fans.91selfie.com"],img[src*="/fans/"],img[src*="jads.co"],' +
        'img[src*="btc620.com"],img[src*="kwai.net"],' +
        'iframe[src*="fans.91selfie.com"],iframe[src*="co.epac.to"],' +
        'iframe[src*="i7p.work"],iframe[src*="rmhfrtnd.com"],' +
        'iframe[src*="jads.co"]{' +
        'display:none!important;visibility:hidden!important;width:0!important;height:0!important}' +
        '</style>';

    if (/<\/head>/i.test(newBody)) {
        newBody = newBody.replace(/<\/head>/i, css + '</head>');
    } else if (/<body[\s>]/i.test(newBody)) {
        newBody = newBody.replace(/(<body[\s>])/i, '$1' + css);
    } else if (newBody.length > 0) {
        newBody = css + newBody;
    }

    $done({ body: newBody });
})();
