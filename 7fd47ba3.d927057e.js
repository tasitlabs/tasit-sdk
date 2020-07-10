(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{109:function(e,t,a){"use strict";a.r(t),a.d(t,"frontMatter",(function(){return c})),a.d(t,"metadata",(function(){return i})),a.d(t,"rightToc",(function(){return s})),a.d(t,"default",(function(){return u}));var n=a(2),r=a(6),o=(a(0),a(119)),c={id:"main-features",title:"Main features",sidebar_label:"Main features"},i={id:"main-features",isDocsHomePage:!1,title:"Main features",description:"- in-dapp wallets (burner and contract-based)",source:"@site/docs/MainFeatures.md",permalink:"/docs/main-features",editUrl:"https://github.com/tasitlabs/tasit-sdk/tree/develop/packages/docs/docs/MainFeatures.md",sidebar_label:"Main features",sidebar:"docs",previous:{title:"Get started",permalink:"/docs/get-started"},next:{title:"Why",permalink:"/docs/why"}},s=[{value:"in-dapp wallets (burner and contract-based)",id:"in-dapp-wallets-burner-and-contract-based",children:[]},{value:"Optimistic UI",id:"optimistic-ui",children:[]}],l={rightToc:s};function u(e){var t=e.components,a=Object(r.a)(e,["components"]);return Object(o.b)("wrapper",Object(n.a)({},l,a,{components:t,mdxType:"MDXLayout"}),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("a",Object(n.a)({parentName:"li"},{href:"#in-dapp-wallets-burner-and-contract-based"}),"in-dapp wallets (burner and contract-based)"),Object(o.b)("ul",{parentName:"li"},Object(o.b)("li",{parentName:"ul"},Object(o.b)("a",Object(n.a)({parentName:"li"},{href:"#start-in-read-only-mode"}),"Start in read-only mode")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("a",Object(n.a)({parentName:"li"},{href:"#in-dapp-accounts"}),"in-dapp accounts")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("a",Object(n.a)({parentName:"li"},{href:"#in-dapp-contract-based-accounts"}),"in-dapp contract-based accounts")))),Object(o.b)("li",{parentName:"ul"},Object(o.b)("a",Object(n.a)({parentName:"li"},{href:"#optimistic-ui"}),"Optimistic UI"))),Object(o.b)("h2",{id:"in-dapp-wallets-burner-and-contract-based"},"in-dapp wallets (burner and contract-based)"),Object(o.b)("p",null,"Apps built with Tasit use an autogenerated in-app account for the user to start with. It should never be the main place users hold their funds, and we don't ask you to back up the seed phrase for it."),Object(o.b)("p",null,"Once the user has enough value that they shouldn't hold it with that account, it can be added as a signer to a contract-based account. This brings the benefits of contract-based wallets like Gnosis Safe and Argent to dapps."),Object(o.b)("p",null,"This SDK takes an opinionated approach to onboarding (although since it's a modular repo, you still retain the ability to use other child packages and not the onboarding-related ones if you prefer). The SDK supports read-only mode, meta-transactions, contract-based accounts, and connecting with their preferred primary mobile Ethereum wallet."),Object(o.b)("p",null,Object(o.b)("em",{parentName:"p"},"This means a flow that users will be used to which decreases the friction for onboarding people who have used other Ethereum dapps.")),Object(o.b)("h4",{id:"start-in-read-only-mode"},"Start in read-only mode"),Object(o.b)("p",null,"A native mobile dapp should be read-only for as long as possible. The user shouldn't know there's a blockchain involved or see anything about an account, and an Ethereum account shouldn't even be created until it becomes necessary. Why go through an onboarding flow at all right away?"),Object(o.b)("p",null,"The flow for reading data from The Graph or directly from contracts without onboarding first just works with no special configuration."),Object(o.b)("p",null,"For more info, see ",Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"/packages/action/"}),Object(o.b)("inlineCode",{parentName:"a"},"@tasit/action")),"."),Object(o.b)("h4",{id:"in-dapp-accounts"},"in-dapp accounts"),Object(o.b)("p",null,"Using Tasit, you can generate a new Ethereum account and private key for the user."),Object(o.b)("p",null,"Tasit makes it simple for a new account to be instantiated in each mobile app it is used in."),Object(o.b)("p",null,"The intended UX is that this account should NOT have any significant amount of ETH, ERC20, or ERC721 tokens sent to it. Instead, this address should be authorized to perform actions on behalf of a contract-based account or software wallet a user already has with some ETH or tokens. This is an ephemeral account for that app on the device, and as the user gets more familiar with it their account can be progressively upgraded to a contract-based account later or their funds can be stored in their preferred primary software wallet."),Object(o.b)("p",null,"For users without any ETH or tokens, any costs the user incurs at first should be subsidized."),Object(o.b)("p",null,"For more info, see ",Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"/packages/account/"}),Object(o.b)("inlineCode",{parentName:"a"},"@tasit/account")),"."),Object(o.b)("p",null,Object(o.b)("em",{parentName:"p"},"This means fewer steps that need to be taken to onboard a new user.")),Object(o.b)("h4",{id:"in-dapp-contract-based-accounts"},"in-dapp contract-based accounts"),Object(o.b)("p",null,"Give them a contract-based account so that the UX around securing keys and recovering funds is simpler."),Object(o.b)("p",null,"For example, set up a ",Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"https://safe.gnosis.io/"}),"Gnosis Safe")," for the user."),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-ts"}),'const { address: burnerWalletAddress } = burnerWallet;\nconst username = "paul";\nconst contractKind = "gnosis-safe"; // | "argent" | "abridged" | "authereum" | ...\n\nconst create2ContractBasedAccount = await Account.upgrade({\n  account: burnerWalletAddress,\n  username: username,\n  contractKind: contractKind\n});\nconsole.log(create2ContractBasedAccount.address); // Send it an ERC20 token!\n\nconst contractBasedAccount = await create2ContractBasedAccount.deploy();\n\nconsole.log(contractBasedAccount.ensName); // paul.{NAMEOFTHISDAPP}.eth\n')),Object(o.b)("p",null,"For more info, see ",Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"/packages/contract-based-account/"}),Object(o.b)("inlineCode",{parentName:"a"},"@tasit/contract-based-account")),"."),Object(o.b)("h2",{id:"optimistic-ui"},"Optimistic UI"),Object(o.b)("p",null,"Tasit provides JavaScript/TypeScript middleware for reading from and writing to smart contracts (and listening to events) through an expressive pub/sub API."),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-js"}),'import { Contract } from "tasit";\nconst { NFT } = Contract;\n\nconst contractAddress = "0x0E86...333";\nconst contract = new NFT(contractAddress);\n\n// No await???\nconst action = contract.safeTransferFrom(/*...*/);\n\naction.on("error", errorListener);\naction.on("oneConfirmation", goodSignListener);\naction.on("enoughConfirmations", successListener);\naction.send(); // broadcast\n\n// Do optimistic UI updates immediately, while making sure\n// to update the UI again when there are enough\n// confirmations for your use case\n// ...\n')),Object(o.b)("p",null,"As a mobile developer, using Tasit to interact with the backend should be as simple as using Firebase as a backend-as-a-service. This library is written in such a way that the developer using the SDK can just think about writing data and listening for more data. The fact that there's a blockchain powering this is an implementation detail that is abstracted away."),Object(o.b)("p",null,"This middleware wraps the core ethers.js contract API for making JSON-RPC requests."),Object(o.b)("p",null,"Fore more info, see ",Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"/packages/action/"}),Object(o.b)("inlineCode",{parentName:"a"},"@tasit/action")),"."),Object(o.b)("p",null,Object(o.b)("em",{parentName:"p"},"This makes the experience for new developers working on a mobile app with Tasit simpler, which means more mobile dapps for end users.")),Object(o.b)("hr",null),Object(o.b)("p",null,Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"/docs/introduction"}),"Go back")," to the home page of the docs."))}u.isMDXComponent=!0},119:function(e,t,a){"use strict";a.d(t,"a",(function(){return b})),a.d(t,"b",(function(){return h}));var n=a(0),r=a.n(n);function o(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function c(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?c(Object(a),!0).forEach((function(t){o(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):c(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function s(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var l=r.a.createContext({}),u=function(e){var t=r.a.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},b=function(e){var t=u(e.components);return r.a.createElement(l.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},d=r.a.forwardRef((function(e,t){var a=e.components,n=e.mdxType,o=e.originalType,c=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),b=u(a),d=n,h=b["".concat(c,".").concat(d)]||b[d]||p[d]||o;return a?r.a.createElement(h,i(i({ref:t},l),{},{components:a})):r.a.createElement(h,i({ref:t},l))}));function h(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=a.length,c=new Array(o);c[0]=d;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i.mdxType="string"==typeof e?e:n,c[1]=i;for(var l=2;l<o;l++)c[l]=a[l];return r.a.createElement.apply(null,c)}return r.a.createElement.apply(null,a)}d.displayName="MDXCreateElement"}}]);