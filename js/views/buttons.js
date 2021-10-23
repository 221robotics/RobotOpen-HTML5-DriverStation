// Filename: buttons.js
// Updates connect/disconnect/enable/disable buttons on DS
define([
  'jquery'
], function($){
  var connected = function() {
    // connected state
    $("#connect-btn").html('Disconnect');
    $("#connect-btn").removeClass('btn-success');
    $("#connect-btn").addClass('btn-danger');
  };

  var disconnected = function() {
    // disconnected state
    $("#enable-btn").html('Enable Robot');
    $("#enable-btn").removeClass('btn-warning');
    $("#enable-btn").addClass('btn-info');
    $("#connect-btn").html('Connect');
    $("#connect-btn").removeClass('btn-danger');
    $("#connect-btn").addClass('btn-success');
  };

  var enabled = function() {
    // enabled state
    $("#enable-btn").html('Disable Robot');
    $("#enable-btn").removeClass('btn-info');
    $("#enable-btn").addClass('btn-warning');
    $("#enable-btn").blur();
    $("#disablehint").show();
  };

  var disabled = function() {
    // disabled state
    $("#enable-btn").html('Enable Robot');
    $("#enable-btn").removeClass('btn-warning');
    $("#enable-btn").addClass('btn-info');
    $("#enable-btn").blur();
    $("#disablehint").hide();
  };

  return {
    connected: connected,
    disconnected: disconnected,
    enabled: enabled,
    disabled: disabled
  };
});