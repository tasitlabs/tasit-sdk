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

    const ordersAreEqual = (o1, o2) => `${o1.id}` === `${o2.id}`;

    const latestOrdersCreated = [];

    ordersCreated.reverse().forEach(created => {
      const isOlder = latestOrdersCreated.find(
        o => `${o.assetId}` === `${created.assetId}`
      );
      if (!isOlder) latestOrdersCreated.push(created);
    });

    // Open = Created - Cancelled - Executed
    const openOrders = latestOrdersCreated
      .filter(
        created =>
          !ordersCancelled.find(cancelled => ordersAreEqual(cancelled, created))
      )
      .filter(
        created =>
          !ordersExecuted.find(executed => ordersAreEqual(executed, created))
      );

    return openOrders;
  };

  getAssetsOf = async address => {
    let [estates, parcels] = await Promise.all([
      this._getEstatesOf(address),
      this._getParcelsOf(address),
    ]);

    const estateAddress = this.#estate.address;
    const landAddress = this.#land.address;

    estates = estates.map(estate => ({
      ...estate,
      nftAddress: estateAddress,
    }));

    parcels = parcels.map(parcel => ({
      ...parcel,
      nftAddress: landAddress,
    }));

    const assets = [...estates, ...parcels];

    return assets;
  };

  // TODO: Move to private
  _getEstatesOf = async address => {
    const estates = await this.#getAssetsFromContractAndOwner(
      this.#estate,
      address
    );
    return estates;
  };

  // TODO: Move to private
  _getParcelsOf = async address => {
    const parcels = await this.#getAssetsFromContractAndOwner(
      this.#land,
      address
    );
    return parcels;
  };

  // Note:
  // This function is assuming that the same asset wasn't received more than one time by the owner
  #getAssetsFromContractAndOwner = async (contract, address) => {
    const { address: nftAddress } = contract;

    const fromTransferEventToAsset = transfer => {
      const { assetId, transactionHash } = transfer;
      const asset = { id: `${assetId}`, nftAddress, transactionHash };
      return asset;
    };

    const getAssetId = asset => asset.id;

    const transfers = await this.#getTransfers(contract);

    const receivedAssets = transfers
      .filter(transfer => transfer.to === address)
      .map(fromTransferEventToAsset);

    const sentAssets = transfers
      .filter(transfer => transfer.from === address)
      .map(fromTransferEventToAsset);

    // Owned = Received - Sent
    const ownedAssets = receivedAssets.filter(
      received => !sentAssets.map(getAssetId).includes(getAssetId(received))
    );

    return ownedAssets;
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
    // - For development blockchain, it's faster since there are few blocks mined.
    // - For (forked from) testnet blockchain, it's made by one HTTP over RPC call
    //   (Infura/Etherscan) and it's faster too.
    const fromBlock = 0;
    const iface = new ethers.utils.Interface(eventABI);
    const logs = await this.#provider.getLogs({
      ...filter,
      fromBlock,
    });

    // ethers.js helpers class for dealing with ABI
    // transforming a { 0, 1, 2 } transfer event object to { from, to, assetId }
    const parsedLogs = logs.map(log => {
      const { transactionHash } = log;
      const parsedLog = iface.parseLog(log);
      const { values } = parsedLog;
      return { ...values, transactionHash };
    });

    return parsedLogs;
  };
}
