(function(root) {
  // Set-up the NameSpace
  root.chromeNetworking = new (function() {
    var NoAddressException = "No Address";
    var NotConnectedException = "Not Connected";

    var socket = chrome.socket || chrome.experimental.socket;

    var baseClient = function(socketMode) {
      var address;
      var port;
      var socketInfo;
      var connected = false;
      var callbacks = [];
      var self = this;

      this.connect = function(inAddress, inPort, callback, responseHandler) {
        if(!!inAddress == false) throw NoAddressException;

        address = inAddress;
        port = inPort;
        console.debug('creating socket', socketMode, address, port);
        socket.create(socketMode, {}, function(_socketInfo) {
          socketInfo = _socketInfo;
          socket.connect(socketInfo.socketId, address, port, function(connectResult) {
            //console.debug('connectResult', connectResult);
            connected = (connectResult == 0);
            socket.ondata = function(result) {
              for (var i=0;i<callbacks.length;i++) { 
                callbacks[i](result);
              }
            };
            self.poll();
            callback(connected);
          });
        });
      };

      this.poll = function() {
        if(!!address == false) throw NoAddressException; 
        if(connected == false) throw NotConnectedException;
        socket.read(socketInfo.socketId, (function(result) {
          if (result.resultCode > 0) {
            socket.ondata(result);
          }
          this.poll();
        }).bind(this));
      };

      this.send = function(data, callback) {
        callback = callback || function() {};
        if(!!address == false) throw NoAddressException; 
        if(connected == false) throw NotConnectedException; 
        socket.write(socketInfo.socketId, data, function(sendResult) {
          callback(sendResult);
        });
      };

      this.receive = function(callback) {
        if(!!address == false) throw NoAddressException; 
        //if(connected == false) throw NotConnectedException;
        callbacks.push(callback);
      };

      this.disconnect = function() {
        if(!!address == false) throw NoAddressException; 
        if(connected == false) throw NotConnectedException; 
        socket.disconnect(socketInfo.socketId);
        socket.destroy(socketInfo.socketId);
        connected = false;
      };
    };

    var _ROClient = function(socketMode) {
      return function() {
        var client = new baseClient(socketMode);

        this.connect = client.connect;
        this.disconnect = client.disconnect;
        this.receive = client.receive;
        this.send = client.send;

        this.callbacks = {};
      };
    };

    return {
      // Clients
      clients: {
        udp: {
          roClient: _ROClient('udp')
        }
      },
      // Exceptions
      exceptions: {
        NoAddressException: NoAddressException,
        NotConnectedException: NotConnectedException
      }
    };
  })(); 
})(this);