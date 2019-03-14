#!/bin/bash
PROJECT_DIR=$1
if [ -z "$PROJECT_DIR" ];
then
    echo "Error! Use: ./$0 <tasit-contract-dir>";
    exit;
fi

DECENTRALAND_DIR="$PROJECT_DIR/3rd-parties/decentraland"


### COMPILE
# mana
cd $DECENTRALAND_DIR/mana && npx truffle compile

# land
cd $DECENTRALAND_DIR/land && npx truffle compile

# marketplace-contracts
cd $DECENTRALAND_DIR/marketplace-contracts && npx truffle compile
