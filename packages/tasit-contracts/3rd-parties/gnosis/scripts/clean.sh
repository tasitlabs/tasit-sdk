#!/bin/bash
PROJECT_DIR=$1;

if [ -z "$PROJECT_DIR" ];
then
    echo "Error! Use: ./$0 <tasit-contract-dir>";
    exit;
fi


GNOSIS_DIR="$PROJECT_DIR/3rd-parties/gnosis";
REPOS="safe-contracts"

for repo in $REPOS;
do
    REPO_DIR="$GNOSIS_DIR/$repo";
    cd $REPO_DIR && git reset --hard && git clean -f
    rm -rf $REPO_DIR/build
done
