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
 */


define([
  'jquery',
], function($){

  // Whether we’re requestAnimationFrameing like it’s 1999.
  var ticking = false;

  // The canonical list of attached gamepads, without “holes” (always
  // starting at [0]) and unified between Firefox and Chrome.
  var gamepads = [];

  // Who do we notify when gamepad updates occur?
  var joyHandler = undefined;

  // Remembers the connected gamepads at the last check; used in Chrome
  // to figure out when gamepads get connected or disconnected, since no
  // events are fired.
  var prevRawGamepadTypes = [];

  // Previous timestamps for gamepad state; used in Chrome to not bother with
  // analyzing the polled data if nothing changed (timestamp is the same
  // as last time).
  var prevTimestamps = [];

  /**
   * Initialize support for Gamepad API.
   */
  var init = function(handler) {
    joyHandler = handler;

    var gamepadSupportAvailable = navigator.getGamepads ||
        !!navigator.webkitGetGamepads ||
        !!navigator.webkitGamepads;

    if (!gamepadSupportAvailable) {
      // It doesn’t seem Gamepad API is available – show a message telling
      // the visitor about it.
      joyHandler.notSupported();
    } else {
      // Check and see if gamepadconnected/gamepaddisconnected is supported.
      // If so, listen for those events and don't start polling until a gamepad
      // has been connected.
      if ('ongamepadconnected' in window) {
        console.log('adding listeners');
        window.addEventListener('gamepadconnected',
                              onGamepadConnect, false);
        window.addEventListener('gamepaddisconnected',
                                onGamepadDisconnect, false);
      } else {
        // If connection events are not supported just start polling
        startPolling();
      }
    }
  };

  /**
   * React to the gamepad being connected. Today, this will only be executed
   * on Firefox.
   */
  var onGamepadConnect = function(event) {
    // Add the new gamepad on the list of gamepads to look after.
    gamepads.push(event.gamepad);

    // Let the handler know that there are more gamepads
    joyHandler.updateGamepads(gamepads);

    // Start the polling loop to monitor button changes.
    startPolling();
  };

  // This will only be executed on Firefox.
  var onGamepadDisconnect = function(event) {
    // Remove the gamepad from the list of gamepads to monitor.
    for (var i in gamepads) {
      if (gamepads[i].index == event.gamepad.index) {
        gamepads.splice(i, 1);
        break;
      }
    }

    // If no gamepads are left, stop the polling loop.
    if (gamepads.length == 0) {
      stopPolling();
    }

    // Let the handler know to remove the gamepad
    joyHandler.updateGamepads(gamepads);
  };

  /**
   * Starts a polling loop to check for gamepad state.
   */
  var startPolling = function() {
    // Don’t accidentally start a second loop, man.
    if (!ticking) {
      ticking = true;
      tick();
    }
  };

  /**
   * Stops a polling loop by setting a flag which will prevent the next
   * requestAnimationFrame() from being scheduled.
   */
  var stopPolling = function() {
    ticking = false;
  };

  /**
   * A function called with each requestAnimationFrame(). Polls the gamepad
   * status and schedules another poll.
   */
  var tick = function() {
    pollStatus();
    scheduleNextTick();
  };

  var scheduleNextTick = function() {
    // Only schedule the next frame if we haven’t decided to stop via
    // stopPolling() before.
    if (ticking) {
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(tick);
      } else if (window.mozRequestAnimationFrame) {
        window.mozRequestAnimationFrame(tick);
      } else if (window.webkitRequestAnimationFrame) {
        window.webkitRequestAnimationFrame(tick);
      }
      // Note lack of setTimeout since all the browsers that support
      // Gamepad API are already supporting requestAnimationFrame().
    }
  };

  /**
   * Checks for the gamepad status. Monitors the necessary data and notices
   * the differences from previous state (buttons for Chrome/Firefox,
   * new connects/disconnects for Chrome). If differences are noticed, asks
   * to update the display accordingly. Should run as close to 60 frames per
   * second as possible.
   */
  var pollStatus = function() {
    // Poll to see if gamepads are connected or disconnected. Necessary
    // only on Chrome.
    pollGamepads();

    for (var i in gamepads) {
      var gamepad = gamepads[i];

      // Don’t do anything if the current timestamp is the same as previous
      // one, which means that the state of the gamepad hasn’t changed.
      // This is only supported by Chrome right now, so the first check
      // makes sure we’re not doing anything if the timestamps are empty
      // or undefined.
      if (gamepad.timestamp &&
          (gamepad.timestamp == prevTimestamps[i])) {
        continue;
      }
      prevTimestamps[i] = gamepad.timestamp;

      updateGamepad(i);
    }
  };

  // This function is called only on Chrome, which does not yet support
  // connection/disconnection events, but requires you to monitor
  // an array for changes.
  var pollGamepads = function() {
    // Get the array of gamepads – the first method (function call)
    // is the most modern one, the second is there for compatibility with
    // slightly older versions of Chrome, but it shouldn’t be necessary
    // for long.
    var rawGamepads =
        (navigator.getGamepads && navigator.getGamepads()) ||
        (navigator.webkitGetGamepads && navigator.webkitGetGamepads());

    if (rawGamepads) {
      // We don’t want to use rawGamepads coming straight from the browser,
      // since it can have “holes” (e.g. if you plug two gamepads, and then
      // unplug the first one, the remaining one will be at index [1]).
      gamepads = [];

      // We only refresh the display when we detect some gamepads are new
      // or removed; we do it by comparing raw gamepad table entries to
      // “undefined.”
      var gamepadsChanged = false;

      for (var i = 0; i < rawGamepads.length; i++) {
        if (typeof rawGamepads[i] != prevRawGamepadTypes[i]) {
          gamepadsChanged = true;
          prevRawGamepadTypes[i] = typeof rawGamepads[i];
        }

        if (rawGamepads[i]) {
          gamepads.push(rawGamepads[i]);
        }
      }

      // Let the handler know the index of gamepads has changed
      if (gamepadsChanged) {
        joyHandler.updateGamepads(gamepads);
      }
    }
  };

  var scaleAxis = function(value) {
    if (value > .05)
      return Math.round((value*128) + 127);
    else if (value < -.05)
      return Math.round(127 - (value*127*-1));
    else
      return 127;
  };

  // joystick buttons are now objects in new versions of chrome
  var normalizeButton = function(b) {
    if (typeof(b) == "object") {
      return b.value;
    }
    return b;
  }

  // Call the handler with new state of this particular gamepad
  var updateGamepad = function(gamepadId) {
    var gamepad = gamepads[gamepadId];

    // send axis updates
    for (var i=0; i<gamepad.axes.length; i++) {
      joyHandler.updateComponent(scaleAxis(gamepad.axes[i]), gamepad.index, true, i);
    }

    // send button updates
    for (var i=0; i<gamepad.buttons.length; i++) {
      joyHandler.updateComponent(Math.round(255*normalizeButton(gamepad.buttons[i])), gamepad.index, false, i);
    }

  };

  var getGamepads = function() {
    return gamepads;
  };

  // return the init call
  return {
    init: init,
    gamepads: getGamepads
  };
});
