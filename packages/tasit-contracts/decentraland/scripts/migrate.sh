#!/bin/bash
DECENTRALAND_DIR="$PROJECT_DIR/decentraland"

cp $DECENTRALAND_DIR/scripts/3_mana_token.js $DECENTRALAND_DIR/mana/migrations
cd $DECENTRALAND_DIR/mana
npx truffle migrate --reset
cp $DECENTRALAND_DIR/mana/build/contracts/MANAToken.json $PROJECT_DIR/build/contracts/
