define([
  'underscore',
  'backbone'
], function(_, Backbone){
  var ControllerButtonModel = Backbone.Model.extend({
    defaults: {
      'alias': 'Left Stick Horizontal',  // the name for this button to show the user
      'axis': true, // is this an axis or button
      'index': 0, // the axis or button index 
      'joyevent': 'stick-left-axis-x', // the event that gets fired to the robot link
    }
  });
  // Return the model
  return ControllerButtonModel;
});