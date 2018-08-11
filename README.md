# TasitSDK
The Tasit SDK is a standardized, open-source set of tools and components for interacting with major classes of already-on-chain dapp smart contracts

Early, popular classes of smart contracts we support include NFTs, TCRs, DAOs, and two-sided marketplaces. The tools for each class of smart contract include:

* Middleware for reading from and writing to smart contracts via an expressive JavaScript library with function names tailored to that type of dapp
* Styled-but-customizable React components for using each feature of the dapp, leveraging the js middleware

The Tasit SDK also provides a standalone tool for discovering the current address of a high-profile dapp project’s primary smart contract interface.

We support Ethereum-based dapps to start, and in the long run the Tasit SDK will work with any blockchain that uses EVM and/or eWASM. In the case of Ethereum, we detect the interface / ERC standard a smart contract implements using ERC-165 standard interface detection whenever possible. As long as we’ve built the tooling to interact with that class of dapp at least once before, the Tasit SDK can “automagically” support any new dapp of that type. We'll (obviously) encourage contributions by the community.
