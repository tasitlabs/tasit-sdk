import { ethers } from "ethers";
import TasitContracts from "../../../tasit-contracts/dist";
const { ropsten } = TasitContracts;
const { Marketplace, MarketplaceProxy } = ropsten;
const { abi: marketplaceABI } = Marketplace;
const { address: MARKETPLACE_ADDRESS } = MarketplaceProxy;

// This util class is being used to fetch data from Decentraland Marketplace contract
// Fetching data likely will be replaced with subgraph queries
export default class DecentralandUtils {
  #marketplace;
  #mana;
  #provider;

  constructor() {
    // Using ethers.js because Tasit Action isn't working with ropsten
    // TODO: Fix ProviderFactory
    this.#provider = ethers.getDefaultProvider("ropsten");

    this.#marketplace = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      marketplaceABI,
      this.#provider
    );
  }

  getOpenSellOrders = async fromBlock => {
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

    return openOrders;
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
