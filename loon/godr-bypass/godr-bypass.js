// godr.cc (GO DaVinci) - 离线会员解锁
// v1.0.0 · 2026-08-28 22:00
//
// 目标端点: godr.cc/api/V1/godr/membership.php?action=check&feature=*
//
// 关键策略 (基于真实抓包):
//   1. 解析 JSON 响应 → body.allowed 强制改 true (功能解锁)
//   2. 提升 body.userType 至 requiredUserTypes 的最高级 (10/11 → 11),
//      避免 app 端 UI 显示 "userType 不匹配" 之类的二次校验失败提示
//   3. 改 body.message = "已解锁" (UI 文案)
//   4. 其他端点全透传: login.php / preview/* / index.php?path=cat/list /
//      notice.php / version.php / time-limits — 都保持原样
//   5. login.php 真实登录保留 (plugin 不伪造登录响应, 让现有会员状态继续有效)
//   6. machine_code 绑定由 URL 携带, plugin 不参与伪造
//
// 安全注意:
//   - HAR 里 godr.cc 的 pwd 是 URL 明文参数 (godr.cc 自己的设计问题),
//     不在 plugin 修复范围
//   - plugin 只读 $response 改 body, 不写 $request
//   - 真实 login 仍走 godr.cc, token 会过期 — 用前确保 token 还在有效期
//
// 已知限制:
//   - 若 server 改 endpoint shape (e.g. allowed 改字符串 "1", 或加 HMAC
//     签名), plugin 需适配
//   - 若 server 改用 status code 区分 (200/403), plugin 无效
//   - 已知 feature: subtitle 已验证; 若 app 加新 feature 检查 (audio_clone?
//     funasr?), ?action=check pattern 自动覆盖
//   - 不影响 list/cat 端点 — 这些端点返回的 effect 列表本身已不受会员限制
//     (HAR 里 200 正常返回), premium 资源下载可能另走 URL, 若发现新端点
//     也返回 allowed:false, 加新 pattern

const url = $request.url;

// === Version log (Ted 验证用: Loon 脚本日志里能看到) ===
console.log('[GodrBypass] v1.0.0 loaded');

// http-response 必有 $response, 直接用
let body;
try {
  body = JSON.parse($response.body);
} catch (e) {
  // 非 JSON 响应 (HTML 错误页 / 502 网关页) — 透传, 避免破坏错误显示
  console.log(`[GodrBypass] body not JSON, pass through: ${e.message}`);
  $done({});
}

let modified = false;

// === membership.php?action=check → 解锁 allowed ===
if (body && typeof body === 'object' && 'allowed' in body && body.allowed === false) {
  const feature = body.feature || 'unknown';
  const featureName = body.featureName || feature;
  const required = Array.isArray(body.requiredUserTypes) ? body.requiredUserTypes : [];
  const newTier = required.length > 0 ? Math.max.apply(null, required) : 11;
  const oldTier = body.userType;

  console.log(`[GodrBypass] unlock feature=${feature} (${featureName}): userType ${oldTier} → ${newTier}`);

  body.allowed = true;
  body.userType = newTier;
  if ('message' in body) {
    body.message = '已解锁';
  }
  modified = true;
}
// === 其他端点透传 (login / preview / list / cat / notice / version / time-limits) ===

$done({ body: modified ? JSON.stringify(body) : $response.body });