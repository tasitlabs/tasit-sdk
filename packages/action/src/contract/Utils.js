export class Utils {
  static isAddress = address => {
    return typeof address === "string" && address.match(/^0x[0-9A-Fa-f]{40}$/);
  };

  static isABI = abi => {
    return abi && Array.isArray(abi);
  };

  // https://github.com/ethers-io/ethers.js/blob/db383a3121bb8cf5c80c5488e853101d8c1df353/src.ts/utils/properties.ts#L20
  static isEthersJsSigner = signer => {
    return signer && signer._ethersType === "Signer";
  };
}

export default Utils;
