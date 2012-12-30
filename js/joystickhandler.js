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

      dPadUp: false,
      dPadRight: false,
      dPadDown: false,
      dPadLeft: false,

      dPadVals: {'up':0x3F, 'upLeft':0x1F, 'upRight':0x5F, 'down':0xBF, 'downLeft':0xDF, 'downRight':0x9F, 'left':0xFF, 'right':0x7F},

      /**
       * Tell the user the browser doesn’t support Gamepad API.
       */
      showNotSupported: function() {
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
      updateButton: function(value, gamepadId, id) {

        if (gamepadId == 'button-dpad-top') {
          if (value == 1)
            this.dPadUp = true;
          else
            this.dPadUp = false;
        }
        else if (gamepadId == 'button-dpad-bottom') {
          if (value == 1)
            this.dPadDown = true;
          else
            this.dPadDown = false;
        }
        else if (gamepadId == 'button-dpad-left') {
          if (value == 1)
            this.dPadLeft = true;
          else
            this.dPadLeft = false;
        }
        else if (gamepadId == 'button-dpad-right') {
          if (value == 1)
            this.dPadRight = true;
          else
            this.dPadRight = false;
        }

        if (gamepadId == 'button-dpad-top' || gamepadId == 'button-dpad-bottom' || gamepadId == 'button-dpad-left' || gamepadId == 'button-dpad-right') {
          // dpad update
          if (this.dPadUp && this.dPadLeft)
            this.updateCallbacks(gamepadId, 'button-dpad', this.dPadVals.upLeft);
          else if (this.dPadUp && this.dPadRight)
            this.updateCallbacks(gamepadId, 'button-dpad', this.dPadVals.upRight);
          else if (this.dPadRight && this.dPadDown)
            this.updateCallbacks(gamepadId, 'button-dpad', this.dPadVals.downRight);
          else if (this.dPadLeft && this.dPadDown)
            this.updateCallbacks(gamepadId, 'button-dpad', this.dPadVals.downLeft);
          else if (this.dPadUp)
            this.updateCallbacks(gamepadId, 'button-dpad', this.dPadVals.up);
          else if (this.dPadRight)
            this.updateCallbacks(gamepadId, 'button-dpad', this.dPadVals.right);
          else if (this.dPadDown)
            this.updateCallbacks(gamepadId, 'button-dpad', this.dPadVals.down);
          else if (this.dPadLeft)
            this.updateCallbacks(gamepadId, 'button-dpad', this.dPadVals.left);
        } else {
          // standard update
          this.updateCallbacks(gamepadId, id, Math.floor(value*255));
        }

      },

      /**
       * Update a given analogue stick
       */
      updateAxis: function(value, gamepadId, labelId, stickId, horizontal) {

        var adjustedVal;

        if (value > .05)
          adjustedVal = Math.floor((value*127) + 127);
        else if (value < -.05)
          adjustedVal = Math.floor(127 - (value*127*-1));
        else
          adjustedVal = 127;

        for (var i=0;i<this.callbacks.length;i++) { 
          this.callbacks[i](gamepadId, labelId, adjustedVal);
        }

      }
  };
});