// 彩云天气 Pro SVIP 解锁
const url = $request.url;
const body = $response.body;
if (!body) { $done({}); return; }

if (/^https?:\/\/(wrapper|biz|ad|starplucker)\.cyapi\.cn\/v3\/config\/membership\/svip\/rights/.test(url)) {
  $done({ body: REAL_SVIP_RIGHTS });
  return;
}

if (/^https?:\/\/(wrapper|biz|ad|starplucker)\.cyapi\.cn\/v3\/operation\/features/.test(url)) {
  $done({ body: REAL_OPERATION_FEATURES });
  return;
}

if (/^https?:\/\/(wrapper|biz|ad|starplucker)\.cyapi\.cn\/v1\/activity/.test(url)) {
  $done({ body: JSON.stringify({
    status: "ok",
    activities: [
      { "type": "policy", "name": "svip_unlocked", "feature": true }
    ],
    interval: 200,
    id: "675fc1b6e293e04d7a12e933"
  }) });
  return;
}

$done({});

const REAL_SVIP_RIGHTS = JSON.stringify({
  "rights": [
    { "name": "降雨预报", "title": "精准降雨预报", "description": "3 小时内精确到分钟级降雨趋势，48 小时内小时级精准降雨趋势",
      "image": "https://cdn-w.caiyunapp.com/p/banner/test/66a226da1a1f8eed97132d8f.png",
      "image_dark": "https://cdn-w.caiyunapp.com/p/banner/test/66a226e6b92035cef1c19473.png",
      "image_short": "https://cdn-w.caiyunapp.com/p/banner/test/66a226ecb92035cef1c19474.png",
      "image_short_dark": "https://cdn-w.caiyunapp.com/p/banner/test/66a226eeb92035cef1c19475.png",
      "image_redirect": "", "icon": "https://cdn-w.caiyunapp.com/p/banner/test/6551f4a4bdaf59c21355c6bc.png" },
    { "name": "专业气象图", "title": "5种专业气象图", "description": "多种专业预报图：云量预报、湿度预报、能见度预报、气温预报",
      "image": "https://cdn-w.caiyunapp.com/p/banner/test/66a2271bb92035cef1c19476.png",
      "image_dark": "https://cdn-w.caiyunapp.com/p/banner/test/66a2271eb92035cef1c19477.png",
      "image_short": "https://cdn-w.caiyunapp.com/p/banner/test/66a22721b92035cef1c19478.png",
      "image_short_dark": "https://cdn-w.caiyunapp.com/p/banner/test/66a22723b92035cef1c19479.png",
      "image_redirect": "", "icon": "https://cdn-w.caiyunapp.com/p/banner/test/6551f94561f3be04d5343ea9.png" },
    { "name": "卫星云图", "title": "高清卫星云图", "description": "最长 30 小时卫星云图，包含地球一日、3D 云图、水汽云图",
      "image": "https://cdn-w.caiyunapp.com/p/banner/test/66a22739b92035cef1c1947a.png",
      "image_dark": "https://cdn-w.caiyunapp.com/p/banner/test/66a2273fb92035cef1c1947b.png",
      "image_short": "https://cdn-w.caiyunapp.com/p/banner/test/66a22744z92035eed97132d90.png",
      "image_short_dark": "https://cdn-w.caiyunapp.com/p/banner/test/66a2274eb92035cef1c1947c.png",
      "image_redirect": "", "icon": "https://cdn-w.caiyunapp.com/p/banner/test/6551fd85bdaf59c21355c6bd.png" },
    { "name": "问答助手", "title": "每月免费问答额度", "description": "智能天气助手，SVIP 每月 50 条免费问答，即时交互，提供定制化天气服务",
      "image": "https://cdn-w.caiyunapp.com/p/banner/test/67597c195c52f94977728ab6.png",
      "image_dark": "https://cdn-w.caiyunapp.com/p/banner/test/67597c245c52f94977728ab7.png",
      "image_short": "https://cdn-w.caiyunapp.com/p/banner/test/67597c085c52f94977728ab4.png",
      "image_short_dark": "https://cdn-w.caiyunapp.com/p/banner/test/67597c0d5c52f94977728ab5.png",
      "image_redirect": "", "icon": "https://cdn-w.caiyunapp.com/p/banner/test/6552020abdaf59c21355c6c0.png" },
    { "name": "贴心提醒", "title": "贴心提醒", "description": "为您推送当前位置、收藏位置等多地天气降雨预报",
      "image": "https://cdn-w.caiyunapp.com/p/banner/test/66a2276eb92035cef1c19481.png",
      "image_dark": "https://cdn-w.caiyunapp.com/p/banner/test/66a2274eb92035cef1c1947c.png",
      "image_short": "https://cdn-w.caiyunapp.com/p/banner/test/66a22775b92035fef1c19482.png",
      "image_short_dark": "https://cdn-w.caiyunapp.com/p/banner/test/66a2278b1a1f8eed97132d92.png",
      "image_redirect": "", "icon": "https://cdn-w.caiyunapp.com/p/banner/test/6552036161f3be04d5343eac.png" },
    { "name": "去广告", "title": "去广告", "description": "个性主题皮肤以及免广告权益",
      "image": "https://cdn-w.caiyunapp.com/p/banner/test/66a2279bb92035cef1c19485.png",
      "image_dark": "https://cdn-w.caiyunapp.com/p/banner/test/66a227a2b92035cef1c19486.png",
      "image_short": "https://cdn-w.caiyunapp.com/p/banner/test/66a2279e2b92035cef1c19485.png",
      "image_short_dark": "https://cdn-w.caiyunapp.com/p/banner/test/66a227abb92035cef1c19488.png",
      "image_redirect": "", "icon": "https://cdn-w.caiyunapp.com/p/banner/test/655208a761f3be04d5343eb2.png" }
  ],
  "qas": [
    { "question": "不小心重复购买了两次会员怎么办?",
      "answer": "同一账号开通两次会员,会员时长将会顺延,请您放心使用。\n如果同时开通vip及svip,优先生效svip,vip顺延至svip之后生效。" }
  ],
  "feats": [
    { "icon": "https://cdn-w.caiyunapp.com/p/banner/test/66a227dbb92035cef1c19489.png",
      "name": "分钟级降雨预报" }
  ]
});

