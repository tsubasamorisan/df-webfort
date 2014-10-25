var colors = [32, 39, 49, 0, 106, 255, 68, 184, 57, 114, 156, 251, 212, 54, 85,
	176, 50, 255, 217, 118, 65, 170, 196, 178, 128, 151, 156, 48, 165, 255, 144,
	255, 79, 168, 212, 255, 255, 82, 82, 255, 107, 255, 255, 232, 102, 255, 250,
	232
];

function getJsonFromUrl() {
	var query = location.search.substr(1);
	var result = {};
	query.split("&").forEach(function(part) {
		var item = part.split("=");
		result[item[0]] = decodeURIComponent(item[1]);
	});
	return result;
}

var params = getJsonFromUrl();
console.log(JSON.stringify(params, null, 4));

var host = params.host || document.location.hostname;
var port = params.port || '1234';
var tileSet = params.tiles || "Spacefox_16x16.png";
var textSet = params.text  || "ShizzleClean.png";
var wsUri = 'ws://' + host + ':' + port + '/';
var active = false;

// Converts integer value in seconds to a time string, HH:MM:SS
function toTime(n) {
	var h = Math.floor(n / 60  / 60);
	var m = Math.floor(n / 60) % 60;
	var s = n % 60;
	return ("0" + h).slice(-2) + ":" +
	       ("0" + m).slice(-2) + ":" +
	       ("0" + s).slice(-2);
}

function setStats(userCount, timeLeft) {
	var u = document.getElementById('user-count');
	var t = document.getElementById('time-left');
	u.innerHTML = String(userCount) + " <i class='fa fa-users'></i>";

	if (timeLeft === -1) {
		t.innerHTML = "";
	} else {
		t.innerHTML = toTime(timeLeft)  + " <i class='fa fa-clock-o'></i>";
	}
}

function setStatus(text, color, onclick) {
	var m = document.getElementById('message');
	m.innerHTML = text;
	var st = m.parentNode;
	if (onclick) {
		st.addEventListener('click', onclick);
	}
	st.style.backgroundColor = color;
}
function connect() {
	setStatus('Connecting...', 'orange');
	websocket = new WebSocket(wsUri);
	websocket.binaryType = 'arraybuffer';
	websocket.onopen  = onOpen;
	websocket.onclose = onClose;
	websocket.onerror = onError;
}

function fitCanvasToWindow() {
	if (active) {
		// FIXME: Canvas resizing meshes poorly with the chatbox.
		//canvas.width = window.innerWidth & (~15);
		//canvas.height = (window.innerHeight - 20) & (~15);

		var data = new Uint8Array([
				112,
				Math.floor(canvas.width / 16),
				Math.floor(canvas.height / 16)]);
		websocket.send(data);
	}
}

function onOpen(evt) {
	setStatus('Connected', 'orange');

	fitCanvasToWindow();
	websocket.send(new Uint8Array([115]));

	websocket.send(new Uint8Array([110]));
	websocket.onmessage = onMessage;
}

function onClose(evt) {
	setStatus('Disconnected. Click to retry.', 'red', connect);
}

function requestTurn() {
	websocket.send(new Uint8Array([116]));
}

function renderQueueStatus(isActive, players, timeLeft) {
	if (isActive) {
		active = true;
		setStatus("You're in charge now! Click here to end your turn.", 'green', requestTurn);
	} else if (timeLeft === -1) {
		setStatus("Nobody is playing right now. Click here to ask for a turn.", 'grey', requestTurn);
	} else {
		setStatus("Somebody else is playing right now. Please wait warmly.", 'orange');
	}
	setStats(players, timeLeft);
}

function renderUpdate(ctx, data) {
	var t = [];
	for (var k = 8; k < data.length; k += 5) {
		var x = data[k + 0];
		var y = data[k + 1];

		var s = data[k + 2];
		var bg = data[k + 3] % 16;
		var fg = data[k + 4];

		var bg_x = ((bg % 4) * 256) + 15 * 16
		var bg_y = (Math.floor(bg / 4) * 256) + 15 * 16
		ctx.drawImage(cd, bg_x, bg_y, 16, 16, x * 16, y * 16, 16, 16);

		if (data[k + 3] & 64) {
			t.push(k);
			continue;
		}
		var fg_x = (s % 16) * 16 + ((fg % 4) * 256);
		var fg_y = Math.floor(s / 16) * 16 + (Math.floor(fg / 4) * 256);
		ctx.drawImage(cd, fg_x, fg_y, 16, 16, x * 16, y * 16, 16, 16);
	}

	for (var m = 0; m < t.length; m++) {
		var k = t[m];
		var x = data[k + 0];
		var y = data[k + 1];

		var s = data[k + 2];
		var bg = data[k + 3];
		var fg = data[k + 4];

		var i = (s % 16) * 16 + ((fg % 4) * 256);
		var j = Math.floor(s / 16) * 16 + (Math.floor(fg / 4) * 256);
		ctx.drawImage(ct, i, j, 16, 16, x * 16, y * 16, 16, 16);
	}
}

