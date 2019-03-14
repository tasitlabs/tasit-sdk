#!/bin/bash
PROJECT_DIR=$1
if [ -z "$PROJECT_DIR" ];
then
    echo "Error! Use: ./$0 <tasit-contract-dir>";
    exit;
fi

DECENTRALAND_DIR="$PROJECT_DIR/3rd-parties/decentraland"
# Use 'development', 'ropsten' or 'goerli'
NETWORK="development";
MNEMONIC="beach swap combine paper music cook electric bullet trust actress liquid asthma";
INFURA_TOKEN="974bd2e667b246f29d2589a59600530e";

### Note: Compiling is done as a separate step from Migration to allow removal of unused overloaded functions from contract ABIs.

### COMPILE
# marketplace-contracts
cd $DECENTRALAND_DIR/marketplace-contracts && npx truffle compile

# remove unused overloaded functions from abis
node $DECENTRALAND_DIR/scripts/remove_functions_overloading.js


### MIGRATE
# marketplace-contracts
cp $DECENTRALAND_DIR/scripts/marketplace-contracts/3_marketplace-contracts_migrations.js $DECENTRALAND_DIR/marketplace-contracts/migrations
cp $DECENTRALAND_DIR/scripts/marketplace-contracts/truffle-config.js $DECENTRALAND_DIR/marketplace-contracts
cd $DECENTRALAND_DIR/marketplace-contracts && MNEMONIC=$MNEMONIC INFURA_TOKEN=$INFURA_TOKEN npx truffle migrate --network $NETWORK


### POPULATE BLOCKCHAIN
cp $DECENTRALAND_DIR/scripts/config/$NETWORK.js $DECENTRALAND_DIR/scripts/config/default.js
cd $PROJECT_DIR && npx babel-node $DECENTRALAND_DIR/scripts/decentralandOrdersLoad.js
