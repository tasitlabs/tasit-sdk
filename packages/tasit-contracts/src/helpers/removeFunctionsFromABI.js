const fs = require("fs");

// Remove overloaded functions
// This helper isn't be used right now, but it'll be useful on that issue:
// https://github.com/tasitlabs/TasitSDK/issues/241 (step 3)
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

// eslint-disable-next-line no-unused-vars
const removeFromEstateRegistry = () => {
  const filePath = "../land/build/contracts/EstateRegistry.json";

  // Keep only the initialize function with 3 arguments
  const removalCondition = f => {
    return f.name === "initialize" && f.inputs.length != 3;
  };

  removeFunctionsFromABI(filePath, removalCondition);
};

// eslint-disable-next-line no-unused-vars
const removeFromMarketplace = () => {
  const filePath = "../marketplace-contracts/build/contracts/Marketplace.json";

  // Keep only the initialize function with 3 arguments
  const removalCondition = f => {
    return f.name === "initialize" && f.inputs.length != 3;
  };

  removeFunctionsFromABI(filePath, removalCondition);
};
