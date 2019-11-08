(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{104:function(e,t,o){"use strict";o.r(t),o.d(t,"frontMatter",(function(){return r})),o.d(t,"rightToc",(function(){return i})),o.d(t,"default",(function(){return h}));o(0);var a=o(110);function n(){return(n=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var o=arguments[t];for(var a in o)Object.prototype.hasOwnProperty.call(o,a)&&(e[a]=o[a])}return e}).apply(this,arguments)}const r={id:"why",title:"Why",sidebar_label:"Why"},i=[{value:"Why?",id:"why",children:[]}],s={rightToc:i},l="wrapper";function h({components:e,...t}){return Object(a.b)(l,n({},s,t,{components:e,mdxType:"MDXLayout"}),Object(a.b)("h3",{id:"why"},"Why?"),Object(a.b)("h4",{id:"why-from-the-users-perspective"},"Why (from the user's perspective)?"),Object(a.b)("p",null,"Today, using a dapp from a phone is painful. Almost no dapps have standalone mobile apps, and you're not easily able to use the dapp without ETH/tokens or with the ETH/tokens you have in another wallet. We lose mainstream people from the onboarding funnel because of this. Some dapps can be used inside a single app like Coinbase Wallet or Status that serves as a dapp browser, but this feels like a terribly broken UX for anyone who has been using a mobile phone for a while, and it also feels like broken UX for people who are used to using web-based dapps with MetaMask (where the wallet mostly stays out of the way until you need it). The ideal UX would be installing each mobile dapp in a way that feels the same as installing any mobile app, and giving it permission to take actions during onboarding with the costs subsidized by others or with your ETH/tokens held in a separate wallet."),Object(a.b)("p",null,"The idea is that the Tasit SDK would be used by many different mobile apps on a user's device. Once the Tasit SDK is around, more dapps will have dedicated mobile apps. This will remove a key barrier to mainstream adoption of Ethereum dapps."),Object(a.b)("h5",{id:"right-to-exit-for-users"},"Right to exit for users"),Object(a.b)("p",null,"A single company's financial incentives determining how a software product works is a bummer for users. See Facebook's newsfeed changing to clickbait, or see Twitter users clamoring for simple changes to the product like spambot or harassment detection to no avail."),Object(a.b)("h4",{id:"why-from-a-developers--ethereum-enthusiasts-perspective"},"Why (from a developer's / Ethereum enthusiast's perspective)?"),Object(a.b)("p",null,"The user-facing answer for \"Why?\" focused on the UX/product, since that's the main thing that mainstream users care about. Here we'll touch on more technical/ideological arguments for why it's important that the Ethereum community creates more mobile dapps."),Object(a.b)("p",null,'One major reason most dapps don\u2019t have standalone mobile apps today is because it\u2019s hard for developers to build mobile Ethereum dapps. There isn\u2019t much good tooling for it. This SDK provides that tooling so that developers can focus on the "business logic" for their dapp.'),Object(a.b)("p",null,"Developers shouldn't need to reinvent the wheel for each new dapp: account and private key generation, linking to another wallet or adding meta-transaction support, etc. Let the Tasit SDK handle those parts for you."),Object(a.b)("p",null,"There's no reason building an Ethereum dapp should feel much different for the front-end developer than building an app using Firebase as the back end - with the Tasit SDK, that's the case."),Object(a.b)("p",null,"If you want to see the Ethereum ecosystem grow, mobile is critical for making that happen, because that's where all the users are."),Object(a.b)("h5",{id:"proof-of-decentralization"},"Proof of decentralization"),Object(a.b)("p",null,'Tasit will serve as "proof of decentralization" for the dapps we support. Vitalik Buterin once tweeted \'One simple litmus test for whether or not a blockchain project is truly decentralized: can a third party independently make a client for it, and do everything that the "official" client can?\'. We agree. It\'s time for major decoupling of "back end" and front end.'),Object(a.b)("h5",{id:"no-platform-risk"},"No platform risk"),Object(a.b)("p",null,'What\'s unique about the Ethereum ecosystem is that making a 3rd-party client is fully permissionless and interoperable, which means there\'s no risk that the developers of a smart contract can suddenly "throttle" users of their "API" in the way that would have been possible in web 2.0.'),Object(a.b)("h4",{id:"why-react-native"},"Why React Native?"),Object(a.b)("p",null,"The web-based front ends for most dapps these days are written with React, so using React Native for the native mobile version is a natural fit."),Object(a.b)("p",null,"It's a common misconception that React Native is good for prototyping but not production - this isn't true! It's out of scope for this README to go into that, but we'd recommend doing some research to decide for yourself (setting aside any preconceived notions you may have first)."),Object(a.b)("p",null,"Most younger developers building interesting new mobile apps these days use React Native (and often Expo) to automatically support both iOS and Android, but there is little-to-no tooling for Ethereum in the React Native ecosystem."),Object(a.b)("hr",null),Object(a.b)("p",null,Object(a.b)("a",n({parentName:"p"},{href:"/docs/home"}),"Go back to the home page of the docs")))}h.isMDXComponent=!0},110:function(e,t,o){"use strict";o.d(t,"a",(function(){return s})),o.d(t,"b",(function(){return c}));var a=o(0),n=o.n(a),r=n.a.createContext({}),i=function(e){var t=n.a.useContext(r),o=t;return e&&(o="function"==typeof e?e(t):Object.assign({},t,e)),o},s=function(e){var t=i(e.components);return n.a.createElement(r.Provider,{value:t},e.children)};var l="mdxType",h={inlineCode:"code",wrapper:function(e){var t=e.children;return n.a.createElement(n.a.Fragment,{},t)}},p=Object(a.forwardRef)((function(e,t){var o=e.components,a=e.mdxType,r=e.originalType,s=e.parentName,l=function(e,t){var o={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&-1===t.indexOf(a)&&(o[a]=e[a]);return o}(e,["components","mdxType","originalType","parentName"]),p=i(o),c=a,u=p[s+"."+c]||p[c]||h[c]||r;return o?n.a.createElement(u,Object.assign({},{ref:t},l,{components:o})):n.a.createElement(u,Object.assign({},{ref:t},l))}));function c(e,t){var o=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var r=o.length,i=new Array(r);i[0]=p;var s={};for(var h in t)hasOwnProperty.call(t,h)&&(s[h]=t[h]);s.originalType=e,s[l]="string"==typeof e?e:a,i[1]=s;for(var c=2;c<r;c++)i[c]=o[c];return n.a.createElement.apply(null,i)}return n.a.createElement.apply(null,o)}p.displayName="MDXCreateElement"}}]);