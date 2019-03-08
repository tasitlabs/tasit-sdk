#!/bin/bash
PROJECT_DIR=$1
if [ -z "$PROJECT_DIR" ];
then
    echo "Error! Use: ./$0 <tasit-contract-dir>";
    exit;
fi

DECENTRALAND_DIR="$PROJECT_DIR/3rd-parties/decentraland"


### CLEAN
# land
rm -rf $DECENTRALAND_DIR/land/build/

# marketplace-contracts
rm -rf $DECENTRALAND_DIR/marketplace-contracts/build/

### COMPILE
# land
cd $DECENTRALAND_DIR/land && npx truffle compile

# marketplace-contracts
cd $DECENTRALAND_DIR/marketplace-contracts && npx truffle compile

# remove unnused overloaded functions from abis
node $DECENTRALAND_DIR/scripts/remove_functions_overloading.js


### MIGRATE
# mana
cp $DECENTRALAND_DIR/scripts/mana/3_mana_migrations.js $DECENTRALAND_DIR/mana/migrations
cd $DECENTRALAND_DIR/mana && npx truffle migrate

# land
cp $DECENTRALAND_DIR/scripts/land/3_land_migrations.js $DECENTRALAND_DIR/land/migrations
# land project has that network pointing to 8454 port of ganache
# the default develop network is pointing to 18545 and isn't working
cd $DECENTRALAND_DIR/land && npx truffle migrate --network livenet

# marketplace-contracts
cp $DECENTRALAND_DIR/scripts/marketplace-contracts/3_marketplace-contracts_migrations.js $DECENTRALAND_DIR/marketplace-contracts/migrations
cd $DECENTRALAND_DIR/marketplace-contracts && npx truffle migrate


### POPULATE BLOCKCHAIN
node $PROJECT_DIR/../tasit-sdk/dist/scripts/decentralandOrdersLoad.js
