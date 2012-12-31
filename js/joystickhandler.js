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
            this.callbacks[i](-1, 'num-gamepads', gamepads.length);
          }
        }
        else {
          this.numJoysticks = 0;
        }

        if (!padsConnected) {
          $("#no-gamepads-connected").show();
          for (var i=0;i<this.callbacks.length;i++) { 
            this.callbacks[i](-1, 'num-gamepads', 0);
          }
        }
      },

      updateCallbacks: function(index, id, value) {
        for (var i=0;i<this.callbacks.length;i++) { 
          this.callbacks[i](index, id, value);
        }
      },

      /**
       * Update a given button on the screen.
       */
      updateComponent: function(value, gamepadId, id) {

        // Send update to all subscribers
        for (var i=0;i<this.callbacks.length;i++) { 
          this.callbacks[i](gamepadId, id, value);
        }

      }
  };
});