// Filename: joylabels.js
// Updates labels at the top of the UI to show when joysticks are mapped or not
define([
  'jquery'
], function($){
  var joyMapped = function(index) {
    $("#joylabel"+index).attr('data-original-title', "Connected! Click setup to change button mapping.");
    $("#joylabel"+index).addClass('label-success');
    $("#joylabel"+index).tooltip('fixTitle');
    $("#joylabel"+index).tooltip();
  };

  var joyUnmapped = function(index) {
    $("#joylabel"+index).attr('data-original-title', "Not mapped. Connect a joystick and press any button to map the next available slot.");
    $("#joylabel"+index).removeClass('label-success');
    $("#joylabel"+index).tooltip('fixTitle');
    $("#joylabel"+index).tooltip();
  };

  return {
    joyMapped: joyMapped,
    joyUnmapped: joyUnmapped
  };
});