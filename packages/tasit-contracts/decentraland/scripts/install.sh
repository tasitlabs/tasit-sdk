#!/bin/bash
PROJECT_DIR=$1;

if [ -z "$PROJECT_DIR" ];
then
    echo "Error! Use: ./$0 <tasit-contract-dir>";
    exit;
fi

DECENTRALAND_DIR="$PROJECT_DIR/decentraland";

# Use list of repository_name:commit_hash
REPOS="\
    mana:f817fcab2c230bc2d2144ae85dff2bdc507ed659 \
    land:f6795c4e47564b08d39d04f2f2d0f60fa97b69ac \
    marketplace-contracts:190ab91887496da1677c41778832ff5a0c0c2ddb"


for clone in $REPOS;
do
    REPO=`echo $clone | awk -F ':' '{print $1}'`
    COMMIT=`echo $clone | awk -F ':' '{print $2}'`
    REPO_DIR="$DECENTRALAND_DIR/$REPO";

    if [ ! -e "$REPO_DIR/package.json" ];
    then
        rm -rf $REPO_DIR;
        git clone https://github.com/decentraland/$REPO.git $REPO_DIR;
        cd $REPO_DIR && git fetch origin $COMMIT && git reset --hard FETCH_HEAD

    fi

    npm i --prefix $REPO_DIR;
done
