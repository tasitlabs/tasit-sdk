#!/bin/bash
PROJECT_DIR=$1;

if [ -z "$PROJECT_DIR" ];
then
    echo "Error! Use: ./$0 <tasit-contract-dir>";
    exit;
fi

DECENTRALAND_DIR="$PROJECT_DIR/decentraland";

# mana
# Note: mana repository has no tags and there is no branch that can be used.
REPO="mana"

REPO_DIR="$DECENTRALAND_DIR/$REPO";

if [ ! -e "$REPO_DIR/package.json" ];
then
    rm -rf $REPO_DIR;
    git clone https://github.com/decentraland/$REPO.git $REPO_DIR;
    npm i --prefix $REPO_DIR;
fi


# land
REPO="land"
TAG="deploy/2018-08-31"

REPO_DIR="$DECENTRALAND_DIR/$REPO";

if [ ! -e "$REPO_DIR/package.json" ];
then
    rm -rf $REPO_DIR;
    git clone -b $TAG https://github.com/decentraland/$REPO.git $REPO_DIR;
    npm i --prefix $REPO_DIR;
fi

# marketplace-contracts
REPO="marketplace-contracts"
TAG="1.0.0"

REPO_DIR="$DECENTRALAND_DIR/$REPO";

if [ ! -e "$REPO_DIR/package.json" ];
then
    rm -rf $REPO_DIR;
    git clone -b $TAG https://github.com/decentraland/$REPO.git $REPO_DIR;
    npm i --prefix $REPO_DIR;
fi
