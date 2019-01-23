#!/bin/bash
PROJECT_DIR=$1;

if [ -z "$PROJECT_DIR" ];
then
    echo "Error! Use: ./$0 <tasit-contract-dir>";
    exit;
fi

DECENTRALAND_DIR="$PROJECT_DIR/decentraland";
REPOS="mana land marketplace-contracts";

for repo in $REPOS;
do
    REPO_DIR="$DECENTRALAND_DIR/$repo";

    if [ ! -e "$REPO_DIR/package.json" ];
    then
        rm -rf $REPO_DIR;
        git clone https://github.com/decentraland/$repo.git $REPO_DIR;
    fi

    npm i --prefix $REPO_DIR;
done
