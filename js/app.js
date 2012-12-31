// Filename: app.js
define([
  'jquery',
  'bootstrap',
  'gamepad',
  'highcharts',
  'networking',
  'robotlink',
  'joystickhandler',
  'charts',
  'backbone',
  'views/bundle'
], function($, bootstrap, gamepad, highcharts, networking, RobotLink, joystickHandler, charts, Backbone, BundleView){
  var init = function(){

    // setup connection
    joystickHandler.init();

    // create new robot link object
    var rolink = new RobotLink();

    // bind joystick handler to rolink
    joystickHandler.subscribe(rolink.handleJoyData);

    // init gamepad library
    gamepad.init(joystickHandler);

    // build the highcharts graph
    charts.buildGraph();
    
    function removeAllActive() {
      $("#control-link").removeClass('selected');
      $("#console-link").removeClass('selected');
      $("#setup-link").removeClass('selected');
      $("#parameters-link").removeClass('selected');
      $("#setup-div").hide();
      $("#parameters-div").hide();
      $("#control-div").hide();
      $("#console-div").hide();
    }

    function showSetup(e) {
      removeAllActive();
      $("#setup-div").show();
      $("#setup-link").addClass('selected');
    }

    function showControls(e) {
      removeAllActive();
      $("#control-div").show();
      $("#control-link").addClass('selected');
    }

    function showConsole(e) {
      removeAllActive();
      $("#console-div").show();
      $("#console-link").addClass('selected');
    }

    function showParameters(e) {
      removeAllActive();
      $("#parameters-div").show();
      $("#parameters-link").addClass('selected');
    }

    function enableRobot(e) {
      rolink.enable();
    }

    function disableRobot(e) {
      rolink.disable();
    }

    function connectRobot(e) {
      if (!window.rolink.is_connected)
        rolink.connect();
    }


    // bind nav links to UI actions
    $("#setup-link").bind('click', showSetup);
    $("#console-link").bind('click', showConsole);
    $("#control-link").bind('click', showControls);
    $("#parameters-link").bind('click', showParameters);

    // control buttons
    $("#enable-btn").bind('click', enableRobot);
    $("#disable-btn").bind('click', disableRobot);
    $("#connect-btn").bind('click', connectRobot);

    // disable backbone sync
    Backbone.sync = function(method, model, success, error){ 
      success();
    }

    var bundleView = new BundleView();
    bundleView.addItem();
    bundleView.addItem();
    bundleView.addItem();


    /*

    protocol version
    enable state
    connection state
    firmware version
    device name (powder keg board)
    uptime

    */

  }

  return {
    init: init
  };
});