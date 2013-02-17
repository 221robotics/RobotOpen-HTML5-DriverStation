define([
  'jquery',
  'underscore',
  'backbone',
  'collections/parameters',
  'views/parameteritem'
], function($, _, Backbone, ParameterCollection, ParameterItemView){
  var ParameterView = Backbone.View.extend({
    el: $('#parameter-body'),

    initialize: function(){
      _.bindAll(this, 'render', 'updateParameters', 'appendItem', 'clearAll'); // every function that uses 'this' as the current object should be in here
      
      this.collection = new ParameterCollection();
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
      this.$el.html('<tr><td colspan="4">No parameters loaded</td></tr>');
    },
    updateParameters: function(parameters){
      var self = this;

      // clear all existing parameters
      self.clearAll();
      this.$el.html('');

      // add each parameter to the collection
      _.each(parameters, function(parameter) {
        self.collection.add(parameter);
      });
    },
    appendItem: function(item){
      var parameterItemView = new ParameterItemView({
        model: item
      });
      this.$el.append(parameterItemView.render().el);
    }
  });

  // Our module now returns our view
  return ParameterView;
});