// creates a grid with the given number of horizontal and vertical tiles
// @ tilesX = number of columns
// @ tilesY = number of rows
// @ tileValues = (optional) array of values to put in, going from top left to bottom right
function Grid(tilesX, tilesY, tileValues, editMode) {
  var that = this;

  var _$el,
      _tileSize,
      _tileSizeOverlap,
      _tileSizeMinusMargin,
      _tilesX = tilesX,
      _tilesY = tilesY,
      _width = 0,
      _challengeCount = 0,
      _tileValues = [],
      _regenerateCount = 0,
      _fallEndHandlers = {},
      _lastMatchingBombCount = 0;

  draw();

  function draw() {
    _fallCount = 0;
    $('#tiles').css('width', '100%');
    // ugly way of detecting the tile margin
    $('#tiles').html('<div class="tile"></div>');
    var $tile =  $($('#tiles .tile')[0]),
        margin = $tile.css('margin-left').replace(/\D/gi,'')*1 +
                 $tile.css('margin-right').replace(/\D/gi,'')*1;
                 //$tile.css('border-left-width').replace(/\D/gi,'')*1 +
                 //$tile.css('border-right-width').replace(/\D/gi,'')*1;
    $('#tiles').html('');

    // load the tile size
    _tileSizeMinusMargin = Math.min(50, Math.floor($('#tiles').width() / tilesX)) - margin;
    _tileSize = _tileSizeMinusMargin + margin;
    _tileSizeOverlap = _tileSize - 2;
    $('#tiles').css('height', tilesY * _tileSizeOverlap + 'px');

    var html = '';
    _tileValues = [];
    for (var y=0; y<tilesY; y++) {
      for (var x=0; x<tilesX; x++) {
        var index = y * tilesX + x;
        var value = tileValues? tileValues[index] : Levels.generateTileNumber(GameOptions.regenerateBombs);
        if (editMode)
          value = tileValues? tileValues[index] : 0;
        if (value || editMode)
          html += createTileHTML(x, y, value);
        _tileValues.push(value);
      }
    }
    // make the stored tileSize be margin-inclusive, used for positioning only
    $('#tiles').html(html);

    // set outer width
    _width = _tileSizeOverlap * tilesX + 2;
    $('#tiles').css('width', _width + 'px');
    
    $('#tiles .tile').each(function() {
      var $tile = $(this),
          x = $tile.attr('data-x') * 1,
          y = $tile.attr('data-y') * 1;
      placeTileXY($tile, x, y);
    });
  }

  var createTile = this.createTile = function(x, y, value, noAdd) {
    var $tile = $(createTileHTML(x, y, value));
    placeTileXY($tile, x, y);
    $('#tiles').append($tile);
    if (!noAdd)
      _tileValues[y * _tilesX + x] = value;
    return $tile;
  }

  function createTileHTML(x, y, value) {
    var left = x * _tileSizeOverlap,
        top = y * _tileSizeOverlap,
        label = value;
        color = (value - 1) % 9 + 1, // 9 = max color defined
        className = 'tile';
    if (value > 100 && value <= (100 + GameOptions.maxNumber + GameOptions.maxNumber)) {
      label -= 100;
      className += ' challenge';
    }
    if (value < 0) {
      className += ' minus';
      color = Math.abs(color);
    }
    className += ' tile-' + color;
    //return '<div id="tile-' + x + '-' + y + '" class="' + className + '" data-x="'+x+'" data-y="'+y+'" data-value="'+value+'" style="width:' + _tileSizeMinusMargin + 'px;height:' + _tileSizeMinusMargin + 'px;line-height:' + (_tileSizeMinusMargin - 6) + 'px; left:' + left + 'px;top:' + top + 'px"><div class="flare"></div></div>';
    return '<div id="tile-' + x + '-' + y + '" class="' + className + '" data-x="'+x+'" data-y="'+y+'" data-value="'+value+'" style="width:' + _tileSizeMinusMargin + 'px;height:' + _tileSizeMinusMargin + 'px;line-height:' + (_tileSizeMinusMargin - 6) + 'px;"><div class="flare"></div></div>';
  }

  function placeTileXY($tile, x, y) {
    placeTile($tile, x * _tileSizeOverlap, y * _tileSizeOverlap);
  }

  function placeTile($tile, left, top) {
    $tile.css('-webkit-transform', 'translate3d(' + left + 'px,' + top + 'px, 0)');
  }

  // returns an array of [$tile, $tile, $tile] that match the value of the given tile
  // optionally (depending on GameOptions) bombs will explode surrounding tiles,
  // and if those tiles are sets of numbers, they will chain a larger explosion
  this.getMatchingTiles = function(x, y) {
    // create an array of tiles to check and put the current one in there
    var tilesToCheck = [],
        had = {},
        added = {},
        valueToMatch = that.getCurrentTileValue(x, y),
        matchingTiles = [];

    _lastMatchingBombCount = 0;

    // helper function to add new tiles to the checking queue
    function addTileToQueue(x, y, fromDirectMatch, value) {
      var id = 'tile-' + x + '-' + y + '-' + value;
      // if x and y are within the grid and this tile hasn't been checked yet
      if (x >= 0 && y >= 0 && x < that.tilesX && y < that.tilesY && !had[id]) {
        had[id] = true;
        if (that.existsTile(x, y))
          tilesToCheck.push([x, y, fromDirectMatch, value]);
      }
    }

    addTileToQueue(x, y, true, valueToMatch);

    // as long as there's tiles to check, add proper new ones
    while (tilesToCheck.length > 0) {
      var tileToCheckXY = tilesToCheck.pop(),
          checkX = tileToCheckXY[0],
          checkY = tileToCheckXY[1],
          fromDirectMatch = tileToCheckXY[2],
          value = that.getCurrentTileValue(checkX, checkY);
          curValueToMatch = tileToCheckXY[3] || valueToMatch;
      if (value == curValueToMatch && value != 97) {
        addTileToQueue(checkX + 1, checkY + 0, true, value);
        addTileToQueue(checkX - 1, checkY + 0, true, value);
        addTileToQueue(checkX + 0, checkY + 1, true, value);
        addTileToQueue(checkX + 0, checkY - 1, true, value);

        // check the four diagonal edges too when bombs go off
        if (curValueToMatch == 98 && GameOptions.bombsTakeOtherBricksDown && GameOptions.bombsTakeDiagonalBricksDown) {
          addTileToQueue(checkX + 1, checkY - 1, true, value);
          addTileToQueue(checkX + 1, checkY + 1, true, value);
          addTileToQueue(checkX - 1, checkY - 1, true, value);
          addTileToQueue(checkX - 1, checkY + 1, true, value);
        }

        var id = '#tile-' + checkX + '-' + checkY;
        if (!added[id]) {
          added[id] = true;
          matchingTiles.push($(id));
          if (value == 98)
            _lastMatchingBombCount++;
        }
      }
      else if (value != 99 && curValueToMatch == 98 && fromDirectMatch && GameOptions.bombsTakeOtherBricksDown) {
        addTileToQueue(checkX + 1, checkY + 0, false, value);
        addTileToQueue(checkX - 1, checkY + 0, false, value);
        addTileToQueue(checkX + 0, checkY + 1, false, value);
        addTileToQueue(checkX + 0, checkY - 1, false, value);

        var id = '#tile-' + checkX + '-' + checkY;
        if (!added[id]) {
          added[id] = true;
          matchingTiles.push($(id));
          if (value == 98)
            _lastMatchingBombCount++;
        }
      }
    }
    return matchingTiles;
  };

  // marks tiles as falling and starts the fall animations
  this.fall = function(initialDelay) {
    initialDelay = initialDelay || 0;

    for (var x = 0; x < _tilesX; x++) {
      var distanceToFall = 0,
          delayToFall = Utils.between(0, 5);
      for (var y = _tilesY - 1; y >= -10; y--) {
        var value = that.getCurrentTileValue(x, y);
        if (value == 0)
          distanceToFall++;
        else if (value == 99)
          distanceToFall = 0;
        else if (distanceToFall) {
          moveDown(x, y, distanceToFall, delayToFall);
          delayToFall++;
        }
      }
    }

    function moveDown(x, y, distance, delay) {
      var value = that.getCurrentTileValue(x, y);
      that.updateTile(x, y, 0)
      that.updateTile(x, y + distance, value);

      var oldId = 'tile-' + x + '-' + y,
          $tile = $('#' + oldId),
          newY = y + distance,
          deltaY = distance * _tileSizeOverlap,
          newId = 'tile-' + x + '-' + newY;

      if (_fallEndHandlers[oldId])
        clearTimeout(_fallEndHandlers[oldId]);

      $tile.attr('id', newId).attr('data-y', newY).attr('data-falling', 'true');
      delay = (initialDelay/1000) + (0.03 * (delay-1));
      $tile.css('-webkit-transition', '-webkit-transform .3s ease-in ' + delay + 's');
      setTimeout(function(){placeTileXY($tile, x, newY); }, 0);
      
      // schedule the fallEnd handler (this goes horribly wrong if we depend it on webkit-transition-end event)
      _fallEndHandlers[newId] = setTimeout(function(){
        onFallEnd($tile);
      }, delay * 1000 + 300);
    }
  };

  function onFallEnd($tile) {
    $tile.attr('data-falling', '');
    delete _fallEndHandlers[$tile.attr('id')];
  }

  function fix() {
    var fixed = '';
    $('#tiles .tile').each(function(){
      var $tile = $(this),
          x = $tile.attr('data-x') * 1,
          y = $tile.attr('data-y') * 1,
          left = x * _tileSizeOverlap,
          top = y * _tileSizeOverlap,
          realLeft = $tile.css('left').replace(/\D/gi,'')*1,
          realTop = $tile.css('top').replace(/\D/gi,'')*1;
      if (realLeft != left || realTop != top) {
        fixed += $tile.attr('id') + ' (left/top)\n';
        $tile.css({'left': left + 'px', 'top': top + 'px'});
      }
      if ($tile.css('-webkit-transform') != 'none' && $tile.css('-webkit-transform') != 'matrix(1, 0, 0, 1, 0, 0)') {
        fixed += $tile.attr('id') + '(' + $tile.css('-webkit-transform') + ')\n';
        $tile.css({'-webkit-transform': 'none'});
      }



    });
    return fixed;
  }

  // adds a new tile above this column (at the first available spot above)
  // forcedValueArray can contain numbers to use, if present but needs more, that works
  this.regenerateTile = function(x, amount, forcedValueArray, noBombs) {
    amount = amount || 1;
    _regenerateCount += amount;
    for (var count = 0; count < amount; count++) {
      // detect the first available spot
      var y = -1, $existingTile = $('#tile-' + x + '-' + y);
      while ($existingTile.length) {
        y--;
        $existingTile = $('#tile-' + x + '-' + y);
      }
      // place the tile
      var value = Levels.generateTileNumber(false/*noBombs? false : true*/, false, false /*GameOptions.regenerateRocks*/);
      if (forcedValueArray && forcedValueArray[count])
        value = forcedValueArray[count];
      else if (GameOptions.regenerateRocks) {
        // okay, let's do this a bit different: use a factor to determine if this value should be a rock,
        // so we can systematically increase the factor over time
        var maxBrickChanceForTower = TowerSize[Game.tower][4];
        if (Utils.between(1,maxBrickChanceForTower) == 1)
          value = 97; // it's a ROCK!
      }
      var $tile = createTile(x, y, value);
    }
  }

  // gets a challenge at slight increasing difficuly for this grid based on what's left
  this.getChallenge = function() {
    // valueCount could be something like this: [5, 10, 3, 6, 5, 4, 3, 5, 7] meaning 5 x 1, 10 x 2, ...
    var valueCount = [0,0,0,0,0,0,0,0,0],
        challenge = 0;
    $('#tiles .tile').each(function(){
      var value = $(this).attr('data-value') * 1;
      valueCount[value - 1]++;
    });

    // when the number of tiles to make a challenge combination is set, see what numbers are available in that amount of tiles
    // and pick a matching one available (at random)
    function getAvailableNumberForChallengeThatHaveEnoughTiles(tilesToUse) {
      var found = false, numbersAvailableForTilesToUse = [];
      // see what numbers are presented in enough tiles to build the required tilesToUse
      for (var i=0; i<valueCount.length; i++) {
        if (valueCount[i] >= tilesToUse) {
          numbersAvailableForTilesToUse.push(i + 1); // i is the index, i+1 is the actual number!
        }
      }
      // now pick a random one from the available ones
      if (numbersAvailableForTilesToUse.length > 0) {
        var pickedNumber = Utils.pick(numbersAvailableForTilesToUse);
        return pickedNumber;
      }
      // no numbers are available for this combination
      return 0;
    }

    // require this many tiles and find a number that allows that
    var tilesToUse = 2 + Utils.between(0, Math.floor(0.4 + _challengeCount * 0.3)), // use the amount of challenges as a slowly increase in possible requiring this amount of tiles...
        numberToUse = getAvailableNumberForChallengeThatHaveEnoughTiles(tilesToUse);

    // if there is no number available to make this combination, decrease the number of tiles and try again
    while (tilesToUse > 2 && !numberToUse) {
      numberToUse = getAvailableNumberForChallengeThatHaveEnoughTiles(--tilesToUse);
    }

    // create the challenge
    if (numberToUse && tilesToUse)
      challenge = numberToUse * tilesToUse;

    // increase the challenge count
    _challengeCount++;

    return challenge;
  };

  this.getCurrentTileValue = function(x, y) {
    var index = y * _tilesX + x,
        value = _tileValues[index];
    return value? value : 0;
  };

  this.existsTile = function(x, y) {
    return this.getCurrentTileValue(x, y) != 0;
  };

  this.getCurrentTileValues = function() {
    var tileValues = [];
    for (var y=0; y<_tilesY; y++) {
      for (var x=0; x<_tilesX; x++) {
        tileValues.push(that.getCurrentTileValue(x, y));
      }
    }
    return tileValues;
  };

  this.updateTile = function(x, y, value) {
    var index = (y * 1) * _tilesX + (x * 1);
    _tileValues[index] = value;
  }

  // shifts all current tiles with the given delta's
  this.shiftAllTiles = function(deltaX, deltaY) {
    var newData = new Array(tilesX * tilesY);
    for (var i=0; i<tilesX*tilesY; i++)
      newData[i] = 0;
    for (var y=0; y<tilesY; y++) {
      for (var x=0; x<tilesX; x++) {
        var value = that.getCurrentTileValue(x, y);

        // get the new x position and cycle out-of-bounds
        var destX = x + deltaX;
        if (destX < 0) destX += tilesX;
        else if (destX >= tilesX) destX -= tilesX;

        // get the new y position and cycle out-of-bounds
        var destY = y + deltaY;
        if (destY < 0) destY += tilesY;
        else if (destY >= tilesY) destY -= tilesY;

        // store
        newData[destY * tilesX + destX] = value;
      }
    }
    tileValues = _tileValues = newData;
    draw();
  }

  // check if tiles van be combined when playing a game that always has a full grid (cause detection is simple)
  this.canCombinationsBeMadeInAFullGrid = function() {
    var possibleCombinations = 0,
        possibleTaps = 0,
        maxPossibleValue = GameOptions.maxNumber + (GameOptions.collectTens? 1 : 0),
        hasEmptySpots = false;

    for (var y=0; y<tilesY; y++) {
      for (var x=0; x<tilesX; x++) {
        var thisValue = that.getCurrentTileValue(x, y),
            rightValue = (x == tilesX - 1)? 999 : that.getCurrentTileValue(x + 1, y),
            belowValue = (y == tilesY - 1)? 999 : that.getCurrentTileValue(x, y + 1);

        if (thisValue == 0)
          hasEmptySpots = true;
        // check bombs first
        if (thisValue == 98 && GameOptions.blowUpOneBomb)
          possibleTaps++;
        if (thisValue == 98 && GameOptions.collectTens) {
          if (thisValue == rightValue || thisValue == belowValue)
            possibleTaps++;
        }
        // otherwise check numbers
        else if (thisValue > 0 && thisValue <= GameOptions.maxNumber) {
          if (thisValue + rightValue <= maxPossibleValue ||
              thisValue + belowValue <= maxPossibleValue)
            possibleCombinations++;
          if (thisValue == rightValue || thisValue == belowValue)
            possibleTaps++;
        }
      }
    }
    var result = (possibleCombinations > 0 || possibleTaps > 0) || hasEmptySpots;
    return result;
  }

  // returns true if this normal level can't be completed anymore
  function isHopeless() {
    // count possible combinations (3+4, 1+7) remove doubles (4+3 of same tiles)
    // if possible combos < n (3?) check all combos for endings, can be removed?
    // 9,9,2
    var remaining = Utils.fillArray(0,0,9),
        bombs = 0,
        pairs = 0,
        comboCanBeMade = false,
        bombsCanBeDetonated = false,
        maxCombination = GameOptions.collectTens? 10 : 9;

    // gather main information on pairs and remaining numbers
    for (var y=0; y<_tilesY; y++) {
      for (var x=0; x<_tilesX; x++) {
        var value = that.getCurrentTileValue(x, y);
        if (value >= 1 && value <= 9)
          remaining[value*1-1]++;
        if (value == 98)
          bombs++;
        if (remaining[value*1-1] > 1)
          pairs++;
      }
    }
    // if no pairs exist, see if combo's can be made by checking if the two lowest numbers combined are < 10
    if (pairs == 0) {
      var firstAvailableValue = 0,
          secondAvailableValue = 0;

      for (var i=0; i<remaining.length - 1; i++) {
        if (!secondAvailableValue && firstAvailableValue && remaining[i])
          secondAvailableValue = i+1;
        if (!firstAvailableValue && remaining[i])
          firstAvailableValue = i+1;
        if (!comboCanBeMade && firstAvailableValue && secondAvailableValue &&
          (firstAvailableValue + secondAvailableValue <= maxCombination))
          comboCanBeMade = true;
      }
    }

    bombsCanBeDetonated = (bombs == 1 && GameOptions.blowUpOneBomb || bombs > 1);

    return !pairs && !comboCanBeMade && !bombsCanBeDetonated;
  }

  function errors() {
    var s = '';
    for (var y=0; y<_tilesY; y++) {
      for (var x=0; x<_tilesX; x++) {
        var value = that.getCurrentTileValue(x, y);
        var $tiles = $('#tiles .tile[data-x="'+x+'"][data-y="'+y+'"]');
        if ($tiles.length == 2) {
          s += 'TWO tiles at position ' + x + ',' + y + '\n';
        }
        else if ($tiles.length && !value) {
          s += $tiles.length + ' tile(s) exist for ' + x + ',' + y + ' where none should!\n';
        }
        else if (value && !$tiles.length) {
          s += 'NO tile exist for ' + x + ',' + y + ' where it should have value ' + value + '\n';
        }
        else if ($tiles.length && $tiles.attr('data-value') * 1 != value) {
          s += 'tile ' + x + ',' + y + ' has value ' + ($tiles.attr('data-value') * 1) + ' and should have ' + value + '\n';
        }
      }
    }
    return s;
  }

  // todo: OPTIMIZE!
  function getTileInfoByEvent(event) {
    var xyEvent = event;
    if (event.originalEvent && event.originalEvent.touches)
      xyEvent = event.originalEvent.touches[0];
    var tilesOffsetTop = $('#tiles').offset().top,
        tilesOffsetLeft = Math.round(($('#game').width() - $('#tiles').width()) / 2),
        pixelX = xyEvent.clientX - $('#game').offset().left - tilesOffsetLeft,
        pixelY = xyEvent.clientY - tilesOffsetTop,
        tileX = Math.floor(pixelX / _tileSizeOverlap),
        tileY = Math.floor(pixelY / _tileSizeOverlap);
    return {
      'x': tileX,
      'y': tileY,
      'value': that.getCurrentTileValue(tileX, tileY)
    };
  }


  this.__defineGetter__('tilesRemaining', function() {
    var count = 0;
    for (var y=0; y<_tilesY; y++) {
      for (var x=0; x<_tilesX; x++) {
        var value = that.getCurrentTileValue(x, y);
        if (value > 0 && value != 99)
          count++;
      }
    }
    return count;
  });

  function getRemainingQuestTileValue() {
    var count = 0, result;
    for (var y=0; y<_tilesY; y++) {
      for (var x=0; x<_tilesX; x++) {
        var value = that.getCurrentTileValue(x, y);
        if (value > 0 && value != 98 & value != 99) {
          count++;
          if (count == 1)
            result = value;
        }
      }
    }
    return count == 1? result : false;
  };

  this.clearRegenerateCount = function() {
    _regenerateCount = 0;
  }

  this.isHopeless = isHopeless;
  this.fix = fix;
  this.errors = errors;
  this.getRemainingQuestTileValue = getRemainingQuestTileValue;
  this.getTileInfoByEvent = getTileInfoByEvent;
  this.placeTile = placeTile;
  this.placeTileXY = placeTileXY;
  this.__defineGetter__('element', function() { return _$el; });
  this.__defineGetter__('tileSize', function() { return _tileSizeOverlap; });
  this.__defineGetter__('tilesX', function() { return _tilesX; });
  this.__defineGetter__('tilesY', function() { return _tilesY; });
  this.__defineGetter__('width', function() { return _width; });
  this.__defineGetter__('tileValues', function() { return _tileValues; });
  this.__defineGetter__('regenerateCount', function() { return _regenerateCount; });
  this.__defineGetter__('lastMatchingBombCount', function() { return _lastMatchingBombCount; });  
}