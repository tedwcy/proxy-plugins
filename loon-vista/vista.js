// Vista 看天下 (VistaKTX) SVIP 解锁
// 基于 Ted 真实抓包 (2026-08-12 22:51 + 22:57)
// 盲猜字段: 在 isFree 基础上加 articleType/vipType/payType/needBuy/isVip/isLimitFree 等

const body = $response.body;
if (!body) { $done({}); return; }

let newBody = body
  // === 顶级 VIP 状态 (已 work) ===
  .replace(/"isVip":0/g, '"isVip":1')
  .replace(/"isActive":0/g, '"isActive":1')
  .replace(/"isMiniVip":0/g, '"isMiniVip":1')
  .replace(/"expireVip":1/g, '"expireVip":0')
  .replace(/"endTime":\d{13}/g, '"endTime":4100726622000')

  // === article 嵌套层 isFree (已 work 但内容仍锁, 试更多字段) ===
  // article.isFree:0 → 1 (上层)
  .replace(/"isFree":0/g, '"isFree":1')

  // articleType: 6 可能是 vip 内容 → 改 0 (普通)
  // 注意: 改成 0 可能错(articleType 含义可能不一样),如果 app 闪退就回退
  .replace(/"articleType":6/g, '"articleType":0')

  // vipType: 1 (需要 vip) → 0 (不需要)
  .replace(/"vipType":1/g, '"vipType":0')
  .replace(/"vipType":2/g, '"vipType":0')

  // payType: 1/2 (付费类型) → 0 (免费)
  .replace(/"payType":1/g, '"payType":0')
  .replace(/"payType":2/g, '"payType":0')

  // needBuy: 1 → 0
  .replace(/"needBuy":1/g, '"needBuy":0')

  // needVip: 1 → 0
  .replace(/"needVip":1/g, '"needVip":0')

  // vipOnly: 1 → 0
  .replace(/"vipOnly":1/g, '"vipOnly":0')

  // isLimitFree: 0 → 1 (限制免费 = 0 是付费,反过来)
  .replace(/"isLimitFree":0/g, '"isLimitFree":1')

  // 通用 payStatus / subscribe
  .replace(/"payStatus":0/g, '"payStatus":1')
  .replace(/"subscribe":0/g, '"subscribe":1')
  .replace(/"subscribed":false/g, '"subscribed":true');

$done({ body: newBody });
