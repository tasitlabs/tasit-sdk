const decentralandAddresses = require("./contracts/addresses.json");

const { ropsten } = decentralandAddresses;

const local = {
  MANAToken: "0x332bfb4d705d3ce37c4bf06141c7104984e91e79",
  EstateRegistry: "0x6191bc768c2339da9eab9e589fc8bf0b3ab80975",
  LANDRegistry: "0x773f11ed472aa43e4ebaa963bcfbbea5a10c1bbd",
  LANDProxy: "0x1212f783f11611b0c029d5e6f86a23be621669e0",
  Marketplace: "0x70960e803a2bbe90c7db34edfdc2d1e81ed46b79",
};

module.exports = { ropsten, local };
