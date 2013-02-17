define([
  'underscore',
  'backbone'
], function(_, Backbone){
  var ParameterModel = Backbone.Model.extend({
    defaults: {
      name: null,     // label of the parameter
      value: null,    // actual value of the parameter
      address: null,  // address the parameter is stored at
      type: null      // what type is this parameter
    }
  });
  // Return the model
  return ParameterModel;
});