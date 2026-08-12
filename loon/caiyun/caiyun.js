// 彩云天气 SVIP 解锁 - Loon native API 版
// 替换 magicJS 框架,直接用 Loon 原生 $request/$response/$done

const url = $request.url;
const body = $response.body;

if (!body) {
  $done({});
  return;
}

let obj;
try {
  obj = JSON.parse(body);
} catch (e) {
  $done({});
  return;
}

// 拦截 /v2/user - 改 VIP 状态
if (/^https?:\/\/biz\.caiyunapp\.com\/v2\/user/.test(url)) {
  if (obj && obj.result) {
    obj.result.is_vip = true;
    obj.result.vip_type = 's';
    obj.result.svip_expired_at = 1882066669;
    obj.result.svip_take_effect = 1;
    if (!obj.result.wt) obj.result.wt = {};
    obj.result.wt.vip = { enable: true, svip_expired_at: 1882066669 };
  }
  $done({ body: JSON.stringify(obj) });
  return;
}

// 拦截 /membership_rights - 返回完整 SVIP 权益列表
if (/^https?:\/\/biz\.caiyunapp\.com\/membership_rights/.test(url)) {
  const RIGHTS = {
    "result": [
      { "name": "免广告", "enabled": true, "vip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/vip-ads-free.png", "vip": true, "svip": true, "_id": "5ee5eb091d28d2634a2ee08f", "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-ads-free.png" },
      { "name": "多地天气推送", "enabled": true, "vip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/vip-custom-push.png", "vip": true, "svip": true, "_id": "5ee5eb091d28d2634a2ee090", "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-custom-push.png" },
      { "name": "降水提醒", "enabled": true, "vip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/vip-rain-notification.png", "vip": true, "svip": true, "_id": "5ee5eb091d28d2634a2ee091", "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-rain-notification.png" },
      { "name": "卫星云图", "enabled": true, "vip_icon": null, "vip": false, "svip": true, "_id": "5ee5eb091d28d2634a2ee092", "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-satellite-clouds.png" },
      { "name": "云量", "enabled": true, "vip_icon": null, "vip": false, "svip": true, "_id": "5ee5eb091d28d2634a2ee093", "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-cloud-cover.png" },
      { "name": "气温预报", "enabled": true, "vip_icon": null, "vip": false, "svip": true, "_id": "5ee5eb091d28d2634a2ee094", "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-tmp-forecast.png" },
      { "name": "露点温度预报", "enabled": true, "vip_icon": null, "vip": false, "svip": true, "_id": "5ee5eb091d28d2634a2ee095", "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-dew-point-tmp-forecast.png" },
      { "name": "短波辐射通量", "enabled": true, "vip_icon": null, "vip": false, "svip": true, "_id": "5ee5eb091d28d2634a2ee096", "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-short-wave-radiation.png" },
      { "name": "气压", "enabled": true, "vip_icon": null, "vip": false, "svip": true, "_id": "5ee5eb091d28d2634a2ee097", "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-pressure.png" },
      { "name": "能见度", "enabled": true, "vip_icon": null, "vip": false, "svip": true, "_id": "5ee5eb091d28d2634a2ee098", "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-visibility.png" },
      { "name": "湿度预报", "enabled": true, "vip_icon": null, "vip": false, "svip": true, "_id": "5ee5eb091d28d2634a2ee099", "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-humidity-forecast.png" },
      { "name": "2天降雨预报图", "enabled": true, "vip_icon": null, "vip": false, "svip": true, "_id": "5ee5eb091d28d2634a2ee09a", "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-rain-forecast.png" }
    ],
    "rc": 0
  };
  $done({ body: JSON.stringify(RIGHTS) });
  return;
}

$done({});
