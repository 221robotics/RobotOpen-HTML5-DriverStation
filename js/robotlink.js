/* robotlink.js - robotopen main comm code */
/* @author Eric Barch (ericb@ericbarch.com) */


define([
  'jquery',
], function($){
    var instance;

    // Start with the constructor
    function RobotLink(ip) {
      instance = this;

      // setup ip address and port
      if (ip == null) {
        instance.ip = "10.0.0.22";
      } else {
        instance.ip = ip;
      }

      // the UDP socket connection to the robot
      instance.socket = null;
      // is the robot currently enabled?
      instance.enabled = false;
      // storage for the interval timer to send data to the robot
      instance.tx_timer = null;
      // is the websocket connection to the robot active?
      instance.is_connected = false;
      // debug to console
      instance.debugging = true;
      // keep track of the packets sent and received this session
      instance.rx_count = 0;
      instance.tx_count = 0;
      // data xmit rate (ms)
      instance.xmit_rate = 100;

      // joystick count
      instance.joy_count = 0;

      instance.joy1 = new Array(
        127,  // Analog Left X Axis
        127,  // Analog Left Y Axis
        127,  // Analog Right X Axis
        127,  // Analog Right Y Axis
        0,    // Button A
        0,    // Button B
        0,    // Button X
        0,    // Button Y
        0,    // Left Shoulder
        0,    // Right Shoulder
        0,    // Left Trigger
        0,    // Right Trigger
        0,    // Select
        0,    // Start
        0,    // Left Stick Button
        0,    // Right Stick Button
        0,    // Up
        0,    // Down
        0,    // Left
        0,    // Right
        0,    // Aux
        0,    // Aux
        0,    // Aux
        0     // Aux
      );
    };

    RobotLink.prototype.debug = function(msg) {
      // if debugging is enabled, push messages to the console
      if(instance.debugging == true) {
        console.log("[RobotLink] " + msg);
      }
    };

    RobotLink.prototype.handleJoyData = function(index, id, value) {
      // parse out data
      // instance.debug(index + "--" + id + "--" + value);

      if (index == 0) {
        if (id == 'stick-left-axis-x') {
          instance.joy1[0] = value;
        }
        else if (id == 'stick-left-axis-y') {
          instance.joy1[1] = 255 - value;
        }
        else if (id == 'stick-right-axis-x') {
          instance.joy1[2] = value;
        }
        else if (id == 'stick-right-axis-y') {
          instance.joy1[3] = 255 - value;
        }
        else if (id == 'button-a') {
          instance.joy1[4] = value;
        }
        else if (id == 'button-b') {
          instance.joy1[5] = value;
        }
        else if (id == 'button-x') {
          instance.joy1[6] = value;
        }
        else if (id == 'button-y') {
          instance.joy1[7] = value;
        }
        else if (id == 'button-left-shoulder') {
          instance.joy1[8] = value;
        }
        else if (id == 'button-right-shoulder') {
          instance.joy1[9] = value;
        }
        else if (id == 'button-left-trigger') {
          instance.joy1[10] = value;
        }
        else if (id == 'button-right-trigger') {
          instance.joy1[11] = value;
        }
        else if (id == 'button-select') {
          instance.joy1[12] = value;
        }
        else if (id == 'button-start') {
          instance.joy1[13] = value;
        }
        else if (id == 'button-left-stick') {
          instance.joy1[14] = value;
        }
        else if (id == 'button-right-stick') {
          instance.joy1[15] = value;
        }
        else if (id == 'button-dpad-up') {
          instance.joy1[16] = value;
        }
        else if (id == 'button-dpad-down') {
          instance.joy1[17] = value;
        }
        else if (id == 'button-dpad-left') {
          instance.joy1[18] = value;
        }
        else if (id == 'button-dpad-right') {
          instance.joy1[19] = value;
        }
          
      }

      if (id.indexOf('num-gamepads') != -1) {
        instance.joy_count = value;
        console.log("joy_count: " + value);
      }
    };

    RobotLink.prototype.enable = function() {
      // enable the robot
      instance.enabled = true;
    };

    RobotLink.prototype.disable = function() {
      // disable the robot
      instance.enabled = false;
    };

    RobotLink.prototype.connect = function() {
        try {
          instance.socket = new chromeNetworking.clients.udp.roClient();

          // pass the robotlink instance to the socket object
          var t = this;
        
        instance.socket.connect(instance.ip,
          function() {
              t.socket_on_open(t);
          }
        );

        instance.socket.receive(function(frame) {
            t.socket_on_message(t, frame);
        });

        return true;

      } catch(exception) {
        instance.debug("Could not create socket.");
        return false;
      }
    };

    RobotLink.prototype.robot_tx = function() {
      if (instance.is_connected) {
        // when the robot is disabled we must sent heartbeat frames to keep the connection alive
        if (!instance.enabled || instance.joy_count < 1) {
          var buf = new ArrayBuffer(3); // 2 bytes for each char
            var bufView = new Uint8Array(buf);
            bufView[0] = 104; // h
            bufView[1] = 238; // 0xEE
            bufView[2] = 1;   // 0x01
          instance.xmit(buf);
        }
        else { // otherwise send joystick data
          instance.send_joysticks();
        }
      }
    };

    RobotLink.prototype.send_joysticks = function() {
      // send joystick data here
      var bytearray = new Uint8Array(21);
      bytearray[0] = 99;  // 'c'
      for (var i = 0; i < 18; i++) {
        bytearray[i+1] = instance.joy1[i];
      }
      var crcDec = crc16(bytearray, 19);

      bytearray[19] = (crcDec >> 8) & 0xFF;
      bytearray[20] = crcDec & 0xFF;

      instance.xmit(bytearray.buffer);
    };

    RobotLink.prototype.xmit = function(frame) {
        try {
          // increment tx count
          instance.tx_count++;

          // transmit the frame or message to the robot
        instance.socket.send(frame);

        var bytearray = new Uint8Array(frame);

          var myString = "";

          for (var i = 0; i < bytearray.length-1; i++) {
          myString += bytearray[i].toString(16) + " ";
        }
        myString += bytearray[bytearray.length-1].toString(16);

        instance.debug("TX: " + myString);

        return true;
      } catch(exception) {
        instance.debug("Transmit failure.");
        return false;
      }
    };

    RobotLink.prototype.socket_on_open = function(link) {
      link.is_connected = true;
      link.debug("Socket opened.");

      // setup the timer to keep data supplied to the robot
      function callTx() { link.robot_tx(); }
      link.tx_timer = setInterval(callTx, link.xmit_rate);
    };

    RobotLink.prototype.socket_on_message = function(link, frame) {
      link.rx_count++;

      if (frame.data instanceof ArrayBuffer) {
        var bytearray = new Uint8Array(frame.data);

        var myString = "";

        for (var i = 0; i < bytearray.length-1; i++) {
          myString += bytearray[i].toString(16) + " ";
        }
        myString += bytearray[bytearray.length-1].toString(16);

        link.debug("RX: " + myString);
      }
    };

    RobotLink.prototype.disconnect = function() {
      instance.socket.disconnect();
      instance.disable();
      instance.socket = null;
      instance.is_connected = false;

      if (instance.tx_timer != null) {
        clearInterval(instance.tx_timer);
        instance.tx_timer = null;
      }

      instance.debug("Socket closed.");
      instance.rx_count = 0;
      instance.tx_count = 0;
    };

    var crctab = new Array(
        0x0000, 0xC0C1, 0xC181, 0x0140, 0xC301, 0x03C0, 0x0280, 0xC241,
        0xC601, 0x06C0, 0x0780, 0xC741, 0x0500, 0xC5C1, 0xC481, 0x0440,
        0xCC01, 0x0CC0, 0x0D80, 0xCD41, 0x0F00, 0xCFC1, 0xCE81, 0x0E40,
        0x0A00, 0xCAC1, 0xCB81, 0x0B40, 0xC901, 0x09C0, 0x0880, 0xC841,
        0xD801, 0x18C0, 0x1980, 0xD941, 0x1B00, 0xDBC1, 0xDA81, 0x1A40,
        0x1E00, 0xDEC1, 0xDF81, 0x1F40, 0xDD01, 0x1DC0, 0x1C80, 0xDC41,
        0x1400, 0xD4C1, 0xD581, 0x1540, 0xD701, 0x17C0, 0x1680, 0xD641,
        0xD201, 0x12C0, 0x1380, 0xD341, 0x1100, 0xD1C1, 0xD081, 0x1040,
        0xF001, 0x30C0, 0x3180, 0xF141, 0x3300, 0xF3C1, 0xF281, 0x3240,
        0x3600, 0xF6C1, 0xF781, 0x3740, 0xF501, 0x35C0, 0x3480, 0xF441,
        0x3C00, 0xFCC1, 0xFD81, 0x3D40, 0xFF01, 0x3FC0, 0x3E80, 0xFE41,
        0xFA01, 0x3AC0, 0x3B80, 0xFB41, 0x3900, 0xF9C1, 0xF881, 0x3840,
        0x2800, 0xE8C1, 0xE981, 0x2940, 0xEB01, 0x2BC0, 0x2A80, 0xEA41,
        0xEE01, 0x2EC0, 0x2F80, 0xEF41, 0x2D00, 0xEDC1, 0xEC81, 0x2C40,
        0xE401, 0x24C0, 0x2580, 0xE541, 0x2700, 0xE7C1, 0xE681, 0x2640,
        0x2200, 0xE2C1, 0xE381, 0x2340, 0xE101, 0x21C0, 0x2080, 0xE041,
        0xA001, 0x60C0, 0x6180, 0xA141, 0x6300, 0xA3C1, 0xA281, 0x6240,
        0x6600, 0xA6C1, 0xA781, 0x6740, 0xA501, 0x65C0, 0x6480, 0xA441,
        0x6C00, 0xACC1, 0xAD81, 0x6D40, 0xAF01, 0x6FC0, 0x6E80, 0xAE41,
        0xAA01, 0x6AC0, 0x6B80, 0xAB41, 0x6900, 0xA9C1, 0xA881, 0x6840,
        0x7800, 0xB8C1, 0xB981, 0x7940, 0xBB01, 0x7BC0, 0x7A80, 0xBA41,
        0xBE01, 0x7EC0, 0x7F80, 0xBF41, 0x7D00, 0xBDC1, 0xBC81, 0x7C40,
        0xB401, 0x74C0, 0x7580, 0xB541, 0x7700, 0xB7C1, 0xB681, 0x7640,
        0x7200, 0xB2C1, 0xB381, 0x7340, 0xB101, 0x71C0, 0x7080, 0xB041,
        0x5000, 0x90C1, 0x9181, 0x5140, 0x9301, 0x53C0, 0x5280, 0x9241,
        0x9601, 0x56C0, 0x5780, 0x9741, 0x5500, 0x95C1, 0x9481, 0x5440,
        0x9C01, 0x5CC0, 0x5D80, 0x9D41, 0x5F00, 0x9FC1, 0x9E81, 0x5E40,
        0x5A00, 0x9AC1, 0x9B81, 0x5B40, 0x9901, 0x59C0, 0x5880, 0x9841,
        0x8801, 0x48C0, 0x4980, 0x8941, 0x4B00, 0x8BC1, 0x8A81, 0x4A40,
        0x4E00, 0x8EC1, 0x8F81, 0x4F40, 0x8D01, 0x4DC0, 0x4C80, 0x8C41,
        0x4400, 0x84C1, 0x8581, 0x4540, 0x8701, 0x47C0, 0x4680, 0x8641,
        0x8201, 0x42C0, 0x4380, 0x8341, 0x4100, 0x81C1, 0x8081, 0x4040
    );

    function crcAdd(crc,c) {
      return crctab[(crc^c)&0xFF]^((crc>>8)&0xFF);
    };

    function crc16(arr, lengthToCheck) {
      var i, crc = 0;

      for(i = 0; i < lengthToCheck; i++)
        crc = crcAdd(crc, arr[i]);

      return crc;
    };

    // return the constructor
    return RobotLink;
});