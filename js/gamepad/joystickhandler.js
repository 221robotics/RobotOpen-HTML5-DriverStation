define([
  'jquery',
], function($){
  return {
      numJoysticks: 0,

      callbacks: [],

      init: function() {
        this.updateGamepads();
      },

      // print debug statements to console
      debugging: false,

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
            this.callbacks[i](-1, false, 'num-gamepads', gamepads.length);
          }
        }
        else {
          this.numJoysticks = 0;
        }

        if (!padsConnected) {
          for (var i=0;i<this.callbacks.length;i++) { 
            this.callbacks[i](-1, false, 'num-gamepads', 0);
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
            this.callbacks[i](gamepadId, axis, id, value);
          }

          // the component did change, cache it
          this.componentCache[key] = value;
        }

      }
  };
});