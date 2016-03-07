// copy and modify from gavinuhma's node-asset-cache
// url: https://github.com/gavinuhma/node-asset-cache/blob/master/lib/asset-cache.js
module.exports = function(config) {

	var http = require('http');
	var path = require('path');
	var fs = require('fs');
	var child_process = require('child_process');
	var spawn = child_process.spawn;

	config.dir = config.dir || path.join(process.cwd(), 'public');

	var loadFile = function(file, ifNoneMatch, callback) {
		//console.log(file);
		file = (file == '/') ? 'index.html' : file;
		file = path.join(config.dir, file);
		var fin = path.relative(config.dir, file).slice(0, 3);
		if(fin  == '../') {
			return callback(err, null);
		}
		fs.stat(file, function(err, stat) {
			if (err) {
				return callback(err, null);
			}
			var thisEtag = '"' + stat.size + '-' + stat.mtime.getTime() + '"';
			if (ifNoneMatch && ifNoneMatch == thisEtag) {
				return callback(null, true, thisEtag);
			}
			fs.readFile(file, function(err, data) {
				callback(err, err ? null : data, false, thisEtag);
			});
		});
	};

	var server = http.createServer(handleRequest);

	function handleRequest(req, res) {
		//console.log(req.url);
		var send_file = function(err, body, notModified, etag) {
			var status;

			if (err) {
				//console.error(err);
				status = notModified ? 304 : 404;
			} else {
				status = notModified ? 304 : 200;
			}

			var ct = '';

			if (req.url.indexOf('.css') !== -1) {
				ct = 'text/css';
			} else if (req.url.indexOf('.js') !== -1) {
				ct = 'text/javascript';
			} else if (req.url.indexOf('.html') !== -1) {
				ct = 'text/html';
			} else if (req.url.indexOf('.png') !== -1) {
				ct = 'image/png';
			}

			res.writeHead(status, {
				'content-type': ct,
				'cache-control': 'must-revalidate,private,max-age=1209600',
				'Expires': new Date(Date.now() + 1209600000).toUTCString(),
				'etag': etag
			});

			if (notModified) {
				res.end();
			} else {
				res.end(body);
			}
		}

		switch (true) {
			// case (req.url == '/api/log'):
			// 	res.writeHead(200, {
			// 		'content-type': 'text/javascript',
			// 		'cache-control': 'private,max-age=30',
			// 		'Expires': new Date(Date.now() + 30000).toUTCString()
			// 	});
			// 	res.end(JSON.stringify(logs));
			// 	break;
			//
			// case /\/api\/board.*/.test(req.url):
			// 	res.writeHead(200, {
			// 		'content-type': 'text/javascript',
			// 		'cache-control': 'private,max-age=0,no-cache',
			// 		'Expires': new Date().toUTCString()
			// 	});
			// 	//res.end('board');
			// 	board.handler(req, res);
			// 	break;
			//
			// case (req.url == '/board'):
			// 	loadFile('board.html', req.headers['if-none-match'], send_file);
			// 	break;

			default:
				loadFile(req.url, req.headers['if-none-match'], send_file);
		}
	}

	return server;
}
