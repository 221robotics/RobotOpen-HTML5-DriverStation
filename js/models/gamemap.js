define([
  'underscore',
  'backbone'
], function(_, Backbone){
  var GameMapModel = Backbone.Model.extend({
    defaults: {
      'alias': 'Standard',  // the alias for this mapping
      'id': 'STANDARD GAMEPAD', // the last known id provided by the gamepad API for this mapping
      'lastIndex': 1, // the last joystick position this was mapped at
      'a0': 'stick-left-axis-x',  // prefix of 'a' represents axis
      'a1': 'stick-left-axis-y',
      'a2': 'stick-right-axis-x',
      'a3': 'stick-right-axis-y',
      'b0': 'button-a', // prefix of 'b' represents button
      'b1': 'button-b',
      'b2': 'button-x',
      'b3': 'button-y',
      'b4': 'button-left-shoulder',
      'b5': 'button-right-shoulder',
      'b6': 'button-left-trigger',
      'b7': 'button-right-trigger',
      'b8': 'button-select',
      'b9': 'button-start',
      'b10': 'button-left-stick',
      'b11': 'button-right-stick',
      'b12': 'button-dpad-up',
      'b13': 'button-dpad-down',
      'b14': 'button-dpad-left',
      'b15': 'button-dpad-right',
      'b16': 'aux1'
    }
  });
  // Return the model
  return GameMapModel;
});