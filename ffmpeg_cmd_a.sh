TARGET=127.0.0.1
#TARGET=172.104.83.248
ffmpeg -f avfoundation -i ":3" -acodec mp2 -ar 44100 -ac 1 -b:a 32k -f mpegts http://$TARGET:6666/aloha
