const fs = require("fs");

// Remove overloaded functions
// Calling overloaded function was only allowed since Truffle v5 and land project uses truffle v4.1.13
// See more: https://github.com/trufflesuite/truffle/issues/737#issuecomment-454892913
// As workaround solution, unused functions should be removed from abi
const removeFromEstateRegistry = () => {
  const filePath = "../land/build/contracts/EstateRegistry.json";
  const rawdata = fs.readFileSync(filePath);
  const contractJson = JSON.parse(rawdata);
  const abi = contractJson.abi;

  const toRemove = json => {
    const isFunction = json.type === "function";

    return isFunction && json.name === "initialize" && json.inputs.length != 3;
  };

  contractJson.abi = abi.filter(json => !toRemove(json));

  const data = JSON.stringify(contractJson, null, 2);
  fs.writeFileSync(filePath, data);
};

const removeFromMarketplace = () => {
  const filePath = "../marketplace-contracts/build/contracts/Marketplace.json";
  const rawdata = fs.readFileSync(filePath);
  const contractJson = JSON.parse(rawdata);
  const abi = contractJson.abi;

  const toRemove = json => {
    const isFunction = json.type === "function";

    return isFunction && json.name === "initialize" && json.inputs.length != 3;
  };

  contractJson.abi = abi.filter(json => !toRemove(json));

  const data = JSON.stringify(contractJson, null, 2);
  fs.writeFileSync(filePath, data);
};

removeFromEstateRegistry();
removeFromMarketplace();
