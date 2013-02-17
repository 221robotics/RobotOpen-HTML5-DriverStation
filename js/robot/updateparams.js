// Filename: packetparser.js
define([
  'jquery',
  'utils'
], function($, utils){
  var rlink;

  var init = function(rolink){
    rlink = rolink;
  };

  var update = function(){
    // robot is disabled and there are parameters we can send to the robot
    if (!rlink.enabled && rlink.parameterView.collection.length > 0) {
      console.log(rlink.parameterView.collection.models);

      // TODO: loop through collection models and create packet to send to robot
      /*var bytearray = new Uint8Array(99);

      // calculate crc-16
      var crcDec = utils.crc16(bytearray, 97);

      // insert crc-16 into byte array
      bytearray[97] = (crcDec >> 8) & 0xFF;
      bytearray[98] = crcDec & 0xFF;*/
    }
  };

  return {
    init: init,
    update: update
  };
});