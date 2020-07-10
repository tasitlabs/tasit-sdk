// Helpers
// import { createSnapshot, revertFromSnapshot, mineBlocks } from "@tasit/test-helpers";
// import ProviderFactory from "./src/ProviderFactory";
import TasitProviderHelpers from "@tasit/provider-helpers";
const { ConfigLoader } = TasitProviderHelpers;
import config from "./src/config/default";
ConfigLoader.setConfig(config);

// Global hooks
// const provider = ProviderFactory.getProvider();
// let snapshotId;

// beforeEach(async () => {
//   snapshotId = await createSnapshot(provider);
//   console.log({ snapshotId })

//   // while (snapshotId > 1) {
//   //   await revertFromSnapshot(provider, snapshotId--);
//   // }
//   // await revertFromSnapshot(provider, 1);
//   // snapshotId = await createSnapshot(provider);

//   // expect(snapshotId).toEqual(1);
// });

// afterEach(async () => {
//   // expect(snapshotId).toEqual(1);
//   await revertFromSnapshot(provider, snapshotId);

//   // Note: Without this the test suite is breaking.
//   // It is still unclear why
//   await mineBlocks(provider, 1);
// });
