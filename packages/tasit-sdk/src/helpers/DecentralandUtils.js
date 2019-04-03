import { ethers } from "ethers";
import TasitContracts from "tasit-contracts";
import ProviderFactory from "tasit-action/dist/ProviderFactory";

// This util class is being used to fetch data from Decentraland Marketplace contract
// Fetching data likely will be replaced with subgraph queries
export default class DecentralandUtils {
  #marketplace;
  #estate;
  #land;
  #provider;

  constructor() {
    this.#provider = ProviderFactory.getProvider();

    const { _network: network } = this.#provider;
    const networkName = !network ? "local" : network.name;

    // Note: Infura/Etherscan API is a faster way to get logs than RPC connection from forked ganache
    if (networkName === "goerli" || networkName === "ropsten")
      this.#provider = ethers.getDefaultProvider(networkName);

    const {
      Marketplace,
      EstateRegistry,
      LANDRegistry,
      LANDProxy,
    } = TasitContracts[networkName];
    const { address: marketplaceAddress, abi: marketplaceABI } = Marketplace;
    const { address: estateAddress, abi: estateABI } = EstateRegistry;
    const { abi: landABI } = LANDRegistry;
    const { address: landAddress } = LANDProxy;

    this.#marketplace = new ethers.Contract(
      marketplaceAddress,
      marketplaceABI,
      this.#provider
    );

    this.#estate = new ethers.Contract(
      estateAddress,
      estateABI,
      this.#provider
    );

    this.#land = new ethers.Contract(landAddress, landABI, this.#provider);
  }

  getAllAssetsForSale = async () => {
    const [ordersCreated, ordersCancelled, ordersExecuted] = await Promise.all([
      this.#getCreatedSellOrders(),
      this.#getCancelledSellOrders(),
      this.#getExecutedSellOrders(),
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

  getAssetsOf = async address => {
    const [estateIds, parcelIds] = await Promise.all([
      this.getEstateIdsOf(address),
      this.getParcelIdsOf(address),
    ]);

    const estateAddress = this.#estate.address;
    const landAddress = this.#land.address;

    const estates = estateIds.map(id => ({
      id,
      nftAddress: estateAddress,
    }));

    const parcels = parcelIds.map(id => ({
      id,
      nftAddress: landAddress,
    }));

    const assets = [...estates, ...parcels];

    return assets;
  };

  getEstateIdsOf = async address => {
    const ids = await this.#getAssetIdsOf(this.#estate, address);
    return ids;
  };

  getParcelIdsOf = async address => {
    const ids = await this.#getAssetIdsOf(this.#land, address);
    return ids;
  };

  #getAssetIdsOf = async (contract, address) => {
    const getAssetId = transfer => `${transfer.assetId}`;

    const transferEvents = await this.#getTransfers(contract);

    const transfers = transferEvents.map(event => event.values);

    const received = transfers
      .filter(transfer => transfer.to === address)
      .map(getAssetId);

    const sent = transfers
      .filter(transfer => transfer.from === address)
      .map(getAssetId);

    const receivedIds = new Set(received);
    const sentIds = new Set(sent);

    const ownedIds = [...receivedIds].filter(
      receivedId => !sentIds.has(receivedId)
    );

    return Array.from(ownedIds);
  };

  #getCreatedSellOrders = async () => {
    return this.#getOrders("OrderCreated");
  };

  #getCancelledSellOrders = async () => {
    return this.#getOrders("OrderCancelled");
  };

  #getExecutedSellOrders = async () => {
    return this.#getOrders("OrderSuccessful");
  };

  #getOrders = async eventName => {
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
    return this.#listEventLogs(eventABI, filter);
  };

  #getTransfers = async contract => {
    const eventName = "Transfer";
    const eventABI = [
      "event Transfer(address indexed from, address indexed to, uint256 indexed assetId)",
    ];

    const { filters } = contract;
    const transferEvent = filters["Transfer(address,address,uint256)"];
    const filter = transferEvent();

    return this.#listEventLogs(eventABI, filter);
  };

  #listEventLogs = async (eventABI, filter) => {
    // Note: We are using fromBlock = 0 because:
    // - For development blockchain, ist's faster since are few blocks mined.
    // - For (forked from) testnet blockchain, it's made by one HTTP over RPC call
    //   (Infura/Etherscan) and it's faster too.
    const fromBlock = 0;
    const iface = new ethers.utils.Interface(eventABI);
    const logs = await this.#provider.getLogs({
      ...filter,
      fromBlock,
    });
    return logs.map(log => iface.parseLog(log));
  };
}
