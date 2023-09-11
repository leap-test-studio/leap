#!/bin/bash
SCRIPT_PATH=$(dirname "$0")
cd $SCRIPT_PATH

for i in $(git status | grep modified | awk '{print $3}'); do
    diff=$(git diff --numstat --ignore-all-space $i | awk '{print $1"_"$2}')
    echo "$i - $diff"
    if [[ $diff == "0_0" ]]; then
        git checkout -- $i
    fi
done
git pull --tags origin main
git add --all .
git commit -m "sync"
git push origin main:main
