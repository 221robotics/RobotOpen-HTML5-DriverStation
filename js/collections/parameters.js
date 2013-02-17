define([
  'underscore',
  'backbone',
  'models/parameter'
], function(_, Backbone, ParameterModel){
  var ParameterCollection = Backbone.Collection.extend({
    model: ParameterModel
  });
  // You don't usually return a collection instantiated
  return ParameterCollection;
});