/**
 * ui.js - robotopen ds UI control
 */

function showSetup() {
  $("#setup-div").show();
  $("#control-div").hide();

  $("#control-link").removeClass('selected');
  $("#setup-link").addClass('selected');
}

function showControls() {
  $("#setup-div").hide();
  $("#control-div").show();

  $("#control-link").addClass('selected');
  $("#setup-link").removeClass('selected');
}