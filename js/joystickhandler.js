/**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author mwichary@google.com (Marcin Wichary)
 * @modified ericb@ericbarch.com (Eric Barch)
 */

var joystickHandler = {

  numJoysticks: 0,

  callbacks: [],

  init: function() {
    joystickHandler.updateGamepads();
  },

  // print debug statements to console
  debugging: false,

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
      joystickHandler.numJoysticks = gamepads.length;

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
      joystickHandler.numJoysticks = 0;
    }

    if (!padsConnected) {
      $("#no-gamepads-connected").show();
      for (var i=0;i<this.callbacks.length;i++) { 
        this.callbacks[i](-1, 'num-gamepads', 0);
      }
    }
  },

  /**
   * Update a given button on the screen.
   */
  updateButton: function(value, gamepadId, id) {

    for (var i=0;i<this.callbacks.length;i++) { 
      this.callbacks[i](gamepadId, id, Math.floor(value*255));
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
