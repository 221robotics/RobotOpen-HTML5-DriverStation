// Filename: packetparser.js
define([
  'jquery',
  'models/bundle'
], function($, BundleModel){
  var parseDS = function(data){
    var bundleArray = new Array();
    var dv = new DataView(data); 
    var byteOffset = 1; // skip the identifier for the packet type

    while (byteOffset < data.byteLength) {
      var bModel = new BundleModel();

      var packetLengthOffset = dv.getUint8(byteOffset) + byteOffset++;
      var typeChar = String.fromCharCode(dv.getUint8(byteOffset++));
      
      if (typeChar == 'b') {
        if (dv.getUint8(byteOffset) > 0)
          bModel.set({value: 'True', type: 'Boolean', percent: 100});
        else
          bModel.set({value: 'False', type: 'Boolean', percent: 0});

        byteOffset += 1;
      }
      else if (typeChar == 'c') {
        bModel.set({value: dv.getUint8(byteOffset), type: 'Byte', percent: Math.round(dv.getUint8(byteOffset)/255)});

        byteOffset += 1;
      }
      else if (typeChar == 'i') {
        bModel.set({value: dv.getInt16(byteOffset), type: 'Integer', percent: 100});

        byteOffset += 2;
      }
      else if (typeChar == 'l') {
        bModel.set({value: dv.getInt32(byteOffset), type: 'Long', percent: 100});

        byteOffset += 4;
      }
      else if (typeChar == 'f') {
        bModel.set({value: dv.getFloat32(byteOffset), type: 'Float', percent: 100});

        byteOffset += 4;
      }
      else {
        // not good, give up
        console.log('Bad DS Packet!');
        return bundleArray;
      }

      var remainingLength = packetLengthOffset - byteOffset;

      // grab the label for this DS bundle
      bModel.set({name: String.fromCharCode.apply(null, new Uint8Array(data, byteOffset, remainingLength))});
      bundleArray.push(bModel);

      byteOffset += remainingLength;
    }

    return bundleArray;
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