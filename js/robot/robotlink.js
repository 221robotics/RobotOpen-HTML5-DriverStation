/* robotlink.js - robotopen main comm code */
/* @author Eric Barch (ericb@ericbarch.com) */


define([
  'jquery',
  'robot/packetparser',
  'views/console',
  'robot/average',
  'utils',
  'views/charts',
  'views/bundle'
], function($, packetparser, consoleview, Average, utils, charts, BundleView){
    var instance;

    // Start with the constructor
    function RobotLink(ip, port) {
      instance = this;

      // setup ip address and port
      if (ip == null)
        instance.ip = "10.0.0.22";
      else
        instance.ip = ip;

      if (port == null)
        instance.port = 22211;
      else
        instance.port = 22211;

      instance.bundleView = new BundleView();

      // rolling average to make data less jumpy
      instance.av = new Average(50);

      instance.lastPacket = 0;

      instance.lastChart = 0;

      // the UDP socket connection to the robot
      instance.socket = null;
      // is the robot currently enabled?
      instance.enabled = false;
      // storage for the interval timer to send data to the robot
      instance.tx_timer = null;
      // is the websocket connection to the robot active?
      instance.is_connected = false;
      // debug to console
      instance.debugging = false;
      // keep track of the packets sent and received this session
      instance.rx_count = 0;
      instance.tx_count = 0;
      // data xmit rate (ms)
      instance.xmit_rate = 100;

      // joystick count
      instance.joy_count = 0;

      // how we update the status model
      instance.statModel = null;

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

    RobotLink.prototype.setStatModel = function(sModel) {
      instance.statModel = sModel;
    };

    RobotLink.prototype.handleJoyData = function(index, id, value) {
      // parse out data
      instance.debug('JOY: '+ index + "--" + id + "--" + value);

      // TODO: handle gamepad mapping here
      if (index == 0) {
        if (id == 'a0') {
          instance.joy1[0] = value;
        }
        else if (id == 'a1') {
          instance.joy1[1] = 255 - value;
        }
        else if (id == 'a2') {
          instance.joy1[2] = value;
        }
        else if (id == 'a3') {
          instance.joy1[3] = 255 - value;
        }
        else if (id == 'b0') {
          instance.joy1[4] = value;
        }
        else if (id == 'b1') {
          instance.joy1[5] = value;
        }
        else if (id == 'b2') {
          instance.joy1[6] = value;
        }
        else if (id == 'b3') {
          instance.joy1[7] = value;
        }
        else if (id == 'b4') {
          instance.joy1[8] = value;
        }
        else if (id == 'b5') {
          instance.joy1[9] = value;
        }
        else if (id == 'b6') {
          instance.joy1[10] = value;
        }
        else if (id == 'b7') {
          instance.joy1[11] = value;
        }
        else if (id == 'b8') {
          instance.joy1[12] = value;
        }
        else if (id == 'b9') {
          instance.joy1[13] = value;
        }
        else if (id == 'b10') {
          instance.joy1[14] = value;
        }
        else if (id == 'b11') {
          instance.joy1[15] = value;
        }
        else if (id == 'b12') {
          instance.joy1[16] = value;
        }
        else if (id == 'b13') {
          instance.joy1[17] = value;
        }
        else if (id == 'b14') {
          instance.joy1[18] = value;
        }
        else if (id == 'b15') {
          instance.joy1[19] = value;
        }
          
      }

      if (id.indexOf('num-gamepads') != -1) {
        instance.joy_count = value;
      }
    };

    RobotLink.prototype.enable = function() {
      // enable the robot
      if (instance.is_connected) {
        instance.enabled = true;
        instance.statModel.set({enabled: true});
      }
    };

    RobotLink.prototype.disable = function() {
      // disable the robot
      instance.enabled = false;
      instance.statModel.set({enabled: false});
    };

    RobotLink.prototype.connect = function() {
        try {
          instance.socket = new chromeNetworking.clients.udp.roClient();

          // pass the robotlink instance to the socket object
          var t = this;
        
        instance.socket.connect(instance.ip, instance.port,
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
        instance.statModel.set({connectionEnd: new Date()});
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
      var bytearray = new Uint8Array(27);
      bytearray[0] = 99;  // 'c'
      for (var i = 0; i < 24; i++) {
        bytearray[i+1] = instance.joy1[i];
      }
      var crcDec = utils.crc16(bytearray, 25);

      bytearray[25] = (crcDec >> 8) & 0xFF;
      bytearray[26] = crcDec & 0xFF;

      instance.xmit(bytearray.buffer);
    };

    RobotLink.prototype.xmit = function(frame) {
        try {
          // increment tx count
          instance.tx_count++;
          instance.statModel.set({packetTx: instance.tx_count});

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
      instance.bundleView.clearAll();
      instance.statModel.set({connected: true});
      instance.statModel.set({connectionStart: new Date(), connectionEnd: new Date()});
      instance.lastPacket = new Date().getTime();
      link.is_connected = true;
      link.debug("Socket opened.");

      // setup the timer to keep data supplied to the robot
      function callTx() { link.robot_tx(); }
      link.tx_timer = setInterval(callTx, link.xmit_rate);
    };

    RobotLink.prototype.socket_on_message = function(link, frame) {
      link.rx_count++;

      // average latency
      var now = new Date().getTime();
      instance.av.add(now - instance.lastPacket);

      // update the latency chart every second
      if (now - instance.lastChart > 1000) {
        charts.addPoint(Math.round(now - instance.lastPacket));
        instance.lastChart = now;
      }
      
      instance.lastPacket = now;
      instance.statModel.set({packetRx: instance.rx_count, averageLatency: instance.av.getAverage()});

      if (frame.data instanceof ArrayBuffer) {
        var bytearray = new Uint8Array(frame.data);

        switch (String.fromCharCode(bytearray[0])) {
          case 'p':
            // feed the parsed packet to the console view
            consoleview.log(packetparser.parsePrint(bytearray));
            break;
          case 'd':
            instance.bundleView.updateBundles(packetparser.parseDS(frame.data));
            break;
          case 's':
            link.debug('GOT STATUS PACKET');
            break;
          case 'r':
            link.debug('GOT PARAMETER PACKET');
            break;
          default:
            break;
        }

        var myString = "";

        for (var i = 0; i < bytearray.length-1; i++) {
          myString += bytearray[i].toString(16) + " ";
        }
        myString += bytearray[bytearray.length-1].toString(16);

        instance.debug("RX: " + myString);
      }
    };

    RobotLink.prototype.disconnect = function() {
      instance.statModel.set({connected: false});
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

    // return the constructor
    return RobotLink;
});