#!/bin/zsh

# adds vendor assets from installed modules
echo "[ COPYING ] vendor resources"

mkdir -p "./public/js/vendor/"

cp -v "./node_modules/riot/riot.min.js" "./public/js/vendor/"
cp -v "./node_modules/riotcontrol/riotcontrol.js" "./public/js/vendor/"
cp -v "./node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.slim.js" "./public/js/vendor/"

echo -e "\n[ COPY ] complete"
