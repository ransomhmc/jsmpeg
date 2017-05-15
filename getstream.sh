#!/bin/bash
while true
do
  node websocket-relay.js aloha 8888 9999 &
  ffmpeg -i rtmp://54.169.82.73:1935/live/testbed -vcodec mpeg1video -b:v 2M -r 24 -f mpegts http://127.0.0.1:8888/aloha
  sleep 5
done

