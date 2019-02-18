#!/bin/bash
PROJECT_DIR=$1
if [ -z "$PROJECT_DIR" ];
then
    echo "Error! Use: ./$0 <tasit-contract-dir>";
    exit;
fi

GNOSIS_DIR="$PROJECT_DIR/3rd-parties/gnosis"

# safe-contracts
cp $GNOSIS_DIR/scripts/2_deploy_contracts.js $GNOSIS_DIR/safe-contracts/migrations
cd $GNOSIS_DIR/safe-contracts && npx truffle migrate
