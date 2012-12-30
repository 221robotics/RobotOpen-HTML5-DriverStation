define([
  'underscore',
  'backbone'
], function(_, Backbone){
  var BundleModel = Backbone.Model.extend({
    defaults: {
      name: "Bundle"
    }
  });
  // Return the model
  return BundleModel;
});