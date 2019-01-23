#!/bin/bash
DECENTRALAND_DIR="$PROJECT_DIR/decentraland"
REPOS="mana land"

for repo in $REPOS;
do
    if [ ! -d "$DECENTRALAND_DIR/$repo" ]; then
        git clone https://github.com/decentraland/$repo.git $DECENTRALAND_DIR/$repo
    fi

    npm i --prefix $DECENTRALAND_DIR/$repo
done
