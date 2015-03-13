window.Editor = new (function Editor() {
  var that = this;

  var _grid,
  		_currentGameSettings,
  		_initialized = false,
      _level,
      _levelDataAtStart,
      _toolbarVisible = false,
      _$toolbarTile,
      _toolbarTileValue = 0;

  this.start = function(level) {
    _level = level;

    $('.next').hide();
    $('.hint').hide();
    $('#level').show().siblings().hide();
    $('html').addClass('editing');
    
    var levelData = Levels.loadForEditing(level);
    if (!levelData)
      levelData = {
        'tilesX': Settings.editorTilesX, 
        'tilesY': Settings.editorTilesY, 
        'tileValues': Levels.createEmptyTileValues(Settings.editorTilesX, Settings.editorTilesY) 
      };

    _levelDataAtStart = levelData;
    
    startGame(levelData);
    if (!_initialized)
    	makeTilesEditable();
    _initialized = true;    
  }

  // stops the editor
  this.stop = function HammerTime() {
    var changesMade = false;
    if (_level > 0) {
      var oriTileValues = _levelDataAtStart.tileValues;
      var currentTileValues = _grid.getCurrentTileValues();
      var changesMade = !Utils.areArraysEqual(oriTileValues, currentTileValues);
      if (changesMade) {
        if (confirm('Save changes?')) {
          var level = prompt('Level', _level) * 1;
          if (level > 0) {
            Levels.save(level, _grid.tilesX, _grid.tilesY, currentTileValues);
          }
        }
      }
    }
    hideToolbar();
  	$('html').removeClass('editing');
  }

  function startGame(gameSettings) {
    _currentGameSettings = gameSettings;
    window.grid = _grid = new Grid(gameSettings.tilesX, gameSettings.tilesY, gameSettings.tileValues, true);
    $('#tiles').css('margin-left', (-_grid.width / 2) + 'px');
  }

  function makeTilesEditable() {
    var startClientX, startClientY, deltaX, deltaY, moving = 0, $tile, startX, startY, x, y;
    var possibleTiles = [0,1,2,3,4,5,6,7,8,9];
    var twoFingers = false;

    $(document).on(Utils.isTouch()? 'touchstart' : 'mousedown', 'html.editing #tiles .tile', startMoveTile);
    $(document).on(Utils.isTouch()? 'touchmove' : 'mousemove', 'html.editing', moveTile);
    $(document).on(Utils.isTouch()? 'touchend' : 'mouseup', 'html.editing', endMoveTile);
    $(document).on(Utils.isTouch()? 'touchstart' : 'mousedown', 'html.editing #editor-overlay .tile', chooseTile);

    function startMoveTile(event) {
      Utils.eat(event);
      $tile = $(event.target).closest('.tile');
      x = 0, y = 0;
      startX = $tile.attr('data-x') * 1;
      startY = $tile.attr('data-y') * 1;
      var xyEvent = event;
      if (event.originalEvent && event.originalEvent.touches)
        xyEvent = event.originalEvent.touches[0];
      startClientX = xyEvent.clientX;
      startClientY = xyEvent.clientY;
      moving = 1;
      twoFingers = false;
      $tile.addClass('selected').siblings().removeClass('selected');
    }

    function moveTile(event) {
      Utils.eat(event);
      if (!moving) return;
      var xyEvent = event;
      if (event.originalEvent && event.originalEvent.touches) {
        xyEvent = event.originalEvent.touches[0];
        twoFingers = (event.originalEvent.touches.length == 2);
      } else {
        twoFingers = event.shiftKey;
      }
      deltaX = xyEvent.clientX - startClientX;
      deltaY = xyEvent.clientY - startClientY;
      if (moving == 1 && (deltaX || deltaY)) {
        moving = 2;
        //$tile.addClass('moving');
      }
      // now we're actually moving
      else if (moving == 2) {
        var aDeltaX = Math.abs(deltaX),
            aDeltaY = Math.abs(deltaY),
            aDelta = (aDeltaX > aDeltaY)? aDeltaX : aDeltaY,
            delta = (aDeltaX > aDeltaY)? deltaX : -deltaY; // minus deltaY, because a lower y means a higher value!
        if (twoFingers) {
          // two fingers move the entire board
          var shifted = false;
          if (aDeltaX >= aDeltaY) {
            if (deltaX >= _grid.tileSize) {
              _grid.shiftAllTiles(1, 0);
              shifted = true;
            }
            if (deltaX <= -_grid.tileSize) {
              _grid.shiftAllTiles(-1, 0);
              shifted = true;
            }
          }          
          if (aDeltaX < aDeltaY) {
            if (deltaY >= _grid.tileSize) {
              _grid.shiftAllTiles(0, 1);
              shifted = true;
            }
            if (deltaY <= -_grid.tileSize) {
              _grid.shiftAllTiles(0, -1);
              shifted = true;
            }
          }          
          if (shifted) {
            startClientX = xyEvent.clientX;
            startClientY = xyEvent.clientY;
          }
        }
        else {
          // swipe up a tile means repeating last tile
          if (aDeltaY > aDeltaX && deltaY < -3) {
            replaceTile($tile, _toolbarTileValue);
          }
          // swipe down means deleting a tile
          if (aDeltaY > aDeltaX && deltaY > 3) {
            replaceTile($tile, 0);
          }
        }
			}    	
    }

    function endMoveTile(event) {
      Utils.eat(event);
      if ($tile && $tile.length) {
	      if (moving == 0 || moving == 1) {
          if (_toolbarVisible && _$toolbarTile.attr('id') === $tile.attr('id'))
            hideToolbar();
          else
            showToolbar($tile);
	      }
    	}
      moving = 0;
    }

    function chooseTile(event) {
      Utils.eat(event)
      var tileValue = $(event.target).closest('.tile').attr('data-value');
      _toolbarTileValue = tileValue;
      hideToolbar();
      if ($tile && $tile.length) {
        replaceTile($tile, tileValue);
        $tile.removeClass('selected');
        $tile = null;
      }
    }

  }

  function showToolbar($tile) {
    _toolbarVisible = true;
    _$toolbarTile = $tile;
    $('#editor-overlay').show();
    if ($tile && $tile.length) {
      var top = $tile.css('top').replace(/\D/g,'')*1;
      if (top) {
        top -= 50;
        if (top < 10) top = 300;
        $('#editor-overlay').css('top', top + 'px');
      }
    }
  }

  function hideToolbar() {
    _toolbarVisible = false;
    $('#editor-overlay').hide();
  }

  function replaceTile($tile, value) {
    if (value == '?') {
      value = prompt('total value to clear') * 1;
      if (value && value > 2) {
        var color = (value - 1) % 9 + 1; // 9 = max color defined
        $tile.attr('data-value', (value + 100)).html(value).removeClass().addClass('tile challenge tile-' + color);
        _grid.updateTile($tile.attr('data-x'), $tile.attr('data-y'), value + 100);
      }
      return;
    }
  	
    $tile.attr('data-value', value).html(value).removeClass().addClass('tile tile-' + value);
    _grid.updateTile($tile.attr('data-x'), $tile.attr('data-y'), value);
  }

  this.__defineGetter__('enabled', function() { return $('html').hasClass('editing'); })

})();