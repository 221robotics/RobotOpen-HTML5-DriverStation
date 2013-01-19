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

          joy1.create({alias: 'Left Stick Horizontal', axis: true, gamepad-index: 0, bundle-index: 0});
          joy1.create({alias: 'Left Stick Vertical', axis: true, gamepad-index: 1, bundle-index: 1});
          joy1.create({alias: 'Right Stick Horizontal', axis: true, gamepad-index: 2, bundle-index: 2});
          joy1.create({alias: 'Right Stick Vertical', axis: true, gamepad-index: 3, bundle-index: 3});

          joy1.create({alias: 'A Button', axis: false, gamepad-index: 0, bundle-index: 4});
          joy1.create({alias: 'B Button', axis: false, gamepad-index: 1, bundle-index: 5});
          joy1.create({alias: 'X Button', axis: false, gamepad-index: 2, bundle-index: 6});
          joy1.create({alias: 'Y Button', axis: false, gamepad-index: 3, bundle-index: 7});
          joy1.create({alias: 'Left Shoulder', axis: false, gamepad-index: 4, bundle-index: 8});
          joy1.create({alias: 'Right Shoulder', axis: false, gamepad-index: 5, bundle-index: 9});
          joy1.create({alias: 'Left Trigger', axis: false, gamepad-index: 6, bundle-index: 10});
          joy1.create({alias: 'Right Trigger', axis: false, gamepad-index: 7, bundle-index: 11});
          joy1.create({alias: 'Select', axis: false, gamepad-index: 8, bundle-index: 12});
          joy1.create({alias: 'Start', axis: false, gamepad-index: 9, bundle-index: 13});
          joy1.create({alias: 'Left Stick Button', axis: false, gamepad-index: 10, bundle-index: 14});
          joy1.create({alias: 'Right Stick Button', axis: false, gamepad-index: 11, bundle-index: 15});
          joy1.create({alias: 'D-Pad Up', axis: false, gamepad-index: 12, bundle-index: 16});
          joy1.create({alias: 'D-Pad Down', axis: false, gamepad-index: 13, bundle-index: 17});
          joy1.create({alias: 'D-Pad Left', axis: false, gamepad-index: 14, bundle-index: 18});
          joy1.create({alias: 'D-Pad Right', axis: false, gamepad-index: 15, bundle-index: 19});
          joy1.create({alias: 'Aux One', axis: false, gamepad-index: 16, bundle-index: 20});
          joy1.create({alias: 'Aux Two', axis: false, gamepad-index: 17, bundle-index: 21});
          joy1.create({alias: 'Aux Three', axis: false, gamepad-index: 18, bundle-index: 22});
          joy1.create({alias: 'Aux Four', axis: false, gamepad-index: 19, bundle-index: 23});

        */

        // update number of connected joysticks
        if (gamepads) {
          this.numJoysticks = gamepads.length;
          for (var i=0;i<this.callbacks.length;i++) { 
            this.callbacks[i].handleJoyCountChange(gamepads.length);
          }
        } else {
          this.numJoysticks = 0;
          for (var i=0;i<this.callbacks.length;i++) { 
            this.callbacks[i].handleJoyCountChange(0);
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