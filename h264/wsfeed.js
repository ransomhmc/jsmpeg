"use strict";

const WebSocket    = require('ws');
const merge  = require('mout/object/merge');
const Server = require('./_server');
const Splitter        = require('stream-split');
const NALseparator    = new Buffer([0,0,0,1]);//NAL break

class WSFeed extends Server {

  constructor(server, opts) {
    console.log('wsfeed server constructor')
    super(server, merge({
      feed_ip   : '127.0.0.1',
      feed_port : 5001,
    }, opts));
  }


  start_feed() {
    var WebSocketStream = require('websocket-stream')
    //var ws = new WebSocket('ws://127.0.0.1:5566/aloha');
    var ws = new WebSocketStream('ws://127.0.0.1:10001/');
    ws = ws.pipe(new Splitter(NALseparator));
    ws.on('data', this.broadcast);
  }

}



module.exports = WSFeed;
