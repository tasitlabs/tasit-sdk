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

### POPULATE BLOCKCHAIN
#cp $DECENTRALAND_DIR/scripts/config/$NETWORK.js $DECENTRALAND_DIR/scripts/config/default.js
#cd $PROJECT_DIR && npx babel-node $DECENTRALAND_DIR/scripts/decentralandOrdersLoad.js
