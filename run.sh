sudo setcap 'cap_net_bind_service=+ep' ~/.nvm/versions/node/v7.5.0/bin/node
node websocket-relay.js aloha 8888 9999 &
node_modules/.bin/http-server -c-1 -p 80

