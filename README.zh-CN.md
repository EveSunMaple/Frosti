# 🧊 Frosti

**一个简洁、优雅、快速的静态博客模板！🚀 使用 [Astro](https://astro.build/) 开发！**

[**🖥️ Frosti Demo**](https://frosti.saroprock.com)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;[**🌏 英语 README (English README)**](https://github.com/EveSunMaple/Frosti/blob/main/README.md)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;[**❤️My Blog**](https://www.saroprock.com)

> [!NOTE]
> 推荐先查看此主题的预览 -> https://frosti.saroprock.com

## 🖥️ 预览

![view](./Frosti_1.png)

## ⏲️ 性能

![speed](./400-lighthouse.png)

## ✨ 特点

- [x] 极速的访问速度与优秀的 SEO
- [x] 视图过渡动画（使用 Swup）
- [x] 侧边栏集成
  - 在 `consts.ts` 定义侧边导航栏的内容
  - 底部社交信息卡片
  - 下方主题切换与返回顶部按钮
  - 常驻侧边文章目录
- [x] 你可以搜索你的文章（使用 pagefind）
- [x] **白天** / **黑夜** 模式可用
- [x] 为丰富博客内容提供的各种组件
  - 折叠页面
  - 链接卡片
  - 时间线组件
  - 多样的 Alert
  - 代码框复制按钮
  - 两张图片的对比
  - 文末版权信息声明
- [x] 使用 [Waline](https://waline.js.org/) 搭建的评论系统
- [x] 使用 [Tailwind CSS](https://tailwindcss.com/) 与 [daisyUI](https://daisyui.com/) 构建自适应页面
  - 整个博客具有在电脑、平板、手机模式下的样式
  - 卡片会根据你现在的设备改变布局
  - 主题切换按钮会自动匹配主题
- 🛠️ 博客易上手
  - 相当简单容易的部署和使用方式
  - 可以在 `consts.ts` 自定义您博客的内容

> [!IMPORTANT]
> 评论系统需自己配置，详见 [Waline](https://waline.js.org/) 更改 `src\components\Comment.astro`

## ✒️ 文章信息

|    名称     |   含义   | 是否必要 |
| :---------: | :------: | :------: |
|    title    | 文章标题 |    是    |
| description | 文章简介 |    是    |
|   pubDate   | 文章日期 |    是    |
|    image    | 文章封面 |    否    |
| categories  | 文章分类 |    否    |
|    tags     | 文章标签 |    否    |
|    badge    | 文章徽标 |    否    |

## ⬇️ 使用方法

在尝试通过 Frosti 搭建属于你自己的博客之前，应该先尝试初步了解以下内容

- Node.js 项目的基本知识
- 静态站点部署的方式
- Web 前端的基本概念和实现方式
- 网络服务运维的基本方法

Frosti 是一个相当简洁、优雅的静态博客模板，但它的使用需要一定的 Web 前端和计算机基础知识。如果你完全没有相关经验，可能会在使用过程中遇到一些困难。因此，我们建议先通过学习掌握一些基本的编程和前端开发知识，这样可以更好地理解和利用 Frosti。

> [!IMPORTANT]
> Frosti 使用pnpm作为包管理器，如果你没有安装pnpm，请先安装pnpm

1. 安装pnpm包管理器

```sh
npm i -g pnpm
```

2. 克隆项目
```sh
git clone --depth 1 https://github.com/EveSunMaple/Frosti.git Frosti
```
3. 进入项目文件夹
```sh
cd Frosti
```
4. 安装依赖
```sh
pnpm i
```

5. 调试、运行项目
```sh
pnpm run dev # 启动调试服务器

pnpm run build # 构建项目为静态文件
```

> [!NOTE]
> Frosti 默认通过 pnpm build 构建，如果出现报错，请运行 `pnpm update`

> [!TIP]
> 您当然也可以使用其他方式来部署 Frosti，比如 Vercel、Netlify 等。但是您需要掌握这些服务的基本使用方法。
> [Astro支持的deploy方式](https://docs.astro.build/zh-cn/guides/deploy/)

## 🎯 计划

- [ ] 尝试接入无头 cms
- [ ] 修复已知的样式错误
- [ ] 更多……

## 👀 问题

新时代新风气，我们遇到了一个人工智能蓬勃发展的时代，所以如果当您在部署时遇到了问题，请先询问 `Bing AI`, `ChatGPT` 等人工智能，它们会帮助你解决大部分问题。

当然如果你有任何问题或建议，可以通过提交 Issues 来反馈或同开发者交流！

开发新手或者不熟悉的同学在群内提问或新开Issue提问前，请先阅读[【提问的智慧】](https://github.com/tvvocold/How-To-Ask-Questions-The-Smart-Way)，这样可以更好的帮助你更好的提出问题，也能方便开发者定位问题以及解决问题。

## 🎉 感谢

@[Saicaca](https://github.com/saicaca) 他的启迪是我制作此主题的主要原因

@[WRXinYue](https://github.com/WRXinYue) 在我前期入门时帮助了我很多
