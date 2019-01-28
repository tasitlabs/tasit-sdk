#!/bin/bash
PROJECT_DIR=$1
if [ -z "$PROJECT_DIR" ];
then
    echo "Error! Use: ./$0 <tasit-contract-dir>";
    exit;
fi

DECENTRALAND_DIR="$PROJECT_DIR/decentraland"

# mana
cp $DECENTRALAND_DIR/scripts/3_mana_migrations.js $DECENTRALAND_DIR/mana/migrations
cd $DECENTRALAND_DIR/mana && npx truffle migrate

# land
cp $DECENTRALAND_DIR/scripts/3_land_migrations.js $DECENTRALAND_DIR/land/migrations
# land project has that network pointing to 8454 port of ganache
# the default develop network is pointing to 18545 and isn't working
cd $DECENTRALAND_DIR/land && npx truffle migrate --network livenet

# marketplace-contracts
cp $DECENTRALAND_DIR/scripts/3_marketplace-contracts_migrations.js $DECENTRALAND_DIR/marketplace-contracts/migrations
cd $DECENTRALAND_DIR/marketplace-contracts && npx truffle migrate
