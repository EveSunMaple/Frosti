# 🧊 Frosti

**A clean, elegant, and fast static blog template! 🚀 Developed with [Astro](https://astro.build/)!**

[**🖥️ Frosti Demo**](https://frosti.saroprock.com)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;[**🌏 Chinese README（中文 README）**](https://github.com/EveSunMaple/Frosti/blob/main/README.zh-CN.md)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;[**❤️ My Blog**](https://www.saroprock.com)

> [!NOTE]
> It is recommended to check out the theme preview first -> https://frosti.saroprock.com

## 🖥️ Preview

![view](./Frosti_1.png)

## ⏲️ Performance

![speed](./400-lighthouse.png)

## ✨ Features

- [x] Lightning-fast access speed and excellent SEO
- [x] View transition animations (using Swup)
- [x] Sidebar integration
  - Define sidebar content in `consts.ts`
  - Social info card at the bottom
  - Theme switch and back-to-top button at the bottom
  - Persistent sidebar article directory
- [x] Search your articles (using pagefind)
- [x] **Day** / **Night** mode available
- [x] Various components to enrich your blog content
  - Collapsible pages
  - Link cards
  - Timeline components
  - Various Alerts
  - Code block copy button
  - Image comparison
  - End-of-article copyright information
- [x] Comment system built with [Waline](https://waline.js.org/)
- [x] Responsive pages built with [Tailwind CSS](https://tailwindcss.com/) and [daisyUI](https://daisyui.com/)
  - The entire blog is styled for desktop, tablet, and mobile modes
  - Cards adapt their layout according to your device
  - Theme switch button automatically matches the theme
- 🛠️ Easy to use blog
  - Simple and easy deployment and usage
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

Before trying to set up your own blog with Frosti, you should have a basic understanding of the following:

- Basic knowledge of Node.js projects
- Methods of deploying static sites
- Basic concepts and implementation of web frontend
- Basic methods of network service operation and maintenance

Frosti is a rather simple and elegant static blog template, but using it requires some basic knowledge of web frontend and computer science. If you have no related experience, you might encounter some difficulties during usage. Therefore, we suggest learning some basic programming and frontend development knowledge first, which will help you better understand and utilize Frosti.

> [!IMPORTANT]
> Frosti uses pnpm as the package manager. If you haven't installed pnpm, please install it first.

1. Install the pnpm package manager

```sh
npm i -g pnpm
```

2. Clone the project
```sh
git clone --depth 1 https://github.com/EveSunMaple/Frosti.git Frosti
```
3. Enter the project folder
```sh
cd Frosti
```
4. Install dependencies
```sh
pnpm i
```

5. Debug and run the project
```sh
pnpm run dev # Start the debug server

pnpm run build # Build the project into static files
```

> [!NOTE]
> Frosti defaults to building with `pnpm build`. If an error occurs, please run `pnpm update`.

> [!TIP]
> You can also deploy Frosti using other methods like Vercel, Netlify, etc. However, you need to have a basic understanding of these services.
> [Astro-supported deployment methods](https://docs.astro.build/en/guides/deploy/)

## 🎯 Plans

- [ ] Try integrating headless CMS
- [ ] Fix known style bugs
- [ ] More...

## 👀 Issues

In this new era of AI development, if you encounter problems during deployment, please consult `Bing AI`, `ChatGPT`, etc. first, as they can help you solve most issues.

Of course, if you have any questions or suggestions, you can submit issues to provide feedback or communicate with the developer!

For beginners or those unfamiliar with the process, before asking questions in a group or opening a new issue, please read [**How to Ask Questions the Smart Way**](https://github.com/tvvocold/How-To-Ask-Questions-The-Smart-Way) first. This will help you ask questions more effectively and make it easier for the developer to identify and solve the problem.

## 🎉 Thanks

@[Saicaca](https://github.com/saicaca) His inspiration was the main reason I created this theme

@[WRXinYue](https://github.com/WRXinYue) Helped me a lot when I was getting started
