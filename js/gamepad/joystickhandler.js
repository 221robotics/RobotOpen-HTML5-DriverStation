define([
  'jquery',
  'collections/controller'
], function($, ControllerCollection){
  return {
      numJoysticks: 0,

      callbacks: [],

      init: function() {
        this.updateGamepads();
      },

      // print debug statements to console
      debugging: false,

      joy1_mapped: false,
      joy2_mapped: false,
      joy3_mapped: false,
      joy4_mapped: false,

      // keep track of components that change (lookup)
      componentCache: {},

      /**
       * Tell the user the browser doesn’t support Gamepad API.
       */
      notSupported: function() {
        // gamepad API is not supported
        $("#no-gamepad-support").show();
      },

      debug: function(msg) {
        if (this.debugging)
          console.log("[JoystickHandler] " + msg);
      },

      subscribe: function(callback) {
        this.callbacks.push(callback);
      },

      /**
       * Update the gamepads on the screen, creating new elements from the
       * template.
       */
      updateGamepads: function(gamepads) {

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

        var padsConnected = false;

        if (gamepads) {
          // update number of connected joysticks
          this.numJoysticks = gamepads.length;

          for (var i in gamepads) {
            var gamepad = gamepads[i];

            if (gamepad) {
              // gamepad.buttons (all buttons in array)
              // gamepad.axes (all axes in array)

              padsConnected = true;
            }
          }
          for (var i=0;i<this.callbacks.length;i++) { 
            this.callbacks[i].handleJoyCountChange(gamepads.length);
          }
        }
        else {
          this.numJoysticks = 0;
        }

        if (!padsConnected) {
          for (var i=0;i<this.callbacks.length;i++) { 
            this.callbacks[i].handleJoyCountChange(0);
            this.numJoysticks = 0;
          }
        }
      },

      /**
       * Update a given button on the screen.
       */
      updateComponent: function(value, gamepadId, axis, id) {

        // generate a key to identify the gamepad index and component ID
        if (axis)
          var key = gamepadId + ':a:' + id;
        else
          var key = gamepadId + ':b:' + id;

        // check if this value has changed since the last update
        if (this.componentCache[key] != value) {
          // Send update to all subscribers
          for (var i=0;i<this.callbacks.length;i++) {
            //this.callbacks[i].handleJoyData(gamepadId, id, value);
          }

          // the component did change, cache it
          this.componentCache[key] = value;
        }

      }
  };
});