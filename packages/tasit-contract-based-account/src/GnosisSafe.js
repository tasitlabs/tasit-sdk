import TasitAction from "tasit-action";
const { Action, Contract, ERC20, ERC721 } = TasitAction;
const { ERC20Detailed } = ERC20;
const { ERC721Full } = ERC721;
import GnosisSafeUtils from "./GnosisSafeUtils";
import ActionUtils from "tasit-action/dist/contract/Utils.js";
import TasitContracts from "tasit-contracts";
const { local } = TasitContracts;
const { GnosisSafe: GnosisSafeInfo, MyERC20Full, MyERC721Full } = local;
const { abi: gnosisSafeABI } = GnosisSafeInfo;
const { abi: erc20ABI } = MyERC20Full;
const { abi: erc721ABI } = MyERC721Full;

// Possible Gnosis Safe wallet operations
const operations = {
  CALL: 0,
  DELEGATE_CALL: 1,
  CREATE: 2,
};

const { CALL } = operations;

const areValidSigners = signers => {
  const { isEthersJsSigner: isSigner } = ActionUtils;
  const { isArray } = Array;

  if (!isArray(signers)) return false;

  const allAreValid = !signers.map(isSigner).includes(false);

  if (!allAreValid) return false;

  return true;
};

// Extended Gnosis Safe wallet contract with higher-level functions
export default class GnosisSafe extends Contract {
  #utils;
  #signers;

  constructor(address, wallet) {
    const abi = gnosisSafeABI;
    super(address, abi, wallet);
    this.#utils = new GnosisSafeUtils(this);
  }

  setSigners = signers => {
    if (!areValidSigners(signers))
      throw new Error(
        `Cannot set invalid signers for the Gnosis Safe contract.`
      );

    this.#signers = signers;
  };

  approveERC20 = (tokenAddress, spender, value) => {
    const contractAddress = tokenAddress;
    const contractABI = erc20ABI;
    const functionName = "approve";
    const argsArray = [spender, value];

    const action = this.customContractAction(
      contractAddress,
      contractABI,
      functionName,
      argsArray
    );
    return action;
  };

  transferERC20 = (tokenAddress, toAddress, value) => {
    const contractAddress = tokenAddress;
    const contractABI = erc20ABI;
    const functionName = "transfer";
    const argsArray = [toAddress, value];

    const action = this.customContractAction(
      contractAddress,
      contractABI,
      functionName,
      argsArray
    );
    return action;
  };

  transferNFT = (tokenAddress, toAddress, tokenId) => {
    const contractAddress = tokenAddress;
    const contractABI = erc721ABI;
    const functionName = "safeTransferFrom";
    const fromAddress = this.getAddress();
    const argsArray = [fromAddress, toAddress, tokenId];

    const action = this.customContractAction(
      contractAddress,
      contractABI,
      functionName,
      argsArray
    );
    return action;
  };

  addSignerWithThreshold = (newSignerAddress, newThreshold) => {
    const contractAddress = this.getAddress();
    const contractABI = this.getABI();
    const functionName = "addOwnerWithThreshold";
    const argsArray = [newSignerAddress, newThreshold];

    const action = this.customContractAction(
      contractAddress,
      contractABI,
      functionName,
      argsArray
    );
    return action;
  };

  transferEther = (toAddress, value) => {
    const data = "0x";
    const etherValue = value;
    const action = this.#executeTransaction(data, toAddress, etherValue);
    return action;
  };

  // Note: Once the Action doesn't send the transaction immediately after building the transaction,
  // a new function such `Action.getData()` could be created and this function
  // could be changed to something like `customContractAction(actionData)`
  // Related to: https://github.com/tasitlabs/TasitSDK/issues/162
  customContractAction = (
    contractAddress,
    contractABI,
    functionName,
    argsArray,
    ethersAmount = 0
  ) => {
    const data = this.#utils.encodeFunctionCall(
      contractABI,
      functionName,
      argsArray
    );
    const action = this.#executeTransaction(
      data,
      contractAddress,
      ethersAmount
    );
    return action;
  };

  #executeTransaction = (data, toAddress, etherValue) => {
    const rawActionPromise = this.#prepareTransaction(
      data,
      toAddress,
      etherValue
    );
    const provider = this._getProvider();
    const signer = this.getWallet();

    const action = new Action(rawActionPromise, provider, signer);
    return action;
  };

  #prepareTransaction = async (data, toAddress, etherValue) => {
    const signers = this.#signers;

    if (!signers)
      throw new Error(
        `Cannot send an action to Gnosis Safe contract without signers.`
      );

    const operation = CALL;

    // Gas that should be used for the Safe transaction.
    const safeTxGas = await this.#utils.estimateFromSafeTxGas(
      toAddress,
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

    // Gas costs for data used to trigger the safe transaction and to pay for transferring a payment
    const { length: signersCount } = signers;
    const dataGas = this.#utils.estimateDataGas(
      this,
      toAddress,
      etherValue,
      data,
      operation,
      safeTxGas,
      gasToken,
      refundReceiver,
      signersCount
    );

    const nonce = await this.nonce();

    const transactionHash = await this.getTransactionHash(
      toAddress,
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

    const execTxAction = this.execTransaction(
      toAddress,
      etherValue,
      data,
      operation,
      safeTxGas,
      dataGas,
      gasPrice,
      gasToken,
      refundReceiver,
      signatures
    );

    const rawAction = await execTxAction._toRaw();

    return rawAction;
  };
}
