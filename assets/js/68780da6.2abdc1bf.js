"use strict";(self.webpackChunkall_in_one_solana=self.webpackChunkall_in_one_solana||[]).push([[2522],{3905:(e,t,a)=>{a.d(t,{Zo:()=>m,kt:()=>g});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function i(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var s=n.createContext({}),p=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},m=function(e){var t=p(e.components);return n.createElement(s.Provider,{value:t},e.children)},c="mdxType",h={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,o=e.originalType,s=e.parentName,m=i(e,["components","mdxType","originalType","parentName"]),c=p(a),u=r,g=c["".concat(s,".").concat(u)]||c[u]||h[u]||o;return a?n.createElement(g,l(l({ref:t},m),{},{components:a})):n.createElement(g,l({ref:t},m))}));function g(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=a.length,l=new Array(o);l[0]=u;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i[c]="string"==typeof e?e:r,l[1]=i;for(var p=2;p<o;p++)l[p]=a[p];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}u.displayName="MDXCreateElement"},63261:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>h,frontMatter:()=>o,metadata:()=>i,toc:()=>p});var n=a(87462),r=(a(67294),a(3905));const o={title:"Learn by example",sidebar_position:34,tags:["solana-cook-book","game","example","learn"]},l="Open source Solana games to reference for learning",i={unversionedId:"references/gaming/game-examples",id:"references/gaming/game-examples",title:"Learn by example",description:"Interact with Anchor Program from Unity",source:"@site/docs/cookbook-zh/references/gaming/game-examples.md",sourceDirName:"references/gaming",slug:"/references/gaming/game-examples",permalink:"/all-in-one-solana/cookbook-zh/references/gaming/game-examples",draft:!1,editUrl:"https://github.com/CreatorsDAO/all-in-one-solana/tree/dev/docs/cookbook-zh/references/gaming/game-examples.md",tags:[{label:"solana-cook-book",permalink:"/all-in-one-solana/cookbook-zh/tags/solana-cook-book"},{label:"game",permalink:"/all-in-one-solana/cookbook-zh/tags/game"},{label:"example",permalink:"/all-in-one-solana/cookbook-zh/tags/example"},{label:"learn",permalink:"/all-in-one-solana/cookbook-zh/tags/learn"}],version:"current",sidebarPosition:34,frontMatter:{title:"Learn by example",sidebar_position:34,tags:["solana-cook-book","game","example","learn"]},sidebar:"tutorialSidebar",previous:{title:"Distribution",permalink:"/all-in-one-solana/cookbook-zh/references/gaming/distribution"},next:{title:"auto-approve",permalink:"/all-in-one-solana/cookbook-zh/references/gaming/auto-approve"}},s={},p=[{value:"Interact with Anchor Program from Unity",id:"interact-with-anchor-program-from-unity",level:2},{value:"Saving Sol in a PDA",id:"saving-sol-in-a-pda",level:2},{value:"On chain matchmaking",id:"on-chain-matchmaking",level:2},{value:"Use Solana Pay Qr codes to control a game",id:"use-solana-pay-qr-codes-to-control-a-game",level:2},{value:"Hide game state from other players",id:"hide-game-state-from-other-players",level:2},{value:"How to build a round based multiplayer game",id:"how-to-build-a-round-based-multiplayer-game",level:2},{value:"On Chain Chess",id:"on-chain-chess",level:2},{value:"Multiplayer Game using voting system",id:"multiplayer-game-using-voting-system",level:2},{value:"Entity component system example",id:"entity-component-system-example",level:2},{value:"Adventure killing monsters and gaining xp",id:"adventure-killing-monsters-and-gaining-xp",level:2},{value:"Real-time pvp on chain game",id:"real-time-pvp-on-chain-game",level:2}],m={toc:p},c="wrapper";function h(e){let{components:t,...a}=e;return(0,r.kt)(c,(0,n.Z)({},m,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"open-source-solana-games-to-reference-for-learning"},"Open source Solana games to reference for learning"),(0,r.kt)("h2",{id:"interact-with-anchor-program-from-unity"},"Interact with Anchor Program from Unity"),(0,r.kt)("p",null,"A simple example moving a player left and right using Anchor framework and Unity SD"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://www.youtube.com/watch?v=_vQ3bSs3svs"},"Video")),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://solplay.de/TinyAdventure/index.html"},"Live Version")),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://beta.solpg.io/tutorials/tiny-adventure"},"Playground")),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/Woody4618/SolPlay_Unity_SDK/tree/main/Assets/SolPlay/Examples/TinyAdventure"},"Unity Client")),(0,r.kt)("h2",{id:"saving-sol-in-a-pda"},"Saving Sol in a PDA"),(0,r.kt)("p",null,"Learn how to save sol in a PDA seed vault and send it back to a player. Backend is written in Anchor and the frontend is using the Unity SDK"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://www.youtube.com/watch?v=gILXyWvXu7M"},"Video")),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://solplay.de/TinyAdventureTwo/index.html"},"Live Version")),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/Woody4618/SolPlay_Unity_SDK/tree/main/Assets/SolPlay/Examples/TinyAdventureTwo"},"Source")),(0,r.kt)("h2",{id:"on-chain-matchmaking"},"On chain matchmaking"),(0,r.kt)("p",null,"A multiplayer match three game which uses NFT stats for the character stats in the game and has an interesting onchain matchmaking system."),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://deezquest.vercel.app/"},"Live Version")),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/val-samonte/deezquest"},"Source")),(0,r.kt)("h2",{id:"use-solana-pay-qr-codes-to-control-a-game"},"Use Solana Pay Qr codes to control a game"),(0,r.kt)("p",null,"Tug of war\nA multiplayer game where an account is changed via Solana Pay qr codes which can be player with many people on a big screen. Backend Anchor and the frontend is Js React and Next13."),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://www.youtube.com/watch?v=_XBvEHwSqJc&ab_channel=SolPlay"},"Tutorial")),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://tug-of-war.vercel.app/"},"Example")),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/solana-developers/workshops/tree/main/workshops/tug-of-war"},"Source")),(0,r.kt)("h2",{id:"hide-game-state-from-other-players"},"Hide game state from other players"),(0,r.kt)("p",null,"Stone paper scissors"),(0,r.kt)("p",null,"A game where on chain data is hidden by saving a hash in the client until reveal. SPL Tokens as price for the winner."),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/kevinrodriguez-io/bonk-paper-scissors"},"Source")),(0,r.kt)("p",null,"Another example submitted for grizzlython which encrypts entries and send it to the next player with an additional encryption:"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/solanaGames"},"Source")),(0,r.kt)("h2",{id:"how-to-build-a-round-based-multiplayer-game"},"How to build a round based multiplayer game"),(0,r.kt)("p",null,"Tic Tac toe\nA simple multiplayer game written in Anchor"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://book.anchor-lang.com/anchor_in_depth/milestone_project_tic-tac-toe.html"},"Tutorial")),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/coral-xyz/anchor-book/tree/master/programs/tic-tac-toe"},"Source")),(0,r.kt)("h2",{id:"on-chain-chess"},"On Chain Chess"),(0,r.kt)("p",null,"Chess\nComplete on chain playable chess game written in Anchor. Send someone a link to start a game. Looking for contributors."),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://chess.vicyyn.com/"},"Live Version")),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/vicyyn/sol-chess/"},"Source")),(0,r.kt)("h2",{id:"multiplayer-game-using-voting-system"},"Multiplayer Game using voting system"),(0,r.kt)("p",null,"Pokemon voting system\nA game where collectively people vote on moves in a game boy game. Every move is recorded and each move can be minted as an NFTs."),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://solana.playspokemon.xyz/"},"Live Version")),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/nelsontky/web3-plays-pokemon"},"Source")),(0,r.kt)("h2",{id:"entity-component-system-example"},"Entity component system example"),(0,r.kt)("p",null,"Kyoudai Clash is an on chain realtime\nUsing the jump crypto ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/JumpCrypto/sol-arc"},"Arc framework")," which is an on chain entity component system for Solana."),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://www.xnft.gg/app/D2i3cz9juUPLwbpi8rV2XvAnB5nEe3f8fM5YUpgVprbT"},"xNFT Version")),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/spacemandev-git/dominari-arc"},"Source")),(0,r.kt)("h2",{id:"adventure-killing-monsters-and-gaining-xp"},"Adventure killing monsters and gaining xp"),(0,r.kt)("p",null,"Lumia online was a hackthon submission and is a nice reference for a little adventure game."),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://www.xnft.gg/app/D2i3cz9juUPLwbpi8rV2XvAnB5nEe3f8fM5YUpgVprbT"},"xNFT Version")),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/spacemandev-git/dominari-arc"},"Source")),(0,r.kt)("h2",{id:"real-time-pvp-on-chain-game"},"Real-time pvp on chain game"),(0,r.kt)("p",null,"SolHunter"),(0,r.kt)("p",null,"Real-time Solana Battle Royal Game. Using Anchor program, UnitySDK, WebSocket account subscription. Players can spawn their characters represented as one of their NFTs on a grid and move around. If a player hits another player or chest he collect its Sol. The grid is implemented as a two dimensional array where every tile saves the players wallet key and the NFT public key."),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://solplay.de/SolHunter/index.html"},"Example")),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/Woody4618/SolPlay_Unity_SDK/tree/main/Assets/SolPlay/Examples/SolHunter"},"Source")))}h.isMDXComponent=!0}}]);