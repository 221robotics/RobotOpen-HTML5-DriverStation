define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone){

  var ParameterItemView = Backbone.View.extend({
    tagName: 'tr', // name of tag to be created

    events : {
      "blur #modinput": "onBlur",
      "click #modcheck": "onBlur"
    },      

    // `initialize()` now binds model change/removal to the corresponding handlers below.
    initialize: function(){
      _.bindAll(this, 'render', 'unrender', 'remove', 'onBlur'); // every function that uses 'this' as the current object should be in here

      this.model.bind('change', this.render);
      this.model.bind('remove', this.unrender);
    },
    // `render()` now includes two extra `span`s corresponding to the actions swap and delete.
    render: function(){
      // chrome app restrictions blow so we have to define our template inline
      if (this.model.get('type') !== 'Boolean') {
        $(this.el).html('<td class="primary">' + this.model.get('name') + '</td><td>' + this.model.get('address') + '</td><td>' + this.model.get('type') + '</td><td><input type="text" id="modinput" placeholder="' + this.model.get('value') + '" value="' + this.model.get('value') + '" /></td>');
      } else {
        var checkedVal = this.model.get('value') ? ' checked' : '';
        $(this.el).html('<td class="primary">' + this.model.get('name') + '</td><td>' + this.model.get('address') + '</td><td>' + this.model.get('type') + '</td><td><input type="checkbox" id="modcheck"'+checkedVal+' /></td>');
      }

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
    onBlur : function(ev){
      var tag = $(ev.currentTarget);

      // update our value if valid
      if (this.model.get('type') === 'Boolean') {
        if (tag.is(":checked")) {
          this.model.set({value: true});
        } else {
          this.model.set({value: false});
        }
      } else if (this.model.get('type') === 'Char') {
        if (!isNaN(parseInt(tag.val())) && parseInt(tag.val()) <= 127 && parseInt(tag.val()) >= -128) {
          this.model.set({value: parseInt(tag.val())});
        }
      } else if (this.model.get('type') === 'Integer') {
        if (!isNaN(parseInt(tag.val())) && parseInt(tag.val()) <= 32767 && parseInt(tag.val()) >= -32768) {
          this.model.set({value: parseInt(tag.val())});
        }
      } else if (this.model.get('type') === 'Long') {
        if (!isNaN(parseInt(tag.val())) && parseInt(tag.val()) <= 2147483647 && parseInt(tag.val()) >= -2147483648) {
          this.model.set({value: parseInt(tag.val())});
        }
      } else if (this.model.get('type') === 'Float') {
        if (!isNaN(parseFloat(tag.val()))) {
          this.model.set({value: parseFloat(tag.val())});
        }
      }

      // update the view in case it was an invalid value
      this.render();
    }
  });
  
  // Our module now returns our view
  return ParameterItemView;
});