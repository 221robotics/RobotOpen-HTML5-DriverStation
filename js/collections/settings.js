define([
  'underscore',
  'backbone',
  'models/settings',
  'localstorage'
], function(_, Backbone, SettingsModel){
  var SettingsCollection = Backbone.Collection.extend({
  	initialize: function() {
      var ref = this;
      this.localStorage = new Backbone.LocalStorage('settings', function() {
        ref.fetch({success: function() {
          // if we didn't get anything from localStorage, initialize a default settings model
          if (ref.length == 0) {
            // default axis controls
            console.log('CREATING DEFAULT SETTINGS');
            ref.create({});
          }
        }});
      });
  	},
    model: SettingsModel
  });
  // You don't usually return a collection instantiated
  return SettingsCollection;
});