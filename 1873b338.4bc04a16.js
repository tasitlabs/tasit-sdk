(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{134:function(e,t,r){"use strict";r.r(t),r.d(t,"frontMatter",(function(){return i})),r.d(t,"metadata",(function(){return c})),r.d(t,"rightToc",(function(){return s})),r.d(t,"Highlight",(function(){return p})),r.d(t,"default",(function(){return l}));var n=r(2),o=r(9),a=(r(0),r(153)),i={id:"home",title:"Tasit",sidebar_label:"Home"},c={id:"home",title:"Tasit",description:"export const Highlight = ({children, color}) => (",source:"@site/docs/Home.md",permalink:"/docs/home",editUrl:"https://github.com/tasitlabs/tasit-sdk/tree/develop/packages/docs/docs/Home.md",sidebar_label:"Home",sidebar:"docs",next:{title:"Getting started",permalink:"/docs/getting-started"}},s=[{value:"Introduction",id:"introduction",children:[]}],p=function(e){var t=e.children,r=e.color;return Object(a.b)("span",{style:{backgroundColor:r,borderRadius:"2px",color:"#fff",padding:"0.2rem"}},t)},b={rightToc:s,Highlight:p};function l(e){var t=e.components,r=Object(o.a)(e,["components"]);return Object(a.b)("wrapper",Object(n.a)({},b,r,{components:t,mdxType:"MDXLayout"}),Object(a.b)("div",{align:"left"},Object(a.b)("img",{src:"/img/TasitLogoSvg.svg",width:"200"})),Object(a.b)("h3",{id:"introduction"},"Introduction"),Object(a.b)(p,{color:"rgb(0, 154, 115)",mdxType:"Highlight"},"Tasit")," is a JavaScript/TypeScript SDK for making mobile Ethereum dapps using React Native.",Object(a.b)("p",null,"Development of Tasit is supported in part by the ",Object(a.b)("a",Object(n.a)({parentName:"p"},{href:"https://ecosystem.support/"}),"Ethereum Foundation")," as well as by ",Object(a.b)("a",Object(n.a)({parentName:"p"},{href:"https://gnosis.io/"}),"Gnosis")," through their ",Object(a.b)("a",Object(n.a)({parentName:"p"},{href:"https://github.com/gnosis/GECO"}),"GECO")," grant initiative."),Object(a.b)("p",null,"This project is open-source and in need of funding to sustain work on it. If you're able to contribute, please consider ",Object(a.b)("a",Object(n.a)({parentName:"p"},{href:"https://gitcoin.co/grants/183/tasit-native-mobile-ethereum-dapps"}),"supporting the project on Gitcoin Grants")," or sending ETH or DAI to the Tasit project's Aragon Agent address:"),Object(a.b)("p",null,Object(a.b)("inlineCode",{parentName:"p"},"0x7d888a9036b5a96f77b433e65b9be1b122f8a499")," (",Object(a.b)("a",Object(n.a)({parentName:"p"},{href:"https://etherscan.io/address/0x7d888a9036b5a96f77b433e65b9be1b122f8a499"}),"Etherscan"),")"),Object(a.b)("p",null,Object(a.b)("em",{parentName:"p"},"Disclaimer:")," The alpha version of this SDK is under active development. We encourage you to try it out today for hackathons, etc., but it's not ready for anything involving real funds on mainnet. If you'd prefer to wait for a more battle-tested release, please watch ",Object(a.b)("a",Object(n.a)({parentName:"p"},{href:"https://github.com/tasitlabs/tasit-sdk"}),"this repo")," with the ",Object(a.b)("inlineCode",{parentName:"p"},"Releases only")," setting and/or sign up to be notified about our releases on the ",Object(a.b)("a",Object(n.a)({parentName:"p"},{href:"https://tasit.io"}),"tasit.io")," website."),Object(a.b)("hr",null))}l.isMDXComponent=!0},153:function(e,t,r){"use strict";r.d(t,"a",(function(){return l})),r.d(t,"b",(function(){return f}));var n=r(0),o=r.n(n);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function c(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var p=o.a.createContext({}),b=function(e){var t=o.a.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):c(c({},t),e)),r},l=function(e){var t=b(e.components);return o.a.createElement(p.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},d=o.a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,a=e.originalType,i=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),l=b(r),d=n,f=l["".concat(i,".").concat(d)]||l[d]||u[d]||a;return r?o.a.createElement(f,c(c({ref:t},p),{},{components:r})):o.a.createElement(f,c({ref:t},p))}));function f(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var a=r.length,i=new Array(a);i[0]=d;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c.mdxType="string"==typeof e?e:n,i[1]=c;for(var p=2;p<a;p++)i[p]=r[p];return o.a.createElement.apply(null,i)}return o.a.createElement.apply(null,r)}d.displayName="MDXCreateElement"}}]);