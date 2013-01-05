// Filename: console.js
define([
  'jquery',
  'utils'
], function($, utils){
  var active = false;

  var log = function(str) {
    if (active) {
      if ($("#console").html() == 'Waiting for data...')
        $("#console").html('');

      var now = new Date();
      $('#console').append("<p><b>["+utils.pad(now.getHours(), 2)+":"+utils.pad(now.getMinutes(), 2)+":"+utils.pad(now.getSeconds(), 2)+"."+utils.pad(now.getMilliseconds(), 3)+"]</b> "+str+"</p>");
      if ($('#console p').length > 50) {
        $('#console p').first().remove();
      }
      $("#console").scrollTop($("#console")[0].scrollHeight);
    }
  };

  var activate = function() {
    active = true;
  };

  var deactivate = function() {
    active = false;
    clear();
  }

  var clear = function() {
    $("#console").html('Waiting for data...');
  };

  return {
    log: log,
    clear: clear,
    activate: activate,
    deactivate: deactivate
  };
});