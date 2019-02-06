const decentralandAddresses = require("./contracts/addresses.json");

const { ropsten } = decentralandAddresses;

const local = {
  MANAToken: "0xb32939da0c44bf255b9810421a55be095f9bb3f4",
  LANDRegistry: "0x6191bc768c2339da9eab9e589fc8bf0b3ab80975",
  LANDProxy: "0x773f11ed472aa43e4ebaa963bcfbbea5a10c1bbd",
  EstateRegistry: "0x41b598a2c618b59b74540ac3afffb32f7971b37a",
  Marketplace: "0x07c0e972064e5c05f7b3596d81de1afd35457eae",
};

module.exports = { ropsten, local };
