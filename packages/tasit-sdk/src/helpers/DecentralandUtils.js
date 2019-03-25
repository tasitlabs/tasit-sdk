import { ethers } from "ethers";
import TasitContracts from "tasit-contracts";
import ProviderFactory from "tasit-action/dist/ProviderFactory";

// This util class is being used to fetch data from Decentraland Marketplace contract
// Fetching data likely will be replaced with subgraph queries
export default class DecentralandUtils {
  #marketplace;
  #provider;

  constructor() {
    this.#provider = ProviderFactory.getProvider();

    const { _network: network } = this.#provider;
    const networkName = !network ? "local" : network.name;

    // Note: Infura/Etherscan API is a faster way to get logs than RPC connection from forked ganache
    if (networkName === "goerli" || networkName === "ropsten")
      this.#provider = ethers.getDefaultProvider(networkName);

    const { Marketplace } = TasitContracts[networkName];
    const { address, abi } = Marketplace;
    this.#marketplace = new ethers.Contract(address, abi, this.#provider);
  }

  getAllAssetsForSale = async () => {
    const fromBlock = 0;

    const [ordersCreated, ordersCancelled, ordersExecuted] = await Promise.all([
      this.#getCreatedSellOrders(fromBlock),
      this.#getCancelledSellOrders(fromBlock),
      this.#getExecutedSellOrders(fromBlock),
    ]);

    // Open = Created - Cancelled - Executed
    const openOrders = ordersCreated
      .filter(
        created =>
          !ordersCancelled.find(
            cancelled => cancelled.values.id == created.values.id
          )
      )
      .filter(
        created =>
          !ordersExecuted.find(
            executed => executed.values.id == created.values.id
          )
      );

    return openOrders.map(order => order.values);
  };

  #getCreatedSellOrders = async fromBlock => {
    return this.#getOrders(fromBlock, "OrderCreated");
  };

  #getCancelledSellOrders = async fromBlock => {
    return this.#getOrders(fromBlock, "OrderCancelled");
  };

  #getExecutedSellOrders = async fromBlock => {
    return this.#getOrders(fromBlock, "OrderSuccessful");
  };

  #getOrders = async (fromBlock, eventName) => {
    let eventABI;

    if (eventName === "OrderCreated") {
      eventABI = [
        "event OrderCreated(bytes32 id,uint256 indexed assetId,address indexed seller,address nftAddress,uint256 priceInWei,uint256 expiresAt)",
      ];
    } else if (eventName === "OrderCancelled") {
      eventABI = [
        "event OrderCancelled(bytes32 id,uint256 indexed assetId,address indexed seller,address nftAddress)",
      ];
    } else if (eventName === "OrderSuccessful") {
      eventABI = [
        "event OrderSuccessful(bytes32 id,uint256 indexed assetId,address indexed seller,address nftAddress,uint256 totalPrice,address indexed buyer)",
      ];
    }
    const { filters } = this.#marketplace;
    const orderEvent = filters[eventName];
    const filter = orderEvent();
    return this.#listEventLogs(fromBlock, eventABI, filter);
  };

  #listEventLogs = async (fromBlock, eventABI, filter) => {
    const iface = new ethers.utils.Interface(eventABI);
    const logs = await this.#provider.getLogs({ ...filter, fromBlock });
    return logs.map(log => iface.parseLog(log));
  };
}
