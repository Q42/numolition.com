// window scope initialization
if (!window.BubbleWrappInfo && window.BubbleWrappBridge) {
  // Added by Kars; Special code for AndroidBridge
  // Android
  window.BubbleWrappInfo = eval('('+ BubbleWrappBridge.getInfo() + ')');

  // send our devicePixelRatio back to android (needed for the effects) (todo: can be read automatically from android?)
  BubbleWrappBridge.registerDevicePixelRatio(window.devicePixelRatio);

} 
else if (!window.BubbleWrappInfo) { 
  // web
  window.BubbleWrappInfo = {
    isApp: false,
    locale: '',
    hasBackButton: false,
    storage: {} // name value pairs, we need this on boot time

  };
}


window.$bw = window.BubbleWrapp = new (function BubbleWrapp() {
  var that = this,
      _queue = [],
      _isApp = false,
      _separator = '__bw__',
      _pingHandler = devicePingHandler;

  detectDevice();
  onPageLoad();

  function onPageLoad() {
    if (document.readyState != 'complete')
      return setTimeout(onPageLoad, 0);
    
    // auto run all modules' onPageLoad methods
    for (var o in $bw)
      if (typeof $bw[o] == 'object' && $bw[o].__onPageLoad)
        $bw[o].__onPageLoad();        
  }

  // see if BubbleWrapp was loaded inside a device using a WebView control
  function detectDevice() {
    _isApp = BubbleWrappInfo.isApp? true : false;
  }

  // default ping handler to tell the device to get all actions (after which the queue is cleared)
  function devicePingHandler() {
    window.location = 'bubblewrapp://ping';
  }

  // @name = name of action to do
  // @paramObj = { foo: 'bar', ... }
  function doAction(name, paramObj) {
  	var actionObj = {
      'name': name,
      'params': paramObj
    };

    if (window.BubbleWrappBridge) {
      //kars added: can be direct to Android
      BubbleWrappBridge.doAction(name, JSON.stringify(paramObj));
    } else {
      _queue.push(actionObj);
      _pingHandler();
    }

    return that;
  }

  function getActions() {
    if (_isApp) {
      var commandArr = [];
      for (var i=0; i<_queue.length; i++)
        commandArr.push(JSON.stringify(_queue[i]));

      var commandStr = commandArr.join(_separator);
      clearQueue();
      return commandStr;
    }
    else {
      var commandArr = [];
      for (var i=0; i<_queue.length; i++)
        commandArr.push(_queue[i]);
      clearQueue();
      return commandArr;
    }
  }

  function clearQueue() {
    _queue = [];
    return that;
  }

  // registers the ping handler (for use in Chrome or Firefox, etc)
  function registerPingHandler(handler) {
    _pingHandler = handler;
  }

  this._ = {};
  this.doAction = doAction; 
  this.getActions = getActions; 
  this.registerPingHandler = registerPingHandler; 
  this.__defineGetter__('isApp', function() { return _isApp; });
})();
