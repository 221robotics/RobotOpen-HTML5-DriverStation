define([
  'underscore',
  'backbone'
], function(_, Backbone){
  var SettingsModel = Backbone.Model.extend({
    defaults: {
      ip: '10.0.0.22',
      port: 22211
    }
  });
  // Return the model
  return SettingsModel;
});