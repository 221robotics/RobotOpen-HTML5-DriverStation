define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone){

  var ItemView = Backbone.View.extend({
    tagName: 'tr', // name of tag to be created        

    // `initialize()` now binds model change/removal to the corresponding handlers below.
    initialize: function(){
      _.bindAll(this, 'render', 'unrender', 'remove'); // every function that uses 'this' as the current object should be in here

      this.model.bind('change', this.render);
      this.model.bind('remove', this.unrender);
    },
    // `render()` now includes two extra `span`s corresponding to the actions swap and delete.
    render: function(){
      // chrome app restrictions blow so we have to define our template inline
      $(this.el).html('<td class="primary">' + this.model.get('name') + '</td><td>' + this.model.get('value') + '</td><td>' + this.model.get('type') + '</td><td><div class="progress progress-mini"><div class="bar" style="width: ' + this.model.get('percent') + '%;"></div></div></td>');
      return this; // for chainable calls, like .render().el
    },
    // `unrender()`: Makes Model remove itself from the DOM.
    unrender: function(){
      $(this.el).remove();
    },
    // `remove()`: We use the method `destroy()` to remove a model from its collection. Normally this would also delete the record from its persistent storage, but we have overridden that (see above).
    remove: function(){
      this.model.destroy();
    }
  });
  
  // Our module now returns our view
  return ItemView;
});