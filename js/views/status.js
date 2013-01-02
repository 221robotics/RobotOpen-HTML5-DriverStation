define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone){

  var StatusView = Backbone.View.extend({
    el: $('#stats'),    

    // `initialize()` now binds model change/removal to the corresponding handlers below.
    initialize: function(){
      _.bindAll(this, 'render'); // every function that uses 'this' as the current object should be in here

      this.model.bind('change', this.render);
    },

    pad: function(number) {
        var result = "" + number;
        if (result.length < 2) {
            result = "0" + result;
        }

        return result;
    },

    millisToHoursMinutesSeconds: function(millis) {
      var time = millis / 1000;
      var hours = Math.floor(time / 3600);
      time = time - hours * 3600;
      var minutes = Math.floor(time / 60);
      var seconds = time - minutes * 60;

      return this.pad(hours) + ":" + this.pad(minutes) + ":" + this.pad(seconds);
    },

    // `render()` now includes two extra `span`s corresponding to the actions swap and delete.
    render: function(){
      // chrome app restrictions blow so we have to define our template inline
      var statTemplate = '<div class="span2"><div class="kpi">';

        if (this.model.get('connected'))
          statTemplate += 'engaged';
        else
          statTemplate += 'no link';

          statTemplate += '</div><div><small>connection</small></div></div><div class="span2"><div class="kpi">';
          
        if (this.model.get('enabled'))
          statTemplate += 'enabled';
        else
          statTemplate += 'disabled';

          statTemplate += '</div><div><small>state</small></div></div><div class="span2"><div class="kpi">';
          
          var dateDiff = this.model.get('connectionEnd').getTime()-this.model.get('connectionStart').getTime();
          statTemplate += this.millisToHoursMinutesSeconds(dateDiff);
          
          statTemplate += '</div><div><small>connection time</small></div></div><div class="span2"><div class="kpi">';
          
        if (this.model.get('averageLatency') > 0)
          statTemplate += this.model.get('averageLatency');
        else
          statTemplate += 'n/a';
          
          statTemplate += '</div><div><small>average latency</small></div></div><div class="span2"><div class="kpi">';
        statTemplate += this.model.get('packetRx');
          statTemplate += '</div><div><small>packet rx</small></div></div><div class="span2"><div class="kpi">';
        statTemplate += this.model.get('packetTx');
          statTemplate += '</div><div><small>packet tx</small></div></div>';
      $(this.el).html(statTemplate);
    }
  });
  
  // Our module now returns our view
  return StatusView;
});