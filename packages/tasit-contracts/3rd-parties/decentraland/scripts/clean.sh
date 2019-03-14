#!/bin/bash
PROJECT_DIR=$1;

if [ -z "$PROJECT_DIR" ];
then
    echo "Error! Use: ./$0 <tasit-contract-dir>";
    exit;
fi


DECENTRALAND_DIR="$PROJECT_DIR/3rd-parties/decentraland";
REPOS="mana land marketplace-contracts"

for repo in $REPOS;
do
    REPO_DIR="$DECENTRALAND_DIR/$repo";
    cd $REPO_DIR && git reset --hard && git clean -f
    rm -rf $DECENTRALAND_DIR/$repo/build
done
