#!/bin/bash
PROJECT_DIR=$1
if [ -z "$PROJECT_DIR" ];
then
    echo "Error! Use: ./$0 <tasit-contract-dir>";
    exit;
fi

GNOSIS_DIR="$PROJECT_DIR/3rd-parties/gnosis"

# safe-contracts
cd $GNOSIS_DIR/safe-contracts && npx truffle migrate
