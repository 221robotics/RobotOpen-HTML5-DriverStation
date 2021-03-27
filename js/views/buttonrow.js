define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone){

  var ButtonRowView = Backbone.View.extend({
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
      var buttonIdentifier;
      if (this.model.get('remap'))
        buttonIdentifier = "...";
      else if (this.model.get('axis'))
        buttonIdentifier = "Axis_"+this.model.get('gamepadIndex');
      else
        buttonIdentifier = "Button_"+this.model.get('gamepadIndex');

      var buttonValue;
      var buttonPercent;
      if (this.model.get('axis')) {
        buttonValue = this.model.get('value');
        buttonPercent = Math.trunc(buttonValue/255*100);
      } else {
        buttonValue = (this.model.get('value') > 0)? 1:this.model.get('value');
        buttonPercent = Math.trunc(buttonValue/1*100);
      }
      
      $(this.el).html('<td class="primary">' + this.model.get('alias') + ': ' + this.model.get('arduino_alias') +'</td><td><div class="progress"><div class="bar" style="width: ' + buttonPercent + '%;" aria-valuenow="' + this.model.get('value') + '" aria-valuemin="0" aria-valuemax="255">' + buttonValue + '</div></div></td><td><a class="btn btn-primary btn-small">' + buttonIdentifier + '</a></td>');
      return this; // for chainable calls, like .render().el
    },
    // `unrender()`: Makes Model remove itself from the DOM.
    unrender: function(){
      $(this.el).remove();
    },
    // `remove()`: We use the method `destroy()` to remove a model from its collection. Normally this would also delete the record from its persistent storage, but we have overridden that (see above).
    remove: function(){
      this.model.destroy();
    },
    events: {
      "click a": "remap"
    },
    remap: function() {
      this.model.set({remap: true});
      this.render();
    }
  });
  
  // Our module now returns our view
  return ButtonRowView;
});