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
      var bytearray = new Uint8Array(3+(rlink.parameterView.collection.length*5));
      var byteIndex = 0;

      bytearray[byteIndex++] = 115; // s

      /*
      s
      address (0-99)
      val1
      val2
      val3
      val4
      crc
      crc
      */

      for (var i=0; i < rlink.parameterView.collection.length; i++) {
        bytearray[byteIndex++] = rlink.parameterView.collection.at(i).get('address');
        if (rlink.parameterView.collection.at(i).get('type') == 'Boolean') {
          if (rlink.parameterView.collection.at(i).get('value') === true)
            bytearray[byteIndex] = 255;
          else
            bytearray[byteIndex] = 0;
          byteIndex += 4;
        }
        else if (rlink.parameterView.collection.at(i).get('type') == 'Char') {
          var xmitChar = new Int8Array(1);
          xmitChar[0] = rlink.parameterView.collection.at(i).get('value');
          bytearray[byteIndex++] = xmitChar[0] & 0xFF;
          bytearray[byteIndex++] = 0;
          bytearray[byteIndex++] = 0;
          bytearray[byteIndex++] = 0;
        }
        else if (rlink.parameterView.collection.at(i).get('type') == 'Integer') {
          var xmitInt = new Int16Array(1);
          xmitInt[0] = rlink.parameterView.collection.at(i).get('value');
          bytearray[byteIndex++] = (xmitInt[0] >> 8) & 0xFF;
          bytearray[byteIndex++] = xmitInt[0] & 0xFF;
          bytearray[byteIndex++] = 0;
          bytearray[byteIndex++] = 0;
        }
        else if (rlink.parameterView.collection.at(i).get('type') == 'Long') {
          var xmitInt = new Int32Array(1);
          xmitInt[0] = rlink.parameterView.collection.at(i).get('value');
          bytearray[byteIndex++] = (xmitInt[0] >> 24) & 0xFF;
          bytearray[byteIndex++] = (xmitInt[0] >> 16) & 0xFF;
          bytearray[byteIndex++] = (xmitInt[0] >> 8) & 0xFF;
          bytearray[byteIndex++] = xmitInt[0] & 0xFF;
        }
        else if (rlink.parameterView.collection.at(i).get('type') == 'Float') {
          var xmitFloat = new Float32Array(1);
          xmitFloat[0] = rlink.parameterView.collection.at(i).get('value');
          var floatIntRepresentation = encodeFloat(xmitFloat[0]);
          bytearray[byteIndex++] = (floatIntRepresentation >> 24) & 0xFF;
          bytearray[byteIndex++] = (floatIntRepresentation >> 16) & 0xFF;
          bytearray[byteIndex++] = (floatIntRepresentation >> 8) & 0xFF;
          bytearray[byteIndex++] = floatIntRepresentation & 0xFF;
        }
      }

      // calculate crc-16
      var crcDec = utils.crc16(bytearray, 1+(rlink.parameterView.collection.length*5));

      // insert crc-16 into byte array
      bytearray[1+(rlink.parameterView.collection.length*5)] = (crcDec >> 8) & 0xFF;
      bytearray[2+(rlink.parameterView.collection.length*5)] = crcDec & 0xFF;

      // xmit
      rlink.sendByteArray(bytearray);

      // update local values
      rlink.getParams();
    }
  };

  // Based on code from Jonas Raoni Soares Silva
  // http://jsfromhell.com/classes/binary-parser
  function encodeFloat(number) {
      var n = +number,
          status = (n !== n) || n == -Infinity || n == +Infinity ? n : 0,
          exp = 0,
          len = 281, // 2 * 127 + 1 + 23 + 3,
          bin = new Array(len),
          signal = (n = status !== 0 ? 0 : n) < 0,
          n = Math.abs(n),
          intPart = Math.floor(n),
          floatPart = n - intPart,
          i, lastBit, rounded, j, exponent;

      if (status !== 0) {
          if (n !== n) {
              return 0x7fc00000;
          }
          if (n === Infinity) {
              return 0x7f800000;
          }
          if (n === -Infinity) {
              return 0xff800000
          }
      }

      i = len;
      while (i) {
          bin[--i] = 0;
      }

      i = 129;
      while (intPart && i) {
          bin[--i] = intPart % 2;
          intPart = Math.floor(intPart / 2);
      }

      i = 128;
      while (floatPart > 0 && i) {
          (bin[++i] = ((floatPart *= 2) >= 1) - 0) && --floatPart;
      }

      i = -1;
      while (++i < len && !bin[i]);

      if (bin[(lastBit = 22 + (i = (exp = 128 - i) >= -126 && exp <= 127 ? i + 1 : 128 - (exp = -127))) + 1]) {
          if (!(rounded = bin[lastBit])) {
              j = lastBit + 2;
              while (!rounded && j < len) {
                  rounded = bin[j++];
              }
          }

          j = lastBit + 1;
          while (rounded && --j >= 0) {
              (bin[j] = !bin[j] - 0) && (rounded = 0);
          }
      }
      i = i - 2 < 0 ? -1 : i - 3;
      while(++i < len && !bin[i]);
      (exp = 128 - i) >= -126 && exp <= 127 ? ++i : exp < -126 && (i = 255, exp = -127);
      (intPart || status !== 0) && (exp = 128, i = 129, status == -Infinity ? signal = 1 : (status !== status) && (bin[i] = 1));

      n = Math.abs(exp + 127);
      exponent = 0;
      j = 0;
      while (j < 8) {
          exponent += (n % 2) << j;
          n >>= 1;
          j++;
      }

      var mantissa = 0;
      n = i + 23;
      for (; i < n; i++) {
          mantissa = (mantissa << 1) + bin[i];
      }
      return ((signal ? 0x80000000 : 0) + (exponent << 23) + mantissa) | 0;
  };

  return {
    init: init,
    update: update
  };
});