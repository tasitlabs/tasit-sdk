#!/bin/bash
PROJECT_DIR=$1;

if [ -z "$PROJECT_DIR" ];
then
    echo "Error! Use: ./$0 <tasit-contract-dir>";
    exit;
fi

DECENTRALAND_DIR="$PROJECT_DIR/3rd-parties/decentraland";

# Use list of repository_name:commit_hash:is_npm
REPOS="\
    mana:f817fcab2c230bc2d2144ae85dff2bdc507ed659:true \
    land:f6795c4e47564b08d39d04f2f2d0f60fa97b69ac:true \
    marketplace-contracts:190ab91887496da1677c41778832ff5a0c0c2ddb:true \
    contracts:d1ece59915692347a669bbf341ce6247a8a3406a:false";


for clone in $REPOS;
do
    REPO=`echo $clone | awk -F ':' '{print $1}'`;
    COMMIT=`echo $clone | awk -F ':' '{print $2}'`;
    IS_NPM=`echo $clone | awk -F ':' '{print $3}'`;

    REPO_DIR="$DECENTRALAND_DIR/$REPO";

    if [ ! -e "$REPO_DIR/package.json" ];
    then
        rm -rf $REPO_DIR;
        git clone https://github.com/decentraland/$REPO.git $REPO_DIR;
        cd $REPO_DIR && git fetch origin $COMMIT && git reset --hard FETCH_HEAD;
    fi

    if [ $IS_NPM ];
    then
        npm i --prefix $REPO_DIR;
    fi

done
