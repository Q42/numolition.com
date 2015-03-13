window.Game = new (function Game() {
  var that = this;

  var _grid,
      _score = 0,
      _reloadTOH = 0,
      _currentLevel = 0,
      _currentGameGameOptions,
      _playing = false,
      _editMode = false,
      _updatingScreen = false,
      _movingTile = 0,
      _$tileBeingMoved,
      _currentTileTransformation = '',
      _mode = 'levels',
      _$flare,
      _flareOpacity,
      _z = 100,
      _currentSize = 0,
      _hasEnded = false,
      _io,
      _meanwhileTOH,
      _oldStars,
      _isTutorial,
      _tutorialFinishedOnceThisSession = false, // this is a disposable flag that we need, sorry
      _newHighScoreReached;

  $(preload);

  function preload() {
    resize();
    $(window).on('resize', resize);

    if ($bw.isApp)
      PreLoadImages.go(init);
    else
      init();
  }

  function init() {
    document.addEventListener("webkitvisibilitychange", handleVisibilityChange, false);
    Utils.requireClicksOnTouchEnds();
    $('#game').css('visibility', 'visible');

    User.init();
    LevelSelect.init();
    Sound.init();
    Story.init();
    Pause.init();
    Config.init();
    Effects.init();
    Hand.init();
    Quests.init();
    Settings.init();

    if (window.Debug) Debug.init();

    _io = new makeTilesMoveable();
    $(document).on(Utils.touchStart(), '.edit', clickEdit);
    $(document).on(Utils.touchEnd(), '#title', clickTitle);

    var level = document.location.hash.substr(1);
    showTitleScreen();
    if (level * 1 > 0) {
      _mode = 'levels';
      $('#nav').css('left', '0px');
      LevelSelect.loadPage(1);
      startLevel(level);
    }
    else if (level == 'towers') {
      _mode = 'towers';
      $('#nav').css('left', '0px');
      LevelSelect.loadPage(1);
      showTowerSelect();
    }
    else if (level == 'random') {
      _mode = 'random';
      $('#nav').css('left', '0px');
      LevelSelect.loadPage(0);
      startRandom();
    }
  }

  function handleVisibilityChange(event) {
    switch(document.webkitVisibilityState) {
      case 'hidden':
        Sound.pauseAll();
        break;
      case 'visible':
        Sound.resumeAll();
        break;
    }
  }

  function resize() {
    Utils.centerElement($('#game'));
  }

  // the actual frame draw
  function handleAnimFrame() {
    _updatingScreen = false;
    // if a tile was set to move, redraw it now
    if (_movingTile == 2) {
      var left = _currentTileTransformation.x * _grid.tileSize + _currentTileTransformation.dx,
          top = _currentTileTransformation.y * _grid.tileSize + _currentTileTransformation.dy;
      _grid.placeTile(_$tileBeingMoved, left, top);
      if (_$flare && !_$flare.hasClass('fadeout'))
        _$flare.css('opacity', _flareOpacity);
    }
  }

  function updateScreen() {
    if (!_updatingScreen) {
      requestAnimFrame(handleAnimFrame);
    }
    _updatingScreen = true;
  }

  function doAction(action) {
    // otherwise just handle them based on their sign
    switch(action) {
      case 'play':
        if (!_mode && !_playing)
          showGameModes();
        break;
      case 'back':
        Story.showLoadingFadeOut();
        $('.next').removeClass('show');
        if (_mode == 'levels') {
          if (_editMode)
            Editor.stop();
          showLevelSelector(true);
        }
        else if (_mode == 'towers') {
          showTowerSelect();
        }
        else
          showGameModes();
        break;
      case 'levels':
        $('.next').removeClass('show');
        if (_mode == 'levels') {
          if (_editMode)
            Editor.stop();
          showLevelSelector();
        }
        else if (_mode == 'towers') {
          showTowerSelect();
        }
        else
          showGameModes();
        break;
      case 'retry':
        $('.next').removeClass('show');
        retry();
        break;
      case 'forward':
        if (!_mode && !_playing)
          showGameModes();
        else
          clickNext();
        break;
      case 'sound-on':
        Sound.disable();
        break;
      case 'sound-off':
        Sound.enable();
        break;
      case 'blow-up-tower':
        blowUpTower(); // ka-BOOOM!
        break;
    }
  }

  function clickTitle(event) {
    Utils.eat(event);
    Story.showLoadingFadeOut();
    $('#nav').css('left', '0px');
    showGameModes(true);
    Sound.play('explosion2');
  }

  function clickNext(event) {
    if (_mode == 'levels')
      startNextLevel();
    else {
      startTower();
    }
  }

  function clickEdit(event) {
    Utils.eat(event);
    //Editor.start();
    _editMode = !_editMode;
    $('.edit').html('EDITMODE ' + (_editMode? 'ON':'OFF'));
  }

  function retry() {
    if (Pause.enabled)
      Pause.hide();
    if (_mode == 'random')
      startRandom(true);
    else if (_mode == 'levels')
      startLevel(_currentLevel, true);
    else
      startTower(_currentSize, true);
  }

  function startMode(mode) {
    switch(mode) {
      case 'levels':
        _mode = 'levels';
        showLevelSelector();
        window.GameOptions = GameOptionsClassic;
        break;
      case 'towers':
        _mode = 'towers';
        showTowerSelect();
        break;
      case 'random':
        _mode = 'random';
        startRandom();
        break;
    }
  }

  function showTitleScreen() {
    document.location.hash = ''
    $('#nav').css('left', '320px');
    LevelSelect.loadPage(0);
    $('#title').show();
    Story.showLoadingFadeOut();
    Sound.play('track1');
  }

  function showGameModes(animate) {    
    document.location.hash = ''
    removeLevelClassNames();
    _playing = false;
    Quests.hideToggleButton();

    $('#nav').show().siblings('.screen').hide();
    LevelSelect.loadPage(0);
  }

  // show the level selector screen
  function showLevelSelector(fromBackPress) {
    _playing = false;
    removeLevelClassNames();

    Hand.stop();
    $('#nav').show().siblings('.screen').hide();

    LevelSelect.showLevels();
    var pageNr = 1;
    if (fromBackPress)
      pageNr = LevelSelect.getPageForLevel(_currentLevel);
    LevelSelect.show().loadPage(pageNr);
  }

  // show sizes for towers mode
  function showTowerSelect() {
    _playing = false;
    LevelSelect.showTowers();
    LevelSelect.show().loadPage(1);
    LevelSelect.updateTowerProgress();
    $('#level').hide();
    $('#modes').show();
    document.location.hash = '';
    removeLevelClassNames();
    
    // and unlock the initial game mode for now TODO REMOVE
    $('.visual-towers').removeClass('locked');

    $('#towers').show().siblings('.screen').hide();
  }

  function clickLevel(event) {
    Utils.eat(event);
    var level = $(event.target).closest('.level').attr('data-level') * 1;
    startLevel(level);
  }

  function clickSize(event) {
    Utils.eat(event);
    var size = $(event.target).closest('.level').attr('data-size') * 1;
    startTower(size);
  }

  function startLevel(level, isRetry, isSliding) {
    _isTutorial = false;
    $('.next').removeClass('show');
    if (_editMode) {
      Editor.start(level);
      return;
    }

    document.location.hash = level;
    _playing = true;
    _currentLevel = level;
    $('#level').show().siblings('.screen').hide();
    var levelData = Levels.load(level);
    if (!levelData)
      levelData = {'tilesX': 6, 'tilesY': 8 };

    var levelText = levelData.desc;
    if (typeof levelText == 'function') levelText = levelText();

    if (levelData.descParams && levelText) {
      if (levelData.descParams.length == 1)
        levelText = Utils.formatText(levelText, levelData.descParams[0]());
    }
    if (levelText) {
      $('.levelhint').html(levelText).show();
    }
    else
      $('.levelhint').hide();

    // unlock stuff at the start
    switch(levelData.unlockFeatureAtStart) {
      case 'quests':
          User.unlockQuests();
          break;
    }

    var enableQuestsForThisLevel = 
        User.state.questsUnlocked && 
        User.hasUnlockedLevel(_currentLevel) &&
        Levels.hasQuests(level);
    if (enableQuestsForThisLevel)
      Quests.showToggleButton(level, !isRetry);
    else
      Quests.hideToggleButton();
    startGame(levelData, levelText? true : false, isRetry, isSliding);
  }

  function startTower(size, isRetry) {
    if (size)
      _currentSize = size;
    $('.next').removeClass('show');
    _mode = 'towers';
    window.GameOptions = GameOptionsTowers;
    document.location.hash = 'towers';
    $('.levelhint').hide();

    _playing = true;
    _currentLevel = 0;
    $('#level').show().siblings('.screen').hide();
    size = (size || 1) + '';
    var sizeInfo = TowerSize[size];
    var levelData = {
      'tilesX': sizeInfo[0],
      'tilesY': sizeInfo[1],
      'tileValues': Levels.generatetowers(sizeInfo[0], sizeInfo[1], 0)
    };

    var levelTitle = sizeInfo[2],
        levelText = Texts.towerIntro,
        highScore = User.state.towers[_currentSize].score * 1;
    
    // enable tutorial for towerMode if no score has ever been made
    _isTutorial = false;
    if (User.getTotalTowerScore() == 0 && !_tutorialFinishedOnceThisSession)
      _isTutorial = true;

    if (_isTutorial) {
      levelData = TowerTutorial;
      levelText = TowerTutorial.desc;
      levelTitle = TowerTutorial.title;
      window.GameOptions = GameOptionsTowerTutorial;
      isRetry = false;
    }
    else {
      if (highScore > 0) {
        levelText = Utils.formatText(Texts.towersBeatHighScore, highScore, (highScore > 1? 's' : ''));
        if (isRetry)
          levelTitle = Utils.formatText(Texts.highscoreText, highScore, (highScore > 1? 's' : ''));
      }
    }

    if (levelText && !isRetry)
      $('.levelhint').html(levelText).show();
    else
      $('.levelhint').hide();
    $('.meanwhile').html(levelTitle).show();
    Quests.hideToggleButton();
    startGame(levelData, !isRetry);
  }

  function startRandom(isRetry) {
    _isTutorial = false;
    $('.visual-random').removeClass('locked');
    _mode = 'random';
    window.GameOptions = GameOptionsRandom;
    document.location.hash = 'random';
    //$('.levelhint').hide();

    _playing = true;
    _currentLevel = 999;    
    $('#level').show().siblings('.screen').hide();
    $('.meanwhile').html(RandomLevel.title).show();
    var levelData = RandomLevel;
    //if (isRetry)
      $('.levelhint').hide();
    //else
      //$('.levelhint').html(levelData.desc).show();
    startGame(levelData, false, isRetry);
  }

  // animate the (fake placeholder) next level from right to left
  function startNextLevel() {
    var nextLevel = _currentLevel * 1 + 1;
    startLevel(nextLevel, false, true);
  }

  function removeLevelClassNames() {
    var levelsClass = '';
    for (var i=0; i<100; i++) {
      levelsClass += 'level-' + i + ' ';
    }
    $('#level').removeClass(levelsClass);
  }

  // showLevelIntro = delayed character fadeout and level fadein
  function startGame(gameSettings, showLevelIntro, isRetry, isSliding) {
    //Sound.play('pling2');    
    Story.showLoadingFadeOut();

    Stats.newGame();

    _hasEnded = false;
    _io.clearState();
    Hand.stop();
    Story.hide();
    Quests.hide();
    Story.hideBalloons();
    Pause.showButton();
    Quests.enableToggleButton();
    _newHighScoreReached = false;
    Stats.init();
    $('#level .progress').removeClass('show');
    $('.levelhint').removeClass('afterLevel afterQuest');
    $('.meanwhile').removeClass('hide')
    $('.retry-toggle').removeClass('show');
    clearTimeout(_meanwhileTOH);
    $('#tiles').removeClass('show')
    $('#level').removeClass('mode-towers mode-levels mode-random tutorial');
    removeLevelClassNames();
    $('#level').addClass('level-' + (_mode == 'towers'? _currentSize : _currentLevel));
    if (_isTutorial)
      $('#level').addClass('tutorial');

    var classNameToRemove = '';
    for (var i=1; i<=7; i++)
      classNameToRemove += 'random-' + i + ' ';
    var randomBg = Utils.between(1,7);
    $('#level').removeClass(classNameToRemove).addClass('random-' + randomBg);    

    $('#level').addClass('mode-' + _mode);
    _currentGameSettings = gameSettings;

    if (_mode == 'levels'){
      $('.meanwhile').show().html(Utils.formatText(Texts.level, _currentLevel));
      Sound.play('track2');
    }
    else if (_mode == 'towers') {
      Sound.play('track2');
    }
    else if (_mode == 'random') {
      Sound.play('track2');
      //$('.meanwhile').hide();
    }


    $('#tiles .tile').remove();
    window.grid = _grid = new Grid(gameSettings.tilesX, gameSettings.tilesY, gameSettings.tileValues);
    $('#tiles').css('margin-left', (-_grid.width / 2) + 'px');
    _grid.fall();
    //checkIfGamehasEnded();
    Effects.gameStarts();
    Hand.gameStarts();

    var characterName = 'girl';
    if (gameSettings.character)
      characterName = gameSettings.character;
    if (_mode == 'towers')
      characterName = 'guy';

    if (showLevelIntro) {
      if (!isRetry) {
        
        // show the girl, go modal and in max 4 seconds, end modal
        if (_mode == 'towers')
          Story.character(characterName).smile();
        else
          Story.character(characterName).hint();

        if (_mode == 'towers') {
          $('#tiles').addClass('show');          
          Story.goModal(function() {
            if (!gameSettings.isTutorial)
              $('.levelhint').hide();
            else {
              if (gameSettings.title2)
                $('.meanwhile').html(gameSettings.title2);
              if (gameSettings.desc2)
                $('.levelhint').html(gameSettings.desc2);
            }
            userCanStartToPlay();
            if (gameSettings.hint)
              gameSettings.hint(gameSettings.condition);
          }, 8000);
        }
        else if (_mode == 'random') {
          $('#tiles').addClass('show');          
          Story.goModal(function() {
            $('.levelhint').hide();
            userCanStartToPlay();
          }, 8000);
        }
        else {
          Story.goModal(function() {
            $('#tiles').addClass('show');            
            userCanStartToPlay(true);
            // also start the hand hint
            if (gameSettings.hint)
              gameSettings.hint(gameSettings.condition);
          }, 4000);
        }
      } else {
        $('#tiles').addClass('show');
        userCanStartToPlay();
        if (gameSettings.hint)
          gameSettings.hint(gameSettings.condition);
      }
    }
    else {
      $('#tiles').addClass('show');
      userCanStartToPlay();
    }
  }


  // just a hook for when the actual gameplay starts
  function userCanStartToPlay(noDelay) {
    _meanwhileTOH = setTimeout(function(){
      $('.meanwhile').addClass('hide');
      $('.retry-toggle').addClass('show');
    }, noDelay? 0 : 1500);    
  }

  this.restart = function() {
    startGame(_currentGameSettings);
  }



  function makeTilesMoveable() {
    var startClientX, startClientY, deltaX, deltaY, $tile, startX, startY, startValue, x, y, snapMargin,
        newX, newY,
        canMoveLeft, canMoveRight, canMoveUp, canMoveDown,
        canCombineLeft, canCombineRight, canCombineUp, canCombineDown,
        leftBoundary, rightBounary,
        moved = false,
        repeatedMove = false,
        targetTileWillFall = false,
        waitingToStartWithTile = false,
        moveState = 0;

    $(document).on(Utils.touchStart(), '#tiles', startMoveTileHandler);
    $(document).on(Utils.touchMove(), 'html', moveTile);
    $(document).on(Utils.touchEnd(), 'html', endMoveTile);

    this.startMoveTileHandler = startMoveTileHandler;
    this.moveTile = moveTile;
    this.endMoveTile = endMoveTile;

    // the entire makeTilesMovable section returns an object for game.js to work with, and it should be able
    // to clear some of its local vars...
    this.clearState = function() {
      $tile = null; 
      moved = false; 
      repeatedMove = false;
      waitingToStartWithTile = false;
      _$tileBeingMoved = null;
      _movingTile = 0;
      x = 0; y = 0;
      moveState = 0;
    }

    // this handler acts on the mouse/touchstart, but can be called later from within the move event,
    // to keep on moving - then the $tileOverride is passed
    // (this way it keeps validating the actions while moving, to prevent wrong moves)
    function startMoveTileHandler(event, $tileOverride) {
      Utils.eat(event);
      if (Story.isModal) return;
      if (moveState) return;

      // remove all existing flares
      //$('#tiles .tile .flare').remove();

      var tileInfo = _grid.getTileInfoByEvent(event);
      
      var $tileUnderPointer = $('#tiles .tile[data-x="'+tileInfo.x+'"][data-y="'+tileInfo.y+'"]');
      if ($tileUnderPointer.length && $tileUnderPointer.attr('data-value') * 1 != tileInfo.value) {
        //console.log('tile not selected. ', tileInfo.x, tileInfo.y, tileInfo.value, ' value in html is ', $tileUnderPointer.attr('data-value'));
        return;
      }
      if ($tileUnderPointer.attr('data-falling') == 'true') return;

      $tile = $tileOverride || $tileUnderPointer;

      waitingToStartWithTile = $tile.length == 0;
      if (waitingToStartWithTile) return;
      repeatedMove = ($tileOverride != undefined);
      var xyEvent = event;
      if (event.originalEvent && event.originalEvent.touches)
        xyEvent = event.originalEvent.touches[0];
      startClientX = xyEvent.clientX;
      startClientY = xyEvent.clientY;
      startMoveTile();
    }

    function startMoveTile() {
      if (!_playing) return;
      moveState = 1;
      moved = false;
      targetTileWillFall = false;
      var isFalling = $tile.attr('data-falling') == 'true';
      if (isFalling) return;
      $tile.css('z-index', _z++);
      x = 0, y = 0;
      startX = $tile.attr('data-x') * 1;
      startY = $tile.attr('data-y') * 1;
      startValue = _grid.getCurrentTileValue(startX, startY);

      // restrict the tile sorts to draw...
      if (startValue == 98) {
        // that's ok, defined in GameOptions if moving a bomb is allowed or not...
      }
      else if (startValue == 0 || startValue > GameOptions.maxNumber) {
        waitingToStartWithTile = true;
        return;
      }

      canCombineLeft = canCombineTo(startX - 1, startY);
      canCombineRight = canCombineTo(startX + 1, startY);
      canCombineUp = canCombineTo(startX, startY - 1);
      canCombineDown = canCombineTo(startX, startY + 1);

      canMoveLeft = canMoveTo(startX - 1, startY);// && !(repeatedMove && canCombineLeft);
      canMoveRight = canMoveTo(startX + 1, startY);// && !(repeatedMove && canCombineRight);
      canMoveUp = canMoveTo(startX, startY - 1);// && !(repeatedMove && canCombineUp);
      canMoveDown = canMoveTo(startX, startY + 1);// && !(repeatedMove && canCombineDown);

      _$flare = null,
      _flareOpacity = .3;

      _movingTile = 1;
      snapMargin = 4;//Math.ceil(_grid.tileSize * 0.1);
    }

    function moveTile(event) {
      if (!_playing) return;
      if (Story.isModal) return;
      if (!moveState && !waitingToStartWithTile) return;
      moveState = 2;

      Utils.eat(event);
      var xyEvent = event,
          hasTouches = event.originalEvent && event.originalEvent.touches;
      if (hasTouches) {
        xyEvent = event.originalEvent.touches[0];
      }

      // if we're not moving and waiting to find a first tile under our touch...
      if (!_movingTile) {
        if (waitingToStartWithTile) {

          var tileInfo = _grid.getTileInfoByEvent(event);
          var $tileUnderPointer = $('#tiles .tile[data-x="'+tileInfo.x+'"][data-y="'+tileInfo.y+'"]');
          if ($tileUnderPointer.length && $tileUnderPointer.attr('data-value') * 1 != tileInfo.value) {
            console.log('tile not selected. ', tileInfo.x, tileInfo.y, tileInfo.value, ' value in html is ', $tileUnderPointer.attr('data-value'));
            return;
          }
          // if we've got a tile, start the movement procedure with it
          if ($tileUnderPointer.length) {
            if ($tileUnderPointer.attr('data-falling') != 'true') {
              moveState = 0;
              startMoveTileHandler(event, $tileUnderPointer);
            }
          }
        }
        return;
      }

      if (!$tile.length) {
        doEndOfMovement();
        return;
      }

      deltaX = xyEvent.clientX - startClientX;
      deltaY = xyEvent.clientY - startClientY;
      if (_movingTile == 1 && (deltaX || deltaY)) {
        moved = true;
        _movingTile = 2;
        $tile[0].classList.add('moving');
        $tile.css('-webkit-transition', 'none');
        _$tileBeingMoved = $tile;
        _$flare = $tile.find('.flare');
        _$flare.removeClass('fade-out');
      }
      if (_movingTile == 2) {
        // snap to grid
        var singleDx = deltaX % _grid.tileSize,
            singleDy = deltaY % _grid.tileSize,
            snapped = false,
            aDx = Math.abs(deltaX),
            aDy = Math.abs(deltaY);


        // snap to the snapMargin percentage
        if (canMoveRight && singleDx > _grid.tileSize - snapMargin) {
          //deltaX = Math.ceil(deltaX / _grid.tileSize) * _grid.tileSize;
          snapped = true;
        }
        else if (canMoveLeft && singleDx < -_grid.tileSize + snapMargin) {
          //deltaX = (Math.ceil(deltaX / _grid.tileSize) - 1)* _grid.tileSize;
          snapped = true;
        }
        if (canMoveDown && singleDy > _grid.tileSize - snapMargin) {
          deltaY = Math.ceil(deltaY / _grid.tileSize) * _grid.tileSize;
          snapped = true;
        }
        else if (canMoveUp && singleDy < -_grid.tileSize + snapMargin) {
          deltaY = (Math.ceil(deltaY / _grid.tileSize) - 1)* _grid.tileSize;
          snapped = true;
        }

        // prevent dragging further than 1 tile distance
        deltaX = Math.max(-_grid.tileSize, Math.min(_grid.tileSize, deltaX));
        deltaY = Math.max(-_grid.tileSize, Math.min(_grid.tileSize, deltaY));

        // prevent dragging tiles to where it's not possible
        if (!canMoveLeft) deltaX = Math.max(0, deltaX);
        if (!canMoveRight) deltaX = Math.min(0, deltaX);
        if (!canMoveUp) deltaY = Math.max(0, deltaY);
        if (!canMoveDown) deltaY = Math.min(0, deltaY);

        // restrict movement by only one axis
        var movingHorizontally = aDx > aDy;
            _flareOpacity = 0;
            showFlare = false;

        if (movingHorizontally) {
          deltaY = 0;
          if (deltaX > 0 && canCombineRight) showFlare = true;
          if (deltaX < 0 && canCombineLeft) showFlare = true;
          if (showFlare) _flareOpacity = (aDx / _grid.tileSize);
        }
        else {
          deltaX = 0;
          if (deltaY < 0 && canCombineUp) showFlare = true;
          if (deltaY > 0 && canCombineDown) showFlare = true;
          if (showFlare) _flareOpacity = (aDy / _grid.tileSize);
        }

        _currentTileTransformation = {
          x: startX,
          y: startY,
          dx: deltaX,
          dy: deltaY
        };

        // ok, don't wait for an animationFrame but draw directly - feels much better
        if (Config.waitForAnimationFrame)
          updateScreen();
        else
          handleAnimFrame();

        // if the tile snapped to the grid, finish the move and take action
        if (snapped && Config.allowLongMoves) {
          // remember the $tile that was being dragged
          var $oldTile = $tile;
          movedToEmptySpot = doEndOfMovement();
          // now see if we can keep on moving while holding down the mouse/touch
          //setTimeout(function() {
          if (movedToEmptySpot) {
            if (!targetTileWillFall) {
              // override the handler with the current move event and old tile
              startMoveTileHandler(event, $oldTile);
            }
          }
        }
      }
    }

    function endMoveTile(event) {
      if (!moveState) return;

      moveState = 0;

      waitingToStartWithTile = false;
      if (!_playing) return;
      if (Pause.enabled) return;
      if (Story.isModal) return;
      if (waitingToStartWithTile) return;
      Utils.eat(event);
      doEndOfMovement();

      //if (_mode == 'towers' && startValue == 99)
        //clickedOnBomb();
    }

    function doEndOfMovement() {
      var movedToEmptySpot = false;
      x = 0; y = 0;
      if ($tile) {

        if (_movingTile == 2) {
          x = Math.round(deltaX / _grid.tileSize);
          y = Math.round(deltaY / _grid.tileSize);
        }
        //var movedAlot = Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2;

        // if a tile was moved
        if (x || y) {
          movedToEmptySpot = handleNewTilePosition();
        }
        else if (!moved) {
          if (!repeatedMove) // don't do this accidentally for longmoves
            handleTileTap();
        }
        else {
          _grid.placeTileXY($tile, startX, startY);
          var _$flare = $tile.find('.flare');
          if (_$flare && _$flare.length) {
            _$flare.attr('style', '');
          }
          //var $remainingFlares = $tile.find('.flare');
          //if ($remainingFlares.length)
            //$remainingFlares.remove();
        }

        // restore transformation to original rotate/scale
        $tile.removeClass('moving');
      }
      _movingTile = 0;
      $tile = null;

      setTimeout(checkIfGamehasEnded, 0);
      return movedToEmptySpot;
    }

    // when a tile is repositioned, check if it can add up or need to relocate
    function handleNewTilePosition() {
      newX = startX + x;
      newY = startY + y;
      var movedToEmptySpot = false;

      // if the tile is placed over another tile, then try to add them up
      if (_grid.existsTile(newX, newY)) {
        var tileValue = _grid.getCurrentTileValue(startX, startY),
            targetValue = _grid.getCurrentTileValue(newX, newY),
            newValue = tileValue + targetValue,
            newColor = (newValue - 1) % 9 + 1,
            isTen = newValue == 10;
        if (newValue <= GameOptions.maxNumber || newValue == 10) {

          if (isTen) {
            newValue = newColor = 98;
            Stats.bombsMade++;
          }
          else
            Stats.combinations++;

          // combine the tiles into a new one
          var $targetTile = $('#tile-' + newX + '-' + newY);
              $oldTile = $('#tile-' + startX + '-' + startY);
          $targetTile.attr('data-value', newValue).removeClass('tile-' + targetValue).addClass('tile-' + newColor);
          _grid.updateTile(newX, newY, newValue);

          Effects.shine(newX, newY);
          Sound.play('pling1');

          var $flare = $targetTile.find('.flare');
          $flare.css('opacity', 1);
          setTimeout(function(){
            $flare.addClass('fade-out');
            $flare.attr('style', '');
          }, 0);

          // clear the original tile's data and its DOM element
          if ($oldTile.length)
            $oldTile.remove();
          _grid.updateTile(startX, startY, 0);

          // if set to regenerate on combine, do so!
          if (GameOptions.regenerateOnCombine)
            regenerateNewTiles(startX, 1);
        }
      }
      // otherwise put the tile in the new position
      else {
        Stats.moved++;
        Sound.play('trigger2');

        newX = GameOptions.allowRepositionX? newX : startX,
        newY = GameOptions.allowRepositionY? newY : startY;
        targetTileWillFall = grid.getCurrentTileValue(newX, newY + 1) == 0;
        var newLeft = newX * _grid.tileSize,
            newTop = newY * _grid.tileSize;
        $tile.attr('data-x', newX).attr('data-y', newY).attr('id', 'tile-' + newX + '-' + newY);
        _grid.placeTileXY($tile, newX, newY);

        var tileValue = _grid.getCurrentTileValue(startX, startY);
        _grid.updateTile(startX, startY, 0);
        _grid.updateTile(newX, newY, tileValue);
        movedToEmptySpot = true;
      }
      
      fall();
      return movedToEmptySpot;
    }

    function handleTileTap() {
      var value = _grid.getCurrentTileValue(startX, startY);
      var blowUpTheBombs = value == 98 && GameOptions.blowUpBombs;
      if (value > 0 && value <= GameOptions.maxNumber || blowUpTheBombs) {
        var matchingTiles = _grid.getMatchingTiles(startX, startY);
        var allowBlowUp = matchingTiles.length >= GameOptions.clearOnMatchingTileCount;
        if (value == 98)
        	Stats.bombsBlownUp += grid.lastMatchingBombCount;
        if (value == 98 && matchingTiles.length == 1 && GameOptions.blowUpOneBomb)
          allowBlowUp = true;
        if (allowBlowUp) {
          blowUpTiles(matchingTiles);
          if (blowUpTheBombs)
            checkIfScoreIsHighScore(matchingTiles.length);
        }
      }
    }

    function canMoveTo(x, y) {
      if (x < 0 || y < 0 || x >= _grid.tilesX || y >= _grid.tilesY) return false;
      var value = _grid.getCurrentTileValue(x, y),
          targetValue = startValue + value,
          maxAllowedValue = GameOptions.maxNumber + (GameOptions.collectTens? 1 : 0);

      if (startValue == 98) {
        if (!GameOptions.moveBombs) return false;
        if (value == 0) return true; // means moving the bomb to an empty spot
      }

      if (targetValue > maxAllowedValue) return false;
      if (value == 0 && x == startX && y == (startY - 1)) return false; // don't move up into space
      return true;
    }

    function canCombineTo(x, y) {
      var value = _grid.getCurrentTileValue(x, y);
      return value != 0 && (startValue + value <= GameOptions.maxNumber + (GameOptions.collectTens? 1 : 0));
    }


  }
  // end of making tiles moveable

  function blowUpTiles($tiles, clearAllIntowersMode) {
    Stats.tilesBlownUp += $tiles.length;
    Stats.detonations++;

    $($tiles).each(function(i){
      var x = $(this).attr('data-x');
      var y = $(this).attr('data-y');
      Effects.explode(x, y, i);
    });
    Effects.shake($tiles.length);
    // in towers mode when expected to clear all tiles, regenerate new ones and force NO bricks
    if (clearAllIntowersMode)
      clearTiles($('#tiles .tile'), false, true);
    else
      clearTiles($tiles);
  }

  function clearTiles(tilesArr, tileValue, forceNoBricks) {
    // keep track of how many tiles per column where cleared
    var xTilesCleared = [];
    Sound.playExplosion();
    if (tilesArr.length >= 4)
      setTimeout(Sound.playExplosion, 150);
    if (tilesArr.length >= 8)
      setTimeout(Sound.playExplosion, 300);
    if (tilesArr.length >= 12)
      setTimeout(Sound.playExplosion, 450);
    $(tilesArr).each(function(i) {
      var $this = $(this),
          x = $this.attr('data-x') * 1,
          y = $this.attr('data-y') * 1;
      if (tileValue == undefined)
        tileValue = $this.attr('data-value');

      // set grid value to 0 and remove the tile
      _grid.updateTile(x, y, 0);

      // slight delay between tile removals
      var $el = $(this),
          delay = Config.explode? (i * 30 + 50) : 0;
      $el.css('z-index', 1);
      $el.attr('id', '');
      setTimeout(function(){
        $el.remove();
      }, delay);


      // increase its xCleared counter
      if (isNaN(xTilesCleared[x]))
        xTilesCleared[x] = 1;
      else
        xTilesCleared[x]++;
    });

    // do something with points
    tilesCleared(tilesArr.length, tileValue);    
    Effects.kapow(tilesArr);

    // regenerate tiles
    if (GameOptions.regenerateOnClear) {
      for (var x=0; x<xTilesCleared.length; x++) {
        var amount = xTilesCleared[x];
        if (amount > 0)
          regenerateNewTiles(x, amount, false, true);
      }
    }

    fall(Config.shake? 150 : 0);
  }

  function regenerateNewTiles(x, amount, valueArray, forceNoBombs) {
    if (_mode == 'towers' && _grid.regenerateCount % 5 == 0 && !forceNoBombs)
      _grid.regenerateTile(x, amount, [97]);
    else
      _grid.regenerateTile(x, amount, false, forceNoBombs);
  }

  // handle when the user cleared a set of 2 or more tiles
  function tilesCleared(numberOfTiles, tileValue) {
    checkIfGamehasEnded();

    // now check if there are any challenge blocks to clear
    var challengeValue = tileValue * numberOfTiles;
    var $challengeTiles = $('#level #tiles .tile.challenge[data-value="' + (challengeValue + 100) + '"]');
    if ($challengeTiles.length)
      clearTiles($challengeTiles);
  }

  // updates the score during tower mode
  function updateScore() {
    if (_mode != 'towers') return;
    if (_isTutorial) return;
    var score = Stats.bombsBlownUp;
    if (score > 0) {
	    var str = Utils.formatText(Texts.score, score);
	    $('.meanwhile').show().html(str);
  	}
  }

  // checks from bottom to the top if any tiles can be cleared
  this.autoClear = function() {
    for (var y = _grid.tilesY - 1; y >= 0; y--) {
      for (var x = 0; x < _grid.tilesX; x++) {
        var value = _grid.getCurrentTileValue(x, y);
        if (value > 0 && value <= GameOptions.maxNumber) {
          var matchingTiles = _grid.getMatchingTiles(x, y);
          if (matchingTiles.length >= GameOptions.clearOnMatchingTileCount) {
            clearTiles(matchingTiles);
            setTimeout(function(){
              that.autoClear();
            }, 310);
            return; // break out the clear loop when matching tiles have been found
          }
        }
      }
    }
  }

  function fall(initialDelay, afterFallHandler) {
    if (GameOptions.gravity)
      setTimeout(function(){
        _grid.fall(initialDelay);
        if (afterFallHandler)
          afterFallHandler();
      }, 0);
  }

  function checkIfGamehasEnded() {
    if (_hasEnded) return;
    updateScore();
    switch(_mode) {
      case 'levels':
        if (_grid.tilesRemaining === 0) {
          _hasEnded = true;
          levelEnded();
        }
        else if (_grid.isHopeless()) {
          _hasEnded = true;
          showHopeless();
        }
        break;
      case 'towers':
        if (_isTutorial && grid.tilesRemaining === 0) {
          _hasEnded = true;
          showEndOftowerTutorial();
        }
        if (!_grid.canCombinationsBeMadeInAFullGrid()) {
          _hasEnded = true;
          showEndOftowers();
        }
        break;
      case 'random':
        if (_grid.tilesRemaining === 0) {
          showEndOfRandom();
         }
        else if (_grid.isHopeless()) {
          _hasEnded = true;
          showHopeless();
        }
        break;
    }
  }

  function levelEnded() {
    _oldStars = User.getStars();
    User.completeLevel(_currentLevel);
    showNextLevel();
  }

  function showNextLevel(backFromDelay) {
    _playing = false;
    if (!backFromDelay) {
      Pause.disableButton();
      setTimeout(function(){showNextLevel(true)}, 1000);
      return;
    }
    Pause.hideButton();
    $('.levelhint').hide();

    var characterName = 'girl',
        levelObj = Levels.levels[_currentLevel];
    if (levelObj && levelObj.character)
      characterName = levelObj.character;
    if (_mode == 'towers')
      characterName = 'guy';

    if (_mode == 'random') {
      Story.showRetry();
      Pause.hideButton();
    }
    else {
      Story.showRetry();
      Story.showNext();
      Pause.hideButton();
    }
    if (_mode == 'towers')
      Story.character(characterName).smile();
    else {
      
      if (levelObj && levelObj.descAfter) {
        var levelText = levelObj.descAfter;
        if (typeof levelText == 'function') levelText = levelText();
        if (levelObj.descParams && levelText) {
          if (levelObj.descParams.length == 1)
            levelText = Utils.formatText(levelText, levelObj.descParams[0]());
        }
        $('.levelhint').removeClass('afterQuest').addClass('afterLevel').show();
        $('.levelhint').html(levelText);
      }

      $('.meanwhile').removeClass('hide'); // show the level number again
      Story.character(characterName).smile();
      Sound.play('pling3');
      
      var newStars = User.getStars();
      $('#level .progress').addClass('show');
      if (_oldStars != newStars) 
        showStarGained(_oldStars, newStars);
      // now that this level has been completed, see if we need to show the robot icon...
      /*
      var showRobotButtonNow = 
          User.state.questsUnlocked && 
          User.hasCompletedLevel(_currentLevel) &&
          Levels.hasQuests(_currentLevel);
      if (showRobotButtonNow)
        Quests.showToggleButton(_currentLevel);
      */
    }
  }

  function showStarGained(oldValue, newValue) {
    $('#level .starsachieved').html(oldValue);
    setTimeout(function() {
      $('#level .starsachieved').html(newValue);
      var x = $('#level .starsachieved').offset().left + 13,
          y = $('#level .starsachieved').offset().top + 18;
      Effects.shineXY(x,y);
    }, 1000);
  }

  // if a regular level is uncompletable, such as having 1 or moe tiles that cannot be combined
  // (this is also the entry for completing a robot-quest!)
  function showHopeless(backFromDelay) {
    _playing = false;
    if (!backFromDelay) {
      Pause.disableButton();
      setTimeout(function(){showHopeless(true)}, 1000);
      return;
    }
    Pause.hideButton();
    $('.levelhint').hide();

    // if one tile remaining on a quest level...
    if (/*User.hasCompletedLevel(_currentLevel) && */
        User.state.questsUnlocked && 
        Levels.hasQuests(_currentLevel) && 
        grid.tilesRemaining == 1) {
      return completeQuest();
    }

    var characterName = 'girl',
        levelObj = Levels.levels[_currentLevel];
    if (levelObj && levelObj.character)
      characterName = levelObj.character;

    if (levelObj && levelObj.descFail) {
      var levelText = levelObj.descFail;
      if (typeof levelText == 'function') levelText = levelText();
      if (levelObj.descParams && levelText) {
        if (levelObj.descParams.length == 1)
          levelText = Utils.formatText(levelText, levelObj.descParams[0]());
      }
      if (levelText) {
        $('.levelhint').removeClass('afterQuest').addClass('afterLevel').show();
        $('.levelhint').html(levelText);
      }
    }


    Story.showRetry();
    Story.character(characterName).sad();
    Sound.play('fail2');
  }

  function completeQuest() {
    _oldStars = User.getStars();
    var tileRemaining = _grid.getRemainingQuestTileValue(),
        completedNewQuest = User.completeQuest(_currentLevel, tileRemaining);
    if (completedNewQuest) {
      Quests.peek();
      Story.robot().smile();

      var newStars = User.getStars();
      $('#level .progress').addClass('show');
      setTimeout(function(){
        if (_oldStars != newStars) 
          showStarGained(_oldStars, newStars);
      },300);

      setTimeout(function() {
        var hasCompletedAllQuests = User.hasCompletedAllQuestsForLevel(_currentLevel);
        Quests.lightUpQuestTile(tileRemaining, hasCompletedAllQuests);

        var levelObj = Levels.levels[_currentLevel];
        if (levelObj.questAfter) {
          var levelText = levelObj.questAfter;
          if (typeof levelText == 'function') levelText = levelText();
          if (levelObj.descParams && levelText) {
            if (levelObj.descParams.length == 1)
              levelText = Utils.formatText(levelText, levelObj.descParams[0]());
          }
          if (levelText) {
            $('.levelhint').removeClass('afterLevel').addClass('afterQuest').show();
            $('.levelhint').html(levelText);
          }
        }

        if (hasCompletedAllQuests)
          Sound.play('pling6');
        else
          Sound.play('pling5');
        setTimeout(function() {
          Story.showRetry();
          if (hasCompletedAllQuests && User.hasCompletedLevel(_currentLevel))
            Story.showNext();
        }, 600)
      }, 1000);
    }
    else {
      Sound.play('fail1');
      Story.robot().sad();
      Story.showRetry();
      Story.showNext();
    }    
  }

  function showEndOftowers(backFromDelay) {
    _playing = false;
    if (!backFromDelay) {
      Pause.disableButton();
      setTimeout(function(){showEndOftowers(true)}, 1000);
      return;
    }
    Story.showRetry();
    Pause.hideButton();
    if (_newHighScoreReached) {
      Story.guy().smile();
      var levelText = Texts.newHighscoreReached;
      if (levelText) {
        $('.levelhint').removeClass('afterQuest').addClass('afterLevel').show();
        $('.levelhint').html(levelText);
      }
    } else {
      Story.guy().hint();
    }
  }

  function showEndOftowerTutorial(backFromDelay) {
    _playing = false;
    if (!backFromDelay) {
      Pause.disableButton();
      setTimeout(function(){showEndOftowerTutorial(true)}, 1000);
      return;
    }
    Story.showNext();
    Pause.hideButton();
    Story.guy().smile();
    _tutorialFinishedOnceThisSession = true;
    var levelText = Texts.storyTutorialCompleted;
    if (levelText) {
      $('.levelhint').show();
      $('.levelhint').html(levelText);
    }
  }

  function showEndOfRandom() {
    _oldStars = User.getStars();
    User.addStars();
    _hasEnded = true;
     showNextLevel();
   }

  function checkIfScoreIsHighScore(bombCount) {
    if (_mode != 'towers') return;
    if (_isTutorial) return;
    var towersObj = User.state.towers[_currentSize + ''],
        highScore = towersObj && towersObj.score > 0 ? towersObj.score : 0;

    //var curScore = bombCount;    
    var curScore = Stats.bombsBlownUp;
    if (curScore > highScore) {
      towersObj.score = curScore;
      User.persistState();
      _newHighScoreReached = true;

      //$('.meanwhile').html(newScoreText);
      /*
      Story.guy().smile();
      Pause.hideButton();
      $('.levelhint').html(newScoreText).show();
      Story.goModal(function() {
        $('.levelhint').hide();
        Pause.showButton();
      }, 4000);
      */
    }    
  }

  function blowUpTower() {
    retry();
    _playing = true;
    Story.hide();
    Story.hideBalloons();

    setTimeout(function(){
      grid.clearRegenerateCount();
      Pause.showButton();
    }, 1000);
  }

  // when clicked on a bomb, show a message to wait
  function clickedOnBomb() {
    setTimeout(function(){
      $('.meanwhile').html(Texts.notDoneYet);
    },0); 
  }

  this.__defineGetter__('mode', function() { return _mode; });
  this.__defineGetter__('level', function() { return _currentLevel; });
  this.__defineGetter__('tower', function() { return _currentSize; });
  this.__defineGetter__('playing', function() { return _playing; });
  this.doAction = doAction;
  this.checkIfGamehasEnded = checkIfGamehasEnded;
  this.showGameModes = showGameModes;
  this.showEndOftowers = showEndOftowers;
  this.blowUpTower = blowUpTower;
  this.startLevel = startLevel;
  this.startMode = startMode;
  this.startTower = startTower;
  this.__defineGetter__('io', function() { return _io; });
})();