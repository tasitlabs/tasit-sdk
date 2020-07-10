(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{119:function(e,t,r){"use strict";r.d(t,"a",(function(){return h})),r.d(t,"b",(function(){return b}));var a=r(0),o=r.n(a);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,a,o=function(e,t){if(null==e)return{};var r,a,o={},n=Object.keys(e);for(a=0;a<n.length;a++)r=n[a],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);for(a=0;a<n.length;a++)r=n[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var c=o.a.createContext({}),p=function(e){var t=o.a.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):s(s({},t),e)),r},h=function(e){var t=p(e.components);return o.a.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},d=o.a.forwardRef((function(e,t){var r=e.components,a=e.mdxType,n=e.originalType,i=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),h=p(r),d=a,b=h["".concat(i,".").concat(d)]||h[d]||u[d]||n;return r?o.a.createElement(b,s(s({ref:t},c),{},{components:r})):o.a.createElement(b,s({ref:t},c))}));function b(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var n=r.length,i=new Array(n);i[0]=d;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:a,i[1]=s;for(var c=2;c<n;c++)i[c]=r[c];return o.a.createElement.apply(null,i)}return o.a.createElement.apply(null,r)}d.displayName="MDXCreateElement"},99:function(e,t,r){"use strict";r.r(t),r.d(t,"frontMatter",(function(){return i})),r.d(t,"metadata",(function(){return s})),r.d(t,"rightToc",(function(){return l})),r.d(t,"default",(function(){return p}));var a=r(2),o=r(6),n=(r(0),r(119)),i={id:"why",title:"Why",sidebar_label:"Why"},s={id:"why",isDocsHomePage:!1,title:"Why",description:"- Why (from the user's perspective)?",source:"@site/docs/Why.md",permalink:"/docs/why",editUrl:"https://github.com/tasitlabs/tasit-sdk/tree/develop/packages/docs/docs/Why.md",sidebar_label:"Why",sidebar:"docs",previous:{title:"Main features",permalink:"/docs/main-features"},next:{title:"Config",permalink:"/docs/config"}},l=[{value:"Why (from the user&#39;s perspective)?",id:"why-from-the-users-perspective",children:[{value:"Right to exit for users",id:"right-to-exit-for-users",children:[]}]},{value:"Why (from a developer&#39;s / Ethereum enthusiast&#39;s perspective)?",id:"why-from-a-developers--ethereum-enthusiasts-perspective",children:[{value:"Proof of decentralization",id:"proof-of-decentralization",children:[]},{value:"No platform risk",id:"no-platform-risk",children:[]}]},{value:"Why React Native?",id:"why-react-native",children:[]}],c={rightToc:l};function p(e){var t=e.components,r=Object(o.a)(e,["components"]);return Object(n.b)("wrapper",Object(a.a)({},c,r,{components:t,mdxType:"MDXLayout"}),Object(n.b)("ul",null,Object(n.b)("li",{parentName:"ul"},Object(n.b)("a",Object(a.a)({parentName:"li"},{href:"#why-from-the-users-perspective"}),"Why (from the user's perspective)?"),Object(n.b)("ul",{parentName:"li"},Object(n.b)("li",{parentName:"ul"},Object(n.b)("a",Object(a.a)({parentName:"li"},{href:"#right-to-exit-for-users"}),"Right to exit for users")))),Object(n.b)("li",{parentName:"ul"},Object(n.b)("a",Object(a.a)({parentName:"li"},{href:"#why-from-a-developers--ethereum-enthusiasts-perspective"}),"Why (from a developer's / Ethereum enthusiast's perspective)?"),Object(n.b)("ul",{parentName:"li"},Object(n.b)("li",{parentName:"ul"},Object(n.b)("a",Object(a.a)({parentName:"li"},{href:"#proof-of-decentralization"}),"Proof of decentralization")),Object(n.b)("li",{parentName:"ul"},Object(n.b)("a",Object(a.a)({parentName:"li"},{href:"#no-platform-risk"}),"No platform risk")))),Object(n.b)("li",{parentName:"ul"},Object(n.b)("a",Object(a.a)({parentName:"li"},{href:"#why-react-native"}),"Why React Native?"))),Object(n.b)("h2",{id:"why-from-the-users-perspective"},"Why (from the user's perspective)?"),Object(n.b)("p",null,"Today, using a dapp from a phone is painful. Almost no dapps have standalone mobile apps, and you're not easily able to use the dapp without ETH/tokens or with the ETH/tokens you have in another wallet. We lose mainstream people from the onboarding funnel because of this. Some dapps can be used inside a single app like Coinbase Wallet or Status that serves as a dapp browser, but this feels like a terribly broken UX for anyone who has been using a mobile phone for a while, and it also feels like broken UX for people who are used to using web-based dapps with MetaMask (where the wallet mostly stays out of the way until you need it). The ideal UX would be installing each mobile dapp in a way that feels the same as installing any mobile app, and giving it permission to take actions during onboarding with the costs subsidized by others or with your ETH/tokens held in a separate wallet."),Object(n.b)("p",null,"The idea is that Tasit would be used by many different mobile apps on a user's device. Once Tasit is around, more dapps will have dedicated mobile apps. This will remove a key barrier to mainstream adoption of Ethereum dapps."),Object(n.b)("h3",{id:"right-to-exit-for-users"},"Right to exit for users"),Object(n.b)("p",null,"A single company's financial incentives determining how a software product works is a bummer for users. See Facebook's newsfeed changing to clickbait, or see Twitter users clamoring for simple changes to the product like spambot or harassment detection to no avail."),Object(n.b)("h2",{id:"why-from-a-developers--ethereum-enthusiasts-perspective"},"Why (from a developer's / Ethereum enthusiast's perspective)?"),Object(n.b)("p",null,"The user-facing answer for \"Why?\" focused on the UX/product, since that's the main thing that mainstream users care about. Here we'll touch on more technical/ideological arguments for why it's important that the Ethereum community creates more mobile dapps."),Object(n.b)("p",null,'One major reason most dapps don\u2019t have standalone mobile apps today is because it\u2019s hard for developers to build mobile Ethereum dapps. There isn\u2019t much good tooling for it. This SDK provides that tooling so that developers can focus on the "business logic" for their dapp.'),Object(n.b)("p",null,"Developers shouldn't need to reinvent the wheel for each new dapp: account and private key generation, linking to another wallet or adding meta-transaction support, etc. Let Tasit handle those parts for you."),Object(n.b)("p",null,"There's no reason building an Ethereum dapp should feel much different for the front-end developer than building an app using Firebase as the back end - with Tasit, that's the case."),Object(n.b)("p",null,"If you want to see the Ethereum ecosystem grow, mobile is critical for making that happen, because that's where all the users are."),Object(n.b)("h3",{id:"proof-of-decentralization"},"Proof of decentralization"),Object(n.b)("p",null,'Tasit will serve as "proof of decentralization" for the dapps we support. Vitalik Buterin once tweeted \'One simple litmus test for whether or not a blockchain project is truly decentralized: can a third party independently make a client for it, and do everything that the "official" client can?\'. We agree. It\'s time for major decoupling of "back end" and front end.'),Object(n.b)("h3",{id:"no-platform-risk"},"No platform risk"),Object(n.b)("p",null,'What\'s unique about the Ethereum ecosystem is that making a 3rd-party client is fully permissionless and interoperable, which means there\'s no risk that the developers of a smart contract can suddenly "throttle" users of their "API" in the way that would have been possible in web 2.0.'),Object(n.b)("h2",{id:"why-react-native"},"Why React Native?"),Object(n.b)("p",null,"The web-based front ends for most dapps these days are written with React, so using React Native for the native mobile version is a natural fit."),Object(n.b)("p",null,"It's a common misconception that React Native is good for prototyping but not production - this isn't true! It's out of scope for this README to go into that, but we'd recommend doing some research to decide for yourself (setting aside any preconceived notions you may have first)."),Object(n.b)("p",null,"Most younger developers building interesting new mobile apps these days use React Native (and often Expo) to automatically support both iOS and Android, but there is little-to-no tooling for Ethereum in the React Native ecosystem."),Object(n.b)("hr",null),Object(n.b)("p",null,Object(n.b)("a",Object(a.a)({parentName:"p"},{href:"/docs/introduction"}),"Go back")," to the home page of the docs."))}p.isMDXComponent=!0}}]);