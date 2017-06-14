#!/bin/bash
while true
do
  ffmpeg -i rtmp://54.169.82.73:1935/live/testbed -c:v libx264 -crf 30 -maxrate 400k -bufsize 2M -vprofile baseline -tune zerolatency -preset fast -f rawvideo http://127.0.0.1:10000
  sleep 5
done

