#TARGET=127.0.0.1
#TARGET=172.104.83.248
TARGET=52.78.137.116
PORT=8888
ffmpeg -f avfoundation -i "1:" -vcodec mpeg1video -s 320x240 -b:v 100k -f mpegts http://$TARGET:$PORT/aloha
