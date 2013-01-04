// Filename: average.js
// Stores and calculates a moving average
define([
  'jquery'
], function($){
  var instance;

  // Start with the constructor
  function Average(avWindow) {
    instance = this;

    if (avWindow != null)
      this.avWindow = avWindow;
    else
      this.avWindow = 10;

    this.items = new Array();
  };

  Average.prototype.add = function(number) {
    instance.items.push(number);
    if (instance.items.length > instance.avWindow)
      instance.items.splice(0, 1);
  };

  Average.prototype.getAverage = function() {
    if (instance.items.length < 1)
      return 0;

    var avg = 0;
    for (var i=0; i<instance.items.length; i++) {
      avg += instance.items[i];
    }
    return Math.round(avg/instance.items.length);
  }

  return Average;
});