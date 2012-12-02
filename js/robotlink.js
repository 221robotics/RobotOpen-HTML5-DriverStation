function robotlink (ip) {
	// setup ip address and port
	if (ip == null) {
    	this.ip = "10.0.0.22";
  	} else {
  		this.ip = ip;
  	}

  	// the UDP socket connection to the robot
  	this.socket = null;
  	// is the robot currently enabled?
  	this.enabled = false;
  	// storage for the interval timer to send data to the robot
  	this.tx_timer = null;
  	// is the websocket connection to the robot active?
	this.is_connected = false;
	// debug to console
	this.debugging = true;
	// keep track of the packets sent and received this session
	this.rx_count = 0;
	this.tx_count = 0;
	// data xmit rate (ms)
	this.xmit_rate = 100;
}

robotlink.prototype.debug = function(msg) {
	// if debugging is enabled, push messages to the console
	if(this.debugging == true) {
		console.log("[RobotLink] " + msg);
	}
}

robotlink.prototype.enable = function() {
	// enable the robot
	this.enabled = true;
}

robotlink.prototype.disable = function() {
	// disable the robot
	this.enabled = false;
}

robotlink.prototype.connect = function() {
    try {
    	this.socket = new chromeNetworking.clients.udp.roClient();

    	// pass the robotlink instance to the socket object
    	var t = this;
		
		this.socket.connect(this.ip,
			function() {
		    	t.socket_on_open(t);
			}
		);

		this.socket.receive(function(frame) {
		    t.socket_on_message(t, frame);
		});

		return true;

	} catch(exception) {
		this.debug("Could not create socket.");
		return false;
	}
};

robotlink.prototype.robot_tx = function() {
	if (this.is_connected) {
		// when the robot is disabled we must sent heartbeat frames to keep the connection alive
		if (!this.enabled) {
			var buf = new ArrayBuffer(3); // 2 bytes for each char
		    var bufView = new Uint8Array(buf);
		    bufView[0] = 104; // h
		    bufView[1] = 238; // 0xEE
		    bufView[2] = 1;   // 0x01
			this.xmit(buf);
		}
		else { // otherwise send joystick data
			this.send_joysticks();
		}
	}
}

robotlink.prototype.send_joysticks = function() {
	// send joystick data here

	/*
		var packetSize = 16;
		var bytearray = new Uint8Array(packetSize);

	    for (var i=0;i<packetSize;++i) {
	        bytearray[i] = canvaspixelarray[i];
	    }

    	this.xmit(bytearray.buffer);
	*/

	// TEMPORARY
	// this.xmit("h");
}

robotlink.prototype.xmit = function(frame) {
    try {
    	// increment tx count
    	this.tx_count++;

    	// transmit the frame or message to the robot
		this.socket.send(frame);

		var bytearray = new Uint8Array(frame);

    	var myString = "";

	    for (var i = 0; i < bytearray.length-1; i++) {
			myString += bytearray[i].toString() + "::";
		}
		myString += bytearray[bytearray.length-1].toString();

		this.debug("TX: " + myString);

		return true;
	} catch(exception) {
		this.debug("Transmit failure.");
		return false;
	}
};

robotlink.prototype.socket_on_open = function(link) {
	link.is_connected = true;
	link.debug("Socket opened.");

	// setup the timer to keep data supplied to the robot
	function callTx() { link.robot_tx(); }
	link.tx_timer = setInterval(callTx, link.xmit_rate);
}

robotlink.prototype.socket_on_message = function(link, frame) {
	link.rx_count++;

	if (frame.data instanceof ArrayBuffer) {
		var bytearray = new Uint8Array(frame.data);

		var myString = "";

		for (var i = 0; i < bytearray.length-1; i++) {
			myString += bytearray[i].toString() + "::";
		}
		myString += bytearray[bytearray.length-1].toString();

		link.debug("RX: " + myString);
	}
}

robotlink.prototype.disconnect = function() {
	this.socket.disconnect();
	this.disable();
	this.socket = null;
	this.is_connected = false;

	if (this.tx_timer != null) {
		clearInterval(this.tx_timer);
		this.tx_timer = null;
	}

	this.debug("Socket closed.");
	this.rx_count = 0;
	this.tx_count = 0;
}

document.addEventListener('DOMContentLoaded', function () {
  	var rolink = new robotlink();
  	rolink.connect();
});