// proxy-plugins version log
console.log("[egdd] v1.0.0 loaded");

/******************************

脚本功能：儿歌点点+解锁VIP
下载地址：https://is.gd/Og6DvK
软件版本：3.47.0
脚本作者：彭于晏💞
更新时间：2022-9-29
问题反馈：QQ+89996462
QQ会员群：779392027💞
TG反馈群：https://t.me/plus8889
TG频道群：https://t.me/py996
使用声明：⚠️此脚本仅供学习与交流，请勿转载与贩卖！⚠️⚠️⚠️

*******************************

[rewrite_local]

^http[s]?:\/\/gateway.ergediandian.com\/dduser\/user\/center\/set url script-response-body https://raw.githubusercontent.com/89996462/Quantumult-X/main/ycdz/egdd.js

[mitm] 

hostname = gateway.ergediandian.com

*******************************/

var body = $response.body.replace(/endtime":"\d+"/g,'endtime":"4567891456"')
.replace(/vip":\d/g,'vip":1')
.replace(/"vip_day":"\d+"/g,'"vip_day":"99999"')
.replace(/"nickname":".*?"/g,'"nickname":"彭于晏"')
.replace(/"is_vip":"0"/g,'"is_vip":"1"')
.replace(/"vip_day":"\d+"/g,'"vip_day":"99999"')
$done({ body });

