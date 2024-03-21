"use strict";(self.webpackChunkall_in_one_solana=self.webpackChunkall_in_one_solana||[]).push([[771],{3905:(t,e,a)=>{a.d(e,{Zo:()=>u,kt:()=>d});var n=a(67294);function l(t,e,a){return e in t?Object.defineProperty(t,e,{value:a,enumerable:!0,configurable:!0,writable:!0}):t[e]=a,t}function r(t,e){var a=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),a.push.apply(a,n)}return a}function o(t){for(var e=1;e<arguments.length;e++){var a=null!=arguments[e]?arguments[e]:{};e%2?r(Object(a),!0).forEach((function(e){l(t,e,a[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(a)):r(Object(a)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(a,e))}))}return t}function c(t,e){if(null==t)return{};var a,n,l=function(t,e){if(null==t)return{};var a,n,l={},r=Object.keys(t);for(n=0;n<r.length;n++)a=r[n],e.indexOf(a)>=0||(l[a]=t[a]);return l}(t,e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);for(n=0;n<r.length;n++)a=r[n],e.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(t,a)&&(l[a]=t[a])}return l}var p=n.createContext({}),i=function(t){var e=n.useContext(p),a=e;return t&&(a="function"==typeof t?t(e):o(o({},e),t)),a},u=function(t){var e=i(t.components);return n.createElement(p.Provider,{value:e},t.children)},s="mdxType",k={inlineCode:"code",wrapper:function(t){var e=t.children;return n.createElement(n.Fragment,{},e)}},m=n.forwardRef((function(t,e){var a=t.components,l=t.mdxType,r=t.originalType,p=t.parentName,u=c(t,["components","mdxType","originalType","parentName"]),s=i(a),m=l,d=s["".concat(p,".").concat(m)]||s[m]||k[m]||r;return a?n.createElement(d,o(o({ref:e},u),{},{components:a})):n.createElement(d,o({ref:e},u))}));function d(t,e){var a=arguments,l=e&&e.mdxType;if("string"==typeof t||l){var r=a.length,o=new Array(r);o[0]=m;var c={};for(var p in e)hasOwnProperty.call(e,p)&&(c[p]=e[p]);c.originalType=t,c[s]="string"==typeof t?t:l,o[1]=c;for(var i=2;i<r;i++)o[i]=a[i];return n.createElement.apply(null,o)}return n.createElement.apply(null,a)}m.displayName="MDXCreateElement"},94166:(t,e,a)=>{a.r(e),a.d(e,{assets:()=>p,contentTitle:()=>o,default:()=>k,frontMatter:()=>r,metadata:()=>c,toc:()=>i});var n=a(87462),l=(a(67294),a(3905));const r={title:"\u8d26\u6237",sidebar_position:4,tags:["solana-cook-book","accounts"]},o="\u8d26\u6237",c={unversionedId:"core-concepts/accounts",id:"core-concepts/accounts",title:"\u8d26\u6237",description:"\u5728Solana\u4e2d\uff0c\u8d26\u6237\u662f\u7528\u6765\u5b58\u50a8\u72b6\u6001\u7684\u3002\u8d26\u6237\u662fSolana\u5f00\u53d1\u4e2d\u975e\u5e38\u91cd\u8981\u7684\u6784\u6210\u8981\u7d20\u3002",source:"@site/docs/cookbook-zh/core-concepts/accounts.md",sourceDirName:"core-concepts",slug:"/core-concepts/accounts",permalink:"/solana-co-learn/cookbook-zh/core-concepts/accounts",draft:!1,editUrl:"https://github.com/CreatorsDAO/solana-co-learn/tree/main/docs/cookbook-zh/core-concepts/accounts.md",tags:[{label:"solana-cook-book",permalink:"/solana-co-learn/cookbook-zh/tags/solana-cook-book"},{label:"accounts",permalink:"/solana-co-learn/cookbook-zh/tags/accounts"}],version:"current",lastUpdatedBy:"v1xingyue",lastUpdatedAt:1710985935,formattedLastUpdatedAt:"Mar 21, 2024",sidebarPosition:4,frontMatter:{title:"\u8d26\u6237",sidebar_position:4,tags:["solana-cook-book","accounts"]},sidebar:"tutorialSidebar",previous:{title:"\u6838\u5fc3\u6982\u5ff5",permalink:"/solana-co-learn/cookbook-zh/core-concepts/"},next:{title:"\u7a0b\u5e8f\u6d3e\u751f\u8d26\u6237\uff08PDA\uff09",permalink:"/solana-co-learn/cookbook-zh/core-concepts/pdas"}},p={},i=[{value:"\u6df1\u5165",id:"\u6df1\u5165",level:2},{value:"\u8d26\u6237\u6a21\u578b",id:"\u8d26\u6237\u6a21\u578b",level:3},{value:"\u79df\u91d1",id:"\u79df\u91d1",level:3},{value:"\u5176\u4ed6\u8d44\u6599",id:"\u5176\u4ed6\u8d44\u6599",level:2},{value:"\u81f4\u8c22",id:"\u81f4\u8c22",level:3}],u={toc:i},s="wrapper";function k(t){let{components:e,...r}=t;return(0,l.kt)(s,(0,n.Z)({},u,r,{components:e,mdxType:"MDXLayout"}),(0,l.kt)("h1",{id:"\u8d26\u6237"},"\u8d26\u6237"),(0,l.kt)("p",null,"\u5728Solana\u4e2d\uff0c\u8d26\u6237\u662f\u7528\u6765\u5b58\u50a8\u72b6\u6001\u7684\u3002\u8d26\u6237\u662fSolana\u5f00\u53d1\u4e2d\u975e\u5e38\u91cd\u8981\u7684\u6784\u6210\u8981\u7d20\u3002"),(0,l.kt)("admonition",{type:"info"},(0,l.kt)("p",{parentName:"admonition"},(0,l.kt)("strong",{parentName:"p"},"tip \u8981\u70b9")),(0,l.kt)("ul",{parentName:"admonition"},(0,l.kt)("li",{parentName:"ul"},"\u8d26\u6237\u662f\u7528\u6765\u5b58\u653e\u6570\u636e\u7684"),(0,l.kt)("li",{parentName:"ul"},"\u6bcf\u4e2a\u8d26\u6237\u90fd\u6709\u4e00\u4e2a\u72ec\u4e00\u65e0\u4e8c\u7684\u5730\u5740"),(0,l.kt)("li",{parentName:"ul"},"\u6bcf\u4e2a\u8d26\u6237\u5927\u5c0f\u4e0d\u80fd\u8d85\u8fc7",(0,l.kt)("strong",{parentName:"li"},"10MB")),(0,l.kt)("li",{parentName:"ul"},"\u7a0b\u5e8f\u6d3e\u751f\u8d26\u6237(PDA accounts)\u5927\u5c0f\u4e0d\u80fd\u8d85\u8fc7",(0,l.kt)("strong",{parentName:"li"},"10KB")),(0,l.kt)("li",{parentName:"ul"},"\u7a0b\u5e8f\u6d3e\u751f\u8d26\u6237(PDA accounts)\u53ef\u4ee5\u7528\u5176\u5bf9\u5e94\u7a0b\u5e8f\u8fdb\u884c\u7b7e\u540d"),(0,l.kt)("li",{parentName:"ul"},"\u8d26\u6237\u5927\u5c0f\u5728\u521b\u5efa\u65f6\u56fa\u5b9a\uff0c\u4f46\u53ef\u4ee5\u4f7f\u7528",(0,l.kt)("a",{parentName:"li",href:"https://solanacookbook.com/references/programs.html#how-to-change-account-size"},"realloc"),"\u8fdb\u884c\u8c03\u6574"),(0,l.kt)("li",{parentName:"ul"},"\u8d26\u6237\u6570\u636e\u5b58\u50a8\u9700\u8981\u4ed8\u79df\u91d1"),(0,l.kt)("li",{parentName:"ul"},'\u9ed8\u8ba4\u7684\u8d26\u6237\u6240\u6709\u8005\u662f"\u7cfb\u7edf\u7a0b\u5e8f"'))),(0,l.kt)("h2",{id:"\u6df1\u5165"},"\u6df1\u5165"),(0,l.kt)("h3",{id:"\u8d26\u6237\u6a21\u578b"},"\u8d26\u6237\u6a21\u578b"),(0,l.kt)("p",null,"\u5728Solana\u4e2d\u6709\u4e09\u7c7b\u8d26\u6237\uff1a"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},"\u6570\u636e\u8d26\u6237\uff0c\u7528\u6765\u5b58\u50a8\u6570\u636e"),(0,l.kt)("li",{parentName:"ul"},"\u7a0b\u5e8f\u8d26\u6237\uff0c\u7528\u6765\u5b58\u50a8\u53ef\u6267\u884c\u7a0b\u5e8f"),(0,l.kt)("li",{parentName:"ul"},'\u539f\u751f\u8d26\u6237\uff0c\u6307Solana\u4e0a\u7684\u539f\u751f\u7a0b\u5e8f\uff0c\u4f8b\u5982"System"\uff0c"Stake"\uff0c\u4ee5\u53ca"Vote"\u3002')),(0,l.kt)("p",null,"\u6570\u636e\u8d26\u6237\u53c8\u5206\u4e3a\u4e24\u7c7b\uff1a"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},"\u7cfb\u7edf\u6240\u6709\u8d26\u6237"),(0,l.kt)("li",{parentName:"ul"},"\u7a0b\u5e8f\u6d3e\u751f\u8d26\u6237\uff08PDA\uff09")),(0,l.kt)("p",null,"\u6bcf\u4e2a\u6570\u636e\u8d26\u6237\u90fd\u6709\u4e00\u4e2a\u5730\u5740\uff08\u4e00\u822c\u60c5\u51b5\u4e0b\u662f\u4e00\u4e2a\u516c\u94a5\uff09\u4ee5\u53ca\u4e00\u4e2a\u6240\u6709\u8005\uff08\u7a0b\u5e8f\u8d26\u6237\u7684\u5730\u5740\uff09\u3002\n\u4e0b\u9762\u8be6\u7ec6\u5217\u51fa\u4e00\u4e2a\u8d26\u6237\u5b58\u50a8\u7684\u5b8c\u6574\u5b57\u6bb5\u5217\u8868\u3002"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:null},"\u5b57\u6bb5"),(0,l.kt)("th",{parentName:"tr",align:null},"\u63cf\u8ff0"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"lamports"),(0,l.kt)("td",{parentName:"tr",align:null},"\u8fd9\u4e2a\u8d26\u6237\u62e5\u6709\u7684lamport\uff08\u5170\u6ce2\u7279\uff09\u6570\u91cf")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"owner"),(0,l.kt)("td",{parentName:"tr",align:null},"\u8fd9\u4e2a\u8d26\u6237\u7684\u6240\u6709\u8005\u7a0b\u5e8f")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"executable"),(0,l.kt)("td",{parentName:"tr",align:null},"\u8fd9\u4e2a\u8d26\u6237\u6210\u662f\u5426\u53ef\u4ee5\u5904\u7406\u6307\u4ee4")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"data"),(0,l.kt)("td",{parentName:"tr",align:null},"\u8fd9\u4e2a\u8d26\u6237\u5b58\u50a8\u7684\u6570\u636e\u7684\u5b57\u8282\u7801")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"rent_epoch"),(0,l.kt)("td",{parentName:"tr",align:null},"\u4e0b\u4e00\u4e2a\u9700\u8981\u4ed8\u79df\u91d1\u7684epoch\uff08\u4ee3\uff09")))),(0,l.kt)("p",null,"\u5173\u4e8e\u6240\u6709\u6743\uff0c\u6709\u51e0\u6761\u91cd\u8981\u7684\u89c4\u5219\uff1a"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},"\u53ea\u6709\u8d26\u6237\u7684\u6240\u6709\u8005\u624d\u80fd\u6539\u53d8\u8d26\u6237\u4e2d\u7684\u6570\u636e\uff0c\u63d0\u53d6lamport"),(0,l.kt)("li",{parentName:"ul"},"\u4efb\u4f55\u4eba\u90fd\u53ef\u4ee5\u5411\u6570\u636e\u8d26\u6237\u4e2d\u5b58\u5165lamport"),(0,l.kt)("li",{parentName:"ul"},"\u5f53\u8d26\u6237\u4e2d\u7684\u6570\u636e\u88ab\u62b9\u9664\u4e4b\u540e\uff0c\u8d26\u6237\u7684\u6240\u6709\u8005\u53ef\u4ee5\u6307\u5b9a\u65b0\u7684\u6240\u6709\u8005")),(0,l.kt)("p",null,"\u7a0b\u5e8f\u8d26\u6237\u4e0d\u50a8\u5b58\u72b6\u6001\u3002"),(0,l.kt)("p",null,"\u4f8b\u5982\uff0c\u5047\u8bbe\u6709\u4e00\u4e2a\u8ba1\u6570\u7a0b\u5e8f\uff0c\u8fd9\u4e2a\u7a0b\u5e8f\u7528\u6765\u4e3a\u4e00\u4e2a\u8ba1\u6570\u5668\u52a0\u6570\uff0c\u4f60\u9700\u8981\u521b\u5efa\u4e24\u4e2a\u8d26\u6237\uff0c\u4e00\u4e2a\u7528\u4e8e\u5b58\u50a8\u7a0b\u5e8f\u7684\u4ee3\u7801\uff0c\n\u53e6\u4e00\u4e2a\u7528\u4e8e\u5b58\u50a8\u8ba1\u6570\u5668\u672c\u8eab\u3002"),(0,l.kt)("p",null,(0,l.kt)("img",{src:a(58556).Z,width:"901",height:"345"})),(0,l.kt)("p",null,"\u4e3a\u4e86\u907f\u514d\u8d26\u6237\u88ab\u5220\u9664\uff0c\u5fc5\u987b\u4ed8\u79df\u91d1\u3002"),(0,l.kt)("h3",{id:"\u79df\u91d1"},"\u79df\u91d1"),(0,l.kt)("p",null,"\u5728\u8d26\u6237\u4e2d\u5b58\u50a8\u6570\u636e\u9700\u8981\u82b1\u8d39SOL\u6765\u7ef4\u6301\uff0c\u8fd9\u90e8\u5206\u82b1\u8d39\u7684SOL\u88ab\u79f0\u4f5c\u79df\u91d1\u3002\u5982\u679c\u4f60\u5728\u4e00\u4e2a\u8d26\u6237\u4e2d\u5b58\u5165\u5927\u4e8e\u4e24\u5e74\u79df\u91d1\u7684SOL\uff0c\n\u8fd9\u4e2a\u8d26\u6237\u5c31\u53ef\u4ee5\u88ab\u8c41\u514d\u4ed8\u79df\u3002\u79df\u91d1\u53ef\u4ee5\u901a\u8fc7\u5173\u95ed\u8d26\u6237\u7684\u65b9\u5f0f\u6765\u53d6\u56de\u3002lamport\u4f1a\u88ab\u8fd4\u8fd8\u56de\u4f60\u7684\u94b1\u5305\u3002"),(0,l.kt)("p",null,"\u79df\u91d1\u5728\u8fd9\u4e24\u4e2a\u4e0d\u540c\u7684\u65f6\u95f4\u70b9\u88ab\u652f\u53d6\uff1a"),(0,l.kt)("ol",null,(0,l.kt)("li",{parentName:"ol"},"\u88ab\u4e00\u4e2a\u4ea4\u6613\u5f15\u7528\u7684\u65f6\u5019"),(0,l.kt)("li",{parentName:"ol"},"epoch\u66f4\u8fed\u65f6")),(0,l.kt)("p",null,"\u6536\u53d6\u7684\u79df\u91d1\uff0c\u4e00\u5b9a\u767e\u5206\u6bd4\u4f1a\u88ab\u9500\u6bc1\uff0c\u53e6\u4e00\u90e8\u5206\u4f1a\u5728\u6bcf\u4e2aslot\uff08\u63d2\u69fd\uff09\u7ed3\u675f\u65f6\u88ab\u5206\u914d\u7ed9\u6295\u7968\u8d26\u6237\u3002"),(0,l.kt)("p",null,"\u5f53\u4e00\u4e2a\u8d26\u6237\u6ca1\u6709\u8db3\u591f\u7684\u4f59\u989d\u652f\u4ed8\u79df\u91d1\u65f6\uff0c\u8fd9\u4e2a\u8d26\u6237\u4f1a\u88ab\u91ca\u653e\uff0c\u6570\u636e\u4f1a\u88ab\u6e05\u9664\u3002"),(0,l.kt)("h2",{id:"\u5176\u4ed6\u8d44\u6599"},"\u5176\u4ed6\u8d44\u6599"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"https://solana.wiki/zh-cn/docs/account-model/#account-storage"},"Solana\u8d26\u6237\u6a21\u578b")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"https://docs.solana.com/developing/programming-model/accounts"},"\u5b98\u65b9\u6587\u6863")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"https://twitter.com/pencilflip/status/1452402100470644739"},"pencilflip\u8d26\u6237\u4e3b\u9898"))),(0,l.kt)("h3",{id:"\u81f4\u8c22"},"\u81f4\u8c22"),(0,l.kt)("p",null,"\u8fd9\u4e9b\u6838\u5fc3\u6982\u5ff5\u6765\u6e90\u4e8ePencilflip. ",(0,l.kt)("a",{parentName:"p",href:"https://twitter.com/intent/user?screen_name=pencilflip"},"\u5728Twitter\u4e0a\u5173\u6ce8\u4ed6"),"."))}k.isMDXComponent=!0},58556:(t,e,a)=>{a.d(e,{Z:()=>n});const n=a.p+"assets/images/account_example-27ec169049e2be93e7baba29dd0c5ba3.png"}}]);