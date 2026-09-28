// egdd - 儿歌点点 VIP 解锁 — QuantumultX 版
// v1.0.0 · 2026-09-28
// 移植自 loon/egdd/egdd.js
//
// 抓包来源: 第三方维护者 (89996462/Quantumult-X)

var body = $response.body.replace(/endtime":"\d+"/g,'endtime":"4567891456"')
.replace(/vip":\d/g,'vip":1')
.replace(/"vip_day":"\d+"/g,'"vip_day":"99999"')
.replace(/"nickname":".*?"/g,'"nickname":"彭于晏"')
.replace(/"is_vip":"0"/g,'"is_vip":"1"')
.replace(/"vip_day":"\d+"/g,'"vip_day":"99999"')
$done({ body });