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

      joy1_controller: null,
      joy2_controller: null,
      joy3_controller: null,
      joy4_controller: null,

      // store the unique identifier of the joystick
      joy1_id: null,
      joy2_id: null,
      joy3_id: null,
      joy4_id: null,

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

      initializeController: function(joyController) {
        // default axis controls
        joyController.create({alias: 'Left Stick Horizontal', axis: true, gamepadIndex: 0, bundleIndex: 0});
        joyController.create({alias: 'Left Stick Vertical', axis: true, gamepadIndex: 1, bundleIndex: 1});
        joyController.create({alias: 'Right Stick Horizontal', axis: true, gamepadIndex: 2, bundleIndex: 2});
        joyController.create({alias: 'Right Stick Vertical', axis: true, gamepadIndex: 3, bundleIndex: 3});

        // default button controls
        joyController.create({alias: 'A Button', axis: false, gamepadIndex: 0, bundleIndex: 4});
        joyController.create({alias: 'B Button', axis: false, gamepadIndex: 1, bundleIndex: 5});
        joyController.create({alias: 'X Button', axis: false, gamepadIndex: 2, bundleIndex: 6});
        joyController.create({alias: 'Y Button', axis: false, gamepadIndex: 3, bundleIndex: 7});
        joyController.create({alias: 'Left Shoulder', axis: false, gamepadIndex: 4, bundleIndex: 8});
        joyController.create({alias: 'Right Shoulder', axis: false, gamepadIndex: 5, bundleIndex: 9});
        joyController.create({alias: 'Left Trigger', axis: false, gamepadIndex: 6, bundleIndex: 10});
        joyController.create({alias: 'Right Trigger', axis: false, gamepadIndex: 7, bundleIndex: 11});
        joyController.create({alias: 'Select', axis: false, gamepadIndex: 8, bundleIndex: 12});
        joyController.create({alias: 'Start', axis: false, gamepadIndex: 9, bundleIndex: 13});
        joyController.create({alias: 'Left Stick Button', axis: false, gamepadIndex: 10, bundleIndex: 14});
        joyController.create({alias: 'Right Stick Button', axis: false, gamepadIndex: 11, bundleIndex: 15});
        joyController.create({alias: 'D-Pad Up', axis: false, gamepadIndex: 12, bundleIndex: 16});
        joyController.create({alias: 'D-Pad Down', axis: false, gamepadIndex: 13, bundleIndex: 17});
        joyController.create({alias: 'D-Pad Left', axis: false, gamepadIndex: 14, bundleIndex: 18});
        joyController.create({alias: 'D-Pad Right', axis: false, gamepadIndex: 15, bundleIndex: 19});
        joyController.create({alias: 'Aux One', axis: false, gamepadIndex: 16, bundleIndex: 20});
        joyController.create({alias: 'Aux Two', axis: false, gamepadIndex: 17, bundleIndex: 21});
        joyController.create({alias: 'Aux Three', axis: false, gamepadIndex: 18, bundleIndex: 22});
        joyController.create({alias: 'Aux Four', axis: false, gamepadIndex: 19, bundleIndex: 23});
      },

      /**
       * Update the gamepads on the screen, creating new elements from the
       * template.
       */
      updateGamepads: function(gamepads) {

        // update number of connected joysticks
        if (gamepads) {
          this.numJoysticks = gamepads.length;

          if (this.numJoysticks > 0 && !joy1_mapped) {
            joy1_controller = new ControllerCollection();
            joy1_mapped = true;
            joy1_id = gamepads[0].id;
            initializeController(joy1_controller);
          }
          if (this.numJoysticks > 1 && !joy2_mapped) {
            joy2_controller = new ControllerCollection();
            joy2_mapped = true;
            joy2_id = gamepads[1].id;
            initializeController(joy2_controller);
          }
          if (this.numJoysticks > 2 && !joy3_mapped) {
            joy3_controller = new ControllerCollection();
            joy3_mapped = true;
            joy3_id = gamepads[2].id;
            initializeController(joy3_controller);
          }
          if (this.numJoysticks > 3 && !joy4_mapped) {
            joy4_controller = new ControllerCollection();
            joy4_mapped = true;
            joy4_id = gamepads[3].id;
            initializeController(joy4_controller);
          }

          // TODO: handle disconnects

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