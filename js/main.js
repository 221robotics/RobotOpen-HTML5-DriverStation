// Main app entry point


require.config({
  paths: {
    jquery: '../lib/jquery.min',
    highcharts: '../lib/highcharts',
    backbone: '../lib/backbone.min',
    json2: '../lib/json2',
    bootstrap: '../lib/bootstrap.min',
    underscore: '../lib/underscore.min'
  },
  shim: {
        // load in proper order
        'bootstrap': ['jquery'],
        'highcharts': ['jquery'],
        'backbone': ['underscore', 'json2', 'jquery']
  }
});

require([
  'app',
], function(App){
  	// initialize the main app
  	App.init();
});