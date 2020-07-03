(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{146:function(e,t,a){"use strict";a.r(t),a.d(t,"frontMatter",(function(){return i})),a.d(t,"metadata",(function(){return c})),a.d(t,"rightToc",(function(){return s})),a.d(t,"default",(function(){return b}));var n=a(2),r=a(9),o=(a(0),a(157)),i={},c={id:"Action",isDocsHomePage:!1,title:"Action",description:"Reading and writing data and reacting to events",source:"@site/docs/Action.md",permalink:"/docs/Action",editUrl:"https://github.com/tasitlabs/tasit-sdk/tree/develop/packages/docs/docs/Action.md"},s=[{value:"Table of Contents",id:"table-of-contents",children:[]},{value:"Getting data",id:"getting-data",children:[]},{value:"Setting data",id:"setting-data",children:[]},{value:"Listening for events",id:"listening-for-events",children:[]},{value:"Topics for the future",id:"topics-for-the-future",children:[]},{value:"Notes",id:"notes",children:[]}],l={rightToc:s};function b(e){var t=e.components,a=Object(r.a)(e,["components"]);return Object(o.b)("wrapper",Object(n.a)({},l,a,{components:t,mdxType:"MDXLayout"}),Object(o.b)("h1",{id:"reading-and-writing-data-and-reacting-to-events"},"Reading and writing data and reacting to events"),Object(o.b)("p",null,"This explains how one can use Tasit to interact with smart contracts at different levels of abstraction."),Object(o.b)("p",null,Object(o.b)("em",{parentName:"p"},"Note:"),' This functionality all "lives" in ',Object(o.b)("inlineCode",{parentName:"p"},"@tasit/action"),", a child package of ",Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"https://github.com/tasitlabs/tasit-sdk"}),Object(o.b)("inlineCode",{parentName:"a"},"tasit"))," that is also published to npm as a standalone module using ",Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"https://lerna.js.org/"}),"lerna"),"."),Object(o.b)("p",null,Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"https://docs.tasit.io/docs/project-layout"}),"For context, here is an overview")," of how this fits in with the rest of Tasit."),Object(o.b)("p",null,"Why ",Object(o.b)("inlineCode",{parentName:"p"},"@tasit/action"),"? ",Object(o.b)("strong",{parentName:"p"},"action:")," ","[ak-sh\u0259n]",', noun. "a thing done". It\'s also nice that "act" (the verb form) is part of the words ',Object(o.b)("em",{parentName:"p"},"contract")," and ",Object(o.b)("em",{parentName:"p"},"abstraction")," and ",Object(o.b)("em",{parentName:"p"},"transaction"),'. Finally, directors say \u201caction\u201d before starting to film a scene in a movie. Also, since this package supports meta-transactions, it\'s not quite correct to call them transactions. "action" is our catch-all word for transactions and meta-transactions.'),Object(o.b)("h3",{id:"table-of-contents"},"Table of Contents"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"#getting-data"}),"Getting data"))),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"#setting-data"}),"Setting data"))),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"#listening-for-events"}),"Listening for events"))),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"#topics-for-the-future"}),"Topics for the future"))),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"#notes"}),"Notes")))),Object(o.b)("h1",{id:"docs"},"Docs"),Object(o.b)("h3",{id:"getting-data"},"Getting data"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"#getting-data---decentraland"}),"Decentraland"))),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"#getting-data---erc721"}),"ERC721"))),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"#getting-data---low-level-tasit-sdk-middleware"}),"Low-level Tasit middleware"))),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"#getting-data---contract-api-from-ethers"}),"Contract API from ethers")))),Object(o.b)("h5",{id:"getting-data---decentraland"},"Getting data - Decentraland"),Object(o.b)("p",null,"Let's start at the highest level of abstraction possible, where we can construct our ideal API for the end user assuming we know the SDK is being used specifically for the Decentraland contracts."),Object(o.b)("p",null,"I think at this level of abstraction, we don't use ERC165 interface detection like we do at lower levels (see below). But actually, using it at all warrants more thought, depending on whether we're assuming the user knows the full contract ABI or not (and depending on whether ethers assumes that.)"),Object(o.b)("p",null,"We just know the ABI for the open source contracts for that exact project and assume the presence of these functions. The developer can still use the lower-level APIs to confirm, though."),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),"import { Decentraland } from @tasit/action\n// We already know what would have normally been the params here\n// (contractABI, address, etc.)\nconst decentraland = new Decentraland()\n")),Object(o.b)("p",null,"Low-level functions still work"),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),"const balance = await decentraland.balanceOf(owner);\n")),Object(o.b)("p",null,"Optional: Expose higher-level functions that are specific to this dapp"),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),"// This is not necessarily the name of the function in the contracts\n// but whatever we think would be simplest for the developer using this\nconst [x, y] = await decentraland.getLandCoordinates(landId);\n")),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),"// Decentraland has some land owned by estates which are owned by users\n// and some land owned directly by users\n// You might want to get all the land a user owns even if they have it\n// inside an estate. Now we're getting past the standard ERC721 functionality\n// and supporting features specific to Decentraland\n\nconst landIds = await decentraland.getAllLandIdsIncludingEstates(userId);\n")),Object(o.b)("p",null,"All of this could be done with a little more work using just the ERC721 abstraction below, though. Under the hood it uses ",Object(o.b)("inlineCode",{parentName:"p"},"tokenOfOwnerByIndex")," from ERC721Enumerable, for instance."),Object(o.b)("p",null,"Open questions:"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},"Whether the address should be configurable at this level of abstraction. For instance, the developer using this SDK might know sooner than Tasit project core devs do that a non-upgradeable contract project (that is, a standard smart contract project - not a delegatecall + proxy project) is deploying new contracts and will be using a new interface address from now on."),Object(o.b)("li",{parentName:"ul"},"Whether the ABI should be in version control in this package or whether we want to add functionality for getting it from the web, using Etherscan's API or hopefully a decentralized npm where teams publish generated files like ABIs down the road.")),Object(o.b)("h5",{id:"getting-data---erc721"},"Getting data - ERC721"),Object(o.b)("p",null,"Let's now consider a slightly lower level of abstraction, where we can construct our ideal API for the end user assuming we know the SDK is being used specifically for an ERC721 (NFT) contract, but not which one until the user instantiates the contract using the SDK."),Object(o.b)("p",null,"There's functionality for determining what ERC721 features it supports beyond the basic, required ones using ERC165 interface detection."),Object(o.b)("p",null,"Moreso than for an unknown contract with the lower-level ",Object(o.b)("inlineCode",{parentName:"p"},"@tasit/action")," API, using ERC165 here is justified because it's a first-class feature for extensions of ERC721 in ",Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"https://github.com/OpenZeppelin/openzeppelin-solidity/blob/5caecf548c04c97955b8f0487ceb804fab0e2ca1/contracts/token/ERC721/ERC721Metadata.sol#L5"}),"OpenZeppelin"),"."),Object(o.b)("p",null,"But maybe there doesn't need to be if we decide the contract ABI will be present for sure. This is an ",Object(o.b)("em",{parentName:"p"},"open question")," for now."),Object(o.b)("p",null,"Anyway, here's how to instantiate the contract:"),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),"// TODO: Decide if we can instantiate this with more or less params\nconst nft = new NFT(address, contractABI);\n// or\nconst nft = new NFT(address); // with an assumed ABI\n")),Object(o.b)("p",null,Object(o.b)("inlineCode",{parentName:"p"},"detectInterfaces()")," returns an object of ERC721-related interfaces this ERC721 contract supports (since there is a basic ERC721 interface but also some more fully-featured extensions)."),Object(o.b)("p",null,"Internally it calls the lower level ",Object(o.b)("inlineCode",{parentName:"p"},"contract.usesSupportsInterface()")," first to see if checking for specific interfaces is even worthwhile."),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),"const { supportsMetadata } = await nft.detectInterfaces();\nif (supportsMetadata) {\n  const metadata = await nft.getMetadata();\n  const { tokenURI } = metadata; // metadata also contains name and symbol\n}\n")),Object(o.b)("p",null,"Alternatively, because tokenURI is just an ",Object(o.b)("inlineCode",{parentName:"p"},"external")," or ",Object(o.b)("inlineCode",{parentName:"p"},"public")," ",Object(o.b)("inlineCode",{parentName:"p"},"view"),' function you can get it directly using the underlying "call a contract method" approach you\'ll see used exclusively below in the lower-level ',Object(o.b)("inlineCode",{parentName:"p"},"@tasit/action")," library with no prior knowledge about contract type."),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),"const tokenURI = await nft.tokenURI(tokenId);\n")),Object(o.b)("p",null,"Fetching additional metadata from the tokenURI is obviously something we need to support. It doesn't feel like it makes sense to have a function for doing this as a ",Object(o.b)("inlineCode",{parentName:"p"},"nft.xyz(...)")," method, though."),Object(o.b)("p",null,"Fetching images from additional URIs linked to in the JSON blob available at the main tokenURI will also be a common use case in the app."),Object(o.b)("h5",{id:"getting-data---low-level-tasit-middleware"},"Getting data - Low-level Tasit middleware"),Object(o.b)("p",null,"A low-level library for calling all of the functions on a given smart contract and listening to events from the smart contract."),Object(o.b)("p",null,"To make this example comparable with the ERC721 example above, let's say the contract happens to be of the same type, ERC721."),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),"// TODO: Finalize way to instantiate contract.\n// Maybe just the same as ethers?\nconst contract = new contract(address, contractABI);\n\nconst balance = await contract.balanceOf(owner);\nconst owner = await contract.ownerOf(tokenId);\n")),Object(o.b)("p",null,"Checks whether the contract will let you look up other interfaces it implements using ERC165"),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),"// supportsInterface is a bool\nconst supportsInterface = await contract.usesSupportsInterface();\n")),Object(o.b)("p",null,"Let's use ERC165 to see if this contract uses the ERC721Metadata extension. Remember, this will be a longer shot because we're just using ",Object(o.b)("inlineCode",{parentName:"p"},"@tasit/action"),', not the ERC721 abstraction that already "knows" ERC165 is popular for ERC721s. Unlike above where we did ',Object(o.b)("inlineCode",{parentName:"p"},"nft.detectInterfaces()"),", we don't know the hashes of the interfaces to check for without the prior knowledge of what type of contract this is. So we'll need to check for ERC721Metadata using its hash as an argument."),Object(o.b)("p",null,"If we decide the user of the SDK has to have the full ABI at this point, maybe this feature is less useful."),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),"// TODO: Add the proper type conversion, etc.\n// Note: This is straight from Solidity - the string as it is probably isn't right.\nconst INTERFACE_ID_ERC721_METADATA = \"0x5b5e139f\";\n\n// 0x5b5e139f ===\n// bytes4(keccak256('name()')) ^\n// bytes4(keccak256('symbol()')) ^\n// bytes4(keccak256('tokenURI(uint256)'))\n//\n\n// returns a bool\nconst supportsMetadata = await contract.supportsInterface(\n  INTERFACE_ID_ERC721_METADATA\n);\n\nif (supportsMetadata) {\n  const tokenURI = await contract.tokenURI(tokenId);\n}\n")),Object(o.b)("p",null,Object(o.b)("em",{parentName:"p"},"Ideas for getting clever with ABIs at this level of abstraction:")),Object(o.b)("p",null,"Find all ",Object(o.b)("inlineCode",{parentName:"p"},"view")," (",Object(o.b)("inlineCode",{parentName:"p"},"external")," or ",Object(o.b)("inlineCode",{parentName:"p"},"public"),") functions. Assume they're the interesting ones for looking up state."),Object(o.b)("p",null,Object(o.b)("inlineCode",{parentName:"p"},"const data = await contract.getAllData()")),Object(o.b)("p",null,Object(o.b)("inlineCode",{parentName:"p"},"getAllData()")," does all data-fetching it can in a single call based on what we know from the ABI or from ERC165."),Object(o.b)("p",null,"Possibly even infer from param types what they might do, but that's a lot harder."),Object(o.b)("h5",{id:"getting-data---contract-api-from-ethers"},"Getting data - Contract API from ethers"),Object(o.b)("p",null,"Let's re-read the ",Object(o.b)("inlineCode",{parentName:"p"},"@tasit/action")," section above when it is finalized and see how much it differs from the ",Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"https://docs.ethers.io/ethers.js/html/api-contract.html#connecting-to-existing-contracts"}),"ethers abstraction for connecting to contracts"),"."),Object(o.b)("p",null,"We'll want to do the same for setting data and listening for events too. As long as there's any abstraction we want on top of the ethers contract functions, ",Object(o.b)("inlineCode",{parentName:"p"},"@tasit/action")," support for contracts of unknown type seems justified. Setting data / creating transactions is very likely to diverge from the ethers library."),Object(o.b)("h3",{id:"setting-data"},"Setting data"),Object(o.b)("p",null,"Setting data could possibly be non-async if it's like publishing in pubsub. There's additional info on this in the ",Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"#notes"}),"notes")," section at the beginning."),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"#setting-data---low-level-tasit-sdk-middleware"}),"Low-level Tasit middleware"))),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"#setting-data---contract-api-from-ethers"}),"Contract API from ethers"))),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"#setting-data---decentraland"}),"Decentraland"))),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"#setting-data---erc721"}),"ERC721")))),Object(o.b)("h5",{id:"setting-data---low-level-tasit-middleware"},"Setting data - Low-level Tasit middleware"),Object(o.b)("p",null,"When using the contract abstraction from ethers, the functions for setting data return a transaction hash."),Object(o.b)("p",null,"That's too blockchain-y for the target audience. The API is being informed too much by the underlying implementation as opposed to the most understandable abstraction. The ",Object(o.b)("inlineCode",{parentName:"p"},"@tasit/action")," API for setting data should be indistinguishable from using pubsub on a non-blockchain architecture."),Object(o.b)("p",null,'So the "set" should return something that lets the user subscribe for the 1st or 7th or nth confirmation of the result, but it shouldn\'t be a tx hash.'),Object(o.b)("p",null,"Here's one option for how it could work:"),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),'const action = contract.transferFrom(from, to, tokenId);\n\nconst handlerFunction = message => {\n  // message.data = Contents of the message.\n  const { data } = message;\n  const { confirmations } = data;\n  if (confirmations === 7) {\n    // do something\n    action.unsubscribe();\n  }\n};\n\naction.on("confirmation", handlerFunction);\n')),Object(o.b)("p",null,"You could even imagine pre-attaching a listener with a handlerFunction by default for a few pubsub topics that the user of the SDK is likely to want."),Object(o.b)("p",null,"Since remembering to remove the listener is a little clunky, we could also include a variant that unsubscribes after the first message for that topic. This is a pretty common pattern."),Object(o.b)("p",null,Object(o.b)("inlineCode",{parentName:"p"},'contract.once("enoughConfirmations", handlerFunction)')),Object(o.b)("p",null,"For more customization of how this works, during or before sending the transaction the user of the SDK could pick which types of events they want to be subscribed to."),Object(o.b)("h5",{id:"setting-data---contract-api-from-ethers"},"Setting data - Contract API from ethers"),Object(o.b)("p",null,"Setting data on a contract returns a tx hash. In the example in the ethers docs, the next step is to ",Object(o.b)("inlineCode",{parentName:"p"},"await")," to see that the transaction has been confirmed."),Object(o.b)("p",null,Object(o.b)("inlineCode",{parentName:"p"},"@tasit/action"),' has more of a "optimistic updates" but "be sure to handle error cases" philosophy. Of course that could be achieved with the lower-level ethers API too, but the ',Object(o.b)("inlineCode",{parentName:"p"},"@tasit/action")," abstraction gently guides the user towards that approach in a more opinionated fashion."),Object(o.b)("h5",{id:"setting-data---decentraland"},"Setting data - Decentraland"),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),"// TODO: Add me\n// But this far down in in the docs, you can probably\n// extrapolate how this would work from the rest\n")),Object(o.b)("h5",{id:"setting-data---erc721"},"Setting data - ERC721"),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),"// TODO: Add me\n// But this far down in in the docs, you can probably\n// extrapolate how this would work from the rest\n")),Object(o.b)("h3",{id:"listening-for-events"},"Listening for events"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"#listening-for-events---low-level-tasit-sdk-middleware"}),"Low-level Tasit middleware"))),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"#listening-for-events---erc721"}),"ERC721"))),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"#listening-for-events---decentraland"}),"Decentraland"))),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"#listening-for-events---contract-api-from-ethers"}),"Contract API from ethers")))),Object(o.b)("h5",{id:"listening-for-events---low-level-tasit-middleware"},"Listening for events - Low-level Tasit middleware"),Object(o.b)("p",null,"Listening for events has a similar subcriptions API to the one you use after creating a transaction (see above)."),Object(o.b)("p",null,'But unlike for "set" operations, the subscription isn\'t created implicitly.'),Object(o.b)("p",null,"Here, it is initiated explicitly with a subscribe function."),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),'contract.on("ExampleEvent", handlerFunction);\n')),Object(o.b)("h5",{id:"listening-for-events---erc721"},"Listening for events - ERC721"),Object(o.b)("p",null,"Note: The ERC721 level of abstraction for listening for events would already know what events to listen for and let you subscribe to them like so:"),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),'// Subscriptions is an object where the keys are the event names from ERC721\ncontract.onAll(handlerFunction);\ncontract.off("Transfer");\n')),Object(o.b)("p",null,"In this example there's an event ",Object(o.b)("inlineCode",{parentName:"p"},"Transfer")," as one of the events supported by ERC721. After unsubscribing from transfer events, you're still be subscribed to other events emitted by the contract."),Object(o.b)("h5",{id:"listening-for-events---decentraland"},"Listening for events - Decentraland"),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),"// TODO: Add me\n// But this far down in in the docs, you can probably\n// extrapolate how this would work from the rest\n")),Object(o.b)("h5",{id:"listening-for-events---contract-api-from-ethers"},"Listening for events - Contract API from ethers"),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),"// TODO: Add me\n// But this far down in in the docs, you can probably\n// extrapolate how this would work from the rest\n")),Object(o.b)("h3",{id:"topics-for-the-future"},"Topics for the future"),Object(o.b)("p",null,"Is it worth considering having upgradeable smart contracts being a first-class feature of this package? That would mean not assuming the ABI you have right now will always work. But, it could still assume that there will be a backwards compatibility guarantee and that the existing ABI functions would continue to be supported."),Object(o.b)("h3",{id:"notes"},"Notes"),Object(o.b)("p",null,"Getting data is like an HTTP(S) request, so it should be async. Because doing the JSON-RPC request to Infura and getting data back has network lag."),Object(o.b)("p",null,"Setting data could possibly be sync (non-async) if it's like publishing in pubsub with no ACK and it's instant. It could be async too if we're picturing a pubsub approach where successful publication is ACK'ed, but not instantly. Or if the ACK is instant, then we're back to sync."),Object(o.b)("p",null,'Then you subscribe for the data like it\'s pubsub as well. That would make subscribing to the "event" of 1 or 7 or 100 block confirmations for a set operation have a very similar API to the one for subscribing to events.'))}b.isMDXComponent=!0},157:function(e,t,a){"use strict";a.d(t,"a",(function(){return p})),a.d(t,"b",(function(){return h}));var n=a(0),r=a.n(n);function o(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function c(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){o(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function s(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var l=r.a.createContext({}),b=function(e){var t=r.a.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):c(c({},t),e)),a},p=function(e){var t=b(e.components);return r.a.createElement(l.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},u=r.a.forwardRef((function(e,t){var a=e.components,n=e.mdxType,o=e.originalType,i=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),p=b(a),u=n,h=p["".concat(i,".").concat(u)]||p[u]||d[u]||o;return a?r.a.createElement(h,c(c({ref:t},l),{},{components:a})):r.a.createElement(h,c({ref:t},l))}));function h(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=a.length,i=new Array(o);i[0]=u;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c.mdxType="string"==typeof e?e:n,i[1]=c;for(var l=2;l<o;l++)i[l]=a[l];return r.a.createElement.apply(null,i)}return r.a.createElement.apply(null,a)}u.displayName="MDXCreateElement"}}]);