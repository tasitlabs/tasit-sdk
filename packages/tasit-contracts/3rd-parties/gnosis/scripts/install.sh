#!/bin/bash
PROJECT_DIR=$1;

if [ -z "$PROJECT_DIR" ];
then
    echo "Error! Use: ./$0 <tasit-contract-dir>";
    exit;
fi

GNOSIS_DIR="$PROJECT_DIR/3rd-parties/gnosis";

# Use list of repository_name:commit_hash:is_npm
REPOS="safe-contracts:427d6f7e779431333c54bcb4d4cde31e4d57ce96:true";

for clone in $REPOS;
do
    REPO=`echo $clone | awk -F ':' '{print $1}'`;
    COMMIT=`echo $clone | awk -F ':' '{print $2}'`;
    IS_NPM=`echo $clone | awk -F ':' '{print $3}'`;

    REPO_DIR="$GNOSIS_DIR/$REPO";

    if [ ! -e "$REPO_DIR/package.json" ];
    then
        rm -rf $REPO_DIR;
        git clone https://github.com/gnosis/$REPO.git $REPO_DIR;
        cd $REPO_DIR && git fetch origin $COMMIT && git reset --hard FETCH_HEAD;
    fi

    if [ $IS_NPM ];
    then
        npm i --prefix $REPO_DIR;
    fi

done
