#!/bin/bash
DECENTRALAND_DIR="$PROJECT_DIR/decentraland"

# mana
cp $DECENTRALAND_DIR/scripts/3_mana_token.js $DECENTRALAND_DIR/mana/migrations
cd $DECENTRALAND_DIR/mana
npx truffle migrate
cp $DECENTRALAND_DIR/mana/build/contracts/MANAToken.json $PROJECT_DIR/build/contracts/

# land
cp $DECENTRALAND_DIR/scripts/3_land_registry.js $DECENTRALAND_DIR/land/migrations
cd $DECENTRALAND_DIR/land
npx truffle migrate --network livenet
cp $DECENTRALAND_DIR/land/build/contracts/LANDRegistry.json $PROJECT_DIR/build/contracts/
