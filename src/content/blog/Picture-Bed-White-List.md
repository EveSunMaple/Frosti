---
draft: true
title: "怎么防止云服务图床被爬虫爬？给自己的图床添加白名单~"
pubDate: "2022-04-18"
description: ""
# image:
categories:
    - Blogs
tags:
    - 技巧分享
    - 图床
---

# 原由

大家好啊！我是七月

上个月发生了一件让许多人破防的一件事: **`Gitee 图床炸了`**

在 `Gitee` 上建立的图床里的图片全都变成了 `Gitee` 的图标: 

![|huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/3ffc2687b14840ef87c27e14844d9cfb.webp)


这波事故过后一定有许多小伙伴也不敢再在 `Gitee` 创建图床, 免得把再自己给整破防了。
肯定有许多小伙伴转到了 `阿里云` 等云平台服务重新建立了自己的图床。
但是在 云平台服务建立图床 `不是免费的`, 无论是空间还是流量都不是免费的。
所以, 对自己图床访问的限制也就变得尤为重要。
 **`不然自己的云服务就可能被爬虫摧残！！`** `(我已经有了惨痛的教训,都是金钱的教训)`
下面就来具体说明一下, `如何给自己的图床设置白名单`, 来阻隔各路爬虫的访问。

---

 # 给图床设置白名单
 这里以 `阿里云` 为例 `( 阿里云手机暂不支持操作, 或者是我没找到如何修改 )`

首先, 在自己的 `OSS管理控制台` 进入`需要设立白名单的Bucket`

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/OSS_1.webp)

然后再左边列表选择 `权限管理->防盗链`

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/OSS_2.webp)

然后找到 `开启防盗链`, 并打开

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/OSS_3.webp)


打开后, 在 `Referer` 表里, 添加 `白名单域名` 或 `ip`  就好了

# 白名单需要添加什么
`白名单(防盗链)` 中, 添加一般 `需要访问图床图片` 的 `网址` 和 `ip`

比如, 我们在 `C站` 写博客需要访问图床外链, 就把 `C站的域名` 添加进去: `*.csdn.net`

或者, 需要在 `阿里云OSS` 预览图片: 

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/cover_OSS.webp)

也需要将 `阿里云` 的域名添加进去, 如果不添加就会变成这样: 

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/cover_OSS_2.webp)

将 `需要访问图床图片的网站域名` 添加进去之后, 指定网站就可以访问获取图片了 !

这里我添加了需要访问图片的域名: 

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/Referer_yuming.webp)

添加域名的方式, 阿里云有给手册 : 

![|medium](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/For_star.webp)


添加完成后, 就可以`防止白名单外的网站访问图床内的图片`, 就可以 `防止爬虫访问导致流量疯狂外流`。

## 添加 ip 建议
添加完网站域名, 我还推荐 `将自己常用网络的ip地址` 添加至白名单。否则本地访问 图床图片时 会被拒绝导致访问失败。

考虑到有些小伙伴可能不知道自己的 网络 `ip`, 这里提供一下查询方法`(Windows平台)`: 
> 1. 使用 `CMD` 指令查看: 
>
>     先打开 `CMD` 或 `Terminal(Win11)`: 
>
>     `CMD`: 可以 `Win + R` 组合键唤出  `运行`, 然后输入 `CMD` 运行就可以
>
>     ![|medium](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/run_CMD.webp)
>     
>     `Terminal(Win11)` : 右键 `开始按钮` 选择 `终端(Terminal)` 就可以 
>     
>     ![|tiny](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/run_Terminal.webp)
>     
>     然后在弹出的界面输入 `ipconfig /all` 回车
>     
>     就可以找到 `当前网络 ip`: 
>     
>     ![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/now_ip_adress.webp)
>     
> 1. 开始界面打开 `设置`, 并打开 `网络与Internet`, 找到 `属性` 点击就可以看到 `当前网络ip`: 
>
>     ![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/now_ip_adress2.webp)
>

找到自己的 `网络 ip` 然后添加到 `阿里云OSS` `防盗链(白名单)` 里就 OK 啦！ 

---

OK 本篇文章到这里就结束了！

`祝以后的我们的无论使用什么做图床, 都不会再挂！！`

