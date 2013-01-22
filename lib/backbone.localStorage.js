/**
 * Backbone localStorage Adapter
 * Version 1.0
 *
 * https://github.com/jeromegn/Backbone.localStorage
 */
(function (root, factory) {
   if (typeof define === "function" && define.amd) {
      // AMD. Register as an anonymous module.
      define(["underscore","backbone"], function(_, Backbone) {
        // Use global variables if the locals is undefined.
        return factory(_ || root._, Backbone || root.Backbone);
      });
   } else {
      // RequireJS isn't being used. Assume underscore and backbone is loaded in <script> tags
      factory(_, Backbone);
   }
}(this, function(_, Backbone) {
// A simple module to replace `Backbone.sync` with *localStorage*-based
// persistence. Models are given GUIDS, and saved into a JSON object. Simple
// as that.

// Hold reference to Underscore.js and Backbone.js in the closure in order
// to make things work even if they are removed from the global namespace

// Generate four random hex digits.
function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

// Our Store is represented by a single JS object in *localStorage*. Create it
// with a meaningful name, like the name you'd give a table.
// window.Store is deprectated, use Backbone.LocalStorage instead
Backbone.LocalStorage = window.Store = function(name, readyCallback) {
  var that = this;
  that.name = name;
  chrome.storage.local.get(name, function(data) {
    that.records = (data[name] && data[name].split(",")) || [];
    readyCallback();
  });
};

_.extend(Backbone.LocalStorage.prototype, {

  // Save the current state of the **Store** to *localStorage*.
  save: function() {
    var dict = {};
    dict[this.name] = this.records.join(",");
    chrome.storage.local.set(dict);
  },

  // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
  // have an id of it's own.
  create: function(model, options, syncDfd, handleResp) {
    if (!model.id) {
      model.id = guid();
      model.set(model.idAttribute, model.id);
    }
    var dict = {};
    dict[this.name+"-"+model.id] = JSON.stringify(model);
    chrome.storage.local.set(dict);
    this.records.push(model.id.toString());
    this.save();
    handleResp(this.find(model), options, syncDfd);
  },

  // Update a model by replacing its copy in `this.data`.
  update: function(model, options, syncDfd, handleResp) {
    var dict = {};
    dict[this.name+"-"+model.id] = JSON.stringify(model);
    chrome.storage.local.set(dict);
    if (!_.include(this.records, model.id.toString()))
      this.records.push(model.id.toString()); this.save();
    handleResp(model, options, syncDfd);
  },

  // Retrieve a model from `this.data` by id.
  find: function(model, options, syncDfd, handleResp) {
    var that = this;
    chrome.storage.local.get(this.name+"-"+model.id, function(data) {
      handleResp(that.jsonData(data[that.name+"-"+model.id]), options, syncDfd);
    });
  },

  // Return the array of all models currently in storage.
  findAll: function(options, syncDfd, handleResp) {
    var ref = this;
    var items = [];
    if (this.records.length == 0) {
      handleResp(items, options, syncDfd);
      return;
    }
    for(var i=0; i<this.records.length; i++) {
      var recordId = this.name+"-"+this.records[i];
      chrome.storage.local.get(recordId, function(data) {
        for (var i in data) {
          items.push(ref.jsonData(data[i]));
        }
        if (items.length == ref.records.length)
          handleResp(_.compact(items), options, syncDfd);
      });
    }
  },

  // Delete a model from `this.data`, returning it.
  destroy: function(model, options, syncDfd, handleResp) {
    if (model.isNew())
      handleResp(false, options, syncDfd);
    chrome.storage.local.remove(this.name+"-"+model.id);
    this.records = _.reject(this.records, function(id){
      return id === model.id.toString();
    });
    this.save();
    handleResp(model, options, syncDfd);
  },

  localStorage: function() {
    return localStorage;
  },
  
  // fix for "illegal access" error on Android when JSON.parse is passed null
  jsonData: function (data) {
      return data && JSON.parse(data);
  }

});

// localSync delegate to the model or collection's
// *localStorage* property, which should be an instance of `Store`.
// window.Store.sync and Backbone.localSync is deprectated, use Backbone.LocalStorage.sync instead
Backbone.LocalStorage.sync = window.Store.sync = Backbone.localSync = function(method, model, options) {
  var store = model.localStorage || model.collection.localStorage;

  var syncDfd = $.Deferred && $.Deferred(); //If $ is having Deferred - use it.

  // callback for handling store response
  var handleResp = function(resp, opt, synDf) {
    if (resp) {
      if (opt && opt.success)
        opt.success(resp);
      if (synDf)
        synDf.resolve(resp);

    } else {
      var errMessage = "Record Not Found";
      
      if (opt && opt.error)
        opt.error(errMessage);
      if (synDf)
        synDf.reject(errMessage);
    }
    
    // add compatibility with $.ajax
    // always execute callback for success and error
    if (opt && opt.complete) opt.complete(resp);
  };

  try {
    switch (method) {
      case "read":
        model.id != undefined ? store.find(model, options, syncDfd, handleResp) : store.findAll(options, syncDfd, handleResp);
        break;
      case "create":
        store.create(model, options, syncDfd, handleResp);
        break;
      case "update":
        store.update(model, options, syncDfd, handleResp);
        break;
      case "delete":
        store.destroy(model, options, syncDfd, handleResp);
        break;
    }

  } catch(error) {
    var errMessage;

    if (error.code === DOMException.QUOTA_EXCEEDED_ERR && window.localStorage.length === 0)
      errMessage = "Private browsing is unsupported";
    else
      errMessage = error.message;

    if (syncDfd)
      syncDfd.reject(errMessage);
  }

  return syncDfd && syncDfd.promise();
};

Backbone.ajaxSync = Backbone.sync;

Backbone.getSyncMethod = function(model) {
  if(model.localStorage || (model.collection && model.collection.localStorage)) {
    return Backbone.localSync;
  }

  return Backbone.ajaxSync;
};

// Override 'Backbone.sync' to default to localSync,
// the original 'Backbone.sync' is still available in 'Backbone.ajaxSync'
Backbone.sync = function(method, model, options) {
  return Backbone.getSyncMethod(model).apply(this, [method, model, options]);
};

return Backbone.LocalStorage;
}));