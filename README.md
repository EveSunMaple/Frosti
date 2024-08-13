# 🧊 Frosti

**A clean, elegant, and fast static blog template! 🚀 Developed with [Astro](https://astro.build/)!**

[**🖥️ Frosti Demo**](https://frosti.saroprock.com)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;[**🌏 Chinese README**](https://github.com/EveSunMaple/Frosti/blob/main/README.zh-CN.md)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;[**❤️ My Blog**](https://www.saroprock.com)

> [!NOTE]
> It is recommended to check out the theme preview first -> https://frosti.saroprock.com

## 🖥️ Preview

![view](./Frosti_1.png)

## ⏲️ Performance

![speed](./400-lighthouse.png)

## ✨ Features

- ✅ Lightning-fast access speed and excellent SEO
- ✅ View transition animations (using Swup)
- ✅ Sidebar integration
  - Define sidebar content in `consts.ts`
  - Social info card at the bottom
  - Theme switch and back-to-top button at the bottom
  - Persistent sidebar article directory
- ✅ Search your articles (using pagefind)
- ✅ **Day** / **Night** mode available
- ✅ Various components to enrich your blog content
  - Collapsible pages
  - Link cards
  - Timeline components
  - Various Alerts
  - Code block copy button
  - Image comparison
  - End-of-article copyright information
- ✅ Comment system built with [Waline](https://waline.js.org/)
- ✅ Responsive pages built with [Tailwind CSS](https://tailwindcss.com/) and [daisyUI](https://daisyui.com/)
  - The entire blog is styled for desktop, tablet, and mobile modes
  - Cards adapt their layout according to your device
  - Theme switch button automatically matches the theme
- 🛠️ Easy to use blog
  - Installation requires only one command
  - Customize your blog content in `consts.ts`

> [!IMPORTANT]
> The comment system needs to be configured by yourself. See [Waline](https://waline.js.org/) for details. Modify `src\components\Comment.astro`

## ✒️ Article Information

|    Name     |      Meaning       | Required |
| :---------: | :----------------: | :------: |
|    title    |   Article title    |   Yes    |
| description |  Article summary   |   Yes    |
|   pubDate   |    Article date    |   Yes    |
|    image    |   Article cover    |    No    |
| categories  | Article categories |    No    |
|    tags     |    Article tags    |    No    |
|    badge    |   Article badge    |    No    |

## ⬇️ Usage

> [!IMPORTANT]
> It is not recommended to clone this repository directly to build your blog!

Use Frosti by passing the `--template` parameter to the `create astro` command!

```sh
npm create astro@latest -- --template EveSunMaple/Frosti
```

> [!NOTE]
> Frosti builds by default using pnpm. If you encounter errors, please run `pnpm update`

## 🎯 Plans

- [ ] Try integrating headless CMS
- [ ] Fix known style bugs
- [ ] More...

## 👀 Issues

If you find any problems, please submit an Issue!

## 🎉 Thanks

@[Saicaca](https://github.com/saicaca) His inspiration was the main reason I created this theme

@[WRXinYue](https://github.com/WRXinYue) Helped me a lot when I was getting started
