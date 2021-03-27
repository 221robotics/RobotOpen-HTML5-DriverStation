define([
  'underscore',
  'backbone'
], function(_, Backbone){
  var ControllerButtonModel = Backbone.Model.extend({
    defaults: {
      'alias': 'Left Stick Horizontal',  // the name for this button to show the user
      'arduino_alias': 'leftX', // the Arduino function for the button
      'axis': true, // is this an axis or button?
      'gamepadIndex': 0, // the axis or button index on the gamepad object for the browser
      'bundleIndex': 0,  // the axis or button index that will be sent over the network as a robotopen bundle
      'value': -1, // Value of the axis or button to display on Controller Setup
      'remap': false  // is this button waiting to be remapped?
    }
  });
  // Return the model
  return ControllerButtonModel;
});