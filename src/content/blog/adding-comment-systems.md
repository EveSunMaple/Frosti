---
title: Adding Comment Systems to Frosti
description: A comprehensive guide on how to integrate Twikoo and Waline comment systems into your Frosti blog
pubDate: 04 15 2025
image: /image/image4.jpg
categories:
  - tech
tags:
  - Frosti
  - Comments
  - Twikoo
  - Waline
  - Astro
---

## Introduction

One of the essential features of any blog is the ability for readers to engage with your content through comments. While Frosti provides an excellent foundation for your Astro-based blog, adding a comment system requires a few additional steps. This guide will walk you through integrating popular comment systems like Twikoo and Waline into your Frosti blog.

Static sites like those built with Astro don't have built-in comment systems since they lack server-side processing. However, we can use third-party comment services that handle the backend for us, while we integrate their frontend components into our site.

## Creating Comment Components in Astro

Before diving into specific comment systems, let's understand how to create and use components in Astro. We'll create reusable components for each comment system that can be easily added to any page.

### Component Structure

We'll create our comment components in the `src/components/comments` directory. First, let's make sure this directory exists:

```bash
mkdir -p src/components/comments
```

## Integrating Twikoo

[Twikoo](https://twikoo.js.org/) is a simple, safe comment system that supports Markdown and does not require user login. It's easy to set up and can be deployed on various platforms.

### Step 1: Set Up Twikoo Backend

Before integrating the frontend component, you need to set up the Twikoo backend. You can deploy it on:

1. **Tencent CloudBase** (recommended for users in Asia)
2. **Vercel** (recommended for global access)

Follow the [official Twikoo deployment guide](https://twikoo.js.org/en/quick-start.html) to set up your backend.

Once deployed, you'll get an environment ID (`envId`), which you'll need for the frontend integration.

### Step 2: Create the Twikoo Component

Let's create a reusable Twikoo component:

```bash
touch src/components/comments/Twikoo.astro
```

Now, let's add the code to this component:

```astro
---
// Props interface for the component
interface Props {
  envId: string; // Your Twikoo environment ID
  region?: string; // Optional region (default: ap-shanghai)
  path?: string; // Optional custom path for comments
  lang?: string; // Optional language setting
}

// Destructure props with defaults
const { envId, region = "ap-shanghai", path = Astro.url.pathname, lang = "en" } = Astro.props;
---

<div id="twikoo-container"></div>

<script define:vars={{ envId, region, path, lang }}>
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      // Dynamically import Twikoo script
      const twikooScript = document.createElement("script");
      twikooScript.src = "https://cdn.jsdelivr.net/npm/twikoo@1.6.42/dist/twikoo.all.min.js";
      twikooScript.async = true;

      twikooScript.onload = () => {
        twikoo.init({
          envId: envId,
          el: "#twikoo-container",
          region: region,
          path: path,
          lang: lang,
        });
      };

      document.head.appendChild(twikooScript);
    } catch (error) {
      console.error("Failed to load Twikoo:", error);
    }
  });
</script>

<style>
  #twikoo-container {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
</style>
```

### Step 3: Using the Twikoo Component

You can now use the Twikoo component in any of your Astro pages or layouts. Here's how to add it to your blog post template:

```astro
---
// In your blog post layout file
import Twikoo from "../../components/comments/Twikoo.astro";
// Other imports and frontmatter...
---

<!-- Your blog post content -->
<article>
  <slot />
</article>

<!-- Add the comment section -->
<section class="comments">
  <h2>Comments</h2>
  <Twikoo envId="your-environment-id" />
</section>
```

Replace `"your-environment-id"` with your actual Twikoo environment ID.

## Integrating Waline

[Waline](https://waline.js.org/) is a simple, safe comment system with backend and frontend separation. It's feature-rich and highly customizable.

### Step 1: Set Up Waline Backend

Before adding Waline to your site, you need to set up the backend:

1. Create a LeanCloud application to store your comments
2. Deploy the Waline server to Vercel or other platforms

Follow the [official Waline guide](https://waline.js.org/guide/get-started/) to set up your backend service. After deploying, you'll get a server URL that you'll need for the frontend component.

### Step 2: Create the Waline Component

Let's create a reusable Waline component:

```bash
touch src/components/comments/Waline.astro
```

Now, let's add the code to this component:

```astro
---
// Props interface for the component
interface Props {
  serverURL: string; // Your Waline server URL
  path?: string; // Optional custom path for comments
  lang?: string; // Optional language setting
  dark?: string; // Optional dark mode CSS selector
  emoji?: string[]; // Optional emoji arrays
  meta?: string[]; // Optional comment information to show
  requiredMeta?: string[]; // Optional required metadata
  reaction?: boolean; // Enable article reactions
  pageview?: boolean; // Enable pageview statistics
}

// Destructure props with defaults
const {
  serverURL,
  path = Astro.url.pathname,
  lang = "en",
  dark = "html.dark",
  emoji = ["https://unpkg.com/@waline/emojis@1.1.0/weibo", "https://unpkg.com/@waline/emojis@1.1.0/bilibili"],
  meta = ["nick", "mail", "link"],
  requiredMeta = [],
  reaction = false,
  pageview = false,
} = Astro.props;
---

<div id="waline-container"></div>

<script
  define:vars={{
    serverURL,
    path,
    lang,
    dark,
    emoji,
    meta,
    requiredMeta,
    reaction,
    pageview,
  }}
>
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      // Load Waline CSS
      const walineCSS = document.createElement("link");
      walineCSS.rel = "stylesheet";
      walineCSS.href = "https://unpkg.com/@waline/client@v3/dist/waline.css";
      document.head.appendChild(walineCSS);

      // Load Waline JS
      const walineScript = document.createElement("script");
      walineScript.src = "https://unpkg.com/@waline/client@v3/dist/waline.js";
      walineScript.async = true;

      walineScript.onload = () => {
        // Initialize Waline
        Waline.init({
          el: "#waline-container",
          serverURL: serverURL,
          path: path,
          lang: lang,
          dark: dark,
          emoji: emoji,
          meta: meta,
          requiredMeta: requiredMeta,
          reaction: reaction,
          pageview: pageview,
        });
      };

      document.head.appendChild(walineScript);
    } catch (error) {
      console.error("Failed to load Waline:", error);
    }
  });
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

## Adding Comment System Selection

To make your blog more flexible, you might want to allow users to choose their preferred comment system through configuration. Here's a simple approach to achieve this:

### Step 1: Create a Configuration File

First, create a configuration file for your blog:

```bash
touch src/config.ts
```

Add comment system configuration:

```typescript
export const siteConfig = {
  // Other site configuration...
  comments: {
    // Which comment system to use: 'twikoo', 'waline', or 'none'
    provider: "twikoo",

    // Twikoo configuration
    twikoo: {
      envId: "your-environment-id",
      region: "ap-shanghai"
    },

    // Waline configuration
    waline: {
      serverURL: "https://your-waline-server.vercel.app"
    }
  }
};
```

### Step 2: Create a CommentSystem Component

Now, create a component that will conditionally render the selected comment system:

```bash
touch src/components/comments/CommentSystem.astro
```

Add the following code:

```astro
---
import { siteConfig } from "../../config";
import Twikoo from "./Twikoo.astro";
import Waline from "./Waline.astro";

// Get comment system configuration
const { provider, twikoo, waline } = siteConfig.comments;
---

<div class="comments-container">
  <h2>Comments</h2>

  {provider === "twikoo" && <Twikoo envId={twikoo.envId} region={twikoo.region} />}

  {provider === "waline" && <Waline serverURL={waline.serverURL} />}

  {provider === "none" && <p>Comments are disabled for this site.</p>}
</div>

<style>
  .comments-container {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
  }
</style>
```

### Step 3: Use the CommentSystem Component

Finally, use this component in your blog post layout:

```astro
---
// In your blog post layout file
import CommentSystem from "../../components/comments/CommentSystem.astro";
// Other imports and frontmatter...
---

<!-- Your blog post content -->
<article>
  <slot />
</article>

<!-- Add the comment section -->
<CommentSystem />
```

## Troubleshooting

### Common Issues with Twikoo:

1. **Script Loading Failures**: If the Twikoo script fails to load, check your network connection and make sure the CDN is accessible.
2. **Environment ID Issues**: Double-check your environment ID to ensure it's correct.
3. **Region Errors**: If you're using Tencent CloudBase, make sure you've set the correct region.

### Common Issues with Waline:

1. **Server URL Errors**: Make sure your Waline server URL is correct and the server is running.
2. **Database Connection Issues**: Check that your LeanCloud application is properly set up and the keys are correctly configured.
3. **Missing Required Fields**: If users can't submit comments, check if you've set required fields that users aren't filling out.

## Extending with Other Comment Systems

The approach we've taken makes it easy to add support for additional comment systems to your Frosti blog. Here's how you might add another system:

1. Create a new component for the comment system in `src/components/comments/`
2. Update the `config.ts` file to include configuration for the new system
3. Modify the `CommentSystem.astro` component to conditionally render the new system

We welcome contributions from the community to add support for other popular comment systems such as:

- Disqus
- Utterances (GitHub-based comments)
- Giscus (GitHub Discussions-based comments)
- Remark42
- CommentBox

## Conclusion

Adding a comment system to your Frosti blog enhances user engagement and creates a community around your content. In this guide, we've covered how to integrate two popular comment systems, Twikoo and Waline, providing step-by-step instructions for setting up both the backend and frontend components.

Remember that each comment system has its own strengths and considerations, so choose the one that best fits your needs and your audience's preferences.

If you've implemented another comment system for your Frosti blog, consider sharing your work with the community to help others enhance their blogs as well.

Happy blogging and engaging with your readers!
