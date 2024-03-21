"use strict";(self.webpackChunkall_in_one_solana=self.webpackChunkall_in_one_solana||[]).push([[9346],{3905:(e,t,l)=>{l.d(t,{Zo:()=>c,kt:()=>d});var a=l(67294);function n(e,t,l){return t in e?Object.defineProperty(e,t,{value:l,enumerable:!0,configurable:!0,writable:!0}):e[t]=l,e}function r(e,t){var l=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),l.push.apply(l,a)}return l}function o(e){for(var t=1;t<arguments.length;t++){var l=null!=arguments[t]?arguments[t]:{};t%2?r(Object(l),!0).forEach((function(t){n(e,t,l[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(l)):r(Object(l)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(l,t))}))}return e}function i(e,t){if(null==e)return{};var l,a,n=function(e,t){if(null==e)return{};var l,a,n={},r=Object.keys(e);for(a=0;a<r.length;a++)l=r[a],t.indexOf(l)>=0||(n[l]=e[l]);return n}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)l=r[a],t.indexOf(l)>=0||Object.prototype.propertyIsEnumerable.call(e,l)&&(n[l]=e[l])}return n}var u=a.createContext({}),p=function(e){var t=a.useContext(u),l=t;return e&&(l="function"==typeof e?e(t):o(o({},t),e)),l},c=function(e){var t=p(e.components);return a.createElement(u.Provider,{value:t},e.children)},s="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},k=a.forwardRef((function(e,t){var l=e.components,n=e.mdxType,r=e.originalType,u=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),s=p(l),k=n,d=s["".concat(u,".").concat(k)]||s[k]||m[k]||r;return l?a.createElement(d,o(o({ref:t},c),{},{components:l})):a.createElement(d,o({ref:t},c))}));function d(e,t){var l=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var r=l.length,o=new Array(r);o[0]=k;var i={};for(var u in t)hasOwnProperty.call(t,u)&&(i[u]=t[u]);i.originalType=e,i[s]="string"==typeof e?e:n,o[1]=i;for(var p=2;p<r;p++)o[p]=l[p];return a.createElement.apply(null,o)}return a.createElement.apply(null,l)}k.displayName="MDXCreateElement"},91428:(e,t,l)=>{l.r(t),l.d(t,{assets:()=>u,contentTitle:()=>o,default:()=>m,frontMatter:()=>r,metadata:()=>i,toc:()=>p});var a=l(87462),n=(l(67294),l(3905));const r={sidebar_position:1,sidebar_label:"\u5165\u95e8",sidebar_class_name:"green",tags:["blockchain","introduction"]},o="\u8bfe\u7a0b\u6307\u5357",i={unversionedId:"module0/README",id:"module0/README",title:"\u8bfe\u7a0b\u6307\u5357",description:"\u6b22\u8fce\uff01",source:"@site/docs/solana-development-course/module0/README.md",sourceDirName:"module0",slug:"/module0/",permalink:"/solana-co-learn/solana-development-course/module0/",draft:!1,editUrl:"https://github.com/CreatorsDAO/solana-co-learn/tree/main/docs/solana-development-course/module0/README.md",tags:[{label:"blockchain",permalink:"/solana-co-learn/solana-development-course/tags/blockchain"},{label:"introduction",permalink:"/solana-co-learn/solana-development-course/tags/introduction"}],version:"current",lastUpdatedBy:"v1xingyue",lastUpdatedAt:1710985935,formattedLastUpdatedAt:"Mar 21, 2024",sidebarPosition:1,frontMatter:{sidebar_position:1,sidebar_label:"\u5165\u95e8",sidebar_class_name:"green",tags:["blockchain","introduction"]},sidebar:"tutorialSidebar",previous:{title:"Solana \u5f00\u53d1\u8bfe\u7a0b",permalink:"/solana-co-learn/solana-development-course/"},next:{title:"\u5bc6\u7801\u5b66\u548c Solana \u5ba2\u6237\u7aef\u7b80\u4ecb",permalink:"/solana-co-learn/solana-development-course/module1/"}},u={},p=[{value:"\u6b22\u8fce\uff01",id:"\u6b22\u8fce",level:2},{value:"\u4ec0\u4e48\u662f Web3\uff1f",id:"\u4ec0\u4e48\u662f-web3",level:2},{value:"\u4ec0\u4e48\u662f Solana\uff1f",id:"\u4ec0\u4e48\u662f-solana",level:2},{value:"\u5f00\u59cb\u4e4b\u524d\u6211\u9700\u8981\u4ec0\u4e48\uff1f",id:"\u5f00\u59cb\u4e4b\u524d\u6211\u9700\u8981\u4ec0\u4e48",level:2},{value:"\u8fd9\u95e8\u8bfe\u7a0b\u7684\u7ed3\u6784\u5982\u4f55\uff1f",id:"\u8fd9\u95e8\u8bfe\u7a0b\u7684\u7ed3\u6784\u5982\u4f55",level:2},{value:"\u5982\u4f55\u6709\u6548\u5730\u4f7f\u7528\u8fd9\u95e8\u8bfe\u7a0b\uff1f",id:"\u5982\u4f55\u6709\u6548\u5730\u4f7f\u7528\u8fd9\u95e8\u8bfe\u7a0b",level:2}],c={toc:p},s="wrapper";function m(e){let{components:t,...l}=e;return(0,n.kt)(s,(0,a.Z)({},c,l,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",{id:"\u8bfe\u7a0b\u6307\u5357"},"\u8bfe\u7a0b\u6307\u5357"),(0,n.kt)("h2",{id:"\u6b22\u8fce"},"\u6b22\u8fce\uff01"),(0,n.kt)("p",null,"\u6b22\u8fce\u6765\u5230\u6700\u9002\u5408\u5e0c\u671b\u5b66\u4e60 Web3 \u548c\u533a\u5757\u94fe\u7684\u5f00\u53d1\u4eba\u5458\u7684\u8d77\u70b9\uff01"),(0,n.kt)("h2",{id:"\u4ec0\u4e48\u662f-web3"},"\u4ec0\u4e48\u662f Web3\uff1f"),(0,n.kt)("p",null,"\u901a\u5e38\uff0c\u5728\u65e7\u7cfb\u7edf\u4e2d\uff0c\u4eba\u4eec\u901a\u8fc7\u7b2c\u4e09\u65b9\u5e73\u53f0\u76f8\u4e92\u4ea4\u4e92\uff1a"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},"\u7528\u6237\u5e10\u6237\u5b58\u50a8\u5728 Google\u3001X\uff08\u4ee5\u524d\u79f0\u4e3a Twitter\uff09\u548c Meta\uff08Facebook\u3001Instagram\uff09\u7b49\u5927\u578b\u5e73\u53f0\u4e0a\u3002\u8fd9\u4e9b\u5e10\u6237\u53ef\u4ee5\u7531\u516c\u53f8\u4efb\u610f\u5220\u9664\uff0c\u5e76\u4e14\u8fd9\u4e9b\u5e10\u6237\u201c\u62e5\u6709\u201d\u7684\u9879\u76ee\u53ef\u80fd\u4f1a\u6c38\u4e45\u4e22\u5931\u3002")),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},"\u5b58\u50a8\u4ef7\u503c\u7684\u5e10\u6237\uff08\u5982\u652f\u4ed8\u5361\u3001\u94f6\u884c\u5e10\u6237\u548c\u4ea4\u6613\u5e10\u6237\uff09\u7531\u5927\u578b\u5e73\u53f0\uff08\u5982\u4fe1\u7528\u5361\u516c\u53f8\u3001\u6c47\u6b3e\u7ec4\u7ec7\u548c\u80a1\u7968\u4ea4\u6613\u6240\uff09\u5904\u7406\u3002\u5728\u8bb8\u591a\u60c5\u51b5\u4e0b\uff0c\u8fd9\u4e9b\u516c\u53f8\u4f1a\u6536\u53d6\u5176\u5e73\u53f0\u4e0a\u53d1\u751f\u7684\u6bcf\u7b14\u4ea4\u6613\u7684\u4e00\u90e8\u5206\uff08\u7ea6\u4e3a 1% \u5230 3%\uff09\u3002\u4ed6\u4eec\u901a\u5e38\u4f1a\u653e\u6162\u4ea4\u6613\u7ed3\u7b97\u901f\u5ea6\uff0c\u4ee5\u4fbf\u4f7f\u7ec4\u7ec7\u53d7\u76ca\u3002\u5728\u67d0\u4e9b\u60c5\u51b5\u4e0b\uff0c\u88ab\u8f6c\u79fb\u7684\u7269\u54c1\u53ef\u80fd\u6839\u672c\u4e0d\u5c5e\u4e8e\u6536\u4ef6\u4eba\uff0c\u800c\u53ea\u662f\u7531\u6536\u4ef6\u4eba\u4ee3\u4e3a\u4fdd\u7ba1\u3002"))),(0,n.kt)("p",null,"Web3 \u662f\u4e92\u8054\u7f51\u7684\u6f14\u53d8\uff0c\u5b83\u5141\u8bb8\u4eba\u4eec\u76f4\u63a5\u76f8\u4e92\u4ea4\u6613\uff1a"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},"\u7528\u6237\u62e5\u6709\u81ea\u5df1\u7684\u5e10\u6237\uff0c\u7531\u4ed6\u4eec\u7684\u94b1\u5305\u4ee3\u8868\u3002")),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},"\u4ef7\u503c\u8f6c\u79fb\u53ef\u4ee5\u76f4\u63a5\u5728\u7528\u6237\u4e4b\u95f4\u8fdb\u884c\u3002")),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},"\u4ee3\u8868\u8d27\u5e01\u3001\u6570\u5b57\u827a\u672f\u3001\u6d3b\u52a8\u95e8\u7968\u3001\u623f\u5730\u4ea7\u6216\u5176\u4ed6\u4efb\u4f55\u4e8b\u7269\u7684\u4ee3\u5e01\u5b8c\u5168\u7531\u7528\u6237\u4fdd\u7ba1\u3002"))),(0,n.kt)("p",null,"Web3 \u7684\u5e38\u89c1\u7528\u9014\u5305\u62ec\uff1a"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},"\u4ee5\u63a5\u8fd1\u96f6\u7684\u8d39\u7528\u548c\u5373\u65f6\u7ed3\u7b97\u5728\u7ebf\u9500\u552e\u5546\u54c1\u548c\u670d\u52a1\u3002"),(0,n.kt)("li",{parentName:"ul"},"\u9500\u552e\u6570\u5b57\u6216\u5b9e\u4f53\u7269\u54c1\uff0c\u786e\u4fdd\u6bcf\u4e2a\u7269\u54c1\u90fd\u662f\u771f\u54c1\uff0c\u5e76\u4e14\u526f\u672c\u53ef\u4ee5\u4e0e\u539f\u59cb\u7269\u54c1\u533a\u5206\u5f00\u6765\u3002"),(0,n.kt)("li",{parentName:"ul"},"\u5373\u65f6\u5168\u7403\u652f\u4ed8\uff0c\u65e0\u9700\u201c\u6c47\u6b3e\u201d\u516c\u53f8\u7684\u6642\u9593\u548c\u8d39\u7528\u3002")),(0,n.kt)("h2",{id:"\u4ec0\u4e48\u662f-solana"},"\u4ec0\u4e48\u662f Solana\uff1f"),(0,n.kt)("p",null,"Solana \u662f\u7b2c\u4e00\u4e2a\u53ef\u6269\u5c55\u7684 Layer 1 \u533a\u5757\u94fe\u3002"),(0,n.kt)("p",null,"\u4e0e\u6bd4\u7279\u5e01\u548c\u4ee5\u592a\u574a\u7b49\u65e7\u5e73\u53f0\u76f8\u6bd4\uff0cSolana \u5177\u6709\u4ee5\u4e0b\u4f18\u52bf\uff1a"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},"\u663e\u8457\u66f4\u5feb - \u5927\u591a\u6570\u4ea4\u6613\u5728\u4e00\u4e24\u79d2\u5185\u5b8c\u6210\u3002"),(0,n.kt)("li",{parentName:"ul"},"\u5927\u5e45\u66f4\u4fbf\u5b9c - \u4ea4\u6613\u8d39\u7528\uff08\u5728\u65e7\u7f51\u7edc\u4e2d\u79f0\u4e3a\u201cgas \u8d39\u201d\uff09\u901a\u5e38\u4e3a 0.000025 \u7f8e\u5143\uff08\u662f\u7684\uff0c\u8fdc\u8fdc\u4e0d\u5230\u4e00\u7f8e\u5206\uff09\uff0c\u65e0\u8bba\u8f6c\u79fb\u4ec0\u4e48\u4ef7\u503c\u3002"),(0,n.kt)("li",{parentName:"ul"},"\u9ad8\u5ea6\u53bb\u4e2d\u5fc3\u5316\uff0c\u5177\u6709\u6240\u6709\u6743\u76ca\u8bc1\u660e\u7f51\u7edc\u4e2d\u6700\u9ad8\u7684 Nakamoto \u7cfb\u6570\uff08\u53bb\u4e2d\u5fc3\u5316\u8bc4\u5206\uff09\u4e4b\u4e00\u3002\nSolana \u4e0a\u7684\u8bb8\u591a\u5e38\u89c1\u7528\u4f8b\u7531\u4e8e\u65e7\u533a\u5757\u94fe\u7684\u9ad8\u6210\u672c\u548c\u7f13\u6162\u7684\u4ea4\u6613\u65f6\u95f4\u800c\u5728 Solana \u4e0a\u624d\u6709\u53ef\u80fd\u3002")),(0,n.kt)("p",null,"\u6211\u5c06\u5728\u8fd9\u95e8\u8bfe\u7a0b\u4e2d\u5b66\u4e60\u4ec0\u4e48\uff1f"),(0,n.kt)("p",null,"\u5728\u8fd9\u95e8\u8bfe\u7a0b\u4e2d\uff0c\u60a8\u5c06\uff1a"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},"\u521b\u5efa\u5141\u8bb8\u4eba\u4eec\u4f7f\u7528 Web3 \u94b1\u5305\u767b\u5f55\u7684 Web \u5e94\u7528\u7a0b\u5e8f"),(0,n.kt)("li",{parentName:"ul"},"\u5728\u4eba\u4e0e\u4eba\u4e4b\u95f4\u8f6c\u8ba9\u4ee3\u5e01\uff08\u5982 USDC\uff0c\u4e00\u79cd\u4ee3\u8868\u7f8e\u5143\u7684\u4ee3\u5e01\uff09"),(0,n.kt)("li",{parentName:"ul"},"\u5c06 Solana pay \u7b49\u5de5\u5177\u96c6\u6210\u5230\u60a8\u73b0\u6709\u7684\u5e94\u7528\u7a0b\u5e8f\u4e2d"),(0,n.kt)("li",{parentName:"ul"},"\u6784\u5efa\u4e00\u4e2a\u7535\u5f71\u8bc4\u8bba\u5e94\u7528\u7a0b\u5e8f\uff0c\u8be5\u5e94\u7528\u7a0b\u5e8f\u5728 Solana \u533a\u5757\u94fe\u4e0a\u5b9e\u65f6\u8fd0\u884c\u3002\u60a8\u5c06\u6784\u5efa\u4e00\u4e2a Web \u524d\u7aef\u548c\u5e94\u7528\u7a0b\u5e8f\u7684\u540e\u7aef\u7a0b\u5e8f\u548c\u6570\u636e\u5e93"),(0,n.kt)("li",{parentName:"ul"},"\u94f8\u9020\u5927\u89c4\u6a21 NFT \u7cfb\u5217")),(0,n.kt)("p",null,"\u7b49\u7b49\u3002\u6211\u4eec\u6b63\u5728\u4e0d\u65ad\u66f4\u65b0\u8fd9\u95e8\u8bfe\u7a0b\uff0c\u56e0\u6b64\u968f\u7740\u65b0\u6280\u672f\u52a0\u5165 Solana \u751f\u6001\u7cfb\u7edf\uff0c\u60a8\u5c06\u5728\u6b64\u5904\u627e\u5230\u8bfe\u7a0b\u3002"),(0,n.kt)("h2",{id:"\u5f00\u59cb\u4e4b\u524d\u6211\u9700\u8981\u4ec0\u4e48"},"\u5f00\u59cb\u4e4b\u524d\u6211\u9700\u8981\u4ec0\u4e48\uff1f"),(0,n.kt)("p",null,"\u60a8\u4e0d\u9700\u8981\u4ee5\u524d\u7684\u533a\u5757\u94fe\u7ecf\u9a8c\u5373\u53ef\u53c2\u52a0\u8fd9\u95e8\u8bfe\u7a0b\uff01"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},"Linux\u3001Mac \u6216 Windows \u8ba1\u7b97\u673a\u3002Windows \u8ba1\u7b97\u673a\u5e94\u5b89\u88c5 Windows Terminal WSL\u3002"),(0,n.kt)("li",{parentName:"ul"},"\u57fa\u672c\u7684 JavaScript/TypeScript \u7f16\u7a0b\u7ecf\u9a8c\u3002\u6211\u4eec\u8fd8\u4f1a\u4f7f\u7528\u4e00\u4e9b Rust\uff0c\u4f46\u6211\u4eec\u4f1a\u8fb9\u8bb2 Rust \u8fb9\u8bb2\u3002"),(0,n.kt)("li",{parentName:"ul"},"\u5b89\u88c5\u4e86 node.js 18"),(0,n.kt)("li",{parentName:"ul"},"\u5b89\u88c5\u4e86 Rust"),(0,n.kt)("li",{parentName:"ul"},"\u547d\u4ee4\u884c\u7684\u57fa\u672c\u4f7f\u7528")),(0,n.kt)("h2",{id:"\u8fd9\u95e8\u8bfe\u7a0b\u7684\u7ed3\u6784\u5982\u4f55"},"\u8fd9\u95e8\u8bfe\u7a0b\u7684\u7ed3\u6784\u5982\u4f55\uff1f"),(0,n.kt)("p",null,"\u6a21\u5757\u6db5\u76d6\u7279\u5b9a\u4e3b\u9898\u3002\u8fd9\u4e9b\u6a21\u5757\u88ab\u5206\u89e3\u4e3a\u5355\u72ec\u7684\u8bfe\u7a0b\u3002"),(0,n.kt)("p",null,"\u6bcf\u4e2a\u8bfe\u7a0b\u90fd\u4ece\u5217\u51fa\u8bfe\u7a0b\u76ee\u6807\u5f00\u59cb\uff0c\u5373\u60a8\u5c06\u5728\u8bfe\u7a0b\u4e2d\u5b66\u4e60\u7684\u5185\u5bb9\u3002"),(0,n.kt)("p",null,"\u7136\u540e\u6709\u4e00\u4e2a\u7b80\u77ed\u7684\u201cTL;DR\u201d\uff0c\u4ee5\u4fbf\u60a8\u53ef\u4ee5\u6d4f\u89c8\u4e00\u4e0b\uff0c\u4e86\u89e3\u8bfe\u7a0b\u6db5\u76d6\u7684\u5185\u5bb9\uff0c\u5e76\u51b3\u5b9a\u8bfe\u7a0b\u662f\u5426\u9002\u5408\u60a8\u3002"),(0,n.kt)("p",null,"\u7136\u540e\u6bcf\u4e2a\u8bfe\u7a0b\u90fd\u6709\u4e09\u4e2a\u90e8\u5206\uff1a"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},"\u6982\u8ff0 - \u6982\u8ff0\u5305\u542b\u8bf4\u660e\u6027\u6587\u672c\u3001\u793a\u4f8b\u548c\u4ee3\u7801\u7247\u6bb5\u3002\u60a8\u4e0d\u9700\u8981\u6309\u7167\u6b64\u5904\u663e\u793a\u7684\u4efb\u4f55\u793a\u4f8b\u8fdb\u884c\u7f16\u7801\u3002\u76ee\u6807\u53ea\u662f\u9605\u8bfb\u5e76\u521d\u6b65\u4e86\u89e3\u8bfe\u7a0b\u4e3b\u9898\u3002"),(0,n.kt)("li",{parentName:"ul"},"\u6f14\u793a - \u6f14\u793a\u662f\u4e00\u4e2a\u6559\u7a0b\u5f0f\u7684\u9879\u76ee\u3002\u60a8\u7edd\u5bf9\u5e94\u8be5\u6309\u7167\u6b64\u90e8\u5206\u8fdb\u884c\u7f16\u7801\u3002\u8fd9\u662f\u60a8\u7b2c\u4e8c\u6b21\u63a5\u89e6\u5185\u5bb9\uff0c\u4e5f\u662f\u60a8\u7b2c\u4e00\u6b21\u6709\u673a\u4f1a\u6df1\u5165\u4e86\u89e3\u5e76\u53bb\u505a\u3002"),(0,n.kt)("li",{parentName:"ul"},"\u6311\u6218 - \u6311\u6218\u5305\u542b\u4e00\u4e2a\u4e0e\u6f14\u793a\u7c7b\u4f3c\u7684\u9879\u76ee\uff0c\u53ea\u662f\u6ca1\u6709\u5f15\u5bfc\u60a8\u5b8c\u6210\u5b83\uff0c\u800c\u662f\u53ea\u7559\u4e0b\u4e86\u4e00\u4e9b\u7b80\u5355\u7684\u63d0\u793a\uff0c\u60a8\u5e94\u8be5\u72ec\u7acb\u5b8c\u6210\u3002")),(0,n.kt)("p",null,"\u8fd9\u79cd\u7ed3\u6784\u501f\u9274\u4e86\u4e00\u79cd\u79f0\u4e3a IWY \u5faa\u73af\u7684\u6559\u5b66\u65b9\u6cd5\u3002IWY \u4ee3\u8868\u201c\u6211\u505a\uff0c\u6211\u4eec\u505a\uff0c\u4f60\u505a\u201d\u3002\u6cbf\u9014\u7684\u6bcf\u4e2a\u6b65\u9aa4\u90fd\u4f1a\u589e\u52a0\u60a8\u5bf9\u4e3b\u9898\u7684\u4e86\u89e3\uff0c\u5e76\u51cf\u5c11\u60a8\u83b7\u5f97\u7684\u6307\u5bfc\u91cf\u3002"),(0,n.kt)("h2",{id:"\u5982\u4f55\u6709\u6548\u5730\u4f7f\u7528\u8fd9\u95e8\u8bfe\u7a0b"},"\u5982\u4f55\u6709\u6548\u5730\u4f7f\u7528\u8fd9\u95e8\u8bfe\u7a0b\uff1f"),(0,n.kt)("p",null,"\u8fd9\u91cc\u7684\u8bfe\u7a0b\u975e\u5e38\u6709\u6548\uff0c\u4f46\u6bcf\u4e2a\u4eba\u90fd\u6765\u81ea\u4e0d\u540c\u7684\u80cc\u666f\u548c\u80fd\u529b\uff0c\u9759\u6001\u5185\u5bb9\u65e0\u6cd5\u8003\u8651\u8fd9\u4e9b\u56e0\u7d20\u3002\u8003\u8651\u5230\u8fd9\u4e00\u70b9\uff0c\u4ee5\u4e0b\u662f\u6709\u5173\u5982\u4f55\u5145\u5206\u5229\u7528\u8bfe\u7a0b\u7684\u4e09\u9879\u5efa\u8bae\uff1a"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},"\u5bf9\u81ea\u5df1\u8bda\u5b9e\u2014\u2014\u8fd9\u53ef\u80fd\u542c\u8d77\u6765\u6709\u70b9\u542b\u7cca\uff0c\u4f46\u5bf9\u81ea\u5df1\u8bda\u5b9e\uff0c\u4e86\u89e3\u81ea\u5df1\u5bf9\u67d0\u4e2a\u4e3b\u9898\u7684\u7406\u89e3\u7a0b\u5ea6\u5bf9\u4e8e\u638c\u63e1\u5b83\u81f3\u5173\u91cd\u8981\u3002\u8bfb\u5230\u4e00\u4ef6\u4e8b\u5e76\u60f3\u201c\u662f\u7684\uff0c\u662f\u7684\uff0c\u6211\u660e\u767d\u4e86\u201d\uff0c\u7136\u540e\u624d\u610f\u8bc6\u5230\u4f60\u5b9e\u9645\u4e0a\u6ca1\u6709\u660e\u767d\uff0c\u8fd9\u771f\u7684\u5f88\u5bb9\u6613\u3002\u5728\u5b66\u4e60\u6bcf\u4e00\u8bfe\u65f6\u8981\u5bf9\u81ea\u5df1\u8bda\u5b9e\u3002\u5982\u679c\u60a8\u9700\u8981\uff0c\u8bf7\u6beb\u4e0d\u72b9\u8c6b\u5730\u91cd\u590d\u67d0\u4e9b\u90e8\u5206\uff0c\u6216\u8005\u5f53\u8bfe\u7a0b\u63aa\u8f9e\u4e0d\u592a\u9002\u5408\u60a8\u65f6\u8fdb\u884c\u5916\u90e8\u7814\u7a76\u3002")),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},"\u505a\u6bcf\u4e00\u4e2a\u6f14\u793a\u548c\u6311\u6218\u2014\u2014\u8fd9\u652f\u6301\u4e86\u7b2c\u4e00\u70b9\u3002\u5f53\u4f60\u5f3a\u8feb\u81ea\u5df1\u5c1d\u8bd5\u505a\u67d0\u4ef6\u4e8b\u65f6\uff0c\u5f88\u96be\u5bf9\u81ea\u5df1\u6492\u8c0e\u8bf4\u4f60\u5bf9\u67d0\u4ef6\u4e8b\u6709\u591a\u4e86\u89e3\u3002\u8fdb\u884c\u6bcf\u4e2a\u6f14\u793a\u548c\u6bcf\u4e2a\u6311\u6218\u6765\u6d4b\u8bd5\u60a8\u6240\u5904\u7684\u4f4d\u7f6e\uff0c\u5e76\u6839\u636e\u9700\u8981\u91cd\u590d\u5b83\u4eec\u3002\u6211\u4eec\u4e3a\u6240\u6709\u5185\u5bb9\u63d0\u4f9b\u89e3\u51b3\u65b9\u6848\u4ee3\u7801\uff0c\u4f46\u8bf7\u52a1\u5fc5\u5c06\u5176\u7528\u4f5c\u6709\u7528\u7684\u8d44\u6e90\u800c\u4e0d\u662f\u62d0\u6756\u3002")),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},"\u8d85\u8d8a\u2014\u2014\u6211\u77e5\u9053\u8fd9\u542c\u8d77\u6765\u5f88\u9648\u8bcd\u6ee5\u8c03\uff0c\u4f46\u4e0d\u8981\u4ec5\u4ec5\u505c\u7559\u5728\u6f14\u793a\u548c\u6311\u6218\u8981\u6c42\u4f60\u505a\u7684\u4e8b\u60c5\u4e0a\u3002\u53d1\u6325\u521b\u610f\uff01\u628a\u8fd9\u4e9b\u9879\u76ee\u53d8\u6210\u4f60\u81ea\u5df1\u7684\u3002\u8d85\u8d8a\u4ed6\u4eec\u3002\u4f60\u7ec3\u4e60\u5f97\u8d8a\u591a\uff0c\u4f60\u5c31\u4f1a\u8d8a\u597d\u3002"))),(0,n.kt)("p",null,"\u597d\u4e86\uff0c\u6211\u7684\u52b1\u5fd7\u6f14\u8bb2\u5c31\u5230\u6b64\u4e3a\u6b62\u3002\u8ffd\u4e0a\u5b83\u5427\uff01"))}m.isMDXComponent=!0}}]);