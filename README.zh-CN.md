# 🧊 Frosti

**一个简洁、优雅、快速的静态博客模板！使用 [Astro](https://astro.build/) 开发！**

[**🖥️ Frosti Demo**](https://frosti.saroprock.com)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;[**🌏 中文 README**](https://github.com/EveSunMaple/Frosti/blob/main/README.zh-CN.md)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;[**❤️My Blog**](https://www.saroprock.com)

> [!NOTE]
> 更好的阅读体验请前往 -> https://frosti.saroprock.com

## 🖥️ 预览

![view](https://frosti.saroprock.com/view.png)

## ⏲️ 性能

![speed](./400-lighthouse.png)
![speed](./400.png)

## ✨ 特点

- ✅ 灯塔 400
- ✅ 视图过渡动画
- ✅ 文章目录支持
- ✅ 你可以搜索你的文章
- ✅ **白天** / **黑夜** 模式可用
- ✅ 为丰富文章内容提供的各种组件
  - 多样的 Alert
  - 代码框复制按钮
  - 更多 [daisyUI](https://daisyui.com/) 支持的内容……
- ✅ 为丰富页面内容提供的各种组件
  - 时间线组件
  - 友链卡片组件
- ✅ 使用 [Waline](https://waline.js.org/) 搭建的评论系统
- ✅ 使用 [Tailwind CSS](https://tailwindcss.com/) 与 [daisyUI](https://daisyui.com/) 构建的漂亮页面

> [!NOTE]
> 评论系统需自己配置，详见 [Waline](https://waline.js.org/) 更改 `src\components\Comment.astro`

## 🚀 项目结构

```sh
\Frosti
├── 400.png
├── astro.config.mjs
├── categories.txt
├── CHANGELOG.md
├── LICENSE
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── public
|  ├── favicon.ico
|  ├── favicon.svg
|  ├── fonts
|  |  └── CascadiaCode.woff2
|  ├── home.webp
|  ├── profile.webp
|  └── view.png
├── README.md
├── src
|  ├── components
|  |  ├── BaseCard.astro
|  |  ├── BaseHead.astro
|  |  ├── blog
|  |  |  ├── error.astro
|  |  |  ├── info.astro
|  |  |  ├── success.astro
|  |  |  └── warning.astro
|  |  ├── Comment.astro
|  |  ├── Content.astro
|  |  ├── EnvelopeCard.astro
|  |  ├── Footer.astro
|  |  ├── FormattedDate.astro
|  |  ├── Header.astro
|  |  ├── HeaderMenu.astro
|  |  ├── License.astro
|  |  ├── page
|  |  |  ├── LinkCard.astro
|  |  |  ├── LinkThere.astro
|  |  |  └── TimeLine.astro
|  |  ├── ProfileCard.astro
|  |  ├── ProfileCardFooter.astro
|  |  ├── ProfileCardMenu.astro
|  |  ├── ProjectCard.astro
|  |  ├── ProjectJS.astro
|  |  └── ThemeIcon.astro
|  ├── consts.ts
|  ├── content
|  |  ├── blog
|  |  |  ├── markdown-style-guide.md
|  |  |  └── using-mdx.mdx
|  |  └── config.ts
|  ├── env.d.ts
|  ├── layouts
|  |  └── BaseLayout.astro
|  ├── pages
|  |  ├── about.mdx
|  |  ├── blog
|  |  |  ├── tag
|  |  |  ├── [...page].astro
|  |  |  └── [...slug].astro
|  |  ├── friend.mdx
|  |  ├── frosti.mdx
|  |  ├── index.mdx
|  |  ├── project.mdx
|  |  └── rss.xml.js
|  ├── scripts
|  |  ├── copybutton.mjs
|  |  └── time.mjs
|  └── styles
|     ├── global.scss
|     └── waline.scss
├── tailwind.config.js
└── tsconfig.json
```

## ✒️ 文章信息

|    名称     |   含义   | 是否必要 |
| :---------: | :------: | :------: |
|    title    | 文章标题 |    是    |
| description | 文章简介 |    是    |
|   pubDate   | 文章日期 |    是    |
|    image    | 文章封面 |    否    |
|    tags     | 文章标签 |    否    |
|    badge    | 文章徽标 |    否    |

## ⬇️ 使用方法

通过将 `--template` 参数传递给 `create astro` 命令来使用 Frosti ！

```sh
npm create astro@latest -- --template EveSunMaple/Frosti
```

## 🎯 计划

- [x] 添加目录(已做好但没有写 CSS ) ~~(Jul 13 2024)~~
- [x] 添加时间线组件 ~~(Apr 21, 2024)~~
- [x] 添加友链组件 ~~(Apr 21, 2024)~~

## 👀 问题

- [x] ~~`global.css` 过于混乱~~
- [x] ~~**白天** / **黑夜** 模式目前无法实现缓动~~ `足够了🛠️`
- [x] ~~网站评分还没有到达 400 分~~ `已经达成✨`

## 🎉 感谢

@[Saicaca](https://github.com/saicaca) 他的启迪是我制作此主题的主要原因

@[WRXinYue](https://github.com/WRXinYue) 在我前期入门时帮助了我很多
