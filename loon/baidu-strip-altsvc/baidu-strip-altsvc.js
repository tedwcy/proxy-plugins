/*
 * Baidu Map Alt-Svc Strip
 *
 * 目的：删掉 baidu map 各端点响应里的 `Alt-Svc: h3=...` 头，
 *       避免 iOS CFNetwork 缓存通告后持续尝试 QUIC 握手超时，
 *       导致搜索框每个 keystroke 都等 5-10s。
 *
 * 触发条件：Loon MITM hostname = *.baidu.com + baidu.com
 *           [Script] URL 模式匹配 https?://*baidu.com/*
 *
 * 工作方式：
 *   1. Loon 把 baidu.com 的 HTTPS 流量解密后传给脚本
 *   2. 脚本按 host 白名单过滤（避免误伤其他 baidu 服务）
 *   3. 在 $response.headers 中找出 `alt-svc` / `Alt-Svc` / `ALT-SVC` 任意大小写组合，删除
 *   4. 把修改后的 headers 通过 $done 回传给 Loon
 *
 * 设计要点：
 *   - 不修改 body（仅 header），抓包上看完全是原样响应
 *   - host 白名单精确到 map 域名，避免误伤 other baidu 服务
 *   - 用 $response.headers 的所有 key 遍历，兼容 HTTP/1.1 大小写和 HTTP/2 lowercase 头
 *   - 如果没匹配 host 或没有 alt-svc 头，原样放行
 */

const BAIDU_HOSTS = [
  'newclient.map.baidu.com',
  'qclient.map.baidu.com',
  'map.baidu.com',
  'newvector.map.baidu.com',
  'offnavi.map.baidu.com',
  'api.map.baidu.com',
  'cnloc.map.baidu.com',
  'integralwall.baidu.com',
  'sofire.baidu.com',
  'sofire-h3.baidu.com',
  'h2tcbox.baidu.com',
  'appnavi.baidu.com',
  'bz-ipdx.baidu.com',
  'ecom.map.baidu.com',
];

function getHost() {
  const h = $request && $request.headers;
  if (!h) return '';
  return h.Host || h.host || h[':authority'] || h[':Authority'] || '';
}

function stripAltSvc() {
  if (!$response || !$response.headers) return {};
  const host = getHost();
  if (!BAIDU_HOSTS.includes(host)) return {};
  const headers = Object.assign({}, $response.headers);
  let changed = false;
  for (const k of Object.keys(headers)) {
    if (k.toLowerCase() === 'alt-svc') {
      delete headers[k];
      changed = true;
    }
  }
  return changed ? { headers } : {};
}

$done(stripAltSvc());