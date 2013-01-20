define([
  'underscore',
  'backbone',
  'models/controllerbutton'
], function(_, Backbone, ControllerButtonModel){
  var ControllerCollection = Backbone.Collection.extend({
    model: ControllerButtonModel
  });
  // You don't usually return a collection instantiated
  return ControllerCollection;
});