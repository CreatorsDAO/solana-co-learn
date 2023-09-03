"use strict";(self.webpackChunkall_in_one_solana=self.webpackChunkall_in_one_solana||[]).push([[1637],{3905:(t,n,e)=>{e.d(n,{Zo:()=>s,kt:()=>g});var a=e(67294);function r(t,n,e){return n in t?Object.defineProperty(t,n,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[n]=e,t}function o(t,n){var e=Object.keys(t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(t,n).enumerable}))),e.push.apply(e,a)}return e}function i(t){for(var n=1;n<arguments.length;n++){var e=null!=arguments[n]?arguments[n]:{};n%2?o(Object(e),!0).forEach((function(n){r(t,n,e[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(e)):o(Object(e)).forEach((function(n){Object.defineProperty(t,n,Object.getOwnPropertyDescriptor(e,n))}))}return t}function u(t,n){if(null==t)return{};var e,a,r=function(t,n){if(null==t)return{};var e,a,r={},o=Object.keys(t);for(a=0;a<o.length;a++)e=o[a],n.indexOf(e)>=0||(r[e]=t[e]);return r}(t,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);for(a=0;a<o.length;a++)e=o[a],n.indexOf(e)>=0||Object.prototype.propertyIsEnumerable.call(t,e)&&(r[e]=t[e])}return r}var c=a.createContext({}),l=function(t){var n=a.useContext(c),e=n;return t&&(e="function"==typeof t?t(n):i(i({},n),t)),e},s=function(t){var n=l(t.components);return a.createElement(c.Provider,{value:n},t.children)},m="mdxType",p={inlineCode:"code",wrapper:function(t){var n=t.children;return a.createElement(a.Fragment,{},n)}},d=a.forwardRef((function(t,n){var e=t.components,r=t.mdxType,o=t.originalType,c=t.parentName,s=u(t,["components","mdxType","originalType","parentName"]),m=l(e),d=r,g=m["".concat(c,".").concat(d)]||m[d]||p[d]||o;return e?a.createElement(g,i(i({ref:n},s),{},{components:e})):a.createElement(g,i({ref:n},s))}));function g(t,n){var e=arguments,r=n&&n.mdxType;if("string"==typeof t||r){var o=e.length,i=new Array(o);i[0]=d;var u={};for(var c in n)hasOwnProperty.call(n,c)&&(u[c]=n[c]);u.originalType=t,u[m]="string"==typeof t?t:r,i[1]=u;for(var l=2;l<o;l++)i[l]=e[l];return a.createElement.apply(null,i)}return a.createElement.apply(null,e)}d.displayName="MDXCreateElement"},70681:(t,n,e)=>{e.r(n),e.d(n,{assets:()=>s,contentTitle:()=>c,default:()=>g,frontMatter:()=>u,metadata:()=>l,toc:()=>m});var a=e(87462),r=(e(67294),e(3905)),o=e(74866),i=e(85162);const u={title:"\u8fc1\u79fb\u7a0b\u5e8f\u7684\u6570\u636e\u8d26\u6237",sidebar_position:9,tags:["solana-cook-book","data-migration"]},c="\u8fc1\u79fb\u7a0b\u5e8f\u7684\u6570\u636e\u8d26\u6237",l={unversionedId:"guides/data-migration",id:"guides/data-migration",title:"\u8fc1\u79fb\u7a0b\u5e8f\u7684\u6570\u636e\u8d26\u6237",description:"\u4f60\u5982\u4f55\u8fc1\u79fb\u4e00\u4e2a\u7a0b\u5e8f\u7684\u6570\u636e\u8d26\u6237\uff1f",source:"@site/docs/cookbook-zh/guides/data-migration.md",sourceDirName:"guides",slug:"/guides/data-migration",permalink:"/all-in-one-solana/cookbook-zh/guides/data-migration",draft:!1,editUrl:"https://github.com/CreatorsDAO/all-in-one-solana/tree/dev/docs/cookbook-zh/guides/data-migration.md",tags:[{label:"solana-cook-book",permalink:"/all-in-one-solana/cookbook-zh/tags/solana-cook-book"},{label:"data-migration",permalink:"/all-in-one-solana/cookbook-zh/tags/data-migration"}],version:"current",sidebarPosition:9,frontMatter:{title:"\u8fc1\u79fb\u7a0b\u5e8f\u7684\u6570\u636e\u8d26\u6237",sidebar_position:9,tags:["solana-cook-book","data-migration"]},sidebar:"tutorialSidebar",previous:{title:"\u5e8f\u5217\u6570\u636e",permalink:"/all-in-one-solana/cookbook-zh/guides/serialization"},next:{title:"\u8d26\u6237\u6620\u5c04",permalink:"/all-in-one-solana/cookbook-zh/guides/account-maps"}},s={},m=[{value:"\u4f60\u5982\u4f55\u8fc1\u79fb\u4e00\u4e2a\u7a0b\u5e8f\u7684\u6570\u636e\u8d26\u6237\uff1f",id:"\u4f60\u5982\u4f55\u8fc1\u79fb\u4e00\u4e2a\u7a0b\u5e8f\u7684\u6570\u636e\u8d26\u6237",level:2},{value:"\u573a\u666f",id:"\u573a\u666f",level:2},{value:"\u5347\u7ea7\u8d26\u6237",id:"\u5347\u7ea7\u8d26\u6237",level:2},{value:"1. \u6dfb\u52a0\u8d26\u6237\u8f6c\u6362\u903b\u8f91",id:"1-\u6dfb\u52a0\u8d26\u6237\u8f6c\u6362\u903b\u8f91",level:3},{value:"\u8d44\u6599",id:"\u8d44\u6599",level:2}],p={toc:m},d="wrapper";function g(t){let{components:n,...e}=t;return(0,r.kt)(d,(0,a.Z)({},p,e,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"\u8fc1\u79fb\u7a0b\u5e8f\u7684\u6570\u636e\u8d26\u6237"},"\u8fc1\u79fb\u7a0b\u5e8f\u7684\u6570\u636e\u8d26\u6237"),(0,r.kt)("h2",{id:"\u4f60\u5982\u4f55\u8fc1\u79fb\u4e00\u4e2a\u7a0b\u5e8f\u7684\u6570\u636e\u8d26\u6237"},"\u4f60\u5982\u4f55\u8fc1\u79fb\u4e00\u4e2a\u7a0b\u5e8f\u7684\u6570\u636e\u8d26\u6237\uff1f"),(0,r.kt)("p",null,"\u5f53\u4f60\u521b\u5efa\u4e00\u4e2a\u7a0b\u5e8f\u65f6\uff0c\u4e0e\u8be5\u7a0b\u5e8f\u5173\u8054\u7684\u6bcf\u4e2a\u6570\u636e\u8d26\u6237\u90fd\u5c06\u5177\u6709\u7279\u5b9a\u7684\u6570\u636e\u7ed3\u6784\u3002\u5982\u679c\u4f60\u9700\u8981\u5347\u7ea7\u4e00\u4e2a\u7a0b\u5e8f\u6d3e\u751f\u8d26\u6237\uff0c\u90a3\u4e48\u4f60\u5c06\u5f97\u5230\u4e00\u5806\u5177\u6709\u65e7\u7ed3\u6784\u7684\u5269\u4f59\u7a0b\u5e8f\u6d3e\u751f\u8d26\u6237\u3002"),(0,r.kt)("p",null,"\u901a\u8fc7\u8d26\u6237\u7248\u672c\u63a7\u5236\uff0c\u60a8\u53ef\u4ee5\u5c06\u65e7\u8d26\u6237\u5347\u7ea7\u5230\u65b0\u7684\u7ed3\u6784\u3002"),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},(0,r.kt)("strong",{parentName:"p"},"tip \u6ce8\u610f"),"\n\u8fd9\u53ea\u662f\u5728\u7a0b\u5e8f\u62e5\u6709\u7684\u8d26\u6237\uff08POA\uff09\u4e2d\u8fc1\u79fb\u6570\u636e\u7684\u4f17\u591a\u65b9\u6cd5\u4e4b\u4e00\u3002")),(0,r.kt)("h2",{id:"\u573a\u666f"},"\u573a\u666f"),(0,r.kt)("p",null,"\u4e3a\u4e86\u5bf9\u8d26\u6237\u6570\u636e\u8fdb\u884c\u7248\u672c\u63a7\u5236\u548c\u8fc1\u79fb\uff0c\u6211\u4eec\u5c06\u4e3a\u6bcf\u4e2a\u8d26\u6237\u63d0\u4f9b\u4e00\u4e2aID\u3002\u8be5ID\u5141\u8bb8\u6211\u4eec\u5728\u5c06\u5176\u4f20\u9012\u7ed9\u7a0b\u5e8f\u65f6\u8bc6\u522b\u8d26\u6237\u7684\u7248\u672c\uff0c\u4ece\u800c\u6b63\u786e\u5904\u7406\u8d26\u6237\u3002"),(0,r.kt)("p",null,"\u5047\u8bbe\u6709\u4ee5\u4e0b\u8d26\u6237\u72b6\u6001\u548c\u7a0b\u5e8f\uff1a"),(0,r.kt)(o.Z,{mdxType:"Tabs"},(0,r.kt)(i.Z,{value:"Account",label:"Account",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-rust"},"#[derive(BorshDeserialize, BorshSerialize, Debug, Default, PartialEq)]\npub struct AccountContentCurrent {\n    pub somevalue: u64,\n}\n\n#[derive(BorshDeserialize, BorshSerialize, Debug, Default, PartialEq)]\npub struct ProgramAccountState {\n    is_initialized: bool,\n    data_version: u8,\n    account_data: AccountContentCurrent,\n}\n"))),(0,r.kt)(i.Z,{value:"instruction",label:"instruction",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-rust"},"impl ProgramInstruction {\n    /// Unpack inbound buffer to associated Instruction\n    /// The expected format for input is a Borsh serialized vector\n    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {\n        let payload = ProgramInstruction::try_from_slice(input).unwrap();\n        match payload {\n            ProgramInstruction::InitializeAccount => Ok(payload),\n            ProgramInstruction::SetU64Value(_) => Ok(payload),\n            _ => Err(DataVersionError::InvalidInstruction.into()),\n        }\n    }\n}\n"))),(0,r.kt)(i.Z,{value:"processor",label:"processor",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-rust"},'fn check_account_ownership(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {\n    // Accounts must be owned by the program.\n    for account in accounts.iter().take(accounts.len() - 1) {\n        if account.owner != program_id {\n            msg!(\n                "Fail: The tracking account owner is {} and it should be {}.",\n                account.owner,\n                program_id\n            );\n            return Err(ProgramError::IncorrectProgramId);\n        }\n    }\n    Ok(())\n}\n\n/// Initialize the programs account, which is the first in accounts\nfn initialize_account(accounts: &[AccountInfo]) -> ProgramResult {\n    msg!("Initialize account");\n    let account_info_iter = &mut accounts.iter();\n    let program_account = next_account_info(account_info_iter)?;\n    let mut account_data = program_account.data.borrow_mut();\n    // Just using unpack will check to see if initialized and will\n    // fail if not\n    let mut account_state = ProgramAccountState::unpack_unchecked(&account_data)?;\n    // Where this is a logic error in trying to initialize the same account more than once\n    if account_state.is_initialized() {\n        return Err(DataVersionError::AlreadyInitializedState.into());\n    } else {\n        account_state.set_initialized();\n        account_state.content_mut().somevalue = 1;\n    }\n    msg!("Account Initialized");\n    // Serialize\n    ProgramAccountState::pack(account_state, &mut account_data)\n}\n\n/// Sets the u64 in the content structure\nfn set_u64_value(accounts: &[AccountInfo], value: u64) -> ProgramResult {\n    msg!("Set new value {}", value);\n    let account_info_iter = &mut accounts.iter();\n    let program_account = next_account_info(account_info_iter)?;\n    let mut account_data = program_account.data.borrow_mut();\n    let mut account_state = ProgramAccountState::unpack(&account_data)?;\n    account_state.content_mut().somevalue = value;\n    // Serialize\n    ProgramAccountState::pack(account_state, &mut account_data)\n}\n/// Main processing entry point dispatches to specific\n/// instruction handlers\npub fn process(\n    program_id: &Pubkey,\n    accounts: &[AccountInfo],\n    instruction_data: &[u8],\n) -> ProgramResult {\n    msg!("Received process request");\n    // Check the account for program relationship\n    if let Err(error) = check_account_ownership(program_id, accounts) {\n        return Err(error);\n    };\n    // Unpack the inbound data, mapping instruction to appropriate structure\n    let instruction = ProgramInstruction::unpack(instruction_data)?;\n    match instruction {\n        ProgramInstruction::InitializeAccount => initialize_account(accounts),\n        ProgramInstruction::SetU64Value(value) => set_u64_value(accounts, value),\n        _ => {\n            msg!("Received unknown instruction");\n            Err(DataVersionError::InvalidInstruction.into())\n        }\n    }\n}\n')))),(0,r.kt)("p",null,"\u5728\u6211\u4eec\u8d26\u6237\u7684\u7b2c\u4e00\u4e2a\u7248\u672c\u4e2d\uff0c\u6211\u4eec\u6267\u884c\u4ee5\u4e0b\u64cd\u4f5c\uff1a"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"ID"),(0,r.kt)("th",{parentName:"tr",align:null},"Action"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"1"),(0,r.kt)("td",{parentName:"tr",align:null},"Include a 'data version' field in your data. It can be a simple incrementing ordinal (e.g. u8) or something more sophisticated")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"2"),(0,r.kt)("td",{parentName:"tr",align:null},"Allocating enough space for data growth")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"3"),(0,r.kt)("td",{parentName:"tr",align:null},"Initializing a number of constants to be used across program versions")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"4"),(0,r.kt)("td",{parentName:"tr",align:null},"Add an update account function under ",(0,r.kt)("inlineCode",{parentName:"td"},"fn conversion_logic")," for future upgrades")))),(0,r.kt)("p",null,"\u5047\u8bbe\u6211\u4eec\u73b0\u5728\u5e0c\u671b\u5347\u7ea7\u7a0b\u5e8f\u7684\u8d26\u6237\uff0c\u5305\u62ec\u4e00\u4e2a\u65b0\u7684\u5fc5\u9700\u5b57\u6bb5\uff1a",(0,r.kt)("inlineCode",{parentName:"p"},"somestring"),"\u5b57\u6bb5\u3002"),(0,r.kt)("p",null,"\u5982\u679c\u6211\u4eec\u4e4b\u524d\u6ca1\u6709\u4e3a\u8d26\u6237\u5206\u914d\u989d\u5916\u7684\u7a7a\u95f4\uff0c\u6211\u4eec\u5c06\u65e0\u6cd5\u5347\u7ea7\u8be5\u8d26\u6237\uff0c\u800c\u88ab\u5361\u4f4f\u3002"),(0,r.kt)("h2",{id:"\u5347\u7ea7\u8d26\u6237"},"\u5347\u7ea7\u8d26\u6237"),(0,r.kt)("p",null,"\u5728\u6211\u4eec\u7684\u65b0\u7a0b\u5e8f\u4e2d\uff0c\u6211\u4eec\u5e0c\u671b\u4e3a\u5185\u5bb9\u72b6\u6001\u6dfb\u52a0\u4e00\u4e2a\u65b0\u5c5e\u6027\u3002\u4e0b\u9762\u7684\u53d8\u5316\u5c55\u793a\u4e86\u6211\u4eec\u5982\u4f55\u5229\u7528\u521d\u59cb\u7684\u7a0b\u5e8f\u7ed3\u6784\uff0c\u5e76\u5728\u73b0\u5728\u4f7f\u7528\u65f6\u8fdb\u884c\u4fee\u6539\u3002"),(0,r.kt)("h3",{id:"1-\u6dfb\u52a0\u8d26\u6237\u8f6c\u6362\u903b\u8f91"},"1. \u6dfb\u52a0\u8d26\u6237\u8f6c\u6362\u903b\u8f91"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-rust"},"/// Current state (DATA_VERSION 1). If version changes occur, this\n/// should be copied to another (see AccountContentOld below)\n/// We've added a new field: 'somestring'\n#[derive(BorshDeserialize, BorshSerialize, Debug, Default, PartialEq)]\npub struct AccountContentCurrent {\n    pub somevalue: u64,\n    pub somestring: String,\n}\n\n/// Old content state (DATA_VERSION 0).\n#[derive(BorshDeserialize, BorshSerialize, Debug, Default, PartialEq)]\npub struct AccountContentOld {\n    pub somevalue: u64,\n}\n\n/// Maintains account data\n#[derive(BorshDeserialize, BorshSerialize, Debug, Default, PartialEq)]\npub struct ProgramAccountState {\n    is_initialized: bool,\n    data_version: u8,\n    account_data: AccountContentCurrent,\n}\n")),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"Line(s)"),(0,r.kt)("th",{parentName:"tr",align:null},"Note"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"6"),(0,r.kt)("td",{parentName:"tr",align:null},"We've added Solana's ",(0,r.kt)("inlineCode",{parentName:"td"},"solana_program::borsh::try_from_slice_unchecked")," to simplify reading subsets of data from the larger data block")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"13-26"),(0,r.kt)("td",{parentName:"tr",align:null},"Here we've preserved the old content structure, ",(0,r.kt)("inlineCode",{parentName:"td"},"AccountContentOld")," line 24, before extending the ",(0,r.kt)("inlineCode",{parentName:"td"},"AccountContentCurrent")," starting in line 17.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"60"),(0,r.kt)("td",{parentName:"tr",align:null},"We bump the ",(0,r.kt)("inlineCode",{parentName:"td"},"DATA_VERSION")," constant")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"71"),(0,r.kt)("td",{parentName:"tr",align:null},"We now have a 'previous' version and we want to know it's size")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"86"),(0,r.kt)("td",{parentName:"tr",align:null},"The Coup de gr\xe2ce is adding the plumbing to upgrade the previous content state to the new (current) content state")))),(0,r.kt)("p",null,"\u7136\u540e\uff0c\u6211\u4eec\u66f4\u65b0\u6307\u4ee4\uff0c\u6dfb\u52a0\u4e00\u4e2a\u65b0\u7684\u6307\u4ee4\u6765\u66f4\u65b0",(0,r.kt)("inlineCode",{parentName:"p"},"somestring"),'\uff0c\u5e76\u66f4\u65b0\u5904\u7406\u5668\u6765\u5904\u7406\u65b0\u7684\u6307\u4ee4\u3002\u8bf7\u6ce8\u610f\uff0c"\u5347\u7ea7"\u6570\u636e\u7ed3\u6784\u662f\u901a\u8fc7',(0,r.kt)("inlineCode",{parentName:"p"},"pack/unpack"),"\u5c01\u88c5\u8d77\u6765\u7684\u3002"),(0,r.kt)(o.Z,{mdxType:"Tabs"},(0,r.kt)(i.Z,{value:"instruction",label:"instruction",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-rust"},"//! instruction Contains the main VersionProgramInstruction enum\n\nuse {\n    crate::error::DataVersionError,\n    borsh::{BorshDeserialize, BorshSerialize},\n    solana_program::{borsh::try_from_slice_unchecked, msg, program_error::ProgramError},\n};\n\n#[derive(BorshDeserialize, BorshSerialize, Debug, PartialEq)]\n/// All custom program instructions\npub enum VersionProgramInstruction {\n    InitializeAccount,\n    SetU64Value(u64),\n    SetString(String), // Added with data version change\n    FailInstruction,\n}\n\nimpl VersionProgramInstruction {\n    /// Unpack inbound buffer to associated Instruction\n    /// The expected format for input is a Borsh serialized vector\n    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {\n        let payload = try_from_slice_unchecked::<VersionProgramInstruction>(input).unwrap();\n        // let payload = VersionProgramInstruction::try_from_slice(input).unwrap();\n        match payload {\n            VersionProgramInstruction::InitializeAccount => Ok(payload),\n            VersionProgramInstruction::SetU64Value(_) => Ok(payload),\n            VersionProgramInstruction::SetString(_) => Ok(payload), // Added with data version change\n            _ => Err(DataVersionError::InvalidInstruction.into()),\n        }\n    }\n}\n"))),(0,r.kt)(i.Z,{value:"process",label:"process",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-rust"},'//! Resolve instruction and execute\n\nuse crate::{\n    account_state::ProgramAccountState, error::DataVersionError,\n    instruction::VersionProgramInstruction,\n};\nuse solana_program::{\n    account_info::{next_account_info, AccountInfo},\n    entrypoint::ProgramResult,\n    msg,\n    program_error::ProgramError,\n    program_pack::{IsInitialized, Pack},\n    pubkey::Pubkey,\n};\n\n/// Checks each tracking account to confirm it is owned by our program\n/// This function assumes that the program account is always the last\n/// in the array\nfn check_account_ownership(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {\n    // Accounts must be owned by the program.\n    for account in accounts.iter().take(accounts.len() - 1) {\n        if account.owner != program_id {\n            msg!(\n                "Fail: The tracking account owner is {} and it should be {}.",\n                account.owner,\n                program_id\n            );\n            return Err(ProgramError::IncorrectProgramId);\n        }\n    }\n    Ok(())\n}\n\n/// Initialize the programs account, which is the first in accounts\nfn initialize_account(accounts: &[AccountInfo]) -> ProgramResult {\n    msg!("Initialize account");\n    let account_info_iter = &mut accounts.iter();\n    let program_account = next_account_info(account_info_iter)?;\n    let mut account_data = program_account.data.borrow_mut();\n    // Just using unpack will check to see if initialized and will\n    // fail if not\n    let mut account_state = ProgramAccountState::unpack_unchecked(&account_data)?;\n    // Where this is a logic error in trying to initialize the same account more than once\n    if account_state.is_initialized() {\n        return Err(DataVersionError::AlreadyInitializedState.into());\n    } else {\n        account_state.set_initialized();\n        account_state.content_mut().somevalue = 1;\n    }\n    msg!("Account Initialized");\n    // Serialize\n    ProgramAccountState::pack(account_state, &mut account_data)\n}\n\n/// Sets the u64 in the content structure\nfn set_u64_value(accounts: &[AccountInfo], value: u64) -> ProgramResult {\n    msg!("Set new value {}", value);\n    let account_info_iter = &mut accounts.iter();\n    let program_account = next_account_info(account_info_iter)?;\n    let mut account_data = program_account.data.borrow_mut();\n    let mut account_state = ProgramAccountState::unpack(&account_data)?;\n    account_state.content_mut().somevalue = value;\n    // Serialize\n    ProgramAccountState::pack(account_state, &mut account_data)\n}\n\n/// Sets the string in the content structure\nfn set_string_value(accounts: &[AccountInfo], value: String) -> ProgramResult {\n    msg!("Set new string {}", value);\n    let account_info_iter = &mut accounts.iter();\n    let program_account = next_account_info(account_info_iter)?;\n    let mut account_data = program_account.data.borrow_mut();\n    let mut account_state = ProgramAccountState::unpack(&account_data)?;\n    account_state.content_mut().somestring = value;\n    // Serialize\n    ProgramAccountState::pack(account_state, &mut account_data)\n}\n/// Main processing entry point dispatches to specific\n/// instruction handlers\npub fn process(\n    program_id: &Pubkey,\n    accounts: &[AccountInfo],\n    instruction_data: &[u8],\n) -> ProgramResult {\n    msg!("Received process request 0.2.0");\n    // Check the account for program relationship\n    if let Err(error) = check_account_ownership(program_id, accounts) {\n        return Err(error);\n    };\n    // Unpack the inbound data, mapping instruction to appropriate structure\n    msg!("Attempting to unpack");\n    let instruction = VersionProgramInstruction::unpack(instruction_data)?;\n    match instruction {\n        VersionProgramInstruction::InitializeAccount => initialize_account(accounts),\n        VersionProgramInstruction::SetU64Value(value) => set_u64_value(accounts, value),\n        VersionProgramInstruction::SetString(value) => set_string_value(accounts, value),\n        _ => {\n            msg!("Received unknown instruction");\n            Err(DataVersionError::InvalidInstruction.into())\n        }\n    }\n}\n')))),(0,r.kt)("h2",{id:"\u8d44\u6599"},"\u8d44\u6599"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://borsh.io/"},"Borsh Specification")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://github.com/solana-labs/solana/blob/master/sdk/program/src/borsh.rs#L67"},"Solana ",(0,r.kt)("inlineCode",{parentName:"a"},"try_from_slice_unchecked"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://github.com/FrankC01/versioning-solana"},"Reference Implementation"))))}g.isMDXComponent=!0},85162:(t,n,e)=>{e.d(n,{Z:()=>i});var a=e(67294),r=e(86010);const o={tabItem:"tabItem_Ymn6"};function i(t){let{children:n,hidden:e,className:i}=t;return a.createElement("div",{role:"tabpanel",className:(0,r.Z)(o.tabItem,i),hidden:e},n)}},74866:(t,n,e)=>{e.d(n,{Z:()=>y});var a=e(87462),r=e(67294),o=e(86010),i=e(12466),u=e(16550),c=e(91980),l=e(67392),s=e(50012);function m(t){return function(t){return r.Children.map(t,(t=>{if(!t||(0,r.isValidElement)(t)&&function(t){const{props:n}=t;return!!n&&"object"==typeof n&&"value"in n}(t))return t;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof t.type?t.type:t.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}(t).map((t=>{let{props:{value:n,label:e,attributes:a,default:r}}=t;return{value:n,label:e,attributes:a,default:r}}))}function p(t){const{values:n,children:e}=t;return(0,r.useMemo)((()=>{const t=n??m(e);return function(t){const n=(0,l.l)(t,((t,n)=>t.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((t=>t.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(t),t}),[n,e])}function d(t){let{value:n,tabValues:e}=t;return e.some((t=>t.value===n))}function g(t){let{queryString:n=!1,groupId:e}=t;const a=(0,u.k6)(),o=function(t){let{queryString:n=!1,groupId:e}=t;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!e)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return e??null}({queryString:n,groupId:e});return[(0,c._X)(o),(0,r.useCallback)((t=>{if(!o)return;const n=new URLSearchParams(a.location.search);n.set(o,t),a.replace({...a.location,search:n.toString()})}),[o,a])]}function k(t){const{defaultValue:n,queryString:e=!1,groupId:a}=t,o=p(t),[i,u]=(0,r.useState)((()=>function(t){let{defaultValue:n,tabValues:e}=t;if(0===e.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!d({value:n,tabValues:e}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${e.map((t=>t.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const a=e.find((t=>t.default))??e[0];if(!a)throw new Error("Unexpected error: 0 tabValues");return a.value}({defaultValue:n,tabValues:o}))),[c,l]=g({queryString:e,groupId:a}),[m,k]=function(t){let{groupId:n}=t;const e=function(t){return t?`docusaurus.tab.${t}`:null}(n),[a,o]=(0,s.Nk)(e);return[a,(0,r.useCallback)((t=>{e&&o.set(t)}),[e,o])]}({groupId:a}),f=(()=>{const t=c??m;return d({value:t,tabValues:o})?t:null})();(0,r.useLayoutEffect)((()=>{f&&u(f)}),[f]);return{selectedValue:i,selectValue:(0,r.useCallback)((t=>{if(!d({value:t,tabValues:o}))throw new Error(`Can't select invalid tab value=${t}`);u(t),l(t),k(t)}),[l,k,o]),tabValues:o}}var f=e(72389);const b={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};function h(t){let{className:n,block:e,selectedValue:u,selectValue:c,tabValues:l}=t;const s=[],{blockElementScrollPositionUntilNextRender:m}=(0,i.o5)(),p=t=>{const n=t.currentTarget,e=s.indexOf(n),a=l[e].value;a!==u&&(m(n),c(a))},d=t=>{let n=null;switch(t.key){case"Enter":p(t);break;case"ArrowRight":{const e=s.indexOf(t.currentTarget)+1;n=s[e]??s[0];break}case"ArrowLeft":{const e=s.indexOf(t.currentTarget)-1;n=s[e]??s[s.length-1];break}}n?.focus()};return r.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,o.Z)("tabs",{"tabs--block":e},n)},l.map((t=>{let{value:n,label:e,attributes:i}=t;return r.createElement("li",(0,a.Z)({role:"tab",tabIndex:u===n?0:-1,"aria-selected":u===n,key:n,ref:t=>s.push(t),onKeyDown:d,onClick:p},i,{className:(0,o.Z)("tabs__item",b.tabItem,i?.className,{"tabs__item--active":u===n})}),e??n)})))}function _(t){let{lazy:n,children:e,selectedValue:a}=t;const o=(Array.isArray(e)?e:[e]).filter(Boolean);if(n){const t=o.find((t=>t.props.value===a));return t?(0,r.cloneElement)(t,{className:"margin-top--md"}):null}return r.createElement("div",{className:"margin-top--md"},o.map(((t,n)=>(0,r.cloneElement)(t,{key:n,hidden:t.props.value!==a}))))}function v(t){const n=k(t);return r.createElement("div",{className:(0,o.Z)("tabs-container",b.tabList)},r.createElement(h,(0,a.Z)({},t,n)),r.createElement(_,(0,a.Z)({},t,n)))}function y(t){const n=(0,f.Z)();return r.createElement(v,(0,a.Z)({key:String(n)},t))}}}]);