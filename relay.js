
var fs = require('fs'),
	http = require('http'),
	WebSocket = require('ws'),
	ip = require("ip");

var STREAM_SECRET = 'aloha',
	STREAM_PORT = 8888,
	WEBSOCKET_PORT = 9999,
	RECORD_STREAM = false;

// Websocket Server

var httpServerForWS = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});


var socketServer = new WebSocket.Server({/*port: WEBSOCKET_PORT*/server: httpServerForWS, perMessageDeflate: false});
socketServer.connectionCount = 0;
socketServer.on('connection', function(socket) {
	socketServer.connectionCount++;
	console.log(
		'New WebSocket Connection: ', 
		socket.upgradeReq.socket.remoteAddress,
		socket.upgradeReq.headers['user-agent'],
		'('+socketServer.connectionCount+' total)'
	);
	socket.on('close', function(code, message){
		socketServer.connectionCount--;
		console.log(
			'Disconnected WebSocket ('+socketServer.connectionCount+' total)'
		);
	});
});
socketServer.broadcast = function(data) {
	socketServer.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(data);
		}
	});
};

// HTTP Server to accept incomming MPEG-TS Stream from ffmpeg
var streamServer = http.createServer( function(request, response) {
	var params = request.url.substr(1).split('/');

	if (params[0] !== STREAM_SECRET) {
		console.log(
			'Failed Stream Connection: '+ request.socket.remoteAddress + ':' +
			request.socket.remotePort + ' - wrong secret.'
		);
		response.end();
	}

	response.connection.setTimeout(0);
	console.log(
		'Stream Connected: ' + 
		request.socket.remoteAddress + ':' +
		request.socket.remotePort
	);
	request.on('data', function(data){
		socketServer.broadcast(data);
		if (request.socket.recording) {
			request.socket.recording.write(data);
		}
	});
	request.on('end',function(){
		console.log('close');
		if (request.socket.recording) {
			request.socket.recording.close();
		}
	});

	// Record the stream to a local file?
	if (RECORD_STREAM) {
		var path = 'recordings/' + Date.now() + '.ts';
		request.socket.recording = fs.createWriteStream(path);
	}
});

module.exports = {
	start : function() {
		httpServerForWS.listen(WEBSOCKET_PORT);
		console.log('Relay: Listening WebSocket on port '+ip.address() + ":" + httpServerForWS.address().port);
		streamServer.listen(STREAM_PORT);
		console.log('Relay: Listening MPEG-TS Stream on port '+ip.address()+ ":" + streamServer.address().port+'/'+STREAM_SECRET);
	},
	stop : function() {
		console.log('TODO!! stop relay');
	}
};

