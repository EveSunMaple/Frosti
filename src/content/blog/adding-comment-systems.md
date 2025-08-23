---
title: Adding Comment Systems to Frosti
description: A comprehensive guide on how to integrate the Waline comment system into your Frosti blog
pubDate: 04 15 2025
image: /image/image4.jpg
categories:
  - Documentation
tags:
  - Frosti
  - Comments
  - Waline
  - Astro
---

## Introduction

One of the essential features of any blog is the ability for readers to engage with your content through comments. While Frosti provides an excellent foundation for your Astro-based blog, adding a comment system requires a few additional steps. This guide will walk you through integrating the Waline comment system into your Frosti blog.

Static sites like those built with Astro don't have built-in comment systems since they lack server-side processing. However, we can use third-party comment services that handle the backend for us, while we integrate their frontend components into our site.

## Creating Comment Components in Astro

Before diving into a specific comment system, let's understand how to create and use components in Astro. We'll create a reusable component that can be easily added to any page.

### Component Structure

We'll create our comment component in the `src/components/comments` directory. First, let's ensure this directory exists:

```bash
mkdir -p src/components/comments
```

## Integrating Waline

[Waline](https://waline.js.org/) is a simple, safe, and feature-rich comment system with backend and frontend separation. It is highly customizable and easy to set up.

### Step 1: Set Up Waline Backend

Before adding Waline to your site, you need to set up the backend:

1. Create a LeanCloud application to store your comments.
2. Deploy the Waline server to Vercel or another hosting platform.

Follow the [official Waline guide](https://waline.js.org/guide/get-started/) to set up your backend service. After deploying, you'll get a server URL that you will need for the frontend component.

### Step 2: Create the Waline Component

Let's create a reusable Waline component:

```bash
touch src/components/comments/Waline.astro
```

Add the following code to this component:

```astro
---
interface Props {
  serverURL: string;
  lang?: string;
  dark?: string;
  emoji?: string[];
  meta?: string[];
  requiredMeta?: string[];
  reaction?: boolean;
  pageview?: boolean;
}

const {
  serverURL,
  lang = "en",
  dark = "html[data-theme-type='dark']",
  emoji = ["https://unpkg.com/@waline/emojis@1.1.0/weibo", "https://unpkg.com/@waline/emojis@1.1.0/bilibili"],
  meta = ["nick", "mail", "link"],
  requiredMeta = [],
  reaction = false,
  pageview = false,
} = Astro.props;
---

<div id="waline-container"></div>

<link rel="stylesheet" href="https://unpkg.com/@waline/client@v3/dist/waline.css" />

<script
  type="module"
  define:vars={{
    serverURL,
    lang,
    dark,
    emoji,
    meta,
    requiredMeta,
    reaction,
    pageview,
  }}
>
  import { init } from "https://unpkg.com/@waline/client@v3/dist/waline.js";

  async function initWaline() {
    const container = document.querySelector("#waline-container");
    if (!container) return;

    init({
      el: "#waline-container",
      serverURL,
      path: location.pathname,
      lang,
      dark,
      emoji,
      meta,
      requiredMeta,
      reaction,
      pageview,
    });
  }

  document.addEventListener("astro:page-load", () => {
    initWaline();
  });

  if (document.readyState !== "loading") {
    initWaline();
  } else {
    document.addEventListener("DOMContentLoaded", initWaline);
  }
</script>

<style>
  #waline-container {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
</style>
```

### Step 3: Using the Waline Component

You can now use the Waline component in your Astro pages or layouts. Here's how to add it to your blog post template:

```astro
---
// In your blog post layout file
import Waline from "../../components/comments/Waline.astro";
// Other imports and frontmatter...
---

<!-- Your blog post content -->
<article>
  <slot />
</article>

<!-- Add the comment section -->
<section class="comments">
  <h2>Comments</h2>
  <Waline serverURL="https://your-waline-server.vercel.app" />
</section>
```

Replace `"https://your-waline-server.vercel.app"` with your actual Waline server URL.

## Troubleshooting

### Common Issues

- **Comments not displaying:** Make sure your `serverURL` is correctly set and accessible.
- **CSS issues:** Ensure that the Waline stylesheet is properly loaded.
- **Deployment issues:** If your server is on Vercel, check the environment variables and deployment logs.
