/**
 * ui.js - robotopen ds UI control
 */

function removeAllActive() {
	$("#control-link").removeClass('selected');
	$("#console-link").removeClass('selected');
	$("#setup-link").removeClass('selected');
	$("#setup-div").hide();
  $("#control-div").hide();
  $("#console-div").hide();
}

function showSetup(e) {
	removeAllActive();
  $("#setup-div").show();
  $("#setup-link").addClass('selected');
}

function showControls(e) {
	removeAllActive();
  $("#control-div").show();
  $("#control-link").addClass('selected');
}

function showConsole(e) {
	removeAllActive();
  $("#console-div").show();
  $("#console-link").addClass('selected');
}

function enableRobot(e) {
  window.rolink.enable();
}

function disableRobot(e) {
  window.rolink.disable();
}

function connectRobot(e) {
  if (!window.rolink.is_connected)
    window.rolink.connect();
}


// bind nav links to UI actions
document.addEventListener('DOMContentLoaded', function () {
  $("#setup-link").bind('click', showSetup);
  $("#console-link").bind('click', showConsole);
  $("#control-link").bind('click', showControls);

  // control buttons
  $("#enable-btn").bind('click', enableRobot);
  $("#disable-btn").bind('click', disableRobot);
  $("#connect-btn").bind('click', connectRobot);

  // setup connection
  joystickHandler.init();
  window.rolink = new robotlink();
  // bind joystick handler to rolink
  joystickHandler.subscribe(rolink.handleJoyData);
});