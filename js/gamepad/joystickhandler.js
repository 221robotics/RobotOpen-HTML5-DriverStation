define([
  'jquery',
  'collections/controller',
  'views/joylabels'
], function($, ControllerCollection, joylabels){
  return {
      callbacks: [],

      // print debug statements to console
      debugging: false,

      joy1_controller: new ControllerCollection([], {localIdentifier: 'joy1'}),
      joy2_controller: new ControllerCollection([], {localIdentifier: 'joy2'}),
      joy3_controller: new ControllerCollection([], {localIdentifier: 'joy3'}),
      joy4_controller: new ControllerCollection([], {localIdentifier: 'joy4'}),

      joy1_mapped: false,
      joy2_mapped: false,
      joy3_mapped: false,
      joy4_mapped: false,

      unique_joy_mapping: {},

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

        // keep track of all joysticks currently mapped so we know if anything has been removed
        var remainingJoys = [];
        for (var key in this.unique_joy_mapping) {
          remainingJoys.push(key);
        }

        for (var i=0; i<gamepads.length; i++) {
          if (gamepads[i].index in this.unique_joy_mapping) {
            // we've seen this gamepad before
            remainingJoys.splice(remainingJoys.indexOf(gamepads[i].index), 1);
          } else {
            // new gamepad!!
            if (!joy1_mapped) {
              joy1_mapped = true;
              this.unique_joy_mapping[gamepads[i].index] = 1;
              joylabels.joyMapped(1);
            } else if (!joy2_mapped) {
              joy2_mapped = true;
              this.unique_joy_mapping[gamepads[i].index] = 2;
              joylabels.joyMapped(2);
            } else if (!joy3_mapped) {
              joy3_mapped = true;
              this.unique_joy_mapping[gamepads[i].index] = 3;
              joylabels.joyMapped(3);
            } else if (!joy4_mapped) {
              joy4_mapped = true;
              this.unique_joy_mapping[gamepads[i].index] = 4;
              joylabels.joyMapped(4);
            } // else we're all filled up, ignore for now
          }
        }

        // check to see if any joysticks have been removed
        for (var i=0; i<remainingJoys.length; i++) {
          // anything in here has just been disconnected!
          if (this.unique_joy_mapping[remainingJoys[i]] == 1 && joy1_mapped) {
            // joystick 1 has been disconnected
            joy1_mapped = false;
            for (var i=0;i<this.callbacks.length;i++) { 
              this.callbacks[i].resetJoy(1);
            }
            joylabels.joyUnmapped(1);
          } else if (this.unique_joy_mapping[remainingJoys[i]] == 2 && joy2_mapped) {
            // joystick 2 has been disconnected
            joy2_mapped = false;
            for (var i=0;i<this.callbacks.length;i++) { 
              this.callbacks[i].resetJoy(2);
            }
            joylabels.joyUnmapped(2);
          } else if (this.unique_joy_mapping[remainingJoys[i]] == 3 && joy3_mapped) {
            // joystick 3 has been disconnected
            joy3_mapped = false;
            for (var i=0;i<this.callbacks.length;i++) { 
              this.callbacks[i].resetJoy(3);
            }
            joylabels.joyUnmapped(3);
          } else if (this.unique_joy_mapping[remainingJoys[i]] == 4 && joy4_mapped) {
            // joystick 4 has been disconnected
            joy4_mapped = false;
            for (var i=0;i<this.callbacks.length;i++) { 
              this.callbacks[i].resetJoy(4);
            }
            joylabels.joyUnmapped(4);
          }
        }

        // let our callbacks know how many joysticks are connected
        for (var i=0;i<this.callbacks.length;i++) { 
          this.callbacks[i].handleJoyCountChange(gamepads.length);
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