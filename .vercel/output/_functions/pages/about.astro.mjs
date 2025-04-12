/* empty css                                */import{c as e,a as t,r as s,b as o,m as i,f as a}from"../chunks/astro/server_Cr3L-o0H.mjs";import{b as n,a as r}from"../chunks/BaseLayout_CQzFYZn-.mjs";import{$ as c}from"../chunks/MainCard_DWu1rACW.mjs";export{renderers}from"../renderers.mjs";const l=e("https://frosti.saroprock.com"),d=t(((e,t,m)=>(e.createAstro(l,t,m).self=d,o`${s(e,"BaseLayout",n,{title:"About"},{default:e=>o` ${s(e,"MainCard",c,{image:"/bg2.jpg",title:"关于",description:"Youngest 的个人介绍: 一名前端开发者和学习者✍️",textOverlay:"ABOUT",infoIcon:"lucide:user"},{default:e=>o` ${i()}<div class="space-y-10 mb-8"> <!-- Profile Section --> <section class="flex flex-col md:flex-row gap-8 items-center md:items-start"> <div class="avatar"> <div class="w-32 h-32 md:w-40 md:h-40 rounded-xl ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden"> <img src="https://github.com/youngestar.png" alt="Youngestar" width="160" height="160" loading="eager"> </div> </div> <div class="flex-1 text-center md:text-left"> <h1 class="text-3xl md:text-4xl font-bold mb-2">Youngestar</h1> <p class="text-xl text-base-content/80 mb-4">Developer & Learner</p> <div class="flex flex-wrap gap-3 justify-center md:justify-start mb-6"> <a href="https://github.com/Youngestar" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline gap-2"> ${s(e,"Icon",r,{name:"lucide:github",class:"w-4 h-4"})} <span>GitHub</span> </a> <a href="https://x.com/sing_a_giao" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline gap-2"> ${s(e,"Icon",r,{name:"lucide:twitter",class:"w-4 h-4"})} <span>Twitter</span> </a> </div> <p class="text-base-content/80">Always keep advancing</p> </div> </section> <!-- GitHub Stats --> <section> <h2 class="text-2xl font-bold mb-6 flex items-center gap-2"> ${s(e,"Icon",r,{name:"lucide:palette",class:"w-6 h-6 text-primary"})} <span>关于我</span> </h2> <p class="text-xl font-semibold text-primary">Hi, I'm Youngestar!</p> <br> <p>是一名前端的开发者和学习者, 目前还是技术小白</p> <p>希望能做一个很有趣的人, 希望能一直向前进</p> <p>与君共勉✌️</p> <!-- <GitHubStats username="youngestar" showLanguages={false} showCommitGraph={true} /> --> </section> <!-- Tech Stack --> <section> <h2 class="text-2xl font-bold mb-6 flex items-center gap-2"> ${s(e,"Icon",r,{name:"lucide:code-2",class:"w-6 h-6 text-primary"})} <span>技术栈</span> </h2> <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"> ${[{name:"JavaScript",icon:"simple-icons:javascript",color:"oklch(0.8 0.2 80)"},{name:"TypeScript",icon:"simple-icons:typescript",color:"oklch(0.6 0.2 250)"},{name:"React",icon:"simple-icons:react",color:"oklch(0.7 0.2 200)"},{name:"Vue",icon:"simple-icons:vuedotjs",color:"oklch(0.7 0.1 160)"},{name:"TailwindCSS",icon:"simple-icons:tailwindcss",color:"oklch(0.6 0.2 220)"},{name:"HTML5",icon:"simple-icons:html5",color:"oklch(0.7 0.2 30)"},{name:"CSS3",icon:"simple-icons:css3",color:"oklch(0.7 0.2 220)"},{name:"Git",icon:"simple-icons:git",color:"oklch(0.7 0.2 30)"}].map((t=>o`<div class="flex flex-col items-center justify-center p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"> <div class="text-3xl mb-2"${a(`color: ${t.color}`,"style")}> ${s(e,"Icon",r,{name:t.icon,class:"w-10 h-10"})} </div> <span class="text-sm font-medium">${t.name}</span> </div>`))} </div> </section> <!-- Contribution Activity --> <!-- <section>
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
          <Icon name="lucide:activity" class="w-6 h-6 text-primary" />
          <span>最近活动</span>
        </h2>

        <div class="bg-base-200 rounded-xl p-6 overflow-x-auto">
          <div class="flex flex-col md:flex-row gap-8 md:gap-4 md:overflow-x-auto md:pb-2">
            {
              [
                {
                  date: "January 2024",
                  title: "Open Source Contributions",
                  desc: "Contributed to several open source projects, focusing on performance optimizations.",
                },
                {
                  date: "March 2024",
                  title: "Initiated Frosti Project",
                  desc: "Started development of the Frosti blog theme for Astro, focusing on modern design principles.",
                },
                {
                  date: "July 2024",
                  title: "Released Frosti v2",
                  desc: "Published version 2 with improved responsive design and extended plugin support.",
                },
                {
                  date: "March 2025",
                  title: "Released Frosti v3",
                  desc: "Launched version 3 of the Frosti blog theme with enhanced performance and new customization options.",
                },
              ].map((item, i) => (
                <div class="relative flex gap-4 pb-2 md:pb-0 md:min-w-[250px]">
                  <div class="flex flex-col items-center">
                    <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content text-xl">
                      {i + 1}
                    </div>
                    <div class="w-0.5 h-16 bg-base-300 mt-2 md:hidden" />
                  </div>
                  <div>
                    <div class="text-sm text-base-content/60 mb-1">{item.date}</div>
                    <h3 class="text-lg font-bold">{item.title}</h3>
                    <p class="text-base-content/80 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </section> --> </div> `})} `})}`)),"D:/我滴作业/blog/Frosti/src/pages/about.astro",void 0),m=Object.freeze(Object.defineProperty({__proto__:null,default:d,file:"D:/我滴作业/blog/Frosti/src/pages/about.astro",url:"/about"},Symbol.toStringTag,{value:"Module"})),p=()=>m;export{p as page};
