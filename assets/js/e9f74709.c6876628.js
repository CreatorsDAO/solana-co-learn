"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[6742],{3905:(e,n,t)=>{t.d(n,{Zo:()=>c,kt:()=>y});var a=t(7294);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,a,r=function(e,n){if(null==e)return{};var t,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)t=i[a],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)t=i[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var s=a.createContext({}),p=function(e){var n=a.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},c=function(e){var n=p(e.components);return a.createElement(s.Provider,{value:n},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var n=e.children;return a.createElement(a.Fragment,{},n)}},f=a.forwardRef((function(e,n){var t=e.components,r=e.mdxType,i=e.originalType,s=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),d=p(t),f=r,y=d["".concat(s,".").concat(f)]||d[f]||u[f]||i;return t?a.createElement(y,l(l({ref:n},c),{},{components:t})):a.createElement(y,l({ref:n},c))}));function y(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var i=t.length,l=new Array(i);l[0]=f;var o={};for(var s in n)hasOwnProperty.call(n,s)&&(o[s]=n[s]);o.originalType=e,o[d]="string"==typeof e?e:r,l[1]=o;for(var p=2;p<i;p++)l[p]=t[p];return a.createElement.apply(null,l)}return a.createElement.apply(null,t)}f.displayName="MDXCreateElement"},3904:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>l,default:()=>u,frontMatter:()=>i,metadata:()=>o,toc:()=>p});var a=t(7462),r=(t(7294),t(3905));const i={sidebar_position:37,sidebar_label:"\u5c55\u793aNFTs \ud83d\udc83",sidebar_class_name:"green"},l="\u5c55\u793aNFTs \ud83d\udc83",o={unversionedId:"Solana-Co-Learn/module2/displayings-nfts-in-a-ui/displaying-nfts/README",id:"Solana-Co-Learn/module2/displayings-nfts-in-a-ui/displaying-nfts/README",title:"\u5c55\u793aNFTs \ud83d\udc83",description:"\u65e2\u7136\u6211\u4eec\u5df2\u7ecf\u94f8\u9020\u4e86\u4e00\u4e2aNFT\uff0c\u73b0\u5728\u6211\u4eec\u5c06\u5b66\u4e60\u5982\u4f55\u94f8\u9020\u4e00\u7cfb\u5217\u7684NFT\u3002\u6211\u4eec\u5c06\u4f7f\u7528Candy Machine\u6765\u5b8c\u6210\u8fd9\u4e2a\u4efb\u52a1\u2014\u2014\u8fd9\u662f\u4e00\u4e2aSolana\u7a0b\u5e8f\uff0c\u8ba9\u521b\u4f5c\u8005\u80fd\u591f\u5c06\u4ed6\u4eec\u7684\u8d44\u4ea7\u4e0a\u94fe\u3002\u8fd9\u4e0d\u662f\u521b\u5efa\u7cfb\u5217\u7684\u552f\u4e00\u65b9\u5f0f\uff0c\u4f46\u5728Solana\u4e0a\u5b83\u662f\u6807\u51c6\u7684\uff0c\u56e0\u4e3a\u5b83\u5177\u6709\u8bb8\u591a\u6709\u7528\u7684\u529f\u80fd\uff0c\u5982\u673a\u5668\u4eba\u4fdd\u62a4\u548c\u5b89\u5168\u968f\u673a\u5316\u3002\u5982\u679c\u4f60\u4e0d\u80fd\u70ab\u8000\u4f60\u7684NFT\uff0c\u90a3\u5b83\u6709\u4ec0\u4e48\u7528\u5462\uff01\u5728\u8fd9\u8282\u8bfe\u4e2d\uff0c\u6211\u4eec\u5c06\u5e2e\u52a9\u4f60\u5c55\u793a\u4f60\u7684\u4f5c\u54c1\uff08\u5047\u8bbe\u4f60\u7684NFT\u662f\u8d5a\u94b1\u7684\uff09\uff1a\u9996\u5148\u5728\u94b1\u5305\u4e2d\u5c55\u793a\u5b83\uff0c\u7136\u540e\u5728Candy Machine\u4e2d\u5c55\u793a\u5b83\u3002",source:"@site/docs/Solana-Co-Learn/module2/displayings-nfts-in-a-ui/displaying-nfts/README.md",sourceDirName:"Solana-Co-Learn/module2/displayings-nfts-in-a-ui/displaying-nfts",slug:"/Solana-Co-Learn/module2/displayings-nfts-in-a-ui/displaying-nfts/",permalink:"/all-in-one-solana/docs/Solana-Co-Learn/module2/displayings-nfts-in-a-ui/displaying-nfts/",draft:!1,editUrl:"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/Solana-Co-Learn/module2/displayings-nfts-in-a-ui/displaying-nfts/README.md",tags:[],version:"current",sidebarPosition:37,frontMatter:{sidebar_position:37,sidebar_label:"\u5c55\u793aNFTs \ud83d\udc83",sidebar_class_name:"green"},sidebar:"tutorialSidebar",previous:{title:"\u5728\u7528\u6237\u754c\u9762\u4e2d\u5c55\u793aNFTS",permalink:"/all-in-one-solana/docs/Solana-Co-Learn/module2/displayings-nfts-in-a-ui/"},next:{title:"\ud83d\udcf1 \u5728\u94b1\u5305\u4e2d\u5c55\u793aNFTs",permalink:"/all-in-one-solana/docs/Solana-Co-Learn/module2/displayings-nfts-in-a-ui/displaying-nfts-from-a-wallet/"}},s={},p=[],c={toc:p},d="wrapper";function u(e){let{components:n,...i}=e;return(0,r.kt)(d,(0,a.Z)({},c,i,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"\u5c55\u793anfts-"},"\u5c55\u793aNFTs \ud83d\udc83"),(0,r.kt)("p",null,"\u65e2\u7136\u6211\u4eec\u5df2\u7ecf\u94f8\u9020\u4e86\u4e00\u4e2aNFT\uff0c\u73b0\u5728\u6211\u4eec\u5c06\u5b66\u4e60\u5982\u4f55\u94f8\u9020\u4e00\u7cfb\u5217\u7684NFT\u3002\u6211\u4eec\u5c06\u4f7f\u7528Candy Machine\u6765\u5b8c\u6210\u8fd9\u4e2a\u4efb\u52a1\u2014\u2014\u8fd9\u662f\u4e00\u4e2aSolana\u7a0b\u5e8f\uff0c\u8ba9\u521b\u4f5c\u8005\u80fd\u591f\u5c06\u4ed6\u4eec\u7684\u8d44\u4ea7\u4e0a\u94fe\u3002\u8fd9\u4e0d\u662f\u521b\u5efa\u7cfb\u5217\u7684\u552f\u4e00\u65b9\u5f0f\uff0c\u4f46\u5728Solana\u4e0a\u5b83\u662f\u6807\u51c6\u7684\uff0c\u56e0\u4e3a\u5b83\u5177\u6709\u8bb8\u591a\u6709\u7528\u7684\u529f\u80fd\uff0c\u5982\u673a\u5668\u4eba\u4fdd\u62a4\u548c\u5b89\u5168\u968f\u673a\u5316\u3002\u5982\u679c\u4f60\u4e0d\u80fd\u70ab\u8000\u4f60\u7684NFT\uff0c\u90a3\u5b83\u6709\u4ec0\u4e48\u7528\u5462\uff01\u5728\u8fd9\u8282\u8bfe\u4e2d\uff0c\u6211\u4eec\u5c06\u5e2e\u52a9\u4f60\u5c55\u793a\u4f60\u7684\u4f5c\u54c1\uff08\u5047\u8bbe\u4f60\u7684NFT\u662f\u8d5a\u94b1\u7684\uff09\uff1a\u9996\u5148\u5728\u94b1\u5305\u4e2d\u5c55\u793a\u5b83\uff0c\u7136\u540e\u5728Candy Machine\u4e2d\u5c55\u793a\u5b83\u3002"),(0,r.kt)("p",null,"\u4f60\u53ef\u80fd\u4f1a\u60f3\u8fd9\u6837\u505a\u7684\u610f\u4e49\u662f\u4ec0\u4e48\u3002\u60f3\u8c61\u4e00\u4e0b\uff0c\u4f60\u7684\u670b\u53cb\u5728\u4f60\u7684\u7f51\u7ad9\u4e0a\u4ece\u4f60\u7684\u6536\u85cf\u4e2d\u94f8\u9020\u4e86\u4e00\u4e2a\u5f88\u9177\u7684Pepe NFT\u3002\u4ed6\u4eec\u94f8\u9020\u4e86\u5f88\u591a\u4e0ePepe\u76f8\u5173\u7684\u4e1c\u897f\uff0c\u6240\u4ee5\u4ed6\u4eec\u7684\u94b1\u5305\u91cc\u6709\u51e0\u5341\u4e2aNFT\u3002\u4ed6\u4eec\u600e\u4e48\u77e5\u9053\u54ea\u4e00\u4e2a\u662f\u6765\u81ea\u4f60\u7684\u6536\u85cf\u5462\uff1f\u4f60\u5f97\u7ed9\u4ed6\u4eec\u770b\uff01"),(0,r.kt)("p",null,"\u4f60\u4f1a\u8bb0\u5f97\u4ece\u7b2c\u4e00\u5468\u5f00\u59cb\uff0c\u6211\u4eec\u60f3\u8981\u7684\u4e00\u5207\u90fd\u5b58\u50a8\u5728\u8d26\u6237\u4e2d\u3002\u8fd9\u610f\u5473\u7740\u4f60\u53ea\u9700\u4f7f\u7528\u94b1\u5305\u5730\u5740\u5c31\u53ef\u4ee5\u83b7\u53d6\u5b83\u4eec\u7684NFT\uff0c\u4f46\u8fd9\u9700\u8981\u66f4\u591a\u7684\u5de5\u4f5c\u3002"),(0,r.kt)("p",null,"\u76f8\u53cd\uff0c\u6211\u4eec\u5c06\u4f7f\u7528Metaplex SDK\uff0c\u5b83\u4f7f\u5f97\u4e00\u5207\u90fd\u53d8\u5f97\u50cf\u8c03\u7528API\u4e00\u6837\u7b80\u5355\u3002\u4ee5\u4e0b\u662f\u5b83\u7684\u6837\u5b50\uff1a"),(0,r.kt)("p",null,(0,r.kt)("img",{src:t(4375).Z,width:"716",height:"844"})),(0,r.kt)("p",null,"\u4f60\u9700\u8981\u8fdb\u884c\u901a\u5e38\u7684Metaplex\u8bbe\u7f6e\uff0c\u4f46\u6211\u4eec\u4f7f\u7528 ",(0,r.kt)("inlineCode",{parentName:"p"},"walletAdapterIdentity")," \u800c\u4e0d\u662f ",(0,r.kt)("inlineCode",{parentName:"p"},"keypairIdentity")," \u6765\u8fdb\u884c\u8fde\u63a5\uff0c\u56e0\u4e3a\u6211\u4eec\u4e0d\u60f3\u8981\u4ed6\u4eec\u7684\u5bc6\u94a5\u5bf9\u54c8\u54c8\u3002\u5b8c\u6210\u540e\uff0c\u6211\u4eec\u53ea\u9700\u4f7f\u7528Metaplex\u5bf9\u8c61\u8c03\u7528 ",(0,r.kt)("inlineCode",{parentName:"p"},"findAllByOwner")," \u65b9\u6cd5\u5373\u53ef\u3002"),(0,r.kt)("p",null,"\u8fd9\u662f\u5355\u4e2aNFT\u7684NFT\u6570\u636e\u5728\u63a7\u5236\u53f0\u4e0a\u7684\u6253\u5370\u7ed3\u679c\uff0c\u6211\u4eec\u4e3b\u8981\u5173\u6ce8\u7684\u662f ",(0,r.kt)("inlineCode",{parentName:"p"},"uri")," \u5b57\u6bb5\uff1a"),(0,r.kt)("p",null,(0,r.kt)("img",{src:t(5144).Z,width:"1500",height:"750"})),(0,r.kt)("p",null,"\u987a\u4fbf\u8bf4\u4e00\u4e0b\uff0c\u8fd8\u6709\u5f88\u591a\u5176\u4ed6\u65b9\u6cd5\u53ef\u4ee5\u83b7\u53d6NFT\uff1a"),(0,r.kt)("p",null,(0,r.kt)("img",{src:t(9553).Z,width:"1116",height:"566"})),(0,r.kt)("p",null,"\u8ba9\u6211\u4eec\u5199\u4e9b\u4ee3\u7801\u5427\uff01"))}u.isMDXComponent=!0},4375:(e,n,t)=>{t.d(n,{Z:()=>a});const a=t.p+"assets/images/display-nft-a9c7b5c0874d024f8f84fdeff19c05c7.png"},5144:(e,n,t)=>{t.d(n,{Z:()=>a});const a=t.p+"assets/images/nft-url-6053c320b078906e1bdd6784c5d1e749.png"},9553:(e,n,t)=>{t.d(n,{Z:()=>a});const a=t.p+"assets/images/other-way-find-nft-c6855fe719c8db53e47b8a18be2dce14.png"}}]);