define([
  'jquery',
  'views/controller',
  'views/joylabels'
], function($, ControllerView, joylabels){
  return {
      callbacks: [],

      // print debug statements to console
      debugging: true,

      //Array to simplify, may break things
      joy_views: [
        new ControllerView({localIdentifier: 'joy1'}),
        new ControllerView({localIdentifier: 'joy2'}),
        new ControllerView({localIdentifier: 'joy3'}),
        new ControllerView({localIdentifier: 'joy4'})
      ],

      //null means unmapped, removes the additional 4 boolean variables. 
      //Array organizes the mapping, since there will only ever be 4 joysticks. 
      //This may break things as the keys are now the values and the values are the keys zero indexed. 
      joy_mapping: [null,null,null,null],

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
      
      //Allows Objects and Arrays to be logged properly
      raw_debug: function(msg) {
        if(this.debugging) {
          console.log("[JoystickHandler]");
          console.log(msg);
        }
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
        for (var key in this.joy_mapping) {
          remainingJoys.push(this.joy_mapping[key]);
        }

        for (var i=0; i<gamepads.length; i++) {
          if (this.joy_mapping.indexOf(gamepads[i].index) != -1) {
            // we've seen this gamepad before
            remainingJoys.splice(remainingJoys.indexOf(gamepads[i].index), 1);
          } else {
            // new gamepad!!
            for(var j = 0; j < this.joy_mapping.length; j++) {
              if(this.joy_mapping[j] == null) {
                this.joy_mapping[j] = gamepads[i].index;
                joylabels.joyMapped(j+1); //Array is zero index, external is one indexed
                break; //Exit Loop after finding an open Joystick
              }
            } // all filled up, ignore for now
          }
        }

        // check to see if any joysticks have been removed
        for (var i=0; i<remainingJoys.length; i++) {
          for(var j = 0; j < this.joy_mapping.length; j++) {
            // anything in here has just been disconnected!
            if (this.joy_mapping[j] == remainingJoys[i]) {
              // joystick has been disconnected
              this.joy_mapping[j] = null;
              for (var k=0;k<this.callbacks.length;k++) { 
                this.callbacks[k].resetJoy(j+1);
              }
              joylabels.joyUnmapped(j+1);
            }
          }
        }//30 to 11

        this.generateDropdowns(gamepads);

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
          if (this.joy_mapping.indexOf(chromeIndex) != -1) {
            var mappedJoyIndex = this.joy_mapping.indexOf(chromeIndex);

            _(this.joy_views[mappedJoyIndex].collection.models).each(function(item){
              if (!axis || (value > 190 || value < 63))
                ref.joy_views[mappedJoyIndex].buttonUpdate(axis, id);
              if (item.get('gamepadIndex') == id && item.get('axis') == axis) {
                // we have a match!
                item.set({value:value});
                for (var i=0;i<ref.callbacks.length;i++) {
                  ref.callbacks[i].handleJoyData(mappedJoyIndex+1, item.get('bundleIndex'), value);
                }
              }
            });//45 to 10
          }

          // the component did change, cache it
          this.componentCache[key] = value;
        }

      },

      updateAllocation: function(joystick, gamepad, gamepads) {
        //Handle Allocated Gamepad
        if(gamepad != null && this.joy_mapping.indexOf(gamepad) != -1) {
          for (var i=0;i<this.callbacks.length;i++) { 
            this.callbacks[i].resetJoy(this.joy_mapping.indexOf(gamepad)+1);
          }
          joylabels.joyUnmapped(this.joy_mapping.indexOf(gamepad)+1);
          this.joy_mapping[this.joy_mapping.indexOf(gamepad)] = null;
        }

        //Cache and Map
        var previous = this.joy_mapping[joystick-1];
        this.joy_mapping[joystick-1] = gamepad;

        //Connect previously disconnected
        if(previous == null && this.joy_mapping[joystick-1] != null) {
          joylabels.joyMapped(joystick);
        }
        //Disconnect previously connected
        if(previous != null && this.joy_mapping[joystick-1] == null) {
          for (var i=0;i<this.callbacks.length;i++) { 
            this.callbacks[i].resetJoy(joystick);
          }
          joylabels.joyUnmapped(joystick);
        }

        //Update Dropdowns
        this.generateDropdowns(gamepads);
      },

      generateDropdowns: function(gamepads) {
        //Generate Gamepad Dropdowns
        var html = ["","","",""]; //Empty Array Template
        for(var i = 0; i < html.length; i++) { //Loop through 4 Joysticks
          html[i]+= "<option  value=\"null\">Not Mapped</option>"; //Default
          for(var j = 0; j < gamepads.length; j++) { //Loop through Each Attached Gamepad
            //Add Each Attached Gamepad (Allocated or Not). Checking if it is the one currently allocated to the Joystick. 
            html[i]+= "<option "+(
              //Is the Joystick Allocated at all && Is the current Gamepad the one allocated (if so it "selects" that dropdown)
              ((this.joy_mapping[i] == gamepads[j].index))
            ? "selected=\"selected\"" : "")+" value=\""+gamepads[j].index+"\" >"+gamepads[j].id+"</option>"
          }
          $("#joystick_setup_"+(i+1)).html(html[i]);
        }
      }
  };
});