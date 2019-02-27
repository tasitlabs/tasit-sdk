import Action from "tasit-action";
const { Contract } = Action;
import { ethers } from "ethers";

const { utils: ethersUtils } = ethers;
const { bigNumberify } = ethersUtils;

// 100 gwei
const GAS_PRICE = bigNumberify(`${1e11}`);

export default class GnosisSafeUtils {
  #contract;

  constructor(contract) {
    this.#contract = contract;
  }

  // Sign a hash using N signers
  // Based on: https://github.com/gnosis/safe-contracts/blob/102e632d051650b7c4b0a822123f449beaf95aed/test/utils.js#L93
  multiSign = (wallets, hash) => {
    let signatures = "0x";

    wallets.forEach(wallet => {
      const signingKey = new ethers.utils.SigningKey(wallet.privateKey);
      const sig = signingKey.signDigest(hash);
      signatures += ethers.utils.joinSignature(sig).slice(2);
    });

    return signatures;
  };

  // Based on: https://github.com/gnosis/safe-contracts/blob/102e632d051650b7c4b0a822123f449beaf95aed/test/utilsPersonalSafe.js#L30
  estimateFromSafeTxGas = async (to, value, data, operation) => {
    const provider = this.#contract._getProvider();
    const safeContractAddress = this.#contract.getAddress();

    // Encode call to the contract's estimate gas function
    const callToEstimate = this.encodeFunctionCall(
      this.#contract,
      "requiredTxGas",
      [to, value, data, operation]
    );

    // The response will be return via error message
    const estimateResponse = await provider.call({
      to: safeContractAddress,
      from: safeContractAddress,
      data: callToEstimate,
    });

    // Extract estimation from revert error message
    const estimatedGasHex = "0x" + estimateResponse.substring(138);
    let estimatedGas = bigNumberify(estimatedGasHex);

    // Extracted from Gnosis Safe test case (Why is it necessary?)
    // Add 10k else we will fail in case of nested calls
    //estimatedGas = estimatedGas.add(10000);

    return estimatedGas;
  };

  // Based on: https://github.com/gnosis/safe-contracts/blob/102e632d051650b7c4b0a822123f449beaf95aed/test/utilsPersonalSafe.js#L7
  estimateDataGas = (
    safe,
    to,
    value,
    data,
    operation,
    txGasEstimate,
    gasToken,
    refundReceiver,
    signatureCount
  ) => {
    const sigRcost = 2176;
    const sigScost = 2176;
    const sigVcost = 68;
    const eachSigCost = sigRcost + sigScost + sigVcost;
    const signatureCost = signatureCount * eachSigCost;

    const dataGas = 0;
    const gasPrice = GAS_PRICE;

    // Signatures cost will add later
    const signatures = "0x";

    const callToEstimate = this.encodeFunctionCall(
      this.#contract,
      "execTransaction",
      [
        to,
        value,
        data,
        operation,
        txGasEstimate,
        dataGas,
        gasPrice,
        gasToken,
        refundReceiver,
        signatures,
      ]
    );

    let estimatedGas =
      this.#estimateDataGasCosts(callToEstimate) + signatureCost;

    if (estimatedGas > 65536) {
      estimatedGas += 64;
    } else {
      estimatedGas += 128;
    }

    // Extracted from Gnosis Safe test case (Why is it necessary?)
    // Add aditional gas costs (e.g. base tx costs, transfer costs)
    //estimatedGas += 32000;

    return estimatedGas;
  };

  // Calculate data gas
  #estimateDataGasCosts = dataString => {
    const reducer = (accumulator, currentValue) =>
      (accumulator += this.#dataGasValue(currentValue));

    return dataString.match(/.{2}/g).reduce(reducer, 0);
  };

  // Calculate gas for each byte
  // Note: No references found
  #dataGasValue = hexValue => {
    switch (hexValue) {
      case "0x":
        return 0;
      case "00":
        return 4;
      default:
        return 68;
    }
  };

  encodeFunctionCall = (contract, functionName, args) => {
    const { getAddress, getABI, _getProvider } = contract;
    const ethersContract = new ethers.Contract(
      getAddress(),
      getABI(),
      _getProvider()
    );
    return ethersContract.interface.functions[functionName].encode(args);
  };
}
