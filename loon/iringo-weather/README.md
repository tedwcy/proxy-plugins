# iRingo WeatherKit

iOS 18 / macOS 15 / watchOS 11 自带天气 app 的功能解锁脚本。

来源: https://github.com/NSRingo/WeatherKit (v3.2.1)

## 功能

1. 解锁全部天气功能(原本需要 API key)
2. 修改空气质量数据
3. 修改下一小时降水数据
4. 修改天气数据
5. 修改天气预警数据

## 用法

不需要自己填 API key。装上 plugin 即可使用。

如需自定义(如切换地区、改 Locale 等),使用 boxjs + iRingo WeatherKit 配置页面:
http://boxjs.com/#/app/iRingo.WeatherKit

## 域名

- weatherkit.apple.com

## 不需要 rewrite (filter) 段

QX 原 snippet 里有:
```
host, weather-analytics-events.apple.com, reject
host-suffix, tthr.apple.com, reject
host, tether.edge.apple, reject
```

但这些是阻断统计/广告域名,不在 Loon plugin 范围。
需要的话可以在 Loon 的 [Rule] 段单独加:
```
DOMAIN,weather-analytics-events.apple.com,REJECT
DOMAIN-SUFFIX,tthr.apple.com,REJECT
DOMAIN,tether.edge.apple,REJECT
```

## 转换说明

QX script-echo-response → Loon script-response-body
- QX echo: 不实际发请求,直接用脚本返回值当响应
- Loon response-body: 实际发请求,拿响应后用脚本 body 替换
- 效果等价(FR24 / 类似的"伪造响应"场景已验证)
