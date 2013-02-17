define([
  'jquery',
  'views/controller',
  'views/joylabels'
], function($, ControllerView, joylabels){
  return {
      callbacks: [],

      // print debug statements to console
      debugging: false,

      joy1_view: new ControllerView({localIdentifier: 'joy1'}),
      joy2_view: new ControllerView({localIdentifier: 'joy2'}),
      joy3_view: new ControllerView({localIdentifier: 'joy3'}),
      joy4_view: new ControllerView({localIdentifier: 'joy4'}),

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
        // reset the component cache
        this.componentCache = {};

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
            if (!this.joy1_mapped) {
              this.joy1_mapped = true;
              this.unique_joy_mapping[gamepads[i].index] = 1;
              $("#joy1name").html(gamepads[i].id);
              joylabels.joyMapped(1);
            } else if (!this.joy2_mapped) {
              this.joy2_mapped = true;
              this.unique_joy_mapping[gamepads[i].index] = 2;
              $("#joy2name").html(gamepads[i].id);
              joylabels.joyMapped(2);
            } else if (!this.joy3_mapped) {
              this.joy3_mapped = true;
              this.unique_joy_mapping[gamepads[i].index] = 3;
              $("#joy3name").html(gamepads[i].id);
              joylabels.joyMapped(3);
            } else if (!this.joy4_mapped) {
              this.joy4_mapped = true;
              this.unique_joy_mapping[gamepads[i].index] = 4;
              $("#joy4name").html(gamepads[i].id);
              joylabels.joyMapped(4);
            } // else we're all filled up, ignore for now
          }
        }

        // check to see if any joysticks have been removed
        for (var i=0; i<remainingJoys.length; i++) {
          // anything in here has just been disconnected!
          if (this.unique_joy_mapping[remainingJoys[i]] == 1 && this.joy1_mapped) {
            // joystick 1 has been disconnected
            this.joy1_mapped = false;
            $("#joy1name").html('Not Mapped');
            for (var i=0;i<this.callbacks.length;i++) { 
              this.callbacks[i].resetJoy(1);
            }
            joylabels.joyUnmapped(1);
          } else if (this.unique_joy_mapping[remainingJoys[i]] == 2 && this.joy2_mapped) {
            // joystick 2 has been disconnected
            this.joy2_mapped = false;
            $("#joy2name").html('Not Mapped');
            for (var i=0;i<this.callbacks.length;i++) { 
              this.callbacks[i].resetJoy(2);
            }
            joylabels.joyUnmapped(2);
          } else if (this.unique_joy_mapping[remainingJoys[i]] == 3 && this.joy3_mapped) {
            // joystick 3 has been disconnected
            this.joy3_mapped = false;
            $("#joy3name").html('Not Mapped');
            for (var i=0;i<this.callbacks.length;i++) { 
              this.callbacks[i].resetJoy(3);
            }
            joylabels.joyUnmapped(3);
          } else if (this.unique_joy_mapping[remainingJoys[i]] == 4 && this.joy4_mapped) {
            // joystick 4 has been disconnected
            this.joy4_mapped = false;
            $("#joy4name").html('Not Mapped');
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
      updateComponent: function(value, chromeIndex, axis, id) {

        // generate a key to identify the gamepad index and component ID
        if (axis)
          var key = chromeIndex + ':a:' + id;
        else
          var key = chromeIndex + ':b:' + id;

        var ref = this;

        // check if this value has changed since the last update
        if (this.componentCache[key] != value) {
          // look up the mapping info and translate from gamepad IDs to robotlink indexes
          if (chromeIndex in this.unique_joy_mapping) {
            var mappedJoyIndex = this.unique_joy_mapping[chromeIndex];

            if (mappedJoyIndex == 1) {
              _(this.joy1_view.collection.models).each(function(item){
                if (!axis || (value > 190 || value < 63))
                  ref.joy1_view.buttonUpdate(axis, id);
                if (item.get('gamepadIndex') == id && item.get('axis') == axis) {
                  // we have a match!
                  for (var i=0;i<ref.callbacks.length;i++) {
                    ref.callbacks[i].handleJoyData(1, item.get('bundleIndex'), value);
                  }
                }
              });
            } else if (mappedJoyIndex == 2) {
              _(this.joy2_view.collection.models).each(function(item){
                if (!axis || (value > 190 || value < 63))
                  ref.joy2_view.buttonUpdate(axis, id);
                if (item.get('gamepadIndex') == id && item.get('axis') == axis) {
                  // we have a match!
                  for (var i=0;i<ref.callbacks.length;i++) {
                    ref.callbacks[i].handleJoyData(2, item.get('bundleIndex'), value);
                  }
                }
              });
            } else if (mappedJoyIndex == 3) {
              _(this.joy3_view.collection.models).each(function(item){
                if (!axis || (value > 190 || value < 63))
                  ref.joy3_view.buttonUpdate(axis, id);
                if (item.get('gamepadIndex') == id && item.get('axis') == axis) {
                  // we have a match!
                  for (var i=0;i<ref.callbacks.length;i++) {
                    ref.callbacks[i].handleJoyData(3, item.get('bundleIndex'), value);
                  }
                }
              });
            } else if (mappedJoyIndex == 4) {
              _(this.joy4_view.collection.models).each(function(item){
                if (!axis || (value > 190 || value < 63))
                  ref.joy4_view.buttonUpdate(axis, id);
                if (item.get('gamepadIndex') == id && item.get('axis') == axis) {
                  // we have a match!
                  for (var i=0;i<ref.callbacks.length;i++) {
                    ref.callbacks[i].handleJoyData(4, item.get('bundleIndex'), value);
                  }
                }
              });
            }
          }

          // the component did change, cache it
          this.componentCache[key] = value;
        }

      }
  };
});