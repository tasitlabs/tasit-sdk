(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{146:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return i})),n.d(t,"metadata",(function(){return c})),n.d(t,"rightToc",(function(){return s})),n.d(t,"default",(function(){return p}));var r=n(2),a=n(9),o=(n(0),n(153)),i={id:"getting-started",title:"Getting started",sidebar_label:"Getting started"},c={id:"getting-started",title:"Getting started",description:"Getting started",source:"@site/docs/GettingStarted.md",permalink:"/docs/getting-started",editUrl:"https://github.com/tasitlabs/tasit-sdk/tree/develop/packages/docs/docs/GettingStarted.md",sidebar_label:"Getting started",sidebar:"docs",previous:{title:"Tasit SDK",permalink:"/docs/home"},next:{title:"Main features",permalink:"/docs/main-features"}},s=[{value:"Getting started",id:"getting-started",children:[]}],l={rightToc:s};function p(e){var t=e.components,n=Object(a.a)(e,["components"]);return Object(o.b)("wrapper",Object(r.a)({},l,n,{components:t,mdxType:"MDXLayout"}),Object(o.b)("h3",{id:"getting-started"},"Getting started"),Object(o.b)("p",null,"You can use the Tasit SDK to create user-friendly mobile iOS and Android apps for a dapp using React Native."),Object(o.b)("p",null,"Looking for the entry point for the ",Object(o.b)("inlineCode",{parentName:"p"},"tasit")," package? ",Object(o.b)("a",Object(r.a)({parentName:"p"},{href:"https://github.com/tasitlabs/tasit-sdk/tree/develop/packages/sdk"}),"That's here"),". The Tasit SDK is a collection of smaller packages exported as one using ",Object(o.b)("a",Object(r.a)({parentName:"p"},{href:"https://lerna.js.org/"}),"lerna"),"."),Object(o.b)("h4",{id:"installation"},"Installation"),Object(o.b)("p",null,"Getting started is as simple as running"),Object(o.b)("p",null,Object(o.b)("inlineCode",{parentName:"p"},"npm install --save tasit")),Object(o.b)("h4",{id:"usage"},"Usage"),Object(o.b)("p",null,"Are you looking to add Ethereum-related functionality to a pre-existing app using the Tasit SDK?"),Object(o.b)("p",null,"Using the Tasit SDK from within your app is simple.\nIn ",Object(o.b)("inlineCode",{parentName:"p"},"App.js")," or the appropriate React Native component, import whichever APIs you need from the Tasit SDK."),Object(o.b)("pre",null,Object(o.b)("code",Object(r.a)({parentName:"pre"},{className:"language-javascript"}),"import { Account } from \"tasit\";\nconst ephemeralWallet = Account.create();\nconsole.log(ephemeralWallet.address); // '0x...'\n// ...\n")),Object(o.b)("p",null,"Or maybe you want to interact with a contract:"),Object(o.b)("pre",null,Object(o.b)("code",Object(r.a)({parentName:"pre"},{className:"language-javascript"}),'import { Contracts } from "tasit";\n\nconst { NFT } = Contracts;\n\n// const contractAddress = \'0x0E86...333\'\n\nconst contract = new NFT(contractAddress);\n\nconst action = contract.safeTransferfrom(/*...*/);\naction.on("error", errorListener);\naction.on("enoughConfirmations", successListener);\naction.sendForFree(); // meta-tx broadcast\n\n// Do optimistic UI updates immediately, while making sure\n// to update the UI again when there are enough\n// confirmations for your use case\n// ...\n')),Object(o.b)("h4",{id:"modular"},"Modular"),Object(o.b)("p",null,"The Tasit SDK is designed with modularity in mind. Are you only planning on using the Tasit SDK for generating an ephemeral Ethereum acccount in your app? That works too!"),Object(o.b)("p",null,"You can install ",Object(o.b)("inlineCode",{parentName:"p"},"@tasit/account")," directly and keep your app's dependencies leaner."),Object(o.b)("pre",null,Object(o.b)("code",Object(r.a)({parentName:"pre"},{}),"npm install --save @tasit/account\n")),Object(o.b)("p",null,"Then the usage example from before becomes:"),Object(o.b)("pre",null,Object(o.b)("code",Object(r.a)({parentName:"pre"},{className:"language-javascript"}),'import Account from "@tasit/account";\n// ...\n')),Object(o.b)("p",null,"...with the rest of the code remaining the same."),Object(o.b)("hr",null))}p.isMDXComponent=!0},153:function(e,t,n){"use strict";n.d(t,"a",(function(){return u})),n.d(t,"b",(function(){return m}));var r=n(0),a=n.n(r);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=a.a.createContext({}),p=function(e){var t=a.a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},u=function(e){var t=p(e.components);return a.a.createElement(l.Provider,{value:t},e.children)},b={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},d=a.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,i=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),u=p(n),d=r,m=u["".concat(i,".").concat(d)]||u[d]||b[d]||o;return n?a.a.createElement(m,c(c({ref:t},l),{},{components:n})):a.a.createElement(m,c({ref:t},l))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,i=new Array(o);i[0]=d;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c.mdxType="string"==typeof e?e:r,i[1]=c;for(var l=2;l<o;l++)i[l]=n[l];return a.a.createElement.apply(null,i)}return a.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"}}]);