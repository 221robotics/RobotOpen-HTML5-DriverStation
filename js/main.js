// Main app entry point


require.config({
  paths: {
    jquery: '../lib/jquery.min',
    highcharts: '../lib/highcharts',
    backbone: '../lib/backbone.min',
    localstorage: '../lib/backbone.localStorage',
    json2: '../lib/json2',
    bootstrap: '../lib/bootstrap.min',
    underscore: '../lib/underscore.min'
  },
  shim: {
    'highcharts': {
        //These script dependencies should be loaded before loading
        //backbone.js
        deps: ['jquery'],
        //Once loaded, use the global 'Backbone' as the
        //module value.
        exports: 'Highcharts'
    },
    'bootstrap': {
        //These script dependencies should be loaded before loading
        //backbone.js
        deps: ['jquery'],
        //Once loaded, use the global 'Backbone' as the
        //module value.
        exports: 'Bootstrap'
    },
    'underscore': {
        exports: '_'
    },
    'backbone': {
        //These script dependencies should be loaded before loading
        //backbone.js
        deps: ['underscore', 'jquery', 'json2'],
        //Once loaded, use the global 'Backbone' as the
        //module value.
        exports: 'Backbone'
    },
    'localstorage': {
        //These script dependencies should be loaded before loading
        //backbone.js
        deps: ['backbone']
    }
  }
});

require([
  'app',
], function(App){
  	// initialize the main app
  	App.init();
});