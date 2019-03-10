const fs = require("fs");

// Remove overloaded functions
// Overloaded function call was only allowed since Truffle v5. Decentraland Land and Marketplace projects use truffle v4.1.13
// See more: https://github.com/trufflesuite/truffle/issues/737#issuecomment-454892913
// As workaround solution, unused functions should be removed from abi

const removeFunctionsFromABI = (contractJsonPath, removalCondition) => {
  const rawdata = fs.readFileSync(contractJsonPath);
  let contractJson = JSON.parse(rawdata);
  const { abi } = contractJson;

  const toRemove = json => {
    const isFunction = json.type === "function";
    return isFunction && removalCondition(json);
  };

  const abiAfterRemovals = abi.filter(json => !toRemove(json));
  contractJson = { ...contractJson, abi: abiAfterRemovals };

  const data = JSON.stringify(contractJson, null, 2);
  fs.writeFileSync(contractJsonPath, data);
};

const removeFromEstateRegistry = () => {
  const filePath = "../land/build/contracts/EstateRegistry.json";

  // Keep only the initialize function with 3 arguments
  const removalCondition = f => {
    return f.name === "initialize" && f.inputs.length != 3;
  };

  removeFunctionsFromABI(filePath, removalCondition);
};

const removeFromMarketplace = () => {
  const filePath = "../marketplace-contracts/build/contracts/Marketplace.json";

  // Keep only the initialize function with 3 arguments
  const removalCondition = f => {
    return f.name === "initialize" && f.inputs.length != 3;
  };

  removeFunctionsFromABI(filePath, removalCondition);
};

removeFromEstateRegistry();
removeFromMarketplace();