function onMessage(evt) {
	var data = new Uint8Array(evt.data);

	var ctx = canvas.getContext('2d');
	if (data[0] === 110) {
		stats.begin();

		var players = data[1] & 127;
		var isActive = data[1] & 128;
		var timeLeft =
			(data[2]<<0) |
			(data[3]<<8) |
			(data[4]<<16) |
			(data[5]<<24);
		//console.log(isActive, players, timeLeft);
		renderQueueStatus(isActive, players, timeLeft);


		var neww = data[6] * 16;
		var newh = data[7] * 16;
		// resizeCanvas
		/*
		if (neww != canvas.width || newh != canvas.height) {
			canvas.width = neww;
			canvas.height = newh;
		}
		*/

		renderUpdate(ctx, data);

		stats.end();
	}
	else if (data[0] == 116) {
		spectator = (data[1]==1 ? true : false);
	}
	setTimeout(function() {
		websocket.send(new Uint8Array([110]));
	}, 1000 / 30);
}

function onError(ev) {
	console.log(ev);
	setStatus('Error', 'red');
}

function colorize(img, cnv) {
	var ctx3 = cnv.getContext('2d');

	for (var j = 0; j < 4; j++) {
		for (var i = 0; i < 4; i++) {
			var c = j * 4 + i;

			ctx3.drawImage(img, i * 256, j * 256);

			var idata = ctx3.getImageData(i * 256, j * 256, 256, 256);
			var pixels = idata.data;

			for (var u = 0, len = pixels.length; u < len; u += 4) {
				pixels[u] = pixels[u] * (colors[c * 3 + 0] / 255);
				pixels[u + 1] = pixels[u + 1] * (colors[c * 3 + 1] / 255);
				pixels[u + 2] = pixels[u + 2] * (colors[c * 3 + 2] / 255);
			}
			ctx3.putImageData(idata, i * 256, j * 256);

			ctx3.fillStyle = 'rgb(' +
					colors[c * 3 + 0] + ',' +
					colors[c * 3 + 1] + ',' +
					colors[c * 3 + 2] + ')';

			ctx3.fillRect(i * 256 + 16 * 15, j * 256 + 16 * 15, 16, 16);

		}
	}
}

function init() {
	if (!l1 || !l2)
		return;

	cd = document.createElement('canvas');
	cd.width = cd.height = 1024;
	colorize(ts, cd);

	ct = document.createElement('canvas');
	ct.width = ct.height = 1024;
	colorize(tt, ct);

	connect();
}

var stats = new Stats();
document.body.appendChild(stats.domElement);
stats.domElement.style.position = "absolute";
stats.domElement.style.bottom = "0";
stats.domElement.style.left   = "0";

function getFolder(path) {
	return path.substring(0, path.lastIndexOf('/') + 1);
}

var l1 = false;
var ts = document.createElement('img');
ts.src = getFolder(window.location.pathname) + "art/" + tileSet;

var l2 = false;
var tt = document.createElement('img');
tt.src = getFolder(window.location.pathname) + "art/" + textSet;

var cd, ct;

ts.onload = function() {
	l1 = true;
	init();
};
tt.onload = function() {
	l2 = true;
	init();
};

var canvas = document.getElementById('myCanvas');

document.onkeydown = function(ev) {
	if (!active)
		return;

	if (ev.keyCode === 91 ||
			ev.keyCode === 18 ||
			ev.keyCode === 17 ||
			ev.keyCode === 16) {
		return;
	}

	if (ev.keyCode < 65) {
		var mod = (ev.shiftKey << 1) | (ev.ctrlKey << 2) | ev.altKey;
		var data = new Uint8Array([111, ev.keyCode, 0, mod]);
		websocket.send(data);
		ev.preventDefault();
	} else {
		lastKeyCode = ev.keyCode;
	}
};

document.onkeypress = function(ev) {
	if (!active)
		return;

	var mod = (ev.shiftKey << 1) | (ev.ctrlKey << 2) | ev.altKey;
	var data = new Uint8Array([111, 0, ev.charCode, mod]);
	websocket.send(data);

	ev.preventDefault();
};

window.onresize = fitCanvasToWindow;
