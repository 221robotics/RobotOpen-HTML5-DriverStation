define([
  'underscore',
  'backbone'
], function(_, Backbone){
  var ControllerButtonModel = Backbone.Model.extend({
    defaults: {
      'alias': 'Left Stick Horizontal',  // the name for this button to show the user
      'axis': true, // is this an axis or button?
      'gamepad-index': 0, // the axis or button index on the gamepad object for the browser
      'bundle-index': 0,  // the axis or button index that will be sent over the network as a robotopen bundle
    }
  });
  // Return the model
  return ControllerButtonModel;
});