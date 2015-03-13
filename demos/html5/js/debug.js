window.Debug = new (function(){
  var that = this,
      _polygon,
      _panels,
      _toh;


  _panels = {
  }

  function init() {
    //addDebugPanel();
    tapStarToAdd();

    if (!Utils.isTouch()) {
      //enableCreatePolygonMode();
      //dragAbsoluteElements();
    }
    //Sound.soundEnabled = User.state.soundEnabled = false;
    //Sound.musicEnabled = User.state.musicEnabled = false;

    //User.unlockQuests();

    //Levels.levels[1].quests=[1,2,3,4,5,6,7,8,9];    

    for (var levelNr = 1; levelNr <= 18; levelNr++) {      
      //User.completeLevel(levelNr);
      
      for (var questNr = 1; questNr <= 9; questNr++) {
        //User.completeQuest(levelNr, questNr);
      }
    }
  }

  function tapStarToAdd() {
    $(document).on(Utils.touchEnd(), '#levels-page-6 .starsachieved', function(event) {
      Utils.eat(event);
      if (!Utils.wasClick((event))) return;
      User.addStars(1)
      return false;
    });
  }

  function addDebugPanel() {
    var $debugButton = $('<div id="debugButton"></div>');
    var $debugPanel = $('<div id="debugPanel"></div>');
    $('body').append($debugButton).append($debugPanel);
    Utils.createCSS('#debugButton{position:fixed;z-index:99999;width:40px;height:30px;background:rgba(0,0,0,.5);bottom:0;left:0;}');
    Utils.createCSS('#debugPanel{display:none;position:fixed;z-index:99998;width:100%;height:100%;background:rgba(255,255,255,.8);bottom:0;left:0; padding: 10px;}');
    Utils.createCSS('#debugPanel button{display:block; margin-bottom: 10px}');
    Utils.createCSS('#debugLog {display:block;width:100%; height: 30%; background-color: transparent}');
    $debugPanel.append('<button onclick="Debug.hideDebugPanel();Debug.enableCreatePolygonMode()">create polygons</button>')
    $debugPanel.append('<button onclick="Debug.hideDebugPanel();Debug.dragAbsoluteElements()">drag absolute elements</button>')
    $debugPanel.append('<button onclick="Debug.hideDebugPanel();Debug.bruteForce()">brute force</button>')
    $debugPanel.append('<textarea id="debugLog"></textarea>')
    $debugPanel.append('<button onclick="Debug.showTileXY()">show tileXY</button>')
    $(document).on(Utils.touchStart(), '#debugButton', function() {
      if ($debugPanel.css('display')=='none')
        $debugPanel.show();
      else
        $debugPanel.hide();
    })
  }

  this.showTileXY = showTileXY;
  function showTileXY() {
    var x = prompt('x', 0) * 1;
    var y = prompt('y', 0) * 1;
    var $tile = $('#tile-' + x + '-' + y);
    if ($tile.length) {
      log($tile[0].outerHTML);
    }
  }

  this.log = log;
  function log() {
    var s = '';
    for (i = 0; i<arguments.length; i++)
      s += arguments[i] + ', ';
    s = s.replace(/\, $/, '\n');
    console.log('[Debug.log]', s);
    if ($('#debugLog').length)
      $('#debugLog')[0].value += s;
  }

  this.hideDebugPanel = hideDebugPanel;
  function hideDebugPanel() {
    $('#debugPanel').hide();
  }

  this.enableCreatePolygonMode = enableCreatePolygonMode;
  function enableCreatePolygonMode() {
    console.log('enableCreatePolygonMode is enabled. Regular swiped or taps may not work...')
    _polygon = [];
    $(document).off('touchmove mousemove touchend mouseup click');
    $(document).on('click', '#game', function(event) {
      Utils.eat(event);
      var xyEvent = event,
          x = Math.round(xyEvent.clientX - $('#game').offset().left);
          y = Math.round(xyEvent.clientY - $('#game').offset().top);
          var s = '';
      if (event.shiftKey) {
        _polygon.push(x, y);
        var polygonText = '\'id\': { polygon: [' + _polygon.join(', ') + '] },'
        console.log(polygonText);
      }
      if (event.ctrlKey || event.metaKey) {
        _polygon = [];
        console.log('polygon cleared');
        log('polygon cleared')
      }
      return false;
    });
  }

  this.dragAbsoluteElements = dragAbsoluteElements;
  function dragAbsoluteElements() {
    var $el, $html = $('html'), startX, startY, startLeft, startTop;

    $(document).on(Utils.touchStart(), 'html', dragStart);

    function dragStart(event) { 
      if (!(event.shiftKey && (event.ctrlKey || event.metaKey))) return;

      $el = $(event.target);
      if (!$el.css('position') == 'absolute') return;

      $(document).off('touchmove mousemove touchend mouseup');

      $(document).on(Utils.touchMove(), 'html', drag);
      $(document).on(Utils.touchEnd(), 'html', dragEnd);
      Utils.eat(event);

      if ($el.length) {
        var xyEvent = event.originalEvent.touches? event.originalEvent.touches[0] : event;
        startX = Math.round(xyEvent.clientX);
        startY = Math.round(xyEvent.clientY);
        startLeft = $el.css('left').replace(/\D/gi, '') * 1;
        startTop = $el.css('top').replace(/\D/gi, '') * 1;
      }
    }

    function drag(event) {
      Utils.eat(event);
      var xyEvent = event.originalEvent.touches? event.originalEvent.touches[0] : event,
          deltaX = Math.round(xyEvent.clientX) - startX,
          deltaY = Math.round(xyEvent.clientY) - startY,
          newLeft = startLeft + deltaX,
          newTop = startTop + deltaY;
      $el.css({
        'left': newLeft + 'px',
        'top': newTop + 'px'
      })
      $el.attr('title', newLeft + ',' + newTop);
    }

    function dragEnd(event) {
      $(document).off(Utils.touchMove(), 'html', drag);
      $(document).off(Utils.touchEnd(), 'html', dragEnd);
      Utils.eat(event);
      var left = $el.css('left').replace(/\D/gi, '') * 1;
      var top = $el.css('top').replace(/\D/gi, '') * 1;
      console.log(left, top);
      log(left, top);
      return false;
    }
  }

  function fakeTap(tileX, tileY) {
    var fakeEvent = new FakeEvent(tileX, tileY);
    Game.io.startMoveTileHandler(fakeEvent);
    setTimeout(function() {
      Game.io.endMoveTile(fakeEvent);
    }, Utils.between(0, 10));
  }

  function fakeMove(tileX, tileY, offsetX, offsetY) {
    Game.io.startMoveTileHandler(new FakeEvent(tileX, tileY));
    //setTimeout(function() {
      Game.io.moveTile(new FakeEvent(tileX + offsetX, tileY + offsetY));
    //}, Utils.between(0, 10));
    //setTimeout(function() {
      Game.io.endMoveTile(new FakeEvent(tileX + offsetX, tileY + offsetY));
    //}, Utils.between(5, 20));
  }

  function FakeEvent(tileX, tileY) {
    var tilesOffsetTop = $('#tiles').offset().top,
        tilesOffsetLeft = Math.round(($('#game').width() - $('#tiles').width()) / 2),
        x = tileX * grid.tileSize + $('#game').offset().left + tilesOffsetLeft,
        y = tileY * grid.tileSize + tilesOffsetTop;
    
    this.clientX = x;
    
    this.clientY = y;
    
    this.stopPropagation = function() {
      
    }
    this.preventDefault = function() {
      
    }
  }

  function bruteForce() {
    /*
    var fixResult = grid.fix();
    if (fixResult != '') {
      alert(fixResult);
      return;
    }
    */
    window.onerror = function(msg) {
      console.log('[error handled inside bruteForce]');
      console.error('error arguments: ', arguments);
      cur = count + 1;
    }

    var maxX = grid.tilesX,
        maxY = grid.tilesY,
        count = 100,
        cur = 0;

    go();

    function go() {
      if (cur < count) {
        tapOrSwipe();
        cur++;
        _toh = setTimeout(go, 0);
      }
      else
        console.log('bruteForce done at', cur)
    }

    function tapOrSwipe() {
      var tap = Utils.between(0, 1) == 1,
          x = Utils.between(0, maxX),
          y = Utils.between(0, maxY);
      if (tap)
        fakeTap(x, y)
      else {
        var moveHor = Utils.between(0, 1) == 1,
            offset = Utils.between(0, 1) == 1? -1 : 1,
            xOffset = moveHor? offset : 0,
            yOffset = moveHor? 0 : offset;
        fakeMove(x, y, xOffset, yOffset);
      }
    }
  }

  function stopBruteForce() {
    clearTimeout(_toh);
  }

  this.fakeTap = fakeTap;
  this.fakeMove = fakeMove;
  this.bruteForce = bruteForce;
  this.stopBruteForce = stopBruteForce;
  this.enableCreatePolygonMode = enableCreatePolygonMode;

  this.init = init;

})();

$(function(){
  if (window.BubbleWrappEnabled) {
    BubbleWrapp.log('HTML5 OK v6');

    window.onerror = function(message, url, lineNumber) {
      BubbleWrapp.log("Error: " + message + " in " + url + " at line " + lineNumber);
    }  
  }
})