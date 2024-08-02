# 🧊 Frosti

**一个简洁、优雅、快速的静态博客模板！🚀 使用 [Astro](https://astro.build/) 开发！**

[**🖥️ Frosti Demo**](https://frosti.saroprock.com)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;[**🌏 中文 README**](https://github.com/EveSunMaple/Frosti/blob/main/README.zh-CN.md)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;[**❤️My Blog**](https://www.saroprock.com)

> [!NOTE]
> 推荐先查看此主题的预览 -> https://frosti.saroprock.com

## 🖥️ 预览

![view](https://frosti.saroprock.com/display/Frosti_1.png)
![view](https://frosti.saroprock.com/display/Frosti_2.png)
![view](https://frosti.saroprock.com/display/Frosti_3.png)
![view](https://frosti.saroprock.com/display/Frosti_4.png)

## ⏲️ 性能

![speed](./400-lighthouse.png)

## ✨ 特点

- ✅ 极速的访问速度与优秀的 SEO
- ✅ 视图过渡动画（使用 ViewTransitionsAPI）
- ✅ 侧边栏集成
  - 在 `consts.ts` 定义侧边导航栏的内容
  - 底部社交信息卡片
  - 下方主题切换与返回顶部按钮
  - 常驻侧边文章目录
- ✅ 你可以搜索你的文章（使用 pagefind）
- ✅ **白天** / **黑夜** 模式可用
- ✅ 为丰富博客内容提供的各种组件
  - 折叠页面
  - 链接卡片
  - 时间线组件
  - 多样的 Alert
  - 代码框复制按钮
  - 两张图片的对比
  - 文末版权信息声明
- ✅ 使用 [Waline](https://waline.js.org/) 搭建的评论系统
- ✅ 使用 [Tailwind CSS](https://tailwindcss.com/) 与 [daisyUI](https://daisyui.com/) 构建自适应页面
  - 整个博客具有在电脑、平板、手机模式下的样式
  - 卡片会根据你现在的设备改变布局
  - 主题切换按钮会自动匹配主题
- 🛠️ 博客易上手
  - 安装只需要一行命令
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

> [!IMPORTANT]
> 不推荐直接克隆本仓库来构建博客！

通过将 `--template` 参数传递给 `create astro` 命令来使用 Frosti ！

```sh
npm create astro@latest -- --template EveSunMaple/Frosti
```

> [!NOTE]
> Frosti 默认通过 pnpm build 构建，如果出现报错，请运行 `pnpm update`

## 🎯 计划

- [ ] 尝试接入无头 cms
- [ ] 修复已知的样式错误
- [ ] 更多……

## 👀 问题

如果发现任何问题，请提交 Issue！

## 🎉 感谢

@[Saicaca](https://github.com/saicaca) 他的启迪是我制作此主题的主要原因

@[WRXinYue](https://github.com/WRXinYue) 在我前期入门时帮助了我很多
