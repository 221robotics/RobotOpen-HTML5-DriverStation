define([
  'underscore',
  'backbone',
  'models/controllerbutton',
  'localstorage'
], function(_, Backbone, ControllerButtonModel){
  var ControllerCollection = Backbone.Collection.extend({
  	initialize: function(models, options) {
      var ref = this;
      this.localStorage = new Backbone.LocalStorage(options.localIdentifier, function() {
        ref.fetch({success: function() {
          // if we didn't get anything from localStorage, initialize a default mapping
          if (ref.length == 0) {
            // default axis controls
            console.log('CREATING DEFAULT MAPPINGS');
            ref.create({alias: 'Left Stick Horizontal', axis: true, gamepadIndex: 0, bundleIndex: 0});
            ref.create({alias: 'Left Stick Vertical', axis: true, gamepadIndex: 1, bundleIndex: 1});
            ref.create({alias: 'Right Stick Horizontal', axis: true, gamepadIndex: 2, bundleIndex: 2});
            ref.create({alias: 'Right Stick Vertical', axis: true, gamepadIndex: 3, bundleIndex: 3});

            // default button controls
            ref.create({alias: 'A Button', axis: false, gamepadIndex: 0, bundleIndex: 4});
            ref.create({alias: 'B Button', axis: false, gamepadIndex: 1, bundleIndex: 5});
            ref.create({alias: 'X Button', axis: false, gamepadIndex: 2, bundleIndex: 6});
            ref.create({alias: 'Y Button', axis: false, gamepadIndex: 3, bundleIndex: 7});
            ref.create({alias: 'Left Shoulder', axis: false, gamepadIndex: 4, bundleIndex: 8});
            ref.create({alias: 'Right Shoulder', axis: false, gamepadIndex: 5, bundleIndex: 9});
            ref.create({alias: 'Left Trigger', axis: false, gamepadIndex: 6, bundleIndex: 10});
            ref.create({alias: 'Right Trigger', axis: false, gamepadIndex: 7, bundleIndex: 11});
            ref.create({alias: 'Select', axis: false, gamepadIndex: 8, bundleIndex: 12});
            ref.create({alias: 'Start', axis: false, gamepadIndex: 9, bundleIndex: 13});
            ref.create({alias: 'Left Stick Button', axis: false, gamepadIndex: 10, bundleIndex: 14});
            ref.create({alias: 'Right Stick Button', axis: false, gamepadIndex: 11, bundleIndex: 15});
            ref.create({alias: 'D-Pad Up', axis: false, gamepadIndex: 12, bundleIndex: 16});
            ref.create({alias: 'D-Pad Down', axis: false, gamepadIndex: 13, bundleIndex: 17});
            ref.create({alias: 'D-Pad Left', axis: false, gamepadIndex: 14, bundleIndex: 18});
            ref.create({alias: 'D-Pad Right', axis: false, gamepadIndex: 15, bundleIndex: 19});
            ref.create({alias: 'Aux One', axis: false, gamepadIndex: 16, bundleIndex: 20});
            ref.create({alias: 'Aux Two', axis: false, gamepadIndex: 17, bundleIndex: 21});
            ref.create({alias: 'Aux Three', axis: false, gamepadIndex: 18, bundleIndex: 22});
            ref.create({alias: 'Aux Four', axis: false, gamepadIndex: 19, bundleIndex: 23});
          }
        }});
      });
  	},
    model: ControllerButtonModel
  });
  // You don't usually return a collection instantiated
  return ControllerCollection;
});