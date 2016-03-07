var WebSocketServer = require("ws").Server;
var cam = require("./build/Release/camera.node");
var fs = require("fs");
var BinaryServer = require('binaryjs').BinaryServer;

var websocketPort = 9090,
    width = 160,
    inputString = "/dev/video0",
    height = 120;

var config = {
	port: 9999,
	ipaddr: '0.0.0.0',
	dir: './public',
};
var server = require('./file-server.js')(config);

//Gathering Arguments
process.argv.forEach(function (val, index, array) {
    switch (val) {
    case "-wsport":
        websocketPort = parseInt(array[index + 1]);
        break;
    case "-webport":
        config.port = parseInt(array[index + 1]);
        break;
    case "-res":
        var res = array[index + 1].split("x");
        width = parseInt(res[0]);
        height = parseInt(res[1]);
        break;
    case "-input":
        inputString = array[index + 1];
        console.log(inputString);
    }
});

//var wss = new WebSocketServer({
//	port: websocketPort
//});
var wss = BinaryServer({
	port: websocketPort,
	chunkSize: 360*640*3
});

var clients = {};
var needsize = [];
var size = null;

console.time('frame');
var frameCallback = function (image) {
//console.log(typeof image, Buffer.isBuffer(image));
	/*var frame = {
		type: "frame",
		frame: new Buffer(image, "ascii").toString("base64")
	};
	var raw = JSON.stringify(frame);
	for (var index in clients) {
		clients[index].send(raw);
	}*/
//console.timeEnd('frame');
//console.time('frame');
//console.time('to Buffer');
	var raw = new Buffer(image, "ascii");
//console.timeEnd('to Buffer');

	if(!size){
		size = cam.GetPreviewSize();
	}
	while(needsize.length){
		var ws = needsize.pop();
		//ws.send(size.width + "x" + size.height, 'size');
		var st = ws.createStream('size');
		st.write(new Buffer(size.width + "x" + size.height));
		st.end();
		console.log("connection", size, ws.index);
		clients[ws.index] = ws.createStream();
		console.log(typeof raw, Buffer.isBuffer(raw), raw.length);
	}

	for (var index in clients) {
		//clients[index].send(raw, { binary: true, mask: false });
		clients[index].write(raw);
	}
};

var disconnectClient = function (index) {
	delete clients[index];
	if (Object.keys(clients).length == 0) {
		console.log("No Clients, Closing Camera");
		//if (cam.IsOpen()) {
		cam.Close();
		//}
	}
};

var connectClient = function (ws) {
	var index = "" + new Date().getTime();
	console.log('cam.IsOpen()', cam.IsOpen());
	if (!cam.IsOpen()) {
		console.log("New Clients, Opening Camera");
		cam.Open(frameCallback, {
			width: width,
			height: height,
			raw: true,
			codec: ".jpg",
			input: inputString
		});
	}
//	clients[index] = ws.createStream();
//	clients[index] = ws;
	ws.index = index;
	return index;
};

wss.on('connection', function (ws) {
	var disconnected = false;
	var index = connectClient(ws);
//	var stream = ws.createStream();
//	stream.index = index;
//	ws.index = index;

//	var size = cam.GetPreviewSize();
//	ws.send(size.width + "x" + size.height);
	console.log("connection", index);
	needsize.push(ws);

	ws.on('close', function () {
		disconnectClient(index);
	});

/*	ws.on('open', function () {
		console.log("Opened");
	});

	ws.on('message', function (message) {
		console.log("id", index, message);
	});*/

});

server.listen(config.port, config.ipaddr, function() {
	console.log('\tserver listening on ' + config.ipaddr + ':' + config.port);
});



