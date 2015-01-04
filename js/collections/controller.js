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
            ref.create({alias: 'Left Stick Horizontal', arduino_alias: 'leftX', axis: true, gamepadIndex: 0, bundleIndex: 0});
            ref.create({alias: 'Left Stick Vertical', arduino_alias: 'leftY', axis: true, gamepadIndex: 1, bundleIndex: 1});
            ref.create({alias: 'Right Stick Horizontal', arduino_alias: 'rightX', axis: true, gamepadIndex: 2, bundleIndex: 2});
            ref.create({alias: 'Right Stick Vertical', arduino_alias: 'rightY', axis: true, gamepadIndex: 3, bundleIndex: 3});

            // default button controls
            ref.create({alias: 'A Button', arduino_alias: 'btnA', axis: false, gamepadIndex: 0, bundleIndex: 4});
            ref.create({alias: 'B Button', arduino_alias: 'btnB', axis: false, gamepadIndex: 1, bundleIndex: 5});
            ref.create({alias: 'X Button', arduino_alias: 'btnX', axis: false, gamepadIndex: 2, bundleIndex: 6});
            ref.create({alias: 'Y Button', arduino_alias: 'btnY', axis: false, gamepadIndex: 3, bundleIndex: 7});
            ref.create({alias: 'Left Shoulder', arduino_alias: 'btnLShoulder', axis: false, gamepadIndex: 4, bundleIndex: 8});
            ref.create({alias: 'Right Shoulder', arduino_alias: 'btnRShoulder', axis: false, gamepadIndex: 5, bundleIndex: 9});
            ref.create({alias: 'Left Trigger', arduino_alias: 'lTrigger', axis: false, gamepadIndex: 6, bundleIndex: 10});
            ref.create({alias: 'Right Trigger', arduino_alias: 'rTrigger', axis: false, gamepadIndex: 7, bundleIndex: 11});
            ref.create({alias: 'Select', arduino_alias: 'btnSelect', axis: false, gamepadIndex: 8, bundleIndex: 12});
            ref.create({alias: 'Start', arduino_alias: 'btnStart', axis: false, gamepadIndex: 9, bundleIndex: 13});
            ref.create({alias: 'Left Stick Button', arduino_alias: 'btnLStick', axis: false, gamepadIndex: 10, bundleIndex: 14});
            ref.create({alias: 'Right Stick Button', arduino_alias: 'btnRStick', axis: false, gamepadIndex: 11, bundleIndex: 15});
            ref.create({alias: 'D-Pad Up', arduino_alias: 'dPadUp', axis: false, gamepadIndex: 12, bundleIndex: 16});
            ref.create({alias: 'D-Pad Down', arduino_alias: 'dPadDown', axis: false, gamepadIndex: 13, bundleIndex: 17});
            ref.create({alias: 'D-Pad Left', arduino_alias: 'dPadLeft', axis: false, gamepadIndex: 14, bundleIndex: 18});
            ref.create({alias: 'D-Pad Right', arduino_alias: 'dPadRight', axis: false, gamepadIndex: 15, bundleIndex: 19});
            ref.create({alias: 'Aux One', arduino_alias: 'auxOne', axis: false, gamepadIndex: 16, bundleIndex: 20});
            ref.create({alias: 'Aux Two', arduino_alias: 'auxTwo', axis: false, gamepadIndex: 17, bundleIndex: 21});
            ref.create({alias: 'Aux Three', arduino_alias: 'auxThree', axis: false, gamepadIndex: 18, bundleIndex: 22});
            ref.create({alias: 'Aux Four', arduino_alias: 'auxFour', axis: false, gamepadIndex: 19, bundleIndex: 23});
          }

          // if new arduino_alias attribute isn't stored (or is default), update it
          // Best way to check was if there was a non-unqiue value between the first models
          if(ref.models[0].attributes.arduino_alias == ref.models[1].attributes.arduino_alias) {
            console.log('UPDATING MAPPINGS');
            //axis controls
            ref.models[0].save({arduino_alias: 'leftX'});
            ref.models[1].save({arduino_alias: 'leftY'});
            ref.models[2].save({arduino_alias: 'rightX'});
            ref.models[3].save({arduino_alias: 'rightY'});

            //button controls
            ref.models[4].save({arduino_alias: 'btnA'});
            ref.models[5].save({arduino_alias: 'btnB'});
            ref.models[6].save({arduino_alias: 'btnX'});
            ref.models[7].save({arduino_alias: 'btnY'});
            ref.models[8].save({arduino_alias: 'btnLShoulder'});
            ref.models[9].save({arduino_alias: 'btnRShoulder'});
            ref.models[10].save({arduino_alias: 'lTrigger'});
            ref.models[11].save({arduino_alias: 'rTrigger'});
            ref.models[12].save({arduino_alias: 'btnSelect'});
            ref.models[13].save({arduino_alias: 'btnStart'});
            ref.models[14].save({arduino_alias: 'btnLStick'});
            ref.models[15].save({arduino_alias: 'btnRStick'});
            ref.models[16].save({arduino_alias: 'dPadUp'});
            ref.models[17].save({arduino_alias: 'dPadDown'});
            ref.models[18].save({arduino_alias: 'dPadLeft'});
            ref.models[19].save({arduino_alias: 'dPadRight'});
            ref.models[20].save({arduino_alias: 'auxOne'});
            ref.models[21].save({arduino_alias: 'auxTwo'});
            ref.models[22].save({arduino_alias: 'auxThree'});
            ref.models[23].save({arduino_alias: 'auxFour'});
          }
        }});
      });
  	},
    model: ControllerButtonModel
  });
  // You don't usually return a collection instantiated
  return ControllerCollection;
});