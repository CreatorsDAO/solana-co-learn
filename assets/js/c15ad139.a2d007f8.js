"use strict";(self.webpackChunkall_in_one_solana=self.webpackChunkall_in_one_solana||[]).push([[5437],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>d});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},o=Object.keys(e);for(a=0;a<o.length;a++)r=o[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)r=o[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var s=a.createContext({}),p=function(e){var t=a.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},c=function(e){var t=p(e.components);return a.createElement(s.Provider,{value:t},e.children)},u="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,o=e.originalType,s=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),u=p(r),m=n,d=u["".concat(s,".").concat(m)]||u[m]||f[m]||o;return r?a.createElement(d,l(l({ref:t},c),{},{components:r})):a.createElement(d,l({ref:t},c))}));function d(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=r.length,l=new Array(o);l[0]=m;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i[u]="string"==typeof e?e:n,l[1]=i;for(var p=2;p<o;p++)l[p]=r[p];return a.createElement.apply(null,l)}return a.createElement.apply(null,r)}m.displayName="MDXCreateElement"},27548:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>f,frontMatter:()=>o,metadata:()=>i,toc:()=>p});var a=r(87462),n=(r(67294),r(3905));const o={},l=void 0,i={unversionedId:"references/gaming/auto-approve",id:"references/gaming/auto-approve",title:"auto-approve",description:"WIP - This is a work in progress",source:"@site/docs/cookbook-zh/references/gaming/auto-approve.md",sourceDirName:"references/gaming",slug:"/references/gaming/auto-approve",permalink:"/all-in-one-solana/cookbook-zh/references/gaming/auto-approve",draft:!1,editUrl:"https://github.com/CreatorsDAO/all-in-one-solana/tree/dev/docs/cookbook-zh/references/gaming/auto-approve.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Learn by example",permalink:"/all-in-one-solana/cookbook-zh/references/gaming/game-examples"}},s={},p=[],c={toc:p},u="wrapper";function f(e){let{components:t,...r}=e;return(0,n.kt)(u,(0,a.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"WIP - This is a work in progress"),(0,n.kt)("h1",{id:"how-to-auto-approve-transaction-for-fast-game-play-and-great-ux"},"How to auto approve transaction for fast game play and great ux"),(0,n.kt)("p",null,"To have a fluid game play for on-chain games it is beneficial to have an auto approve wallet."),(0,n.kt)("ol",null,(0,n.kt)("li",{parentName:"ol"},"Solflare wallet offers auto-approve functionality with burner wallets, but this limits your players to only one wallet.")),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"https://twitter.com/solflare_wallet/status/1625950688709644324"},"Burner Auto Approve Wallets"),(0,n.kt)("br",null)),(0,n.kt)("ol",{start:2},(0,n.kt)("li",{parentName:"ol"},"Another way to do it is to create a key pair in your game and let the player transfer some sol to that wallet and then use it to pay for transaction fees. Only problem with this is that you need to handle the security for this wallet and the players would need to have access to their seed phrase.")),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"https://github.com/Woody4618/SolPlay_Unity_SDK/blob/main/Assets/SolPlay/Scripts/Services/WalletHolderService.cs"},"Example Source Code"),(0,n.kt)("br",null),"\n",(0,n.kt)("a",{parentName:"p",href:"https://solplay.de/SolHunter/index.html"},"Example Game"),(0,n.kt)("br",null)),(0,n.kt)("ol",{start:3},(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("p",{parentName:"li"},"You can pay the fees yourself, by creating and signing the transactions in the backend and interact with it via an API. For that you send parameters to your backend and sign the transaction there and send a confirmation to the client as soon as it is done.")),(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("p",{parentName:"li"},"There is a protocol called @gumisfunn and they released a feature called session keys. Session Keys are ephemeral keys with fine-grained program/instruction scoping for tiered access in your @solana programs.\nThey allow users to interact with apps under particular parameters like duration, max tokens, amount of posts or any other function specific to an app.\n",(0,n.kt)("a",{parentName:"p",href:"https://twitter.com/gumisfunn/status/1642898237395972097?s=20"},"Link")))))}f.isMDXComponent=!0}}]);