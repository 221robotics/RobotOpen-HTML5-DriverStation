define([
  'jquery',
  'underscore',
  'backbone',
  'collections/controller',
  'views/buttonrow'
], function($, _, Backbone, ControllerCollection, ButtonRowView){
  var ControllerView = Backbone.View.extend({
    initialize: function(options){
      _.bindAll(this, 'buttonUpdate', 'render', 'appendItem'); // every function that uses 'this' as the current object should be in here

      this.el = $('#'+options.localIdentifier);
      
      this.collection = new ControllerCollection([], {localIdentifier: options.localIdentifier})
      this.collection.bind('add', this.appendItem); // collection event binder
      this.collection.bind('reset', this.render);
    },
    buttonUpdate: function(axs, id) {
      var self = this;
      _(this.collection.models).each(function(item){
        if (item.get('remap') && (item.get('axis') == axs)) {
          item.set({gamepadIndex: id, remap: false});
          item.sync('update', item);
        }
      }, this);
    },
    render: function(){
      var self = this;

      _(this.collection.models).each(function(item){ // in case collection is not empty
        self.appendItem(item);
      }, this);
    },
    appendItem: function(item){
      var itemView = new ButtonRowView({
        model: item
      });
      this.el.append(itemView.render().el);
    }
  });

  // Our module now returns our view
  return ControllerView;
});