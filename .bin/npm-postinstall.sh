#!/bin/zsh

# adds vendor assets from installed modules
echo "[ COPYING ] vendor resources"

mkdir -p "./public/js/vendor/"

cp -v "./node_modules/riot/riot.min.js" "./public/js/vendor/"
cp -v "./node_modules/riotcontrol/riotcontrol.js" "./public/js/vendor/"
cp -v "./node_modules/firebase/firebase.js" "./public/js/vendor/"
cp -v "./node_modules/firebase/firebase-app.js.map" "./public/js/vendor/"

echo -e "\n[ COPY ] complete"
