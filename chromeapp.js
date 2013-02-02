chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    width: 1000,
    height: 800,
  },
  function(win) {
    win.maximize();
  });
});