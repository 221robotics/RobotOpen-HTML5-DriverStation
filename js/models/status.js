define([
  'underscore',
  'backbone'
], function(_, Backbone){
  var StatusModel = Backbone.Model.extend({
    defaults: {
      connected: false,
      connecting: false,
      enabled: false,
      connectionStart: new Date(),
      connectionEnd: new Date(),
      averageLatency: 0,
      packetRx: 0,
      packetTx: 0
    }
  });
  // Return the model
  return StatusModel;
});