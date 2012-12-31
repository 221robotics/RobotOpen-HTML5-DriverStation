define([
  'underscore',
  'backbone',
  'models/bundle'
], function(_, Backbone, BundleModel){
  var BundleCollection = Backbone.Collection.extend({
    model: BundleModel
  });
  // You don't usually return a collection instantiated
  return BundleCollection;
});