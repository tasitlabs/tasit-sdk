import axios from "axios";

// TODO: Move base URL into an env var
// const BASE_URL = "https://safe-relay.rinkeby.gnosis.io/"; // Rinkeby
const BASE_URL = "https://safe-relay.staging.gnosisdev.com/api"; // Mainnet staging

const api = axios.create({
  baseURL: BASE_URL,
});

const API_VERSION = "v3";

async function generateRandomBytes(randomBytes: Uint8Array): Promise<number> {
  const byteCount = randomBytes.length

  let randomIntAggregator = 0;

  for (let index = 0; index < byteCount; index++) {
    randomIntAggregator +=
      randomBytes[byteCount - index - 1] * Math.pow(256, index);
  }

  return randomIntAggregator;
}

// Using relay service:
export async function create(owners: string[], threshold: number, randomBytes: Uint8Array): Promise<string> {
  try {
    // API parameters:
    // saltNonce*	integer
    //   title: Salt nonce
    //   maximum: 1.157920892373162e+77
    //   minimum: 0
    // owners*	[
    //   minItems: 1
    //   string]
    // threshold*	integer
    //   title: Threshold
    //   minimum: 1
    // paymentToken	string
    //   title: Payment token
    //   x-nullable: true

    const randomInt = await generateRandomBytes(randomBytes);
    console.log({ randomInt });

    const response = await api.post(`/${API_VERSION}/safes/`, {
      threshold: threshold,
      owners: owners,
      saltNonce: randomInt,
    });

    console.log({ response });

    const { data, status } = response;
    console.log({ data });
    console.log({ status });

    const { safe: safeAddress } = data;
    return safeAddress;

    // ---
    // Success looks like this:
    //   { data:
    //     { safe: '0x451b472FB14b3cDDdA496c15E7407291F73321Cb',
    //       masterCopy: '0xb6029EA3B2c51D09a50B53CA8012FeEB05bDa35A',
    //       proxyFactory: '0x12302fE9c02ff50939BaAaaf415fc226C078613C',
    //       paymentToken: '0x0000000000000000000000000000000000000000',
    //       payment: '804223680257764',
    //       paymentReceiver: '0x0000000000000000000000000000000000000000',
    //       setupData:
    //        '0xa97ab18a00000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002db6feac81ee4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000009b1c8920659cd7db3dee1ae55ec1dc7d0e500c9600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    //       gasEstimated: '257764',
    //       gasPriceEstimated: '3120000001' } }
    //  { status: 201 }
    // ---
  } catch (error) {
    // console.error({ error });

    console.log("Error");
    console.log(error.response.data);
    throw error;
  }
}

// TODO: Use the PUT operation to let the polling process
// on the Gnosis back end know that the wallet is funded,
// but only use that once we have set up a way for the Safe address to be
// funded

// async function getFundingStatus(safeAddress: string): Promise<void> {
//   try {
//     const response = await api.get(
//       `/${API_VERSION}/safes/${safeAddress}/funded`
//     );
//     const { data, status } = response;
//     console.log({ data });
//     console.log({ status });
//     return;
//   } catch (error) {
//     console.log("Error");
//     // console.error({ error });
//     console.log(error.response.data);
//   }
// }