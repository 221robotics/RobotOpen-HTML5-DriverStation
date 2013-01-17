/* robotlink.js - robotopen main comm code */
/* @author Eric Barch (ericb@ericbarch.com) */


define([
  'jquery',
  'robot/packetparser',
  'views/console',
  'robot/average',
  'utils',
  'views/charts',
  'views/bundle',
  'views/buttons'
], function($, packetparser, consoleview, Average, utils, charts, BundleView, buttons){
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
      // kill the connection if we don't receive packets for this long
      instance.autodrop_timer = null;
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

    RobotLink.prototype.handleJoyData = function(index, axis, id, value) {
      /*

        var joy1 = new ControllerCollection();

        joy1.create({alias: 'Left Stick Horizontal', axis: true, index: 0, joyevent: 'stick-left-axis-x'});
        joy1.create({alias: 'Left Stick Vertical', axis: true, index: 1, joyevent: 'stick-left-axis-y'});
        joy1.create({alias: 'Right Stick Horizontal', axis: true, index: 2, joyevent: 'stick-right-axis-x'});
        joy1.create({alias: 'Right Stick Vertical', axis: true, index: 3, joyevent: 'stick-right-axis-y'});

        joy1.create({alias: 'A Button', axis: false, index: 0, joyevent: 'button-a'});
        joy1.create({alias: 'B Button', axis: false, index: 1, joyevent: 'button-b'});
        joy1.create({alias: 'X Button', axis: false, index: 2, joyevent: 'button-x'});
        joy1.create({alias: 'Y Button', axis: false, index: 3, joyevent: 'button-y'});
        joy1.create({alias: 'Left Shoulder', axis: false, index: 4, joyevent: 'button-left-shoulder'});
        joy1.create({alias: 'Right Shoulder', axis: false, index: 5, joyevent: 'button-right-shoulder'});
        joy1.create({alias: 'Left Trigger', axis: false, index: 6, joyevent: 'button-left-trigger'});
        joy1.create({alias: 'Right Trigger', axis: false, index: 7, joyevent: 'button-right-trigger'});
        joy1.create({alias: 'Select', axis: false, index: 8, joyevent: 'button-select'});
        joy1.create({alias: 'Start', axis: false, index: 9, joyevent: 'button-start'});
        joy1.create({alias: 'Left Stick Button', axis: false, index: 10, joyevent: 'button-left-stick'});
        joy1.create({alias: 'Right Stick Button', axis: false, index: 11, joyevent: 'button-right-stick'});
        joy1.create({alias: 'D-Pad Up', axis: false, index: 12, joyevent: 'button-dpad-up'});
        joy1.create({alias: 'D-Pad Down', axis: false, index: 13, joyevent: 'button-dpad-down'});
        joy1.create({alias: 'D-Pad Left', axis: false, index: 14, joyevent: 'button-dpad-left'});
        joy1.create({alias: 'D-Pad Right', axis: false, index: 15, joyevent: 'button-dpad-right'});
        joy1.create({alias: 'Aux One', axis: false, index: 16, joyevent: 'aux1'});
        joy1.create({alias: 'Aux Two', axis: false, index: 17, joyevent: 'aux2'});
        joy1.create({alias: 'Aux Three', axis: false, index: 18, joyevent: 'aux3'});
        joy1.create({alias: 'Aux Four', axis: false, index: 19, joyevent: 'aux4'});

      */

      // TODO: handle gamepad mapping here
      if (index == 0) {
        if (axis) {
          if (id == 0) {
            instance.joy1[0] = value;
          }
          else if (id == 1) {
            instance.joy1[1] = 255 - value;
          }
          else if (id == 2) {
            instance.joy1[2] = value;
          }
          else if (id == 3) {
            instance.joy1[3] = 255 - value;
          }
        } else {
          if (id == 0) {
            instance.joy1[4] = value;
          }
          else if (id == 1) {
            instance.joy1[5] = value;
          }
          else if (id == 2) {
            instance.joy1[6] = value;
          }
          else if (id == 3) {
            instance.joy1[7] = value;
          }
          else if (id == 4) {
            instance.joy1[8] = value;
          }
          else if (id == 5) {
            instance.joy1[9] = value;
          }
          else if (id == 6) {
            instance.joy1[10] = value;
          }
          else if (id == 7) {
            instance.joy1[11] = value;
          }
          else if (id == 8) {
            instance.joy1[12] = value;
          }
          else if (id == 9) {
            instance.joy1[13] = value;
          }
          else if (id == 10) {
            instance.joy1[14] = value;
          }
          else if (id == 11) {
            instance.joy1[15] = value;
          }
          else if (id == 12) {
            instance.joy1[16] = value;
          }
          else if (id == 13) {
            instance.joy1[17] = value;
          }
          else if (id == 14) {
            instance.joy1[18] = value;
          }
          else if (id == 15) {
            instance.joy1[19] = value;
          }
        }
      }

      try {
        if (id.indexOf('num-gamepads') != -1) {
          instance.joy_count = value;
        }
      } catch (err) {
        // ignore
      }
    };

    RobotLink.prototype.enable = function() {
      // enable the robot
      if (instance.is_connected) {
        buttons.enabled();
        instance.enabled = true;
        instance.statModel.set({enabled: true});
      }
    };

    RobotLink.prototype.disable = function() {
      // disable the robot
      instance.enabled = false;
      buttons.disabled();
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
      function killConnect() { 
        var now = new Date().getTime();
        if (now - instance.lastPacket > 2000) {
          instance.disconnect(); 
          clearInterval(instance.autodrop_timer); 
        }
      }
      instance.autodrop_timer = setInterval(killConnect, 1000);
      link.is_connected = true;
      instance.bundleView.clearAll();
      instance.statModel.set({connecting: true});
      instance.statModel.set({connectionStart: new Date(), connectionEnd: new Date()});
      buttons.connected();
      instance.lastPacket = new Date().getTime();
      link.debug("Socket opened.");

      // setup the timer to keep data supplied to the robot
      function callTx() { link.robot_tx(); }
      link.tx_timer = setInterval(callTx, link.xmit_rate);
    };

    RobotLink.prototype.socket_on_message = function(link, frame) {
      clearTimeout(instance.autodrop_timer);

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
      instance.statModel.set({packetRx: instance.rx_count, averageLatency: instance.av.getAverage(), connected: true, connecting: false});

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
      buttons.disconnected();
      instance.statModel.set({connected: false, connecting: false});
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