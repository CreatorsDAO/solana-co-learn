"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[5846],{3905:(n,e,t)=>{t.d(e,{Zo:()=>p,kt:()=>d});var o=t(7294);function a(n,e,t){return e in n?Object.defineProperty(n,e,{value:t,enumerable:!0,configurable:!0,writable:!0}):n[e]=t,n}function r(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(n);e&&(o=o.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),t.push.apply(t,o)}return t}function i(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?r(Object(t),!0).forEach((function(e){a(n,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e))}))}return n}function l(n,e){if(null==n)return{};var t,o,a=function(n,e){if(null==n)return{};var t,o,a={},r=Object.keys(n);for(o=0;o<r.length;o++)t=r[o],e.indexOf(t)>=0||(a[t]=n[t]);return a}(n,e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);for(o=0;o<r.length;o++)t=r[o],e.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(n,t)&&(a[t]=n[t])}return a}var c=o.createContext({}),s=function(n){var e=o.useContext(c),t=e;return n&&(t="function"==typeof n?n(e):i(i({},e),n)),t},p=function(n){var e=s(n.components);return o.createElement(c.Provider,{value:e},n.children)},u="mdxType",m={inlineCode:"code",wrapper:function(n){var e=n.children;return o.createElement(o.Fragment,{},e)}},k=o.forwardRef((function(n,e){var t=n.components,a=n.mdxType,r=n.originalType,c=n.parentName,p=l(n,["components","mdxType","originalType","parentName"]),u=s(t),k=a,d=u["".concat(c,".").concat(k)]||u[k]||m[k]||r;return t?o.createElement(d,i(i({ref:e},p),{},{components:t})):o.createElement(d,i({ref:e},p))}));function d(n,e){var t=arguments,a=e&&e.mdxType;if("string"==typeof n||a){var r=t.length,i=new Array(r);i[0]=k;var l={};for(var c in e)hasOwnProperty.call(e,c)&&(l[c]=e[c]);l.originalType=n,l[u]="string"==typeof n?n:a,i[1]=l;for(var s=2;s<r;s++)i[s]=t[s];return o.createElement.apply(null,i)}return o.createElement.apply(null,t)}k.displayName="MDXCreateElement"},1835:(n,e,t)=>{t.r(e),t.d(e,{assets:()=>c,contentTitle:()=>i,default:()=>m,frontMatter:()=>r,metadata:()=>l,toc:()=>s});var o=t(7462),a=(t(7294),t(3905));const r={sidebar_position:29,sidebar_label:"\ud83c\udfe7 \u5728Solana\u4e0a\u94f8\u9020\u4ee3\u5e01",sidebar_class_name:"green"},i="\ud83c\udfe7 \u5728Solana\u4e0a\u94f8\u9020\u4ee3\u5e01",l={unversionedId:"Solana-Co-Learn/module2/spl-token/mint-token-on-solana/README",id:"Solana-Co-Learn/module2/spl-token/mint-token-on-solana/README",title:"\ud83c\udfe7 \u5728Solana\u4e0a\u94f8\u9020\u4ee3\u5e01",description:"\u662f\u65f6\u5019\u8ba9\u4ee3\u5e01\u4e0e\u5b83\u4eec\u7684\u521b\u9020\u8005\uff08\u4f60\uff09\u76f8\u9047\u4e86\u3002\u6211\u4eec\u5c06\u4ece\u4e0a\u4e00\u8282\u7684\u6784\u5efa\u90e8\u5206\u7ee7\u7eed\u8fdb\u884c\u3002\u5982\u679c\u9700\u8981\uff0c\u4f60\u53ef\u4ee5\u4ece\u8fd9\u91cc\u83b7\u53d6\u8d77\u59cb\u4ee3\u7801\uff08\u786e\u4fdd\u4f60\u5728 solution-without-burn \u5206\u652f\u4e0a\uff09\u3002\u8bf4\u4e86\u8fd9\u4e48\u591a\uff0c\u8ba9\u6211\u4eec\u6765\u521b\u9020\u4e00\u4e9b\u795e\u5947\u7684\u4e92\u8054\u7f51\u8d27\u5e01\u5427\u3002\u5728\u6211\u4eec\u7684\u6700\u7ec8\u9879\u76ee\u4e2d\uff0c\u6211\u4eec\u5c06\u521b\u5efa\u4e00\u4e2a\u4ee3\u5e01\uff0c\u4f60\u5c06\u968f\u7740\u62b5\u62bc\u4f60\u7684\u793e\u533aNFT\u800c\u9010\u6e10\u83b7\u5f97\u5b83\u3002\u5728\u90a3\u4e4b\u524d\uff0c\u8ba9\u6211\u4eec\u5148\u73a9\u4e00\u4e0b\u5b9e\u9645\u6784\u5efa\u8fd9\u4e2a\u94f8\u5e01\u8fc7\u7a0b\u7684\u8fc7\u7a0b\u3002\u73b0\u5728\u662f\u53d1\u6325\u4f60\u7684\u60f3\u8c61\u529b\uff0c\u5c3d\u60c5\u4eab\u53d7\u7684\u597d\u65f6\u673a\u3002\u4e5f\u8bb8\u4f60\u4e00\u76f4\u60f3\u521b\u5efa\u81ea\u5df1\u7684\u6a21\u56e0\u5e01 - \u73b0\u5728\u662f\u4f60\u7684\u673a\u4f1a\u4e86 \ud83d\ude80",source:"@site/docs/Solana-Co-Learn/module2/spl-token/mint-token-on-solana/README.md",sourceDirName:"Solana-Co-Learn/module2/spl-token/mint-token-on-solana",slug:"/Solana-Co-Learn/module2/spl-token/mint-token-on-solana/",permalink:"/all-in-one-solana/docs/Solana-Co-Learn/module2/spl-token/mint-token-on-solana/",draft:!1,editUrl:"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/Solana-Co-Learn/module2/spl-token/mint-token-on-solana/README.md",tags:[],version:"current",sidebarPosition:29,frontMatter:{sidebar_position:29,sidebar_label:"\ud83c\udfe7 \u5728Solana\u4e0a\u94f8\u9020\u4ee3\u5e01",sidebar_class_name:"green"},sidebar:"tutorialSidebar",previous:{title:"\ud83d\udcb5 The token Program",permalink:"/all-in-one-solana/docs/Solana-Co-Learn/module2/spl-token/the-token-program/"},next:{title:"\ud83e\uddee \u4ee4\u724c\u5143\u6570\u636e",permalink:"/all-in-one-solana/docs/Solana-Co-Learn/module2/spl-token/token-metadata/"}},c={},s=[{value:"\ud83c\udf81 \u6784\u5efa\u4e00\u4e2a\u4ee3\u5e01\u94f8\u9020\u5668",id:"-\u6784\u5efa\u4e00\u4e2a\u4ee3\u5e01\u94f8\u9020\u5668",level:2}],p={toc:s},u="wrapper";function m(n){let{components:e,...r}=n;return(0,a.kt)(u,(0,o.Z)({},p,r,{components:e,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"-\u5728solana\u4e0a\u94f8\u9020\u4ee3\u5e01"},"\ud83c\udfe7 \u5728Solana\u4e0a\u94f8\u9020\u4ee3\u5e01"),(0,a.kt)("p",null,"\u662f\u65f6\u5019\u8ba9\u4ee3\u5e01\u4e0e\u5b83\u4eec\u7684\u521b\u9020\u8005\uff08\u4f60\uff09\u76f8\u9047\u4e86\u3002\u6211\u4eec\u5c06\u4ece\u4e0a\u4e00\u8282\u7684\u6784\u5efa\u90e8\u5206\u7ee7\u7eed\u8fdb\u884c\u3002\u5982\u679c\u9700\u8981\uff0c\u4f60\u53ef\u4ee5\u4ece",(0,a.kt)("a",{parentName:"p",href:"https://github.com/buildspace/solana-token-client/tree/solution-without-burn"},"\u8fd9\u91cc"),"\u83b7\u53d6\u8d77\u59cb\u4ee3\u7801\uff08\u786e\u4fdd\u4f60\u5728 ",(0,a.kt)("inlineCode",{parentName:"p"},"solution-without-burn")," \u5206\u652f\u4e0a\uff09\u3002\u8bf4\u4e86\u8fd9\u4e48\u591a\uff0c\u8ba9\u6211\u4eec\u6765\u521b\u9020\u4e00\u4e9b\u795e\u5947\u7684\u4e92\u8054\u7f51\u8d27\u5e01\u5427\u3002\u5728\u6211\u4eec\u7684\u6700\u7ec8\u9879\u76ee\u4e2d\uff0c\u6211\u4eec\u5c06\u521b\u5efa\u4e00\u4e2a\u4ee3\u5e01\uff0c\u4f60\u5c06\u968f\u7740\u62b5\u62bc\u4f60\u7684\u793e\u533aNFT\u800c\u9010\u6e10\u83b7\u5f97\u5b83\u3002\u5728\u90a3\u4e4b\u524d\uff0c\u8ba9\u6211\u4eec\u5148\u73a9\u4e00\u4e0b\u5b9e\u9645\u6784\u5efa\u8fd9\u4e2a\u94f8\u5e01\u8fc7\u7a0b\u7684\u8fc7\u7a0b\u3002\u73b0\u5728\u662f\u53d1\u6325\u4f60\u7684\u60f3\u8c61\u529b\uff0c\u5c3d\u60c5\u4eab\u53d7\u7684\u597d\u65f6\u673a\u3002\u4e5f\u8bb8\u4f60\u4e00\u76f4\u60f3\u521b\u5efa\u81ea\u5df1\u7684\u6a21\u56e0\u5e01 - \u73b0\u5728\u662f\u4f60\u7684\u673a\u4f1a\u4e86 \ud83d\ude80"),(0,a.kt)("p",null,"\u6211\u4eec\u5c06\u4ece\u4e00\u4e2a\u65b0\u7684Solana\u5ba2\u6237\u7aef\u5f00\u59cb\uff0c\u8f6c\u5230\u60a8\u7684Solana\u5de5\u4f5c\u533a\u5e76\u8fd0\u884c\u4ee5\u4e0b\u547d\u4ee4\uff1a"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"npx create-solana-client [name] --initialize-keypair\ncd [name]\nnpm i\n")),(0,a.kt)("p",null,"\u4ee5\u4f60\u7684\u4ee3\u5e01\u6765\u547d\u540d\u4f60\u7684\u5ba2\u6237\u3002\u6211\u8981\u521b\u5efa",(0,a.kt)("inlineCode",{parentName:"p"},"Pizzacoin"),"\uff0c\u56e0\u4e3a\u6211\u6628\u5929\u5403\u4e86\u4e00\u4e9b\u975e\u5e38\u597d\u5403\u7684\u62ab\u8428\u3002\u73b0\u5728\u662f\u4f60\u53d1\u6325\u521b\u610f\u7684\u65f6\u5019\u4e86\u3002\u4e5f\u8bb8\u4f60\u60f3\u5c06\u65f6\u95f4\u672c\u8eab\u8fdb\u884c\u4ee3\u5e01\u5316\uff1f\u4f60\u53ef\u4ee5\u521b\u5efa",(0,a.kt)("inlineCode",{parentName:"p"},"HokageCoin"),"\uff0c\u751a\u81f3\u662f",(0,a.kt)("inlineCode",{parentName:"p"},"TwitterThreadCoin"),"\u3002\u65e0\u9650\u7684\u53ef\u80fd\u6027\uff01"),(0,a.kt)("p",null," ",(0,a.kt)("inlineCode",{parentName:"p"},"--initialize-keypair")," \u6807\u5fd7\u4f4d\u5b8c\u6210\u4e86\u6211\u4eec\u4e0a\u6b21\u4f7f\u7528 ",(0,a.kt)("inlineCode",{parentName:"p"},"initalizeKeypair")," \u8fdb\u884c\u7684\u6240\u6709\u9b54\u6cd5\u3002\u8fd0\u884c ",(0,a.kt)("inlineCode",{parentName:"p"},"npm run start")," \uff0c\u60a8\u5c06\u83b7\u5f97\u4e00\u5bf9\u65b0\u7684\u5bc6\u94a5\uff0c\u5e76\u83b7\u5f97\u4e00\u4e9bSOL\u7a7a\u6295\u3002\u8ba9\u6211\u4eec\u6253\u5f00\u8d27\u5e01\u6253\u5370\u673a\uff0c\u8ba9\u5b83\u55e1\u55e1\u4f5c\u54cd\u3002"),(0,a.kt)("p",null," ",(0,a.kt)("img",{src:t(2292).Z,width:"480",height:"480"})),(0,a.kt)("p",null," \u56fe\u7247\uff1a\u7f8e\u56fd\u8054\u90a6\u50a8\u5907\u94f6\u884c\u884c\u957f\u6770\u7f57\u59c6\xb7\u9c8d\u5a01\u5c14\u8ba9\u6253\u5370\u673a\u55e1\u55e1\u4f5c\u54cd\u3002"),(0,a.kt)("h2",{id:"-\u6784\u5efa\u4e00\u4e2a\u4ee3\u5e01\u94f8\u9020\u5668"},"\ud83c\udf81 \u6784\u5efa\u4e00\u4e2a\u4ee3\u5e01\u94f8\u9020\u5668"),(0,a.kt)("p",null," \u8bb0\u4f4f\u8fd9\u4e9b\u6b65\u9aa4\uff1a"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("ol",{parentName:"li"},(0,a.kt)("li",{parentName:"ol"},"\u521b\u5efa\u4e00\u4e2a",(0,a.kt)("inlineCode",{parentName:"li"},"Token Mint"),"s\u8d26\u6237"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("ol",{parentName:"li",start:2},(0,a.kt)("li",{parentName:"ol"},"\u4e3a\u7279\u5b9a\u7684\u94b1\u5305\u521b\u5efa\u4e00\u4e2a\u5173\u8054\u7684token\u8d26\u6237"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("ol",{parentName:"li",start:3},(0,a.kt)("li",{parentName:"ol"},"\u5c06Mint\u4ee3\u5e01\u53d1\u9001\u5230\u8be5\u94b1\u5305\u4e2d")),(0,a.kt)("p",{parentName:"li"},"\u8fd9\u662f ",(0,a.kt)("inlineCode",{parentName:"p"},"src/index.ts")," \u4e2d\u7684\u7b2c\u4e00\u6b65\uff0c\u5728\u5bfc\u5165\u4e4b\u540e\u3001\u5728 ",(0,a.kt)("inlineCode",{parentName:"p"},"main()")," \u4e4b\u524d\u653e\u7f6e\u8fd9\u4e2a"),(0,a.kt)("pre",{parentName:"li"},(0,a.kt)("code",{parentName:"pre",className:"language-ts"},'// Add the spl-token import at the top\nimport * as token from "@solana/spl-token"\n\nasync function createNewMint(\n    connection: web3.Connection,\n    payer: web3.Keypair,\n    mintAuthority: web3.PublicKey,\n    freezeAuthority: web3.PublicKey,\n    decimals: number\n): Promise<web3.PublicKey> {\n\n    const tokenMint = await token.createMint(\n        connection,\n        payer,\n        mintAuthority,\n        freezeAuthority,\n        decimals\n    );\n\n    console.log(`The token mint account address is ${tokenMint}`)\n    console.log(\n        `Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=devnet`\n    );\n\n    return tokenMint;\n}\n')))),(0,a.kt)("p",null,"\u8fd9\u5e94\u8be5\u770b\u8d77\u6765\u5f88\u719f\u6089\u3002\u5982\u679c\u4e0d\u662f\u7684\u8bdd\uff0c\u8bf7\u56de\u5230\u4e0a\u4e00\u8282\u518d\u8bfb\u4e00\u904d \ud83d\ude20"),(0,a.kt)("p",null,"\u518d\u6b21 - \u8fd9\u4e2a ",(0,a.kt)("inlineCode",{parentName:"p"},"@solana/spl-token")," \u7a0b\u5e8f\u4f7f\u5f97\u8fd9\u4e00\u5207\u53d8\u5f97\u7b80\u5355\u3002 ",(0,a.kt)("inlineCode",{parentName:"p"},"tokenMint")," \u662f",(0,a.kt)("inlineCode",{parentName:"p"},"TokenMint"),"\u8d26\u6237\u7684\u5730\u5740\u3002"),(0,a.kt)("p",null,"\u63a5\u4e0b\u6765\uff0c\u6211\u4eec\u9700\u8981\u521b\u5efa\u5173\u8054\u7684\u4ee4\u724c\u8d26\u6237\uff0c\u5728 ",(0,a.kt)("inlineCode",{parentName:"p"},"createNewMint")," \u51fd\u6570\u4e4b\u540e\u6dfb\u52a0\u4ee5\u4e0b\u5185\u5bb9\uff1a"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"async function createTokenAccount(\n    connection: web3.Connection,\n    payer: web3.Keypair,\n    mint: web3.PublicKey,\n    owner: web3.PublicKey\n) {\n    const tokenAccount = await token.getOrCreateAssociatedTokenAccount(\n        connection,\n        payer,\n        mint,\n        owner\n    )\n\n    console.log(\n        `Token Account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=devnet`\n    )\n\n    return tokenAccount\n}\n")),(0,a.kt)("p",null,"\u8fd9\u91cc\u6ca1\u6709\u4ec0\u4e48\u65b0\u9c9c\u4e8b\u3002\u9700\u8981\u6ce8\u610f\u7684\u4e00\u70b9\u662f\uff0c ",(0,a.kt)("inlineCode",{parentName:"p"},"payer")," \u548c ",(0,a.kt)("inlineCode",{parentName:"p"},"owner")," \u53ef\u80fd\u662f\u4e0d\u540c\u7684 - \u4f60\u53ef\u4ee5\u4ed8\u8d39\u521b\u5efa\u67d0\u4eba\u7684\u8d26\u6237\u3002\u8fd9\u53ef\u80fd\u4f1a\u5f88\u6602\u8d35\uff0c\u56e0\u4e3a\u4f60\u5c06\u4e3a\u4ed6\u4eec\u7684\u8d26\u6237\u652f\u4ed8\u201c\u79df\u91d1\u201d\uff0c\u6240\u4ee5\u786e\u4fdd\u5728\u8fdb\u884c\u8fd9\u9879\u64cd\u4f5c\u4e4b\u524d\u5148\u505a\u597d\u8ba1\u7b97\u3002"),(0,a.kt)("p",null,"\u6700\u540e\uff0cmint function\uff1a"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"async function mintTokens(\n  connection: web3.Connection,\n  payer: web3.Keypair,\n  mint: web3.PublicKey,\n  destination: web3.PublicKey,\n  authority: web3.Keypair,\n  amount: number\n) {\n  const mintInfo = await token.getMint(connection, mint)\n\n  const transactionSignature = await token.mintTo(\n    connection,\n    payer,\n    mint,\n    destination,\n    authority,\n    amount * 10 ** mintInfo.decimals\n  )\n\n  console.log(\n    `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`\n  )\n}\n")),(0,a.kt)("p",null,"\u8ba9\u6211\u4eec\u5728\u4e3b\u51fd\u6570\u4e2d\u8c03\u7528\u8fd9\u4e9b\u51fd\u6570\uff0c\u8fd9\u662f\u6211\u5f97\u5230\u7684\uff1a"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},'async function main() {\n  const connection = new web3.Connection(web3.clusterApiUrl("devnet"))\n  const user = await initializeKeypair(connection)\n\n  console.log("PublicKey:", user.publicKey.toBase58())\n\n  const mint = await createNewMint(\n    connection,\n    user,           // We\'ll pay the fees\n    user.publicKey, // We\'re the mint authority\n    user.publicKey, // And the freeze authority >:)\n    2               // Only two decimals!\n  )\n\n  const tokenAccount = await createTokenAccount(\n    connection,\n    user,\n    mint,\n    user.publicKey   // Associating our address with the token account\n  )\n\n  // Mint 100 tokens to our address\n  await mintTokens(connection, user, mint, tokenAccount.address, user, 100)\n}\n')),(0,a.kt)("p",null,"\u8fd0\u884c ",(0,a.kt)("inlineCode",{parentName:"p"},"npm run start")," - \u4f60\u5e94\u8be5\u5728\u7ec8\u7aef\u4e2d\u770b\u5230\u4e09\u4e2a\u6d4f\u89c8\u5668\u94fe\u63a5\u88ab\u8bb0\u5f55\u4e0b\u6765\u3002\uff08\u6ce8\u610f\uff1a\u786e\u4fdd\u4f60\u5df2\u7ecf ",(0,a.kt)("inlineCode",{parentName:"p"},"@solana/spl-token")," \uff0c\u5426\u5219\u4f1a\u663e\u793a\u9519\u8bef\u3002\u8981\u5b89\u88c5\uff0c\u8bf7\u5728\u7ec8\u7aef\u4e2d\u8f93\u5165 ",(0,a.kt)("inlineCode",{parentName:"p"},"npm uninstall @solana/spl-token")," \u548c ",(0,a.kt)("inlineCode",{parentName:"p"},"npm install @solana/spl-token")," \u3002\u4fdd\u5b58\u4ee3\u5e01Mint\u8d26\u6237\u5730\u5740\uff0c\u7a0d\u540e\u4f1a\u7528\u5230\u3002\u6253\u5f00\u6700\u540e\u4e00\u4e2a\u94fe\u63a5\u5e76\u5411\u4e0b\u6eda\u52a8\u5230\u4ee3\u5e01\u4f59\u989d\u90e8\u5206\uff1a"),(0,a.kt)("p",null,(0,a.kt)("img",{src:t(3962).Z,width:"1150",height:"202"})),(0,a.kt)("p",null,"\u4f60\u521a\u521a\u94f8\u9020\u4e86\u4e00\u4e9b\u4ee3\u5e01\uff01\u8fd9\u4e9b\u4ee3\u5e01\u53ef\u4ee5\u4ee3\u8868\u4f60\u60f3\u8981\u7684\u4efb\u4f55\u4e1c\u897f\u3002\u6bcf\u4e2a\u4ee3\u5e01\u4ef7\u503c100\u7f8e\u5143\uff1f100\u5206\u949f\u7684\u65f6\u95f4\uff1f100\u5f20\u732b\u54aa\u8868\u60c5\u5305\uff1f100\u724712\u82f1\u5bf8\u9ec4\u6cb9\u9e21\u8584\u5e95\u5939\u5fc3\u62ab\u8428\uff1f\u8fd9\u662f\u4f60\u7684\u73b0\u5b9e\u3002\u4f60\u662f\u552f\u4e00\u63a7\u5236\u94f8\u5e01\u8d26\u6237\u7684\u4eba\uff0c\u6240\u4ee5\u4ee3\u5e01\u4f9b\u5e94\u7684\u4ef7\u503c\u53d6\u51b3\u4e8e\u4f60\u7684\u51b3\u5b9a\uff0c\u53ef\u4ee5\u662f\u6beb\u65e0\u4ef7\u503c\u6216\u8005\u73cd\u8d35\u65e0\u6bd4\u3002"),(0,a.kt)("p",null,"\u5728\u4f60\u5f00\u59cb\u5728Solana\u533a\u5757\u94fe\u4e0a\u91cd\u65b0\u5b9a\u4e49\u73b0\u4ee3\u91d1\u878d\u4e4b\u524d\uff0c\u8ba9\u6211\u4eec\u6765\u770b\u770b\u5982\u4f55\u8f6c\u79fb\u548c\u9500\u6bc1\u4ee3\u5e01\uff1a"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"async function transferTokens(\n  connection: web3.Connection,\n  payer: web3.Keypair,\n  source: web3.PublicKey,\n  destination: web3.PublicKey,\n  owner: web3.PublicKey,\n  amount: number,\n  mint: web3.PublicKey\n) {\n  const mintInfo = await token.getMint(connection, mint)\n\n  const transactionSignature = await token.transfer(\n    connection,\n    payer,\n    source,\n    destination,\n    owner,\n    amount * 10 ** mintInfo.decimals\n  )\n\n  console.log(\n    `Transfer Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`\n  )\n}\n\nasync function burnTokens(\n    connection: web3.Connection,\n    payer: web3.Keypair,\n    account: web3.PublicKey,\n    mint: web3.PublicKey,\n    owner: web3.Keypair,\n    amount: number\n) {\n\n    const mintInfo = await token.getMint(connection, mint)\n\n    const transactionSignature = await token.burn(\n        connection,\n        payer,\n        account,\n        mint,\n        owner,\n        amount * 10 ** mintInfo.decimals\n    )\n\n    console.log(\n        `Burn Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`\n    )\n}\n")),(0,a.kt)("p",null,"\u8fd9\u4e9b\u51fd\u6570\u770b\u8d77\u6765\u5f88\u957f\uff0c\u56e0\u4e3a\u6211\u7ed9\u6bcf\u4e2a\u53c2\u6570\u90fd\u5355\u72ec\u5360\u4e86\u4e00\u884c\uff0c\u5b9e\u9645\u4e0a\u5b83\u4eec\u53ea\u67093\u884c\u800c\u5df2\uff0c\u54c8\u54c8\u3002"),(0,a.kt)("p",null,"\u4f7f\u7528\u5b83\u4eec\u540c\u6837\u7b80\u5355\uff1a"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"async function main() {\n        ...\n\n    const receiver = web3.Keypair.generate().publicKey\n\n    const receiverTokenAccount = await createTokenAccount(\n        connection,\n        user,\n        mint,\n        receiver\n    )\n\n    await transferTokens(\n        connection,\n        user,\n        tokenAccount.address,\n        receiverTokenAccount.address,\n        user.publicKey,\n        50,\n        mint\n    )\n\n   await burnTokens(connection, user, tokenAccount.address, mint, user, 25)\n}\n")),(0,a.kt)("p",null,"\u73a9\u5f04\u8f6c\u8d26\u529f\u80fd\uff0c\u5411\u60a8\u7684\u94b1\u5305\u5730\u5740\u53d1\u9001\u4e00\u4e9b\u4ee3\u5e01\uff0c\u770b\u770b\u5b83\u662f\u4ec0\u4e48\u6837\u5b50\u3002\u8fd9\u662f\u6211\u770b\u5230\u7684\uff1a"),(0,a.kt)("p",null,(0,a.kt)("img",{src:t(4134).Z,width:"359",height:"537"})),(0,a.kt)("p",null,"\u55ef...\u4e3a\u4ec0\u4e48\u663e\u793a\u672a\u77e5\uff1f\u8ba9\u6211\u4eec\u6765\u4fee\u590d\u4e00\u4e0b\uff01"))}m.isMDXComponent=!0},2292:(n,e,t)=>{t.d(e,{Z:()=>o});const o=t.p+"assets/images/giphy-bd8ccbd4d0915affa402473df4f7acdf.gif"},4134:(n,e,t)=>{t.d(e,{Z:()=>o});const o=t.p+"assets/images/mint-token-wallet-e3a55a700372cfe50e8e5c41e6ff4e68.png"},3962:(n,e,t)=>{t.d(e,{Z:()=>o});const o=t.p+"assets/images/mint-token-1be9f8110b98e83220c0df538fe27707.png"}}]);