import { ethers } from "ethers";

// Chai
import { expect } from "chai";
global.expect = expect;

// Global hooks

const provider = new ethers.providers.JsonRpcProvider();
provider.pollingInterval = 50;