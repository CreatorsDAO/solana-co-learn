"use strict";(self.webpackChunkall_in_one_solana=self.webpackChunkall_in_one_solana||[]).push([[3449],{3905:(n,e,t)=>{t.d(e,{Zo:()=>u,kt:()=>d});var r=t(67294);function o(n,e,t){return e in n?Object.defineProperty(n,e,{value:t,enumerable:!0,configurable:!0,writable:!0}):n[e]=t,n}function a(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),t.push.apply(t,r)}return t}function i(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?a(Object(t),!0).forEach((function(e){o(n,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e))}))}return n}function l(n,e){if(null==n)return{};var t,r,o=function(n,e){if(null==n)return{};var t,r,o={},a=Object.keys(n);for(r=0;r<a.length;r++)t=a[r],e.indexOf(t)>=0||(o[t]=n[t]);return o}(n,e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(n);for(r=0;r<a.length;r++)t=a[r],e.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(n,t)&&(o[t]=n[t])}return o}var c=r.createContext({}),s=function(n){var e=r.useContext(c),t=e;return n&&(t="function"==typeof n?n(e):i(i({},e),n)),t},u=function(n){var e=s(n.components);return r.createElement(c.Provider,{value:e},n.children)},m="mdxType",p={inlineCode:"code",wrapper:function(n){var e=n.children;return r.createElement(r.Fragment,{},e)}},_=r.forwardRef((function(n,e){var t=n.components,o=n.mdxType,a=n.originalType,c=n.parentName,u=l(n,["components","mdxType","originalType","parentName"]),m=s(t),_=o,d=m["".concat(c,".").concat(_)]||m[_]||p[_]||a;return t?r.createElement(d,i(i({ref:e},u),{},{components:t})):r.createElement(d,i({ref:e},u))}));function d(n,e){var t=arguments,o=e&&e.mdxType;if("string"==typeof n||o){var a=t.length,i=new Array(a);i[0]=_;var l={};for(var c in e)hasOwnProperty.call(e,c)&&(l[c]=e[c]);l.originalType=n,l[m]="string"==typeof n?n:o,i[1]=l;for(var s=2;s<a;s++)i[s]=t[s];return r.createElement.apply(null,i)}return r.createElement.apply(null,t)}_.displayName="MDXCreateElement"},58071:(n,e,t)=>{t.r(e),t.d(e,{assets:()=>c,contentTitle:()=>i,default:()=>p,frontMatter:()=>a,metadata:()=>l,toc:()=>s});var r=t(87462),o=(t(67294),t(3905));const a={sidebar_position:72,sidebar_label:"\ud83d\udcb8 \u4f7f\u7528CPI\u6784\u5efa\u652f\u4ed8\u7cfb\u7edf",sidebar_class_name:"green"},i="\ud83d\udcb8 \u4f7f\u7528CPI\u6784\u5efa\u652f\u4ed8\u7cfb\u7edf",l={unversionedId:"module4/cross-program-invocations/build-a-payment-system-with-cpis/README",id:"module4/cross-program-invocations/build-a-payment-system-with-cpis/README",title:"\ud83d\udcb8 \u4f7f\u7528CPI\u6784\u5efa\u652f\u4ed8\u7cfb\u7edf",description:"\u4e0a\u4e00\u5802\u8bfe\u6211\u4eec\u5df2\u7ecf\u5b8c\u6210\u4e86Mint\u8d26\u6237\u7684\u51c6\u5907\u5de5\u4f5c\uff0c\u70ed\u8eab\u73af\u8282\u5230\u6b64\u7ed3\u675f\uff0c\u73b0\u5728\u6b63\u5f0f\u5f00\u59cb\u4e3b\u8981\u8868\u6f14\u3002",source:"@site/docs/Solana-Co-Learn/module4/cross-program-invocations/build-a-payment-system-with-cpis/README.md",sourceDirName:"module4/cross-program-invocations/build-a-payment-system-with-cpis",slug:"/module4/cross-program-invocations/build-a-payment-system-with-cpis/",permalink:"/all-in-one-solana/Solana-Co-Learn/module4/cross-program-invocations/build-a-payment-system-with-cpis/",draft:!1,editUrl:"https://github.com/CreatorsDAO/all-in-one-solana/tree/dev/docs/Solana-Co-Learn/module4/cross-program-invocations/build-a-payment-system-with-cpis/README.md",tags:[],version:"current",sidebarPosition:72,frontMatter:{sidebar_position:72,sidebar_label:"\ud83d\udcb8 \u4f7f\u7528CPI\u6784\u5efa\u652f\u4ed8\u7cfb\u7edf",sidebar_class_name:"green"},sidebar:"tutorialSidebar",previous:{title:"\ud83e\udd47 \u4e3a\u7528\u6237\u94f8\u9020\u4ee3\u5e01",permalink:"/all-in-one-solana/Solana-Co-Learn/module4/cross-program-invocations/mint-token-for-users/"},next:{title:"\u6d4b\u8bd5",permalink:"/all-in-one-solana/Solana-Co-Learn/module4/testing/"}},c={},s=[{value:"\ud83d\ude80 \u6784\u5efa\u3001\u90e8\u7f72\u548c\u6d4b\u8bd5",id:"-\u6784\u5efa\u90e8\u7f72\u548c\u6d4b\u8bd5",level:2},{value:"\ud83d\udea2 \u6311\u6218",id:"-\u6311\u6218",level:2}],u={toc:s},m="wrapper";function p(n){let{components:e,...t}=n;return(0,o.kt)(m,(0,r.Z)({},u,t,{components:e,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"-\u4f7f\u7528cpi\u6784\u5efa\u652f\u4ed8\u7cfb\u7edf"},"\ud83d\udcb8 \u4f7f\u7528CPI\u6784\u5efa\u652f\u4ed8\u7cfb\u7edf"),(0,o.kt)("p",null,"\u4e0a\u4e00\u5802\u8bfe\u6211\u4eec\u5df2\u7ecf\u5b8c\u6210\u4e86",(0,o.kt)("inlineCode",{parentName:"p"},"Mint"),"\u8d26\u6237\u7684\u51c6\u5907\u5de5\u4f5c\uff0c\u70ed\u8eab\u73af\u8282\u5230\u6b64\u7ed3\u675f\uff0c\u73b0\u5728\u6b63\u5f0f\u5f00\u59cb\u4e3b\u8981\u8868\u6f14\u3002"),(0,o.kt)("p",null,"\u6211\u4eec\u5c06\u6df1\u5165\u5230\u5ba1\u67e5\u548c\u8bc4\u8bba\u7684\u5de5\u4f5c\u6d41\u7a0b\u4e2d\uff0c\u5e76\u6dfb\u52a0\u5fc5\u8981\u7684\u903b\u8f91\u6765\u94f8\u9020\u4ee3\u5e01\u3002"),(0,o.kt)("p",null,"\u6211\u4eec\u9996\u5148\u4ece\u7535\u5f71\u8bc4\u8bba\u5f00\u59cb\u3002\u8bf7\u8f6c\u5230 ",(0,o.kt)("inlineCode",{parentName:"p"},"processor.rs")," \u6587\u4ef6\uff0c\u5e76\u66f4\u65b0 ",(0,o.kt)("inlineCode",{parentName:"p"},"add_movie_review")," \u51fd\u6570\uff0c\u4ee5\u4fbf\u63a5\u6536\u989d\u5916\u7684\u8d26\u6237\u3002"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-rust"},'// Inside add_movie_review\nmsg!("Adding movie review...");\nmsg!("Title: {}", title);\nmsg!("Rating: {}", rating);\nmsg!("Description: {}", description);\n\nlet account_info_iter = &mut accounts.iter();\n\nlet initializer = next_account_info(account_info_iter)?;\nlet pda_account = next_account_info(account_info_iter)?;\nlet pda_counter = next_account_info(account_info_iter)?;\nlet token_mint = next_account_info(account_info_iter)?;\nlet mint_auth = next_account_info(account_info_iter)?;\nlet user_ata = next_account_info(account_info_iter)?;\nlet system_program = next_account_info(account_info_iter)?;\nlet token_program = next_account_info(account_info_iter)?;\n')),(0,o.kt)("p",null,"\u65b0\u589e\u7684\u90e8\u5206\u5305\u62ec\uff1a"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"token_mint")," - \u4ee3\u5e01\u7684\u94f8\u5e01\u5730\u5740\u3002"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"mint_auth")," - \u4ee3\u5e01\u94f8\u9020\u673a\u6784\u7684\u5730\u5740\u3002"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"user_ata")," - \u7528\u6237\u4e0e\u6b64\u4ee3\u5e01\u53d1\u884c\u673a\u6784\u5173\u8054\u7684\u4ee4\u724c\u8d26\u6237\uff08\u7528\u4e8e\u4ee3\u5e01\u94f8\u9020\uff09\u3002"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"token_program")," - \u4ee3\u5e01\u7a0b\u5e8f\u7684\u5730\u5740\u3002")),(0,o.kt)("p",null,"\u8fd9\u91cc\u5e76\u6ca1\u6709\u592a\u591a\u7279\u6b8a\u4e4b\u5904\uff0c\u8fd9\u4e9b\u53ea\u662f\u5904\u7406\u4ee3\u5e01\u65f6\u6240\u671f\u671b\u7684\u8d26\u6237\u3002"),(0,o.kt)("p",null,"\u8fd8\u8bb0\u5f97\u6211\u4eec\u7684\u7f16\u7a0b\u4e60\u60ef\u5417\uff1f\u6bcf\u6b21\u6dfb\u52a0\u4e00\u4e2a\u8d26\u6237\u540e\uff0c\u7acb\u5373\u6dfb\u52a0\u9a8c\u8bc1\uff01\u4ee5\u4e0b\u662f\u6211\u4eec\u9700\u8981\u5728 ",(0,o.kt)("inlineCode",{parentName:"p"},"add_movie_review")," \u51fd\u6570\u4e2d\u6dfb\u52a0\u7684\u5185\u5bb9\uff1a"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-rust"},'msg!("deriving mint authority");\nlet (mint_pda, _mint_bump) = Pubkey::find_program_address(&[b"token_mint"], program_id);\nlet (mint_auth_pda, mint_auth_bump) =\n    Pubkey::find_program_address(&[b"token_auth"], program_id);\n\nif *token_mint.key != mint_pda {\n    msg!("Incorrect token mint");\n    return Err(ReviewError::IncorrectAccountError.into());\n}\n\nif *mint_auth.key != mint_auth_pda {\n    msg!("Mint passed in and mint derived do not match");\n    return Err(ReviewError::InvalidPDA.into());\n}\n\nif *user_ata.key != get_associated_token_address(initializer.key, token_mint.key) {\n    msg!("Incorrect token mint");\n    return Err(ReviewError::IncorrectAccountError.into());\n}\n\nif *token_program.key != TOKEN_PROGRAM_ID {\n    msg!("Incorrect token program");\n    return Err(ReviewError::IncorrectAccountError.into());\n}\n')),(0,o.kt)("p",null,"\u4f60\u73b0\u5728\u5df2\u7ecf\u53cd\u590d\u5b9e\u8df5\u8fc7\u8fd9\u6837\u7684\u6d41\u7a0b\uff0c\u6240\u4ee5\u8fd9\u4e9b\u64cd\u4f5c\u5e94\u8be5\u611f\u89c9\u5f97\u76f8\u5f53\u719f\u6089\u4e86 :)"),(0,o.kt)("p",null,"\u73b0\u5728\u6211\u4eec\u53ef\u4ee5\u5f00\u59cb\u94f8\u5e01\u4e86\uff01\u5c31\u5728\u7a0b\u5e8f\u7ed3\u675f\u4e4b\u524d\uff0c\u6211\u4eec\u4f1a\u6dfb\u52a0\u5982\u4e0b\u4ee3\u7801\uff1a ",(0,o.kt)("inlineCode",{parentName:"p"},"Ok(())")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-rust"},'msg!("Minting 10 tokens to User associated token account");\ninvoke_signed(\n    // Instruction\n    &spl_token::instruction::mint_to(\n        token_program.key,\n        token_mint.key,\n        user_ata.key,\n        mint_auth.key,\n        &[],\n        10*LAMPORTS_PER_SOL,\n    )?,\n    // Account_infos\n    &[token_mint.clone(), user_ata.clone(), mint_auth.clone()],\n    // Seeds\n    &[&[b"token_auth", &[mint_auth_bump]]],\n)?;\n\nOk(())\n')),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"mint_to")," \u662f\u6765\u81ea",(0,o.kt)("inlineCode",{parentName:"p"},"SPL"),"\u4ee4\u724c\u5e93\u7684\u6307\u4ee4\uff0c\u6240\u4ee5\u6211\u4eec\u8fd8\u9700\u66f4\u65b0\u9876\u90e8\u7684\u5bfc\u5165\u5185\u5bb9\uff1a"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-rust"},"// Existing imports\nuse spl_token::{instruction::{initialize_mint, mint_to}, ID as TOKEN_PROGRAM_ID};\n")),(0,o.kt)("p",null,"\u6211\u4eec\u7684\u8bc4\u8bba\u529f\u80fd\u5df2\u7ecf\u5b8c\u6210\u4e86\uff01\u73b0\u5728\u6bcf\u5f53\u6709\u4eba\u7559\u4e0b\u8bc4\u8bba\u65f6\uff0c\u6211\u4eec\u5c31\u4f1a\u7ed9\u4ed6\u4eec\u53d1\u900110\u4e2a\u4ee3\u5e01\u3002"),(0,o.kt)("p",null,"\u6211\u4eec\u5c06\u5728 ",(0,o.kt)("inlineCode",{parentName:"p"},"add_comment")," \u51fd\u6570\u4e2d\u6267\u884c\u5b8c\u5168\u76f8\u540c\u7684\u64cd\u4f5c\uff1a ",(0,o.kt)("inlineCode",{parentName:"p"},"processor.rs")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-rust"},'// Inside add_comment\nlet account_info_iter = &mut accounts.iter();\n\nlet commenter = next_account_info(account_info_iter)?;\nlet pda_review = next_account_info(account_info_iter)?;\nlet pda_counter = next_account_info(account_info_iter)?;\nlet pda_comment = next_account_info(account_info_iter)?;\nlet token_mint = next_account_info(account_info_iter)?;\nlet mint_auth = next_account_info(account_info_iter)?;\nlet user_ata = next_account_info(account_info_iter)?;\nlet system_program = next_account_info(account_info_iter)?;\nlet token_program = next_account_info(account_info_iter)?;\n\n// Mint tokens here\nmsg!("deriving mint authority");\nlet (mint_pda, _mint_bump) = Pubkey::find_program_address(&[b"token_mint"], program_id);\nlet (mint_auth_pda, mint_auth_bump) =\n    Pubkey::find_program_address(&[b"token_auth"], program_id);\n\nif *token_mint.key != mint_pda {\n    msg!("Incorrect token mint");\n    return Err(ReviewError::IncorrectAccountError.into());\n}\n\nif *mint_auth.key != mint_auth_pda {\n    msg!("Mint passed in and mint derived do not match");\n    return Err(ReviewError::InvalidPDA.into());\n}\n\nif *user_ata.key != get_associated_token_address(commenter.key, token_mint.key) {\n    msg!("Incorrect token mint");\n    return Err(ReviewError::IncorrectAccountError.into());\n}\n\nif *token_program.key != TOKEN_PROGRAM_ID {\n    msg!("Incorrect token program");\n    return Err(ReviewError::IncorrectAccountError.into());\n}\nmsg!("Minting 5 tokens to User associated token account");\ninvoke_signed(\n    // Instruction\n    &spl_token::instruction::mint_to(\n        token_program.key,\n        token_mint.key,\n        user_ata.key,\n        mint_auth.key,\n        &[],\n        5 * LAMPORTS_PER_SOL,\n    )?,\n    // Account_infos\n    &[token_mint.clone(), user_ata.clone(), mint_auth.clone()],\n    // Seeds\n    &[&[b"token_auth", &[mint_auth_bump]]],\n)?;\n\nOk(())\n')),(0,o.kt)("p",null,"\u6ce8\u610f\uff0c\u4e0d\u8981\u91cd\u590d ",(0,o.kt)("inlineCode",{parentName:"p"},"Ok(())")," \uff0c\u56e0\u4e3a\u90a3\u4f1a\u5bfc\u81f4\u9519\u8bef\u3002"),(0,o.kt)("p",null,"\u5e0c\u671b\u4f60\u73b0\u5728\u80fd\u591f\u770b\u51fa\u8fd9\u4e9b\u6a21\u5f0f\u7684\u5171\u901a\u6027\u4e86\u3002\u867d\u7136\u5728\u8fdb\u884c\u672c\u5730\u5f00\u53d1\u65f6\uff0c\u6211\u4eec\u9700\u8981\u5199\u5f88\u591a\u4ee3\u7801\uff0c\u4f46\u6574\u4e2a\u5de5\u4f5c\u6d41\u7a0b\u76f8\u5f53\u7b80\u5355\uff0c\u5e76\u4e14\u611f\u89c9\u5f88\u201c\u7eaf\u7cb9\u201d\u3002"),(0,o.kt)("h2",{id:"-\u6784\u5efa\u90e8\u7f72\u548c\u6d4b\u8bd5"},"\ud83d\ude80 \u6784\u5efa\u3001\u90e8\u7f72\u548c\u6d4b\u8bd5"),(0,o.kt)("p",null,"\u662f\u65f6\u5019\u8d5a\u53d6\u4e00\u4e9b\u7206\u7c73\u82b1\u4ee3\u5e01\u4e86 \ud83c\udf7f"),(0,o.kt)("p",null,"\u9996\u5148\uff0c\u8ba9\u6211\u4eec\u5f00\u59cb\u6784\u5efa\u548c\u90e8\u7f72\u9879\u76ee\u3002"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"cargo build-sbf\nsolana program deploy <PATH>\n")),(0,o.kt)("p",null,"\u63a5\u4e0b\u6765\uff0c\u6211\u4eec\u5c06\u6d4b\u8bd5\u521d\u59cb\u5316\u4ee3\u5e01\u94f8\u9020\u6d41\u7a0b\u3002"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"git clone https://github.com/buildspace/solana-movie-token-client\ncd solana-movie-token-client\nnpm install\n")),(0,o.kt)("p",null,"\u548c\u4ee5\u524d\u4e00\u6837\uff0c\u9700\u8981\u8fdb\u884c\u4ee5\u4e0b\u64cd\u4f5c\uff1a"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},"\u5728 ",(0,o.kt)("inlineCode",{parentName:"li"},"index.ts")," \u4e2d\u66f4\u65b0 ",(0,o.kt)("inlineCode",{parentName:"li"},"PROGRAM_ID")," \u7684\u503c\u3002"),(0,o.kt)("li",{parentName:"ol"},"\u4fee\u6539\u7b2c",(0,o.kt)("inlineCode",{parentName:"li"},"67"),"\u884c\u7684\u8fde\u63a5\u4e3a\u5728\u7ebf\u8fde\u63a5\u3002")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},'const connection = new web3.Connection("http://localhost:8899");\n')),(0,o.kt)("p",null,"\u8fd0\u884c ",(0,o.kt)("inlineCode",{parentName:"p"},"npm start")," \u540e\uff0c\u4f60\u7684 ",(0,o.kt)("inlineCode",{parentName:"p"},"Mint")," \u8d26\u6237\u5c06\u4f1a\u88ab\u521d\u59cb\u5316\u3002"),(0,o.kt)("p",null,"\u6700\u540e\uff0c\u6211\u4eec\u53ef\u4ee5\u4f7f\u7528\u524d\u7aef\u6765\u53d1\u9001\u7535\u5f71\u8bc4\u8bba\uff0c\u5e76\u56e0\u6b64\u83b7\u5f97\u4e00\u4e9b\u4ee3\u5e01\u3002"),(0,o.kt)("p",null,"\u50cf\u5f80\u5e38\u4e00\u6837\uff0c\u4f60\u53ef\u4ee5\u7ee7\u7eed\u4f7f\u7528\u4e4b\u524d\u505c\u4e0b\u7684\u524d\u7aef\uff0c\u6216\u8005\u4ece\u6b63\u786e\u7684\u5206\u652f\u521b\u5efa\u4e00\u4e2a\u65b0\u7684\u5b9e\u4f8b\u3002"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"git clone https://github.com/buildspace/solana-movie-frontend/\ncd solana-movie-frontend\ngit checkout solution-add-tokens\nnpm install\n")),(0,o.kt)("p",null,"\u66f4\u65b0 ",(0,o.kt)("inlineCode",{parentName:"p"},"PROGRAM_ID"),"\uff0c\u63d0\u4ea4\u8bc4\u8bba\uff0c\u53d1\u8868\u8bc4\u8bba\u540e\uff0c\u4f60\u73b0\u5728\u5e94\u8be5\u80fd\u5728 ",(0,o.kt)("inlineCode",{parentName:"p"},"Phantom")," \u94b1\u5305\u4e2d\u770b\u5230\u4f60\u7684\u4ee3\u5e01\u4e86\uff01"),(0,o.kt)("h2",{id:"-\u6311\u6218"},"\ud83d\udea2 \u6311\u6218"),(0,o.kt)("p",null,"\u4e3a\u4e86\u8fd0\u7528\u4f60\u5728\u672c\u8bfe\u7a0b\u4e2d\u5b66\u5230\u7684\u6709\u5173 ",(0,o.kt)("inlineCode",{parentName:"p"},"CPI")," \u7684\u77e5\u8bc6\uff0c\u4e0d\u59a8\u8003\u8651\u5982\u4f55\u5c06\u5176\u6574\u5408\u5230\u5b66\u751f\u4ecb\u7ecd\u65b9\u6848\u4e2d\u3002\u4f60\u53ef\u4ee5\u505a\u4e9b\u7c7b\u4f3c\u6211\u4eec\u6f14\u793a\u4e2d\u7684\u4e8b\u60c5\uff0c\u6bd4\u5982\u5728\u7528\u6237\u81ea\u6211\u4ecb\u7ecd\u65f6\u94f8\u9020\u4e00\u4e9b\u4ee3\u5e01\u7ed9\u4ed6\u4eec\u3002\u6216\u8005\uff0c\u5982\u679c\u4f60\u611f\u5230\u66f4\u6709\u6311\u6218\u6027\uff0c\u601d\u8003\u5982\u4f55\u5c06\u8bfe\u7a0b\u4e2d\u5b66\u5230\u7684\u6240\u6709\u5185\u5bb9\u6574\u5408\u5728\u4e00\u8d77\uff0c\u4ece\u96f6\u5f00\u59cb\u521b\u5efa\u5168\u65b0\u7684\u9879\u76ee\u3002"),(0,o.kt)("p",null,"\u5982\u679c\u4f60\u9009\u62e9\u505a\u7c7b\u4f3c\u7684\u6f14\u793a\uff0c\u53ef\u4ee5\u81ea\u7531\u4f7f\u7528\u76f8\u540c\u7684",(0,o.kt)("a",{parentName:"p",href:"https://github.com/buildspace/solana-movie-token-client?utm_source=buildspace.so&utm_medium=buildspace_project"},"\u811a\u672c"),"\u6765\u8c03\u7528 ",(0,o.kt)("inlineCode",{parentName:"p"},"initialize_mint")," \u6307\u4ee4\uff0c\u6216\u8005\u4f60\u53ef\u4ee5\u5c55\u73b0\u521b\u9020\u529b\uff0c\u4ece\u5ba2\u6237\u7aef\u521d\u59cb\u5316\u94f8\u5e01\u8fc7\u7a0b\uff0c\u7136\u540e\u5c06\u94f8\u5e01\u6743\u9650\u8f6c\u79fb\u5230\u7a0b\u5e8f PDA\u3002\u5982\u679c\u4f60\u9700\u8981\u67e5\u770b\u53ef\u80fd\u7684\u89e3\u51b3\u65b9\u6848\uff0c\u8bf7\u67e5\u770b\u8fd9\u4e2a",(0,o.kt)("a",{parentName:"p",href:"https://beta.solpg.io/631f631a77ea7f12846aee8d?utm_source=buildspace.so&utm_medium=buildspace_project"},"\u6e38\u4e50\u573a\u94fe\u63a5"),"\u3002"),(0,o.kt)("p",null,"\u4eab\u53d7\u7f16\u7a0b\u7684\u4e50\u8da3\uff0c\u5e76\u5c06\u6b64\u89c6\u4e3a\u81ea\u6211\u63d0\u5347\u7684\u673a\u4f1a\uff01"))}p.isMDXComponent=!0}}]);