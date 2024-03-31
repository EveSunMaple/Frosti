---
title: 用 Astro 搭建一个高性能博客
description: 一篇简单的 Astro 博客部署教程
pubDate: 02 23 2024
heroImage: https://saroprock.oss-cn-hangzhou.aliyuncs.com/img/itemPreview.png
tags:
  - Web
  - Astro
  - SEO
  - 博客
badge: 教程
---
## 前言

> 本篇文章的目的旨在读者无须在多个窗口间跳动即可完成 Astro 的部署与个性化。**需要下载的内容可在本页面一键下载**

## 为什么选择 Astro

关于这个问题，你可以访问它的官方网站：[为什么是 Astro? | Docs](https://docs.astro.build/zh-cn/concepts/why-astro/)

> 如果你想了解我的想法，请移动至本文结尾

## 需要的环境

- 为了让 Astro 在你的系统上运行，你需要安装 [**Node.js**](https://nodejs.cn/)、版本 `v18.14.1` 或更高版本。
	> 点击下载：<a class="btn" href="https://saroprock.oss-cn-hangzhou.aliyuncs.com/asset/node-v20.11.1-x64.msi" target="_blank"> node-v20.11.1-x64</a>
- [可选] 安装 **pnpm**：
	
```bash
npm install -g pnpm
```
	
### 我还需要什么
- 一个 [GitHub](https://github.com/) 账号
- 一个合适的代码编辑器
- 掌握一定的 **_魔法-Magic_**

## 创建你的博客项目

> Astro 不像 Hexo，可以安装多个主题，然后只用写几个配置文件就好了——还能随便切换主题。Astro 每个主题就是一个项目，而每位作者用的 `frontmatter` 格式可能都不一样，所以为了避免频繁迁移项目，请先选好自己要使用的主题。

### 选择你需要的主题

Astro 像 Hexo 一样，也有很多主题可用（~~更好的说法是项目模板~~）。你可以在 [**Themes | Astro**](https://astro.build/themes/) 挑选自己需要的主题，这里我选择简单好用的 [**AstroPaper**](https://github.com/satnaing/astro-paper) 作为示例。

### 拷贝主题 / 项目模板（仓库）

只需要使用包管理器即可（推荐使用 pnpm）：

```bash
# npm 6.x
npm create astro@latest --template satnaing/astro-paper
# npm 7+, extra double-dash is needed:
npm create astro@latest -- --template satnaing/astro-paper
# yarn
yarn create astro --template satnaing/astro-paper
```

完成后的目录如下：

```bash
/
├── public/
│   ├── assets/
│   │   └── logo.svg
│   │   └── logo.png
│   └── favicon.svg
│   └── astropaper-og.jpg
│   └── robots.txt
│   └── toggle-theme.js
├── src/
│   ├── assets/
│   │   └── socialIcons.ts
│   ├── components/
│   ├── content/
│   │   |  blog/
│   │   |    └── some-blog-posts.md
│   │   └── config.ts
│   ├── layouts/
│   └── pages/
│   └── styles/
│   └── utils/
│   └── config.ts
│   └── types.ts
└── package.json
```

安装必要的内容：

```bash
npm installl
```

如果你迫不及待想看看自己的博客，可以启动 Astro 开发服务：

```bash
npm run dev
```

你应该能在终端中看到 Astro 正在以开发模式运行的提示信息。

在浏览器中输入 `http://localhost:4321/` 即可即时预览。
### 个性化你的博客

#### config.ts

里面包含了网站的一些基本信息，下面是 [**AstroPaper**](https://github.com/satnaing/astro-paper) 的 `config.ts`：

```js
// file: src/config.ts
export const SITE = {
  website: "https://astro-paper.pages.dev/",
  author: "Sat Naing",
  desc: "A minimal, responsive and SEO-friendly Astro blog theme.",
  title: "AstroPaper",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 3,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};
```

| 选项                  | 描述                                                                                                                                                                                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **_website_**             | 您部署的网站URL                                                                                                                                                                                                                                      |
| **_author_**              | 您的姓名                                                                                                                                                                                                                                            |
| **_desc_**                | 您的网站描述。对于SEO和社交媒体分享很有用                                                                                                                                                                                                              |
| **_title_**               | 您的网站名称                                                                                                                                                                                                                                        |
| **_ogImage_**             | 您网站的默认OG图像。对于社交媒体分享很有用。OG图像可以是外部图像URL，也可以放置在`/public`目录下                                                                                                                                                  |
| **_lightAndDarkMode_**    | 启用或禁用网站的`明亮和暗黑模式`。如果禁用，将使用主色彩方案。此选项默认启用。                                                                                                                                                                           |
| **_postPerPage_**         | 您可以指定每个帖子页面上显示多少帖子。（例如：如果将SITE.postPerPage设置为3，则每页只显示3篇帖子）                                                                                                                                                  |
| **_scheduledPostMargin_** | 在生产模式下，具有将来`pubDatetime`的帖子将不可见。但是，如果帖子的`pubDatetime`在接下来的15分钟内，它将是可见的。如果您不喜欢默认的15分钟间隔，可以设置`scheduledPostMargin`。                                                                         |

#### 新文章

`blog/` 文件夹中放的就是你的文章，用一般的 `MarkDown` 格式编写即可，注意里面的 `frontmatter`，不同的主题可能有不同的 `frontmatter` 规则，详见主题仓库的 `README.md`。

下面是 [**AstroPaper**](https://github.com/satnaing/astro-paper) 的 `frontmatter` 规则：

| 属性               | 描述                                                                                      | 备注                                        |
| ------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------- |
| **_title_**        | 文章的标题。 (h1)                                                                         | 必填<sup>\*</sup>                           |
| **_description_**  | 文章的描述。用于文章摘要和文章的站点描述。                                                | 必填<sup>\*</sup>                           |
| **_pubDatetime_**  | 发布的日期时间，使用 ISO 8601 格式。                                                       | 必填<sup>\*</sup>                           |
| **_modDatetime_**  | 修改的日期时间，使用 ISO 8601 格式。 （仅在博客文章修改时添加此属性）                      | 可选                                        |
| **_author_**       | 文章的作者。                                                                             | 默认 = SITE.author                         |
| **_slug_**         | 文章的Slug。此字段是可选的，但不能是空字符串。 (slug: ""❌)                              | 默认 = slugified文件名                     |
| **_featured_**     | 是否在首页的特色部分显示此文章                                                            | 默认 = false                               |
| **_draft_**        | 将此文章标记为'未发布'。                                                                 | 默认 = false                               |
| **_tags_**         | 此文章的相关关键词。以数组 yaml 格式编写。                                               | 默认 = others                              |
| **_ogImage_**      | 文章的OG图像。对于社交媒体分享和SEO很有用。                                             | 默认 = SITE.ogImage 或生成的OG图像         |
| **_canonicalURL_** | 规范的URL（绝对路径），以防文章已经存在于其他来源。                                     | 默认 = `Astro.site` + `Astro.url.pathname` |

## 部署你的博客项目

随便找一个托管平台部署即可，这里使用 `Vercel` 。
### 将你的项目托管至 GitHub

这个不用多说了吧：

```bash
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin 你的仓库地址
git push -u origin main
```

### 托管 Vercel

1. 进入 [Vercel](https://vercel.com/) 然后注册一个账号；
2. 新建一个项目；
	![](https://saroprock.oss-cn-hangzhou.aliyuncs.com/img/97775e103ec12b1948f80056fac26354.png)
3. 选择你刚刚创建的仓库（这里拿之前的举例子）；
	![](https://saroprock.oss-cn-hangzhou.aliyuncs.com/img/523d70223b1e6415b5a6c3d64e786ef9.png)
4. 点击 `Deploy`；
5. 看到满屏的烟花了吗？你成功了！
	![](https://saroprock.oss-cn-hangzhou.aliyuncs.com/img/3a044d73989b13aecd6758293ab9f0d9.png)

## 可能遇到的问题

1. **克隆项目时报错了**：
	
	这可能是 npm 镜像的问题，推荐使用官方镜像 + 使用魔法。
	
	>~~博主之前就是用了其他镜像导致祭了~~。

```bash
npm config set registry https://registry.npmjs.org/
```
2. **项目自己就报错了**：
	
	因为 Astro 的博客就是一个独立的项目：
	
	所以这个很难有一个通用的解法，下面是可能的问题：
	
	- 启用了作者的实验性内容（我就遇到过）；
	- 文章格式不符合项目要求或者文件路径错误；
	- ……
3. **本地没问题，部署报错了**：
	
	看看 `pnpm-lock.yaml` 和 `package.json` 有没有问题。
	
4. 其他（待添加）
## 尾声——我为什么选择 Astro

搭建个人博客有很多种途径，作者本人（我）曾在此吃了不少苦头。刚开始我买了云服务器准备使用 WordPress 搭建网站，结果发现这对服务器的要求太高了，WP 还会出一些奇怪的 BUG （比如某一个重要 .js 突然祭了，就写不了文章了）。于是乎，我找到了成本更低也更快捷的方法——Hexo。它拥有庞大的社区，解决方案也很成熟，很适合我这种没有基础的小白。问题就是，单从我个人体验来说，Hexo 并不像它简介说的一样快速，它太臃肿了，尤其是对于某些主题来说，东西太多太杂，资源浪费严重。如果你曾使用[PageSpeed Insights (web.dev)](https://pagespeed.web.dev/analysis/https-old-saroprock-com/hf4ci40qpw?hl=en&form_factor=mobile)测试过 Hexo 站点，会发现它真的慢……

下面是用 Butterfly 搭建的一个 Hexo 站点，仅有两篇文章：

![](https://saroprock.oss-cn-hangzhou.aliyuncs.com/img/0baf905c14088e62e3ba11b9eff51bbd.png)

我的老博客：

![](https://saroprock.oss-cn-hangzhou.aliyuncs.com/img/623cd59dc2400922b54af34b3ecce512.png)

更不用说其他的了……

![](https://saroprock.oss-cn-hangzhou.aliyuncs.com/img/fc5bd25a6a6b47a6ad0057d8b08b8533.png)

而下面是我现在的博客：

![](https://saroprock.oss-cn-hangzhou.aliyuncs.com/img/b455bc18eb247c4822f8c5408269e979.png)

就我个人而言，Astro 是一个优于 Hexo 的替代品，那么我为什么不用 Astro 呢？