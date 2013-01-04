// Filename: packetparser.js
define([
  'jquery'
], function($){
  var parseDS = function(data){
    /*

    length
    type (b, c, i, l, f)
    val1
    val2
    id

    */
  };

  var parseParameters = function(data){
    /*

    length
    address
    type
    val1
    val2
    id

    */
  }

  var parseStatus = function(data){
    /*

    protocol_ver
    controller_state
    firmware_ver
    device_id
    uptime

    */
  };

  var parsePrint = function(data){
    var returnString = "";
    for (var i=1; i < data.length; i++) {
      returnString += String.fromCharCode(data[i]);
    }
    return returnString;
  };

  return {
    parseDS: parseDS,
    parsePrint: parsePrint
  };
});