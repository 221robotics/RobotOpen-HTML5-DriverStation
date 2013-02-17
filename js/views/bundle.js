define([
  'jquery',
  'underscore',
  'backbone',
  'collections/bundles',
  'views/bundleitem'
], function($, _, Backbone, BundleCollection, ItemView){
  var BundleView = Backbone.View.extend({
    el: $('#bundles'),

    initialize: function(){
      _.bindAll(this, 'render', 'updateBundles', 'appendItem', 'clearAll'); // every function that uses 'this' as the current object should be in here
      
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
    clearAll: function(){
      // remove all items
      while (this.collection.models.length > 0) {
        this.collection.remove(this.collection.models[0]);
      }
      // clear the view
      this.$el.html('');
    },
    updateBundles: function(bundles){
      var self = this;

      // if the DS item already exists, update it!
      _.each(bundles, function(bundle) {
        var found = false;

        self.collection.find(function(item) {
          if (item.get('name') === bundle.get('name')) {
            item.set({value: bundle.get('value'), type: bundle.get('type'), percent: bundle.get('percent')});
            found = true;
            // clean up the intermediary model
            bundle.destroy();
          }
        });

        // didn't find it, add it to the collection
        if (!found)
          self.collection.add(bundle);
      });
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