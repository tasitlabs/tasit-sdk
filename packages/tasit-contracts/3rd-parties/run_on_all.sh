#!/bin/bash
SCRIPT_NAME=$1;
PROJECT_DIR=$2;

if [ -z "$PROJECT_DIR" ];
then
    echo "Error! Use: ./$0 <tasit-contract-dir>";
    exit;
fi

THIRD_PARTIES="decentraland gnosis";

for party in $THIRD_PARTIES;
do
  SCRIPT="$PROJECT_DIR/3rd-parties/$party/scripts/$SCRIPT_NAME.sh"
  if [ ! -e $SCRIPT ]; then
    echo "WARN: Script $SCRIPT doesn't exist.";
  else
    bash $SCRIPT $PROJECT_DIR;
  fi
done
