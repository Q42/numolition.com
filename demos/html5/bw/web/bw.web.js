$bw.web = new (function(){
  var that = this;

  if (!$bw.isApp)
    init();

  function init() {
    $bw.registerPingHandler(ping);
    detectLanguage();
  }

  function ping() {
    var actions = $bw.getActions();
    while (actions.length) {
      var action = actions.splice(0,1)[0];
      handleAction(action);
    }    
  }

  function detectLanguage() {
    var langDetected = (navigator.language + '').replace(/\-.*$/g, '').toLowerCase();
    BubbleWrappInfo.locale = langDetected;
  }

  function handleAction(action) {
    var name = action.name,
        params = action.params,
        pairs = name.split('.'),
        moduleName = pairs[0],
        methodName = pairs[1],
        module = $bw.web[moduleName];

    // pass it to the respective module and handler
    if (module && module[methodName]) {
      module[methodName](params);
    }
  }

  function createCSS(cssStr) {
    var style = document.createElement('style');
    style.innerHTML = cssStr;
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(style);
  }

  this.createCSS = createCSS;

})();