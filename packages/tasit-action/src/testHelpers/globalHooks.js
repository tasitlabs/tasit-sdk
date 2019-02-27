import { ethers } from "ethers";

// Global hooks
const provider = new ethers.providers.JsonRpcProvider();
provider.pollingInterval = 50;
global.provider = provider;
let testcaseSnaphotId;

//before("", () => {});

beforeEach("", async () => {
  testcaseSnaphotId = await createSnapshot(provider);
});

afterEach("", async () => {
  await revertFromSnapshot(provider, testcaseSnaphotId);

  // Note: Without this the test suite is breaking.
  // It is still unclear why
  await mineBlocks(provider, 1);
});
