function robotlink (ip, port) {
	// setup ip address and port
	if (ip == null) {
    	this.ip = "10.0.0.22";
  	} else {
  		this.ip = ip;
  	}
  	if (port == null) {
    	this.port = "8000";
  	} else {
  		this.port = port;
  	}

  	// the websocket connection to the robot
  	this.websocket = null;
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
    	// setup the websocket connection with the defined IP and port - must use subprotocol ro1 to connect
		this.websocket = new WebSocket("ws://" + this.ip + ":" + port, "ro1");
		// make sure any binary data we receive from the robot is in arraybuffer format
		this.websocket.binaryType = "arraybuffer";

		// glue to connect websocket to robotlink
		this.websocket.robotlink = this;

		// bindings between websocket events and robotlink functions
		this.websocket.onopen = function() {
		    this.robotlink.socket_on_open();
		};
		
		this.websocket.onclose = function() {
		    this.robotlink.socket_on_close();
		};

		this.websocket.onmessage = function(frame) {
		    this.robotlink.socket_on_message(frame);
		};

		this.websocket.onerror = function(error) {
		    this.robotlink.socket_on_error(error);
		};

		return true;
	} catch(exception) {
		this.debug("Could not create websocket.");
		return false;
	}
};

robotlink.prototype.robot_tx = function() {
	// when the robot is disabled we must sent heartbeat frames to keep the connection alive
	if (!this.enabled)
		this.xmit("h");
	else // otherwise send joystick data
		this.send_joysticks();
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
}

robotlink.prototype.xmit = function(frame) {
    try {
    	// increment tx count
    	this.tx_count++;

    	// transmit the frame or message to the robot
		this.websocket.send(frame);

		return true;
	} catch(exception) {
		this.debug("Transmit failure.");
		return false;
	}
};

robotlink.prototype.socket_on_open = function() {
	this.is_connected = true;
	this.debug("Websocket opened.");

	// setup the timer to keep data supplied to the robot
	this.tx_timer = setInterval(robotlink.robot_tx, 40);
}

robotlink.prototype.socket_on_close = function() {
	this.websocket = null;
	this.disable();
	this.is_connected = false;
	this.debug("Websocket closed.");
	this.rx_count = 0;
	this.tx_count = 0;

	if (this.tx_timer != null) {
		clearInterval(this.tx_timer);
		this.tx_timer = null;
	}

	this.debug("Attempting reconnect...");
	setTimeout(function(){
		robotlink.connect();
	}, 1000);
}

robotlink.prototype.socket_on_message = function(frame) {
	this.rx_count++;

	if (frame.data instanceof ArrayBuffer) {
		var bytearray = new Uint8Array(frame.data);

		var myString = "";

		for (var i = 0; i < bytearray.length; i++) {
			myString += bytearray[i].toString() + "::";
		}

		this.debug("GOT ARRAY BUFFER FRAME " + myString);
	}
	else {
		this.debug("GOT TEXT FRAME: " + frame.data);
	}
}

robotlink.prototype.socket_on_error = function(error) {
	this.debug("Websocket Error! " + error);
	this.disable();
}

robotlink.prototype.disconnect = function() {
	this.websocket.close();
	this.disable();
	this.websocket = null;
	this.is_connected = false;

	if (this.tx_timer != null) {
		clearInterval(this.tx_timer);
		this.tx_timer = null;
	}

	this.debug("Websocket closed.");
	this.rx_count = 0;
	this.tx_count = 0;
}