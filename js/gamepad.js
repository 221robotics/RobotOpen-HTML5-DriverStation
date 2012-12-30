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
  // A number of typical buttons recognized by Gamepad API and mapped to
  // standard controls. Any extraneous buttons will have larger indexes.
  var TYPICAL_BUTTON_COUNT = 16;

  // A number of typical axes recognized by Gamepad API and mapped to
  // standard controls. Any extraneous buttons will have larger indexes.
  var TYPICAL_AXIS_COUNT = 4;

  // Whether we’re requestAnimationFrameing like it’s 1999.
  var ticking = false;

  // The canonical list of attached gamepads, without “holes” (always
  // starting at [0]) and unified between Firefox and Chrome.
  var gamepads = [];

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
    joyHandler = handler

    // As of writing, it seems impossible to detect Gamepad API support
    // in Firefox, hence we need to hardcode it in the third clause.
    // (The preceding two clauses are for Chrome.)
    var gamepadSupportAvailable = !!navigator.webkitGetGamepads ||
        !!navigator.webkitGamepads ||
        (navigator.userAgent.indexOf('Firefox/') != -1);

    if (!gamepadSupportAvailable) {
      // It doesn’t seem Gamepad API is available – show a message telling
      // the visitor about it.
      joyHandler.showNotSupported();
    } else {
      // Firefox supports the connect/disconnect event, so we attach event
      // handlers to those.
      window.addEventListener('MozGamepadConnected',
                              onGamepadConnect, false);
      window.addEventListener('MozGamepadDisconnected',
                              onGamepadDisconnect, false);

      // Since Chrome only supports polling, we initiate polling loop straight
      // away. For Firefox, we will only do it if we get a connect event.
      if (!!navigator.webkitGamepads || !!navigator.webkitGetGamepads) {
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

    // Ask the tester to update the screen to show more gamepads.
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

    // Ask the tester to update the screen to remove the gamepad.
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

      updateDisplay(i);
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
        (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) ||
        navigator.webkitGamepads;

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

      // Ask the tester to refresh the visual representations of gamepads
      // on the screen.
      if (gamepadsChanged) {
        joyHandler.updateGamepads(gamepads);
      }
    }
  };

  // Call the tester with new state and ask it to update the visual
  // representation of a given gamepad.
  var updateDisplay = function(gamepadId) {
    var gamepad = gamepads[gamepadId];

    // Update all the buttons (and their corresponding labels) on screen.
    joyHandler.updateButton(gamepad.buttons[0], gamepadId, 'button-1');
    joyHandler.updateButton(gamepad.buttons[1], gamepadId, 'button-2');
    joyHandler.updateButton(gamepad.buttons[2], gamepadId, 'button-3');
    joyHandler.updateButton(gamepad.buttons[3], gamepadId, 'button-4');

    joyHandler.updateButton(gamepad.buttons[4], gamepadId,
        'button-left-shoulder-top');
    joyHandler.updateButton(gamepad.buttons[6], gamepadId,
        'button-left-shoulder-bottom');
    joyHandler.updateButton(gamepad.buttons[5], gamepadId,
        'button-right-shoulder-top');
    joyHandler.updateButton(gamepad.buttons[7], gamepadId,
        'button-right-shoulder-bottom');

    joyHandler.updateButton(gamepad.buttons[8], gamepadId, 'button-select');
    joyHandler.updateButton(gamepad.buttons[9], gamepadId, 'button-start');

    joyHandler.updateButton(gamepad.buttons[10], gamepadId, 'stick-1');
    joyHandler.updateButton(gamepad.buttons[11], gamepadId, 'stick-2');

    joyHandler.updateButton(gamepad.buttons[12], gamepadId, 'button-dpad-top');
    joyHandler.updateButton(gamepad.buttons[13], gamepadId, 'button-dpad-bottom');
    joyHandler.updateButton(gamepad.buttons[14], gamepadId, 'button-dpad-left');
    joyHandler.updateButton(gamepad.buttons[15], gamepadId, 'button-dpad-right');

    // Update all the analogue sticks.
    joyHandler.updateAxis(gamepad.axes[0], gamepadId,
        'stick-1-axis-x', 'stick-1', true);
    joyHandler.updateAxis(gamepad.axes[1], gamepadId,
        'stick-1-axis-y', 'stick-1', false);
    joyHandler.updateAxis(gamepad.axes[2], gamepadId,
        'stick-2-axis-x', 'stick-2', true);
    joyHandler.updateAxis(gamepad.axes[3], gamepadId,
        'stick-2-axis-y', 'stick-2', false);

    // Update extraneous buttons.
    var extraButtonId = TYPICAL_BUTTON_COUNT;
    while (typeof gamepad.buttons[extraButtonId] != 'undefined') {
      joyHandler.updateButton(gamepad.buttons[extraButtonId], gamepadId,
          'extra-button-' + extraButtonId);

      extraButtonId++;
    }

    // Update extraneous axes.
    var extraAxisId = TYPICAL_AXIS_COUNT;
    while (typeof gamepad.axes[extraAxisId] != 'undefined') {
      joyHandler.updateAxis(gamepad.axes[extraAxisId], gamepadId,
          'extra-axis-' + extraAxisId);

      extraAxisId++;
    }

  };


  // return the init call
  return {
    init: init
  };
});
