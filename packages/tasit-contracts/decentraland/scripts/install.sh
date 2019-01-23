#!/bin/bash
DECENTRALAND_DIR="$PROJECT_DIR/decentraland"

if [ ! -d "$DECENTRALAND_DIR/mana" ]; then
    git clone https://github.com/decentraland/mana.git $DECENTRALAND_DIR/mana
fi

npm i --prefix $DECENTRALAND_DIR/mana
