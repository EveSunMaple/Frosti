/* empty css                                */import{a as t,r as e,b as a,m as s}from"../chunks/astro/server_Cr3L-o0H.mjs";import{b as o,a as r}from"../chunks/BaseLayout_CQzFYZn-.mjs";import{$ as i}from"../chunks/MainCard_DWu1rACW.mjs";import{$ as n}from"../chunks/GitHubStats_DD-FCCor.mjs";import{$ as l,a as c}from"../chunks/CardGroup_BwAz8DNY.mjs";import{g as d}from"../chunks/_astro_content_Cp5fOLG1.mjs";export{renderers}from"../renderers.mjs";const p=t((async(t,p,u)=>{const m=(await d("blog")).filter((t=>!t.data.draft)),g=m.filter((t=>"Pin"===t.data.badge)),b=m.filter((t=>"Pin"!==t.data.badge));g.sort(((t,e)=>e.data.pubDate.valueOf()-t.data.pubDate.valueOf())),b.sort(((t,e)=>e.data.pubDate.valueOf()-t.data.pubDate.valueOf()));const h=[...g,...b],f=h.length<3?h.length:3,x=await Promise.all(h.map((async t=>{const{remarkPluginFrontmatter:e}=await t.render();return{...t,remarkPluginFrontmatter:{readingTime:e.readingTime,totalCharCount:e.totalCharCount}}})));return a`${e(t,"BaseLayout",o,{title:"Home"},{default:async t=>a` ${e(t,"MainCard",i,{image:"/bg3.jpg",title:"主页",description:"Youngestar 的后院: 希望是一个静悄悄但有意思的地方🌻",textOverlay:"HOME",infoIcon:"lucide:info"},{default:async t=>a` ${s()}<div class="space-y-8"> <!-- Hero Section --> <section class="py-6"> <div class="flex flex-col items-center text-center"> <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mt-1">
🏕️ 后院
</h1> <p class="text-md text-base-content/80 max-w-3xl mb-8">
Youngestar 的个人博客, 用于记录一些技术见解和日常琐事<br>
(如果看到我很久没更新请踢我🎈)
</p> <div class="flex flex-wrap gap-4 justify-center"> <a href="/blog" class="btn btn-primary gap-2 btn-shine-effect"> ${e(t,"Icon",r,{name:"lucide:book-open",class:"w-5 h-5"})} <span>探索一下</span> </a> <!-- 后续更新请替换为博客链接 --> <a href="https://github.com/youngestar" target="_blank" class="btn btn-outline gap-2"> ${e(t,"Icon",r,{name:"lucide:github",class:"w-5 h-5"})} <span>看看 GitHub</span> </a> </div> </div> </section> <!-- Quick Start --> <section class="py-2"> <h2 class="text-2xl font-bold mb-6 flex items-center gap-2"> ${e(t,"Icon",r,{name:"lucide:rocket",class:"w-6 h-6 text-primary"})} <span>文章推荐</span> </h2> ${e(t,"CardGroup",l,{cols:"1",gap:"6"},{default:async t=>a`${x.slice(0,f).map((s=>a`${e(t,"PostCard",c,{title:s.data.title,image:s.data.image,description:s.data.description,url:"/blog/"+s.slug,pubDate:s.data.pubDate,badge:s.data.badge,categories:s.data.categories,tags:s.data.tags,word:s.remarkPluginFrontmatter.totalCharCount,time:s.remarkPluginFrontmatter.readingTime})}`))}`})} ${3===f?a`<div class="flex gap-4 justify-center mt-10"> <a href="/blog" class="btn btn-primary gap-2 btn-shine-effect"> ${e(t,"Icon",r,{name:"lucide:book-open",class:"w-5 h-5"})} <span>更多文章</span> </a> </div>`:a`<section></section>`} </section> <!-- Features Section
      <section class="py-6">
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
          <Icon name="lucide:sparkles" class="w-6 h-6 text-primary" />
          <span>Features</span>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            title="Responsive Design"
            description="Fully responsive design that looks great on all devices from mobile to desktop."
            icon="lucide:smartphone"
            color="oklch(0.7 0.2 30)"
          />

          <FeatureCard
            title="Dark/Light Mode"
            description="Toggle between light and dark themes with a beautiful transition effect."
            icon="lucide:moon"
            color="oklch(0.65 0.2 280)"
          />

          <FeatureCard
            title="MDX Support"
            description="Write your content in MDX with full support for React components and JSX."
            icon="lucide:file-code"
            color="oklch(0.6 0.2 160)"
          />

          <FeatureCard
            title="SEO Optimized"
            description="Built-in SEO optimization with meta tags, OpenGraph, and JSON-LD."
            icon="lucide:search"
            color="oklch(0.6 0.2 200)"
          />

          <FeatureCard
            title="Fast Performance"
            description="Optimized for speed with lazy loading, code splitting, and minimal JavaScript."
            icon="lucide:zap"
            color="oklch(0.8 0.2 80)"
          />

          <FeatureCard
            title="Customizable"
            description="Easily customize the theme to match your personal brand and preferences."
            icon="lucide:palette"
            color="oklch(0.7 0.2 10)"
          />
        </div>
      </section> --> </div>  <section class="py-6"> <h2 class="text-2xl font-bold mb-6 flex items-center gap-2"> ${e(t,"Icon",r,{name:"lucide:github",class:"w-6 h-6 text-primary"})} <span>github 主页</span> </h2> ${e(t,"GitHubStats",n,{username:"Youngestar",showLanguages:!0,showContributors:!0})} </section> `})} `})}`}),"D:/我滴作业/blog/Frosti/src/pages/index.astro",void 0),u=Object.freeze(Object.defineProperty({__proto__:null,default:p,file:"D:/我滴作业/blog/Frosti/src/pages/index.astro",url:""},Symbol.toStringTag,{value:"Module"})),m=()=>u;export{m as page};
