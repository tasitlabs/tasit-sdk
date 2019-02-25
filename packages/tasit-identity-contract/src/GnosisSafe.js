import Action from "tasit-action";
const { Contract } = Action;
import GnosisSafeUtils from "./GnosisSafeUtils";

import gnosisSafeABI from "../../tasit-contracts/abi/GnosisSafe.json";

// TODO: Go deep on gas handling.
// Without that, VM returns a revert error instead of out of gas error.
// See: https://github.com/tasitlabs/TasitSDK/issues/173
const gasParams = {
  gasLimit: 7e6,
  gasPrice: 1e9,
};

// Possible Gnosis Safe wallet operations
const operations = {
  CALL: 0,
  DELEGATE_CALL: 1,
  CREATE: 2,
};

const { CALL } = operations;

// Extended Gnosis Safe wallet contract with higher-level functions
export default class GnosisSafe extends Contract {
  #utils;

  constructor(address, wallet) {
    const abi = gnosisSafeABI;
    super(address, abi, wallet);
    this.#utils = new GnosisSafeUtils(this);
  }

  sendTokenTransaction = async (signers, tokenContract, toAddress, value) => {
    const data = this.#utils.encodeFunctionCall(tokenContract, "transfer", [
      toAddress,
      value,
    ]);
    const etherValue = "0";
    return this.#executeTransaction(signers, data, toAddress, etherValue);
  };

  sendEtherTransaction = async (signers, toAddress, value) => {
    const data = "0x";
    const etherValue = value;
    return this.#executeTransaction(signers, data, toAddress, etherValue);
  };

  #executeTransaction = async (signers, data, toAddress, etherValue) => {
    const to = toAddress;

    const operation = CALL;
    const signatureCount = signers.length;

    // Gas that should be used for the Safe transaction.
    const safeTxGas = await this.#utils.estimateFromSafeTxGas(
      to,
      etherValue,
      data,
      operation
    );

    // Gas price that should be used for the payment calculation.
    // Note: If no safeTxGas has been set and the gasPrice is 0 we assume that all available gas can be used (refs GnosisSafe.sol:94)
    const gasPrice = 0;

    // Token address (or 0 if ETH) that is used for the payment.
    const gasToken = "0x0000000000000000000000000000000000000000";

    // Address of receiver of gas payment (or 0 if tx.origin)
    const refundReceiver = "0x0000000000000000000000000000000000000000";

    // Gas costs for data used to trigger the safe transaction and to pay the payment transfer
    const dataGas = this.#utils.estimateDataGas(
      this,
      to,
      etherValue,
      data,
      operation,
      safeTxGas,
      gasToken,
      refundReceiver,
      signatureCount
    );
    const nonce = await this.nonce();

    const transactionHash = await this.getTransactionHash(
      to,
      etherValue,
      data,
      operation,
      safeTxGas,
      dataGas,
      gasPrice,
      gasToken,
      refundReceiver,
      nonce
    );
    const signatures = this.#utils.multiSign(signers, transactionHash);

    const execTxAction = await this.execTransaction(
      to,
      etherValue,
      data,
      operation,
      safeTxGas,
      dataGas,
      gasPrice,
      gasToken,
      refundReceiver,
      signatures,
      gasParams
    );

    return execTxAction;
  };
}
