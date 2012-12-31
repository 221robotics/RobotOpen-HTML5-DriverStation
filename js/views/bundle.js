define([
  'jquery',
  'underscore',
  'backbone',
  'collections/bundles',
  'views/item'
], function($, _, Backbone, BundleCollection, ItemView){
  var BundleView = Backbone.View.extend({
    el: $('#bundles'),

    initialize: function(){
      _.bindAll(this, 'render', 'addItem', 'appendItem'); // every function that uses 'this' as the current object should be in here
      
      this.collection = new BundleCollection();
      this.collection.bind('add', this.appendItem); // collection event binder

      this.render();
    },
    render: function(){
      var self = this;

      _(this.collection.models).each(function(item){ // in case collection is not empty
        self.appendItem(item);
      }, this);
    },
    addItem: function(){
      // TODO - create bundle object/model here
      this.collection.add({ name: "Stupid Encoder", value: 193, type: 'Int', percent: 55});
    },
    appendItem: function(item){
      var itemView = new ItemView({
        model: item
      });
      this.$el.append(itemView.render().el);
    }
  });

  // Our module now returns our view
  return BundleView;
});