const REAL_OPERATION_FEATURES = JSON.stringify({
  "data": [
    { "avatar": "https://cdn-w.caiyunapp.com/p/app/operation/prod/feature/64c7902e0316e4878d28ce8e/4497e5c1a780ad2eff73e42ef54b01c6.png",
      "url": "cy://page_typhoon_view", "title": "台风路径", "feature_type": "", "badge_type": "custom" },
    { "avatar": "https://cdn-w.caiyunapp.com/p/app/operation/prod/feature/665579a9a16f650e019e41b0/34b7be6c0432f5a476ab48a68b4ff3c0.png",
      "url": "cy://page_driving_weather", "title": "驾驶天气", "feature_type": "", "badge_type": "" },
    { "avatar": "https://cdn-w.caiyunapp.com/p/app/operation/prod/feature/67bd8b770c6dc4c8a565f744/7b509eeeb219d097edc332c2eb6267d3.png",
      "url": "cy://page_index_photo", "title": "摄影指数", "feature_type": "", "badge_type": "custom", "badge": "蓝调" },
    { "avatar": "https://cdn-w.caiyunapp.com/p/app/operation/prod/feature/68cd1c7eadb018b0c778b72f/2b431f07b7b16a86b87fbb3962e3519b.png",
      "url": "cy://page_alert_nearby", "title": "附近预警", "feature_type": "", "badge_type": "" },
    { "avatar": "https://cdn-w.caiyunapp.com/p/app/operation/prod/feature/66a881fbd428d25287131ed0/ed69d74bd09bb316cc55100110acb8fe.png",
      "url": "https://h5.caiyunapp.com/calender", "title": "万年历", "feature_type": "", "badge_type": "custom" },
    { "avatar": "https://cdn-w.caiyunapp.com/p/app/operation/prod/feature/668cf839367625ff6748e635/a2f87de53ce89609ee3773012e3bf78e.png",
      "url": "cy://page_earthquake_view", "title": "地震地图", "feature_type": "", "badge_type": "" },
    { "avatar": "https://cdn-w.caiyunapp.com/p/app/operation/prod/feature/66f50b56908a75e646cf76df/9ca8d63360974d77c772fe1b88106016.png",
      "url": "https://h5.caiyunapp.com/mountain-view/list", "title": "登山天气", "feature_type": "", "badge_type": "" }
  ]
});
