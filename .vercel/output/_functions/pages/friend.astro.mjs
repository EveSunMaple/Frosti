/* empty css                                */import{c as t,a,m as e,f as s,r,b as o}from"../chunks/astro/server_Cr3L-o0H.mjs";import{a as i,b as d}from"../chunks/BaseLayout_CQzFYZn-.mjs";import{$ as n}from"../chunks/MainCard_DWu1rACW.mjs";import{$ as c}from"../chunks/_astro_assets_Cenp1MQy.mjs";/* empty css                                 */export{renderers}from"../renderers.mjs";const l=t("https://frosti.saroprock.com"),p=a(((t,a,d)=>{const n=t.createAstro(l,a,d);n.self=p;const{title:m,img:u,desc:g,url:h,badge:b,target:f="_blank",icon:v="lucide:link",categories:x=[]}=n.props;return o`${e()}<div class="not-prose card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 animate-fade-in-up border border-base-200" data-astro-cid-allout54> <a${s(h,"href")}${s(f,"target")} class="card-body p-4 md:p-6"${s(`Visit ${m}: ${g}`,"aria-label")}${s("_blank"===f?"noopener noreferrer":void 0,"rel")} data-astro-cid-allout54> <div class="flex flex-col md:flex-row gap-4 items-center" data-astro-cid-allout54> <div class="w-full md:w-[120px] h-[120px] flex-shrink-0 bg-base-200 rounded-lg overflow-hidden" data-astro-cid-allout54> ${u?o`${r(t,"Image",c,{src:u,width:120,height:120,format:"webp",alt:m,loading:"lazy",class:"w-full h-full object-cover","data-astro-cid-allout54":!0})}`:o`<div class="flex items-center justify-center w-full h-full bg-gradient-to-br from-base-300 to-base-100" data-astro-cid-allout54> ${r(t,"Icon",i,{name:v,class:"w-8 h-8 text-primary opacity-80","aria-hidden":"true","data-astro-cid-allout54":!0})} </div>`} </div> <div class="flex-1 space-y-2 w-full" data-astro-cid-allout54> <div class="flex items-center gap-2 flex-wrap" data-astro-cid-allout54> <h2 class="card-title text-xl" data-astro-cid-allout54>${m}</h2> ${b&&o`<div class="badge badge-secondary badge-md font-medium" data-astro-cid-allout54>${b}</div>`} </div> ${x.length>0&&o`<div class="flex flex-wrap gap-1 my-1" data-astro-cid-allout54> ${x.map((t=>o`<span class="badge badge-outline badge-sm" data-astro-cid-allout54>${t}</span>`))} </div>`} <p class="text-base-content/80 line-clamp-2 text-sm" data-astro-cid-allout54>${g}</p> <div class="card-actions justify-end mt-2" data-astro-cid-allout54> <div class="flex items-center gap-1 text-primary hover:text-primary-focus transition-colors" data-astro-cid-allout54> <span class="text-sm font-medium" data-astro-cid-allout54>看看 ${m}</span> ${r(t,"Icon",i,{name:"lucide:external-link",class:"w-3.5 h-3.5","aria-hidden":"true","data-astro-cid-allout54":!0})} </div> </div> </div> </div> </a> </div> `}),"D:/我滴作业/blog/Frosti/src/components/mdx/LinkCard.astro",void 0),m=t("https://frosti.saroprock.com"),u=a(((t,a,d)=>{const n=t.createAstro(m,a,d);n.self=u;const{name:l,avatar:p,description:g,url:h,type:b="friend"}=n.props,{bgClass:f,iconName:v,borderClass:x}={friend:{bgClass:"bg-gradient-to-br from-primary/20 to-base-100",iconName:"lucide:users",borderClass:"border-primary/30"},tech:{bgClass:"bg-gradient-to-br from-secondary/20 to-base-100",iconName:"lucide:code-2",borderClass:"border-secondary/30"},contributor:{bgClass:"bg-gradient-to-br from-accent/20 to-base-100",iconName:"lucide:git-pull-request",borderClass:"border-accent/30"}}[b];return o`${e()}<div${s(`card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1.5 border ${x} overflow-hidden animate-fade-in-up`,"class")} data-astro-cid-qgpm3szh> <a${s(h,"href")} target="_blank" rel="noopener noreferrer" data-astro-cid-qgpm3szh> <div${s(`${f} p-4 flex flex-col items-center`,"class")} data-astro-cid-qgpm3szh> <div class="avatar mb-3" data-astro-cid-qgpm3szh> <div class="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden" data-astro-cid-qgpm3szh> ${p?o`${r(t,"Image",c,{src:p,width:64,height:64,format:"webp",alt:l,loading:"lazy",class:"object-cover","data-astro-cid-qgpm3szh":!0})}`:o`<div class="flex items-center justify-center w-full h-full bg-primary" data-astro-cid-qgpm3szh> <span class="text-xl font-bold text-primary-content" data-astro-cid-qgpm3szh>${l.charAt(0)}</span> </div>`} </div> </div> <h3 class="font-bold text-center" data-astro-cid-qgpm3szh>${l}</h3> <div class="divider my-1" data-astro-cid-qgpm3szh></div> <p class="h-10 text-sm text-center text-base-content/70 line-clamp-2" data-astro-cid-qgpm3szh> ${g||"这个人很懒, 什么都没写~"} </p> </div> <div class="card-footer p-2 flex justify-center border-t border-base-200" data-astro-cid-qgpm3szh> <div class="flex items-center gap-1 text-primary text-xs" data-astro-cid-qgpm3szh> ${r(t,"Icon",i,{name:v,class:"w-3.5 h-3.5","data-astro-cid-qgpm3szh":!0})} <span data-astro-cid-qgpm3szh>Visit</span> </div> </div> </a> </div> `}),"D:/我滴作业/blog/Frosti/src/components/mdx/FriendCard.astro",void 0),g=t("https://frosti.saroprock.com"),h=a(((t,a,s)=>(t.createAstro(g,a,s).self=h,o`${r(t,"BaseLayout",d,{title:"Friends"},{default:t=>o` ${r(t,"MainCard",n,{image:"/bg1.jpg",title:"友链",description:"Youngestar 的友链:看看我的朋友们, 或者找找有用的资源💖",textOverlay:"FRIENDS",infoIcon:"lucide:link"},{default:t=>o` ${e()}<div class="space-y-10"> <!-- Friends Section --> <section> <h2 class="text-2xl font-bold mb-6 flex items-center gap-2"> ${r(t,"Icon",i,{name:"lucide:users",class:"w-6 h-6 text-primary"})} <span>朋友们</span> </h2> <section class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"> ${r(t,"FriendCard",u,{name:"TanChengChuan",avatar:"https://avatars.githubusercontent.com/u/182097664?v=4",description:"I LOVE ACG",url:"https://github.com/TanChengChuan",type:"friend"})} <!-- <FriendCard
            name="梦凌汐"
            avatar="https://github.com/MeowLynxSea.png"
            description="来自星辰边缘的猫猫~爱好是睡觉awa"
            url="https://github.com/MeowLynxSea"
            type="friend"
          />
          <FriendCard
            name="颜涂楷睿"
            avatar="https://github.com/SnowFoxqwq.png"
            description="你好，我是雪狐~"
            url="https://github.com/SnowFoxqwq"
            type="friend"
          /> --> </section> </section> <!-- Contributors Section --> <!-- <section>
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
          <Icon name="lucide:git-pull-request" class="w-6 h-6 text-primary" />
          <span>Contributors</span>
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <FriendCard
            name="SunMaple"
            avatar="https://github.com/EveSunMaple.png"
            description=""
            url="https://github.com/EveSunMaple"
            type="contributor"
          />
          <FriendCard
            name="Loping151"
            avatar="https://github.com/Loping151.png"
            description=""
            url="https://github.com/Loping151"
            type="contributor"
          />
          <FriendCard
            name="Tianxiang Roxiyater"
            avatar="https://github.com/TNXG.png"
            description="明日尚未到来，希望凝于心上"
            url="https://github.com/TNXG"
            type="contributor"
          />
          <FriendCard
            name="Yaoqx"
            avatar="https://github.com/YaoqxCN.png"
            description="A lazy junior high school student who likes coding!"
            url="https://github.com/YaoqxCN"
            type="contributor"
          />
          <FriendCard
            name="Yao Tutu"
            avatar="https://github.com/yaotutu.png"
            description="Graduated student of SHMTU, CS major."
            url="https://github.com/yaotutu"
            type="contributor"
          />
          <FriendCard
            name="WRXinYue"
            avatar="https://github.com/WRXinYue.png"
            description="Technology is not just a tool; it is a joy and an art."
            url="https://github.com/WRXinYue"
            type="contributor"
          />
        </div>
      </section> --> <!-- Useful Resources Section --> <section> <h2 class="text-2xl font-bold mb-6 flex items-center gap-2"> ${r(t,"Icon",i,{name:"lucide:bookmark",class:"w-6 h-6 text-primary"})} <span>技术支持</span> </h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> ${r(t,"LinkCard",p,{title:"Astro Documentation",desc:"Astro 的官方文档，涵盖从入门到高级技巧的全面内容",url:"https://docs.astro.build",icon:"simple-icons:astro",categories:["Docs","Learning","Reference"]})} ${r(t,"LinkCard",p,{title:"Tailwind CSS Documentation",desc:"学习如何使用 Tailwind 的实用工具类为网站添加样式，无需编写 CSS 代码",url:"https://tailwindcss.com/docs",icon:"simple-icons:tailwindcss",categories:["Docs","CSS","Reference"]})} ${r(t,"LinkCard",p,{title:"DaisyUI Components",desc:"浏览 DaisyUI 的组件库，并学习如何将其应用到你的项目中",url:"https://daisyui.com/components/",icon:"simple-icons:daisyui",categories:["Components","UI","Reference"]})} ${r(t,"LinkCard",p,{title:"TypeScript Handbook",desc:"TypeScript 手册是 TypeScript 语言的全面指南",url:"https://www.typescriptlang.org/docs/handbook/intro.html",icon:"simple-icons:typescript",categories:["Docs","TypeScript","Reference"]})} </div> </section> <div class="divider my-8"> ${r(t,"Icon",i,{name:"lucide:heart",class:"w-10 h-10 text-primary"})} </div> <div class="text-center"> <p class="text-base-content/80 mb-4">留言或者私信与我互换友链吧!</p> <a href="/message" target="_blank" rel="noopener noreferrer" class="btn btn-primary gap-2"> ${r(t,"Icon",i,{name:"lucide:flower",class:"w-5 h-5"})} <span>写点留言</span> </a> </div> </div> `})} `})}`)),"D:/我滴作业/blog/Frosti/src/pages/friend.astro",void 0),b=Object.freeze(Object.defineProperty({__proto__:null,default:h,file:"D:/我滴作业/blog/Frosti/src/pages/friend.astro",url:"/friend"},Symbol.toStringTag,{value:"Module"})),f=()=>b;export{f as page};
