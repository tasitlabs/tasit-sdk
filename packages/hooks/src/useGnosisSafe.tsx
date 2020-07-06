import { useEffect, useState } from "react";

import ContractBasedAccount from "@tasit/contract-based-account"
const { Deploy } = ContractBasedAccount;

const { create } = Deploy;

type GnosisSafeCreationData = {
  gnosisSafeAddress: string;
  gnosisSafeCreationError: boolean;
};

// Note: In the case where from local state you know
// Gnosis Safe has already been created for the user,
// don't bother rendering a component which uses this hook
// TODO: Pass in saltNonce so the user can use this again with the same settings
// TODO: Think about whether we want a hook to be async
export async function useGnosisSafe(
  owners: string[],
  threshold: number,
  randomBytes: Uint8Array
): Promise<GnosisSafeCreationData> {
  console.log("useGnosisSafe called");
  // For this hook, it "wants" to let the component using the hook decide
  // how to manage state (local state, redux, Apollo's internal redux, etc.)

  // let gnosisSafeCreated = false;
  // let gnosisSafeAddress = "";
  // let gnosisSafeCreationError = false;
  // const [gnosisSafeCreated, setGnosisSafeCreated] = useState(false);
  const [gnosisSafeAddress, setGnosisSafeAddress] = useState("");
  const [gnosisSafeCreationError, setGnosisSafeCreationError] = useState(false);

  useEffect(() => {
    console.log("useEffect called");
    // When component mounts, if you haven't already created a Safe, create one

    function createSync(owners: string[], threshold: number, randomBytes: Uint8Array): void {
      (async () => {
        try {
          const address = await create(owners, threshold, randomBytes);
          // gnosisSafeCreated = true;
          // setGnosisSafeCreated(true);
          // gnosisSafeAddress = address;
          setGnosisSafeAddress(address);
        } catch (error) {
          // gnosisSafeCreationError = true;
          setGnosisSafeCreationError(true);
        }
      })();
    }

    // TODO: Consider alternate ways to achieve this same goal
    if (gnosisSafeAddress === "") {
      createSync(owners, threshold, randomBytes);
    }
    return () => {
      // Can't cancel REST API request, so nothing to clean up
    };
  }, [owners, threshold, randomBytes]); // Only deploy Gnosis Safe with new params;

  return { gnosisSafeAddress, gnosisSafeCreationError };
}