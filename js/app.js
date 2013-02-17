// Filename: app.js
define([
  'jquery',
  'bootstrap',
  'gamepad/gamepad',
  'highcharts',
  'robot/networking',
  'robot/robotlink',
  'gamepad/joystickhandler',
  'views/charts',
  'backbone',
  'views/status',
  'views/console'
], function($, bootstrap, gamepad, highcharts, networking, RobotLink, joystickHandler, charts, Backbone, statView, consoleview){
  var init = function(){

    // create new robot link object
    var rolink = new RobotLink();

    // bind joystick handler to rolink
    joystickHandler.subscribe(rolink);

    // init gamepad library
    gamepad.init(joystickHandler);

    // build the highcharts graph
    charts.buildGraph();
    
    // bind statView to robot link
    rolink.setStatModel(statView);
    
    function removeAllActive() {
      consoleview.deactivate();
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
      consoleview.activate();
      $("#console-div").show();
      $("#console-link").addClass('selected');
    }

    function showParameters(e) {
      removeAllActive();
      $("#parameters-div").show();
      $("#parameters-link").addClass('selected');
    }

    function enableRobot(e) {
      if (rolink.is_connected) {
        if (rolink.enabled) {
          rolink.disable();
        } else {
          rolink.enable();
        }
      }
    }

    function connectRobot(e) {
      if (!rolink.is_connected) {
        rolink.connect();
      }
      else {
        rolink.disconnect();
      }
    }

    function showJoyOne() {
      showSetup();
      $('#myTab a[href="#joy1main"]').tab('show');
    }

    function showJoyTwo() {
      showSetup();
      $('#myTab a[href="#joy2main"]').tab('show');
    }

    function showJoyThree() {
      showSetup();
      $('#myTab a[href="#joy3main"]').tab('show');
    }

    function showJoyFour() {
      showSetup();
      $('#myTab a[href="#joy4main"]').tab('show');
    }

    $('#robotPort').blur(function() {
      if (!isNaN(parseInt($('#robotPort').val()))) {
        chrome.storage.sync.set({'robotPort': parseInt($('#robotPort').val())}, function() {
          console.log('saved robot port');
        });
      } else {
        chrome.storage.sync.set({'robotPort': 22211}, function() {
          console.log('saved robot port 22211');
        });
      }
    });

    $('#robotIp').blur(function() {
      chrome.storage.sync.set({'robotIp': $('#robotIp').val()}, function() {
        // saved
        console.log('saved robot IP');
      });
    });

    // bind nav links to UI actions
    $("#setup-link").bind('click', showSetup);
    $("#console-link").bind('click', showConsole);
    $("#control-link").bind('click', showControls);
    $("#parameters-link").bind('click', showParameters);

    // bind joy labels to UI actions
    $("#joylabel1").bind('click', showJoyOne);
    $("#joylabel2").bind('click', showJoyTwo);
    $("#joylabel3").bind('click', showJoyThree);
    $("#joylabel4").bind('click', showJoyFour);

    // control buttons
    $("#enable-btn").bind('click', enableRobot);
    $("#connect-btn").bind('click', connectRobot);

    // create tooltips
    $("[rel='tooltip']").tooltip();

    // load in robot config
    chrome.storage.sync.get(['robotPort', 'robotIp'], function(items) {
      if (items.robotPort !== undefined && items.robotIp !== undefined) {
        $('#robotIp').val(items.robotIp);
        $('#robotPort').val(items.robotPort);
        console.log('successfully loaded stored robot config');
      } else {
        console.log('robot config not found, loading defaults');
      }
    });

    $(document).keydown(function(evt) {
      if (evt.keyCode == 32 && rolink.enabled) {
        rolink.disable();
      }
    });
  }

  return {
    init: init
  };
});