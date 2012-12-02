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


// bind nav links to UI actions
document.addEventListener('DOMContentLoaded', function () {
  $("#setup-link").bind('click', showSetup);
  $("#console-link").bind('click', showConsole);
  $("#control-link").bind('click', showControls);
});