// tideline - 91porn.com 去广告 / 反追踪 — QuantumultX 版
// v1.1.0 · 2026-09-28
// 移植自 loon/tideline/tideline.js (核心逻辑直接 copy)
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
            headers: { "Content-Type": "text/html; charset=utf-8" },
            body: "<!doctype html><html><body></body></html>"
        });
        return;
    }

    // (D) s1.kwai.net — 快手 pre-roll 视频广告, 返回最小 mp4
    if (/^https?:\/\/s1\.kwai\.net\//.test(url)) {
        $done({
            status: "HTTP/1.1 200 OK",
            headers: { "Content-Type": "video/mp4" },
            body: ""
        });
        return;
    }

    // ============ HTML 页面清理 ============
    if (/^https?:\/\/91porn\.com\//.test(url)) {
        // JS: 清掉推广条 / JuicyAds / smartpop / preroll 等
        if (/\/js\//.test(url)) {
            $done({
                status: "HTTP/1.1 200 OK",
                headers: { "Content-Type": "application/javascript" },
                body: "/* tideline: js cleaned */"
            });
            return;
        }

        // HTML: 删除推广 DOM 节点 (不只是 CSS 隐藏)
        let cleaned = body
            // 顶部 cont6 推广条 (6 个 div)
            .replace(/<div[^>]*class=["'][^"']*cont6[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, "")
            // 中段 / 右侧栏 ad_img 链接 (5+2 个)
            .replace(/<a[^>]*class=["'][^"']*ad_img[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, "")
            // JuicyAds 整块
            .replace(/<!--\s*JuicyAds[\s\S]*?JuicyAds\s*END\s*-->/gi, "")
            // smartpop iframe
            .replace(/<iframe[^>]*src=["'][^"']*rmhfrtnd[^"']*["'][^>]*>[\s\S]*?<\/iframe>/gi, "")
            // 快手 pre-roll script
            .replace(/player\.preroll\s*\(\s*\{[^}]*s1\.kwai\.net[^}]*\}\s*\)\s*;?/gi, "")
            // 通用 ad/banner/promo class 元素
            .replace(/<div[^>]*class=["'][^"']*\b(ad|banner|promo|sponsor)\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, "");

        $done({
            status: "HTTP/1.1 200 OK",
            headers: { "Content-Type": "text/html; charset=utf-8" },
            body: cleaned
        });
        return;
    }

    // 其他端点透传
    $done({});
})();