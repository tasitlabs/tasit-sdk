---
id: project-layout
title: Project layout
sidebar_label: Project layout
---

# Directories in the monorepo

For those familiar with Ethereum, here are some details about the scope of each of the packages in this project and what they're built with.

### sdk
This package exports the child packages below as a single export for convenience.

### account
An abstraction around [ethers.js](https://github.com/ethers-io/ethers.js) utilities for creating a new Ethereum account

### action
An abstraction around the [ethers.js](https://github.com/ethers-io/ethers.js) code for interacting with contracts on Ethereum (reading and writing)

### contract-based-account
Helpers for upgrading an external owned account on Ethereum into a contract-based account using the Gnosis Safe (or other alternatives).

### contracts
This repo tracks a few useful 3rd party contracts and exports classes for interacting with them using the `@tasit/action` API.

### docs
(These docs!)

---

[Go back](Home.md) to the home page of the docs.

See something that can be improved on this page? [Edit it here](https://github.com/tasitlabs/tasit-sdk/blob/develop/packages/docs/docs/ProjectLayout.md).