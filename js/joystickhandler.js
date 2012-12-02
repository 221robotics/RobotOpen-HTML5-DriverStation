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

  // How “deep” does an analogue button need to be depressed to consider it
  // a button down.
  ANALOG_BUTTON_THRESHOLD: .5,

  numJoysticks: 0,

  init: function() {
    joystickHandler.updateGamepads();
  },

  // print debug statements to console
  debugging: true,

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
    }
    else {
      joystickHandler.numJoysticks = 0;
    }

    if (!padsConnected) {
      $("#no-gamepads-connected").show();
    }
  },

  /**
   * Update a given button on the screen.
   */
  updateButton: function(value, gamepadId, id) {

    // value >= ANALOG_BUTTON_THRESHOLD

    if (id == 'button-1') {
      this.debug("joy " + gamepadId + ", button 1 " + value);
    }
    else if (id == 'button-2') {
      this.debug("joy " + gamepadId + ", button 2 " + value);
    }
    else if (id == 'button-3') {
      this.debug("joy " + gamepadId + ", button 3 " + value);
    }
    else if (id == 'button-4') {
      this.debug("joy " + gamepadId + ", button 4 " + value);
    }
    else if (id == 'button-left-shoulder-top') {
      this.debug("joy " + gamepadId + ", button-left-shoulder-top " + value);
    }
    else if (id == 'button-left-shoulder-bottom') {
      this.debug("joy " + gamepadId + ", button-left-shoulder-bottom " + value);
    }
    else if (id == 'button-right-shoulder-top') {
      this.debug("joy " + gamepadId + ", button-right-shoulder-top " + value);
    }
    else if (id == 'button-right-shoulder-bottom') {
      this.debug("joy " + gamepadId + ", button-right-shoulder-bottom " + value);
    }
    else if (id == 'button-select') {
      this.debug("joy " + gamepadId + ", button-select " + value);
    }
    else if (id == 'button-start') {
      this.debug("joy " + gamepadId + ", button-start " + value);
    }
    else if (id == 'stick-1') {
      this.debug("joy " + gamepadId + ", stick-1 " + value);
    }
    else if (id == 'stick-2') {
      this.debug("joy " + gamepadId + ", stick-2 " + value);
    }
    else if (id == 'button-dpad-top') {
      this.debug("joy " + gamepadId + ", button-dpad-top " + value);
    }
    else if (id == 'button-dpad-bottom') {
      this.debug("joy " + gamepadId + ", button-dpad-bottom " + value);
    }
    else if (id == 'button-dpad-left') {
      this.debug("joy " + gamepadId + ", button-dpad-left " + value);
    }
    else if (id == 'button-dpad-right') {
      this.debug("joy " + gamepadId + ", button-dpad-right " + value);
    }
    else if (id.indexOf('extra-button') != -1) {
      this.debug("joy " + gamepadId + ", extra-button " + value);
    }

  },

  /**
   * Update a given analogue stick
   */
  updateAxis: function(value, gamepadId, labelId, stickId, horizontal) {

    // value is from -1 to 1
    if (labelId == 'stick-1-axis-x') {
      this.debug("joy " + gamepadId + ", stick-1-axis-x update " + value);
    }
    else if (labelId == 'stick-1-axis-y') {
      this.debug("joy " + gamepadId + ", stick-1-axis-y update " + value);
    }
    else if (labelId == 'stick-2-axis-x') {
      this.debug("joy " + gamepadId + ", stick-2-axis-x update " + value);
    }
    else if (labelId == 'stick-2-axis-y') {
      this.debug("joy " + gamepadId + ", stick-2-axis-y update " + value);
    }
    else if (labelId.indexOf('extra-axis') != -1) {
      this.debug("joy " + gamepadId + ", extra-axis update " + value);
    }
  }

};


document.addEventListener('DOMContentLoaded', function () {
  joystickHandler.init();
  gamepadSupport.init();
});
