window.Hand = new (function(){
  var that = this,
      _tilesOffsetTop,
      _tilesOffsetLeft,
      _$hand,
      _$handIcon,
      _commands = [],
      _nextTOH = 0,
      _condition,
      _cmdIndex,
      _repeat = true,
      _loop = 0,
      _showDownTile = true;

  function init() {
    _$hand = $('#hand'),
    _$handIcon = $('#hand-icon');
  }

  // allows for doing stuff right before an actual game begins
  function gameStarts() {
    // update the actual tiles offset for properly positioning the explosions
    _tilesOffsetTop = $('#game').height() - grid.tileSize * grid.tilesY;
    _tilesOffsetLeft = Math.round(($('#game').width() - $('#tiles').width()) / 2);
  }

  function startAt(x, y, condition, noDownTile) {
    _showDownTile = noDownTile? false : true;
    if (_showDownTile)
      _$hand.addClass('showDownTile');
    else
      _$hand.removeClass('showDownTile');
    stop();
    _loop = 0;
    _condition = condition;
    _commands.push({'x':x, 'y':y});
    start();
    if (!_nextTOH)
      _nextTOH = setTimeout(next, 1500);
    return that;
  }
  
  function start() {
    _cmdIndex = 0;
    var command = _commands[_cmdIndex];
    _$hand.show().removeClass('down');
    Utils.cssVendor(_$hand, 'opacity', '0');
    Utils.cssVendor(_$hand, 'transition', '');
    var left = command.x * grid.tileSize + _tilesOffsetLeft,
        top = command.y * grid.tileSize + _tilesOffsetTop;
    Utils.cssVendor(_$hand, 'transform', 'translate(' + left + 'px, ' + top + 'px)');
    return that;
  }

  function moveTo(x, y) {
    _commands.push({'x':x, 'y':y, 'duration': 500});
    if (!_nextTOH)
      next();
    return that;
  }

  function tap() {
    _commands.push({'tap':true, 'duration': 250});
    _commands.push({'up':true, 'duration': 250});
    if (!_nextTOH)
      next();
    return that;
  }

  function down() {
    _commands.push({'down':true, 'duration': 250});
    if (!_nextTOH)
      next();
    return that;
  }

  function up() {
    _commands.push({'up':true, 'duration': 250});
    if (!_nextTOH)
      next();
    return that;
  }

  function next() {    
    if (_cmdIndex && _cmdIndex >= _commands.length - 1) {
      _nextTOH = setTimeout(endOfSequence, 500);
      return;
    }

    // if this hint runs on a certain condition, validate it at every step and stop when invalid
    if (_condition) {
      try {
        var stillGood = _condition();
        if (!stillGood) {
          fadeOut();
          return;
        }
      }
      catch(e) {
      }
    }

    if (_cmdIndex < _commands.length - 1) {
      var command = _commands[_cmdIndex];
      _cmdIndex++;
      var left = command.x * grid.tileSize + _tilesOffsetLeft,
          top = command.y * grid.tileSize + _tilesOffsetTop,
          duration = command.duration || 300;
      Utils.cssVendor(_$hand, 'transition', 'all ' + (duration / 1000) + 's ease-in-out');
      setTimeout(function(){
        Utils.cssVendor(_$hand, 'transform', 'translate(' + left + 'px, ' + top + 'px)');
        Utils.cssVendor(_$hand, 'opacity', '1');
        if (command.tap || command.down) {
          _$hand.addClass('down');
          if (command.tap) {
            setTimeout(function(){
              _$hand.removeClass('down');
            }, command.duration);
          }
        }
        if (command.up) {
          //Utils.cssVendor(_$handIcon, 'width', '');
          _$hand.removeClass('down');
        }
      },0);
      _nextTOH = setTimeout(next, duration + 50);
    }
  }

  function endOfSequence() {
    fadeOut();
    if (_repeat) {
      // overwrite the timeout and start a loop
      clearTimeout(_nextTOH);
      _nextTOH = setTimeout(function() {
        _$hand.hide().removeClass('down');
        _cmdIndex = 0;
        start();
        _loop++;
        _nextTOH = setTimeout(next, 3000);
      }, 500);
    }
  }

  function fadeOut() {
    _nextTOH = 0;
    Utils.cssVendor(_$hand, 'transition', 'all .3s ease-in-out');
    Utils.cssVendor(_$hand, 'opacity', '0');
    _nextTOH = setTimeout(function() {
      stop();
    }, 300);
  }

  function stop() {
    clearTimeout(_nextTOH);
    _commands = [];
    _$hand.hide().removeClass('down');
    _nextTOH = 0;
    _condition = undefined;
    _cmdIndex = 0;
  }

  this.init = init;
  this.gameStarts = gameStarts;
  this.startAt = startAt;
  this.moveTo = moveTo;
  this.tap = tap;
  this.down = down;
  this.up = up;
  this.stop = stop;
  this.__defineGetter__('loop', function() { return _loop;})
})();