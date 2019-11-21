export class Utils {
  static isAddress = (address: string | null | undefined) => {
    return typeof address === "string" && address.match(/^0x[0-9A-Fa-f]{40}$/);
  };

  static isABI = (abi: any) => {
    return abi && Array.isArray(abi);
  };

  // https://github.com/ethers-io/ethers.js/blob/db383a3121bb8cf5c80c5488e853101d8c1df353/src.ts/utils/properties.ts#L20
  static isEthersJsSigner = (signer: { _ethersType: string }) => {
    return signer && signer._ethersType === "Signer";
  };
}

export default Utils;
