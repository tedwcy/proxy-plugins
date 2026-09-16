// Umetrip 去开屏广告 — 响应改写
// v1.0.0 · 2026-09-16 22:20
//
// 抓包来源: 102_1789567600869.zip (386 条网络记录, 航旅纵横 iOS)
//
// 目标端点: umestartup.umetrip.com/*
// 响应格式: Content-Encoding: gzip + Content-Serialize: pb (protobuf)
//          gzip 已被 Loon 解压, $response.body 是解压后的 protobuf bytes
//          protobuf 内嵌一段完整 JSON 配置 (含广告相关 flag)
//
// 策略:
//   JSON 配置 blob 里有几个广告控制字段, 做等长度字符串替换:
//     - "adBlackList":"0"           → "adBlackList":"1"           (启用广告黑名单)
//     - "advertImageTimeout":"2000" → "advertImageTimeout":"0000" (图片立即超时)
//     - "advertTotalTimeout":"2500" → "advertTotalTimeout":"0000" (广告整体立即超时)
//
//   等长度替换 → protobuf 字符串字段的 varint 长度不变 → 结构合法, app 能正常解析
//   不改其他字段 → 保留 app 原有功能
//
// 已知不确定性:
//   - adBlackList 的 "0"/"1" 可能是 boolean (禁用/启用) 或列表 ID, 实测前不知道哪种解释对
//   - advertImageTimeout=0000 是把超时设为 0, 多数 ad SDK 会跳过加载 (立即失败)
//   - 如果以上都不生效, 需要重新抓包找真正下发 splash 内容的 endpoint

(function () {
  const body = $response.body || '';
  if (!body) {
    $done({});
    return;
  }

  let modified = false;
  let newBody = body;

  // 1. adBlackList: 0 → 1 (启用广告黑名单, 18 字节不变)
  if (newBody.indexOf('"adBlackList":"0"') !== -1) {
    newBody = newBody.split('"adBlackList":"0"').join('"adBlackList":"1"');
    console.log('[UmetripNoAd] adBlackList: 0 → 1');
    modified = true;
  }

  // 2. advertImageTimeout: 2000 → 0000 (图片立即超时, 27 字节不变)
  if (newBody.indexOf('"advertImageTimeout":"2000"') !== -1) {
    newBody = newBody.split('"advertImageTimeout":"2000"').join('"advertImageTimeout":"0000"');
    console.log('[UmetripNoAd] advertImageTimeout: 2000 → 0000');
    modified = true;
  }

  // 3. advertTotalTimeout: 2500 → 0000 (广告整体立即超时, 27 字节不变)
  if (newBody.indexOf('"advertTotalTimeout":"2500"') !== -1) {
    newBody = newBody.split('"advertTotalTimeout":"2500"').join('"advertTotalTimeout":"0000"');
    console.log('[UmetripNoAd] advertTotalTimeout: 2500 → 0000');
    modified = true;
  }

  if (!modified) {
    $done({});
    return;
  }

  $done({ body: newBody });
})();