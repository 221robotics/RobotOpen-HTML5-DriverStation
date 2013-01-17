define([
  'jquery',
  'underscore',
  'backbone',
  'models/status',
  'utils'
], function($, _, Backbone, StatusModel, utils){

  var StatusView = Backbone.View.extend({
    el: $('#stats'),    

    // `initialize()` now binds model change/removal to the corresponding handlers below.
    initialize: function(){
      _.bindAll(this, 'render'); // every function that uses 'this' as the current object should be in here

      this.model.bind('change', this.render);
    },

    millisToHoursMinutesSeconds: function(millis) {
      var time = millis / 1000;
      var hours = Math.floor(time / 3600);
      time = time - hours * 3600;
      var minutes = Math.floor(time / 60);
      var seconds = Math.floor(time - minutes * 60);

      return utils.pad(hours, 2) + ":" + utils.pad(minutes, 2) + ":" + utils.pad(seconds, 2);
    },

    // `render()` now includes two extra `span`s corresponding to the actions swap and delete.
    render: function(){
      // chrome app restrictions blow so we have to define our template inline
      var statTemplate = '<div class="span2"><div class="kpi">';

        if (this.model.get('connecting'))
          statTemplate += 'trying';
        else if (this.model.get('connected'))
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
          if (dateDiff > 0)
            statTemplate += this.millisToHoursMinutesSeconds(dateDiff);
          else
            statTemplate += '00:00:00';
          
          statTemplate += '</div><div><small>connection time</small></div></div><div class="span2"><div class="kpi">';
          
        if (this.model.get('averageLatency') > 0)
          statTemplate += this.model.get('averageLatency') + ' ms';
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

  // status view
  var statModel = new StatusModel();
  var statView = new StatusView({
      model: statModel
  });

  // first pass render
  statView.render();
  
  // return the singleton model
  return statModel;
});