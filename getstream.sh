#!/bin/bash
while true
do
  ffmpeg -i rtmp://54.169.82.73:1935/live/testbed -vcodec mpeg1video -b:v 1024k -r 20 -f mpegts http://127.0.0.1:8888/aloha
  sleep 5
done

