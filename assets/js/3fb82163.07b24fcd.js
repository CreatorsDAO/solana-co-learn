"use strict";(self.webpackChunkall_in_one_solana=self.webpackChunkall_in_one_solana||[]).push([[5259],{3905:(e,n,t)=>{t.d(n,{Zo:()=>s,kt:()=>f});var a=t(67294);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function l(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?l(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function i(e,n){if(null==e)return{};var t,a,r=function(e,n){if(null==e)return{};var t,a,r={},l=Object.keys(e);for(a=0;a<l.length;a++)t=l[a],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)t=l[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var p=a.createContext({}),c=function(e){var n=a.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},s=function(e){var n=c(e.components);return a.createElement(p.Provider,{value:n},e.children)},u="mdxType",g={inlineCode:"code",wrapper:function(e){var n=e.children;return a.createElement(a.Fragment,{},n)}},m=a.forwardRef((function(e,n){var t=e.components,r=e.mdxType,l=e.originalType,p=e.parentName,s=i(e,["components","mdxType","originalType","parentName"]),u=c(t),m=r,f=u["".concat(p,".").concat(m)]||u[m]||g[m]||l;return t?a.createElement(f,o(o({ref:n},s),{},{components:t})):a.createElement(f,o({ref:n},s))}));function f(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var l=t.length,o=new Array(l);o[0]=m;var i={};for(var p in n)hasOwnProperty.call(n,p)&&(i[p]=n[p]);i.originalType=e,i[u]="string"==typeof e?e:r,o[1]=i;for(var c=2;c<l;c++)o[c]=t[c];return a.createElement.apply(null,o)}return a.createElement.apply(null,t)}m.displayName="MDXCreateElement"},83021:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>p,contentTitle:()=>o,default:()=>g,frontMatter:()=>l,metadata:()=>i,toc:()=>c});var a=t(87462),r=(t(67294),t(3905));const l={slug:"pileline",title:"Pipelining in Solana The Transaction Processing Unit",authors:["davirain"],tags:["blog","blockchain","solana","pipeline"]},o=void 0,i={permalink:"/solana-co-learn/blog/pileline",editUrl:"https://creatorsdao.github.io/solana-co-learn/blog/blog/2023-09-28/pipeline.md",source:"@site/blog/2023-09-28/pipeline.md",title:"Pipelining in Solana The Transaction Processing Unit",description:"\u4e3a\u4e86\u8fbe\u5230\u4e9a\u79d2\u7ea7\u7684\u786e\u8ba4\u65f6\u95f4\u548c Solana \u6210\u4e3a\u4e16\u754c\u4e0a\u7b2c\u4e00\u4e2a\u7f51\u7edc\u89c4\u6a21\u533a\u5757\u94fe\u6240\u9700\u7684\u4ea4\u6613\u80fd\u529b\uff0c\u4ec5\u4ec5\u5feb\u901f\u8fbe\u6210\u5171\u8bc6\u662f\u4e0d\u591f\u7684\u3002\u8be5\u56e2\u961f\u5fc5\u987b\u5f00\u53d1\u4e00\u79cd\u65b9\u6cd5\u6765\u5feb\u901f\u9a8c\u8bc1\u5927\u91cf\u4ea4\u6613\u5757\uff0c\u540c\u65f6\u5728\u7f51\u7edc\u4e0a\u5feb\u901f\u590d\u5236\u5b83\u4eec\u3002\u4e3a\u4e86\u5b9e\u73b0\u8fd9\u4e00\u76ee\u6807\uff0cSolana \u7f51\u7edc\u4e0a\u7684\u4e8b\u52a1\u9a8c\u8bc1\u8fc7\u7a0b\u5e7f\u6cdb\u4f7f\u7528\u4e86 CPU \u8bbe\u8ba1\u4e2d\u5e38\u89c1\u7684\u4e00\u79cd\u79f0\u4e3a\u7ba1\u9053\u7684\u4f18\u5316\u3002",date:"2023-09-28T00:00:00.000Z",formattedDate:"September 28, 2023",tags:[{label:"blog",permalink:"/solana-co-learn/blog/tags/blog"},{label:"blockchain",permalink:"/solana-co-learn/blog/tags/blockchain"},{label:"solana",permalink:"/solana-co-learn/blog/tags/solana"},{label:"pipeline",permalink:"/solana-co-learn/blog/tags/pipeline"}],readingTime:5.65,hasTruncateMarker:!1,authors:[{name:"Davirain",title:"Davirain Blog",url:"https://github.com/DaviRain-Su",imageURL:"https://github.com/DaviRain-Su.png",key:"davirain"}],frontMatter:{slug:"pileline",title:"Pipelining in Solana The Transaction Processing Unit",authors:["davirain"],tags:["blog","blockchain","solana","pipeline"]},prevItem:{title:"Gulf Stream Solana Mempool-less Transaction Forwarding Protocol",permalink:"/solana-co-learn/blog/gulf-stream"},nextItem:{title:"Proof of History A Clock for Blockchain",permalink:"/solana-co-learn/blog/proof-of-history"}},p={authorsImageUrls:[void 0]},c=[],s={toc:c},u="wrapper";function g(e){let{components:n,...t}=e;return(0,r.kt)(u,(0,a.Z)({},s,t,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"\u4e3a\u4e86\u8fbe\u5230\u4e9a\u79d2\u7ea7\u7684\u786e\u8ba4\u65f6\u95f4\u548c Solana \u6210\u4e3a\u4e16\u754c\u4e0a\u7b2c\u4e00\u4e2a\u7f51\u7edc\u89c4\u6a21\u533a\u5757\u94fe\u6240\u9700\u7684\u4ea4\u6613\u80fd\u529b\uff0c\u4ec5\u4ec5\u5feb\u901f\u8fbe\u6210\u5171\u8bc6\u662f\u4e0d\u591f\u7684\u3002\u8be5\u56e2\u961f\u5fc5\u987b\u5f00\u53d1\u4e00\u79cd\u65b9\u6cd5\u6765\u5feb\u901f\u9a8c\u8bc1\u5927\u91cf\u4ea4\u6613\u5757\uff0c\u540c\u65f6\u5728\u7f51\u7edc\u4e0a\u5feb\u901f\u590d\u5236\u5b83\u4eec\u3002\u4e3a\u4e86\u5b9e\u73b0\u8fd9\u4e00\u76ee\u6807\uff0cSolana \u7f51\u7edc\u4e0a\u7684\u4e8b\u52a1\u9a8c\u8bc1\u8fc7\u7a0b\u5e7f\u6cdb\u4f7f\u7528\u4e86 CPU \u8bbe\u8ba1\u4e2d\u5e38\u89c1\u7684\u4e00\u79cd\u79f0\u4e3a\u7ba1\u9053\u7684\u4f18\u5316\u3002"),(0,r.kt)("p",null,"\u5f53\u5b58\u5728\u9700\u8981\u901a\u8fc7\u4e00\u7cfb\u5217\u6b65\u9aa4\u5904\u7406\u7684\u8f93\u5165\u6570\u636e\u6d41\u5e76\u4e14\u6bcf\u4e2a\u6b65\u9aa4\u90fd\u6709\u4e0d\u540c\u7684\u786c\u4ef6\u8d1f\u8d23\u65f6\uff0c\u6d41\u6c34\u7ebf\u662f\u4e00\u4e2a\u5408\u9002\u7684\u8fc7\u7a0b\u3002\u89e3\u91ca\u8fd9\u4e00\u70b9\u7684\u5178\u578b\u6bd4\u55bb\u662f\u6d17\u8863\u673a\u548c\u70d8\u5e72\u673a\uff0c\u5b83\u6309\u987a\u5e8f\u6d17\u6da4/\u70d8\u5e72/\u6298\u53e0\u591a\u6279\u8863\u7269\u3002\u6e05\u6d17\u5fc5\u987b\u5728\u5e72\u71e5\u4e4b\u524d\u8fdb\u884c\uff0c\u5e72\u71e5\u4e4b\u524d\u5fc5\u987b\u8fdb\u884c\u6298\u53e0\uff0c\u4f46\u8fd9\u4e09\u4e2a\u64cd\u4f5c\u4e2d\u7684\u6bcf\u4e00\u4e2a\u90fd\u7531\u5355\u72ec\u7684\u5355\u5143\u6267\u884c\u3002"),(0,r.kt)("p",null,"\u4e3a\u4e86\u6700\u5927\u9650\u5ea6\u5730\u63d0\u9ad8\u6548\u7387\uff0c\u4eba\u4eec\u521b\u5efa\u4e86\u4e00\u7cfb\u5217\u9636\u6bb5\u7684\u7ba1\u9053\u3002\u6211\u4eec\u5c06\u6d17\u8863\u673a\u79f0\u4e3a\u7b2c\u4e00\u9636\u6bb5\uff0c\u70d8\u5e72\u673a\u79f0\u4e3a\u7b2c\u4e8c\u9636\u6bb5\uff0c\u6298\u53e0\u8fc7\u7a0b\u79f0\u4e3a\u7b2c\u4e09\u9636\u6bb5\u3002\u4e3a\u4e86\u8fd0\u884c\u7ba1\u9053\uff0c\u9700\u8981\u5728\u7b2c\u4e00\u6279\u8863\u7269\u6dfb\u52a0\u5230\u70d8\u5e72\u673a\u540e\u7acb\u5373\u5c06\u7b2c\u4e8c\u6279\u8863\u7269\u6dfb\u52a0\u5230\u6d17\u8863\u673a\u4e2d\u3002\u540c\u6837\uff0c\u7b2c\u4e09\u4e2a\u8d1f\u8f7d\u5728\u7b2c\u4e8c\u4e2a\u8d1f\u8f7d\u653e\u5165\u70d8\u5e72\u673a\u5e76\u4e14\u7b2c\u4e00\u4e2a\u8d1f\u8f7d\u88ab\u6298\u53e0\u4e4b\u540e\u6dfb\u52a0\u5230\u6d17\u8863\u673a\u3002\u901a\u8fc7\u8fd9\u79cd\u65b9\u5f0f\uff0c\u4eba\u4eec\u53ef\u4ee5\u540c\u65f6\u5904\u7406\u4e09\u6279\u8863\u7269\u3002\u7ed9\u5b9a\u65e0\u9650\u8d1f\u8f7d\uff0c\u7ba1\u9053\u5c06\u59cb\u7ec8\u4ee5\u7ba1\u9053\u4e2d\u6700\u6162\u9636\u6bb5\u7684\u901f\u7387\u5b8c\u6210\u8d1f\u8f7d\u3002"),(0,r.kt)("p",null,"\u201c\u6211\u4eec\u9700\u8981\u627e\u5230\u4e00\u79cd\u65b9\u6cd5\u8ba9\u6240\u6709\u786c\u4ef6\u59cb\u7ec8\u4fdd\u6301\u5fd9\u788c\u72b6\u6001\u3002\u8fd9\u5c31\u662f\u7f51\u5361\u3001CPU \u6838\u5fc3\u548c\u6240\u6709 GPU \u6838\u5fc3\u3002\u4e3a\u6b64\uff0c\u6211\u4eec\u501f\u9274\u4e86 CPU \u8bbe\u8ba1\u7684\u7ecf\u9a8c\u201d\uff0cSolana \u521b\u59cb\u4eba\u517c\u9996\u5e2d\u6280\u672f\u5b98 Greg Fitzgerald \u89e3\u91ca\u9053\u3002 \u201c\u6211\u4eec\u5728\u8f6f\u4ef6\u4e2d\u521b\u5efa\u4e86\u4e00\u4e2a\u56db\u7ea7\u4ea4\u6613\u5904\u7406\u5668\u3002\u6211\u4eec\u79f0\u4e4b\u4e3a TPU\uff0c\u6211\u4eec\u7684\u4ea4\u6613\u5904\u7406\u5355\u5143\u3002\u201d"),(0,r.kt)("p",null,(0,r.kt)("img",{parentName:"p",src:"https://miro.medium.com/v2/resize:fit:2000/format:webp/1*e0HE3BV4nfJAx_qOElC9ZQ.png",alt:null})),(0,r.kt)("p",null,"\u5728 Solana \u7f51\u7edc\u4e0a\uff0c\u7ba1\u9053\u673a\u5236\u2014\u2014\u4ea4\u6613\u5904\u7406\u5355\u5143\u2014\u2014\u901a\u8fc7\u5185\u6838\u7ea7\u522b\u7684\u6570\u636e\u83b7\u53d6\u3001GPU \u7ea7\u522b\u7684\u7b7e\u540d\u9a8c\u8bc1\u3001CPU \u7ea7\u522b\u7684\u5b58\u50a8\u548c\u5185\u6838\u7a7a\u95f4\u7684\u5199\u5165\u6765\u8fdb\u884c\u3002\u5f53 TPU \u5f00\u59cb\u5411\u9a8c\u8bc1\u5668\u53d1\u9001\u5757\u65f6\uff0c\u5b83\u5df2\u7ecf\u5728\u4e0b\u4e00\u7ec4\u6570\u636e\u5305\u4e2d\u83b7\u53d6\uff0c\u9a8c\u8bc1\u4e86\u5b83\u4eec\u7684\u7b7e\u540d\uff0c\u5e76\u5f00\u59cb\u8bb0\u5165\u4ee4\u724c\u3002"),(0,r.kt)("p",null,"\u9a8c\u8bc1\u5668\u8282\u70b9\u540c\u65f6\u8fd0\u884c\u4e24\u4e2a\u7ba1\u9053\u8fdb\u7a0b\uff0c\u4e00\u4e2a\u7528\u4e8e\u9886\u5bfc\u8005\u6a21\u5f0f\uff0c\u79f0\u4e3a TPU\uff0c\u53e6\u4e00\u4e2a\u7528\u4e8e\u9a8c\u8bc1\u5668\u6a21\u5f0f\uff0c\u79f0\u4e3a TVU\u3002\u5728\u8fd9\u4e24\u79cd\u60c5\u51b5\u4e0b\uff0c\u7ba1\u9053\u5316\u7684\u786c\u4ef6\u662f\u76f8\u540c\u7684\uff1a\u7f51\u7edc\u8f93\u5165\u3001GPU \u5361\u3001CPU \u5185\u6838\u3001\u78c1\u76d8\u5199\u5165\u548c\u7f51\u7edc\u8f93\u51fa\u3002\u5b83\u5bf9\u8be5\u786c\u4ef6\u7684\u4f5c\u7528\u662f\u4e0d\u540c\u7684\u3002 TPU \u7684\u5b58\u5728\u662f\u4e3a\u4e86\u521b\u5efa\u5206\u7c7b\u5e10\u6761\u76ee\uff0c\u800c TVU \u7684\u5b58\u5728\u662f\u4e3a\u4e86\u9a8c\u8bc1\u5b83\u4eec\u3002"),(0,r.kt)("p",null,"\u201c\u6211\u4eec\u77e5\u9053\u7b7e\u540d\u9a8c\u8bc1\u5c06\u6210\u4e3a\u74f6\u9888\uff0c\u4f46\u6211\u4eec\u4e5f\u53ef\u4ee5\u5c06\u8fd9\u79cd\u4e0e\u4e0a\u4e0b\u6587\u65e0\u5173\u7684\u64cd\u4f5c\u5378\u8f7d\u5230 GPU\uff0c\u201dFitzgersald \u8bf4\u9053\u3002 \u201c\u5373\u4f7f\u5378\u8f7d\u4e86\u8fd9\u4e00\u6700\u6602\u8d35\u7684\u64cd\u4f5c\uff0c\u4ecd\u7136\u5b58\u5728\u8bb8\u591a\u989d\u5916\u7684\u74f6\u9888\uff0c\u4f8b\u5982\u4e0e\u7f51\u7edc\u9a71\u52a8\u7a0b\u5e8f\u4ea4\u4e92\u4ee5\u53ca\u7ba1\u7406\u9650\u5236\u5e76\u53d1\u6027\u7684\u667a\u80fd\u5408\u7ea6\u4e2d\u7684\u6570\u636e\u4f9d\u8d56\u6027\u3002\u201d"),(0,r.kt)("p",null,"\u5728\u8fd9\u4e2a\u56db\u7ea7\u7ba1\u9053\u4e2d\u7684 GPU \u5e76\u884c\u5316\u4e4b\u95f4\uff0c\u5728\u4efb\u4f55\u7ed9\u5b9a\u65f6\u523b\uff0cSolana TPU \u90fd\u53ef\u4ee5\u540c\u65f6\u5904\u7406 50,000 \u4e2a\u4e8b\u52a1\u3002 \u201c\u8fd9\u4e00\u5207\u90fd\u53ef\u4ee5\u901a\u8fc7\u4e00\u53f0\u73b0\u6210\u7684\u8ba1\u7b97\u673a\u6765\u5b9e\u73b0\uff0c\u4ef7\u683c\u4e0d\u5230 5000 \u7f8e\u5143\uff0c\u201dFitzgerland \u89e3\u91ca\u9053\u3002 \u201c\u4e0d\u662f\u8d85\u7ea7\u8ba1\u7b97\u673a\u3002\u201d"),(0,r.kt)("p",null,"\u901a\u8fc7\u5c06 GPU \u5378\u8f7d\u5230 Solana \u7684\u4e8b\u52a1\u5904\u7406\u5355\u5143\u4e0a\uff0c\u7f51\u7edc\u53ef\u4ee5\u5f71\u54cd\u5355\u4e2a\u8282\u70b9\u7684\u6548\u7387\u3002\u5b9e\u73b0\u8fd9\u4e00\u76ee\u6807\u4e00\u76f4\u662f Solana \u81ea\u6210\u7acb\u4ee5\u6765\u7684\u76ee\u6807\u3002"),(0,r.kt)("p",null,"\u201c\u4e0b\u4e00\u4e2a\u6311\u6218\u662f\u4ee5\u67d0\u79cd\u65b9\u5f0f\u5c06\u5757\u4ece\u9886\u5bfc\u8282\u70b9\u53d1\u9001\u5230\u6240\u6709\u9a8c\u8bc1\u8282\u70b9\uff0c\u5e76\u4e14\u4ee5\u4e00\u79cd\u4e0d\u4f1a\u62e5\u585e\u7f51\u7edc\u5e76\u5bfc\u81f4\u541e\u5410\u91cf\u7f13\u6162\u7684\u65b9\u5f0f\u8fdb\u884c\uff0c\u201dFitzgerald \u7ee7\u7eed\u8bf4\u9053\u3002 \u201c\u4e3a\u6b64\uff0c\u6211\u4eec\u63d0\u51fa\u4e86\u4e00\u79cd\u79f0\u4e3a Turbine \u7684\u533a\u5757\u4f20\u64ad\u7b56\u7565\u3002"),(0,r.kt)("p",null,"\u201c\u901a\u8fc7 Turbine\uff0c\u6211\u4eec\u5c06\u9a8c\u8bc1\u5668\u8282\u70b9\u6784\u5efa\u4e3a\u591a\u4e2a\u7ea7\u522b\uff0c\u5176\u4e2d\u6bcf\u4e2a\u7ea7\u522b\u7684\u5927\u5c0f\u81f3\u5c11\u662f\u5176\u4e0a\u4e00\u7ea7\u7684\u4e24\u500d\u3002\u901a\u8fc7\u8fd9\u79cd\u7ed3\u6784\uff0c\u8fd9\u4e9b\u4e0d\u540c\u7684\u7ea7\u522b\uff0c\u786e\u8ba4\u65f6\u95f4\u6700\u7ec8\u4e0e\u6811\u7684\u9ad8\u5ea6\u6210\u6b63\u6bd4\uff0c\u800c\u4e0d\u662f\u4e0e\u6811\u4e2d\u7684\u8282\u70b9\u6570\u91cf\u6210\u6b63\u6bd4\uff0c\u540e\u8005\u8981\u5927\u5f97\u591a\u3002\u6bcf\u5f53\u7f51\u7edc\u89c4\u6a21\u6269\u5927\u4e00\u500d\u65f6\uff0c\u60a8\u90fd\u4f1a\u770b\u5230\u786e\u8ba4\u65f6\u95f4\u7565\u6709\u589e\u52a0\uff0c\u4f46\u4ec5\u6b64\u800c\u5df2\u3002\u201d"))}g.isMDXComponent=!0}}]);