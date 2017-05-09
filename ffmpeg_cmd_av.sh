TARGET=127.0.0.1
PORT=5555
ffmpeg -f avfoundation -i "2:3" -vcodec mpeg1video -s 640x480 -b:v 500k -acodec mp2 -ar 44100 -ac 1 -b:a 64k -f mpegts http://$TARGET:$PORT/aloha -muxdelay 0.001
