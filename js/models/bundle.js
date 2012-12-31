define([
  'underscore',
  'backbone'
], function(_, Backbone){
  var BundleModel = Backbone.Model.extend({
    defaults: {
      name: null,
      value: 0,
      type: null,
      percent: 0
    }
  });
  // Return the model
  return BundleModel;
});