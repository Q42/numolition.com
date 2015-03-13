window.LevelSelect = new (function(){
  var that = this,
      _page = 0,
      _maxPage = 10,
      _max = 50,
      _levelsPerPage = 7,
      _panels,
      _pixelOffset = 0,
      _moved,
      _noClick,
      _movedThreshold = 5, // detect if you've moved or tapped
      _swipeThreshold = 40; // how much you need to swipe before a page is flipped


  _panels = {
    'modes': {
      'levels': { polygon: [9, 203, 8, 7, 250, 11, 261, 39, 313, 43, 313, 139] },
      'towers': { polygon: [4, 211, 317, 143, 316, 351, 3, 291] },
      'random': { polygon: [9, 297, 313, 356, 310, 409, 245, 412, 227, 464, 8, 462] }
    },
    'towers': { // towers
      '1': { polygon: [10, 11, 146, 8, 165, 217, 6, 190] },
      '2': { polygon: [150, 9, 314, 7, 314, 239, 167, 219] },
      '3': { polygon: [5, 198, 150, 223, 178, 467, 4, 470] },
      '4': { polygon: [156, 223, 316, 250, 315, 470, 180, 472] },
    },
    'settings-screen': {
      'language': { polygon: [12, 239, 154, 232, 169, 471, 11, 471] },
      'sound': { polygon: [12, 65, 74, 61, 73, 117, 16, 126] },
      'music': { polygon: [82, 48, 143, 49, 145, 103, 88, 106] }
    },
    'quento': {
      'loadquento': { polygon: [9, 94, 63, 90, 82, 46, 312, 39, 316, 458, 77, 459, 65, 433, 16, 431] }
    },
    'levels-page-1': {
      '1': { polygon: [9, 14, 210, 9, 164, 174, 8, 154], questPos: [4, 111] },
      '2': { polygon: [217, 10, 315, 10, 313, 115, 194, 93], underProgress:true, questPos: [257, 62] },
      '3': { polygon: [198, 98, 311, 120, 312, 192, 178, 174], questPos: [251, 140] },
      '4': { polygon: [8, 163, 312, 198, 310, 303, 6, 294], questPos: [255, 255] },
      '5': { polygon: [7, 301, 172, 306, 163, 367, 4, 393], questPos: [-4, 334] },
      '6': { polygon: [7, 398, 161, 374, 148, 468, 7, 469], questPos: [92, 405] },
      '7': { polygon: [176, 306, 313, 309, 315, 473, 154, 472], questPos:[160,409] }
    },
    'levels-page-2': {
      '8': { polygon: [7, 8, 148, 9, 172, 155, 6, 144], questPos:[-2,94] }, 
      '9': { polygon: [153, 7, 313, 8, 311, 65, 167, 84], underProgress:true, questPos:[259,15] },
      '10': { polygon: [167, 89, 313, 68, 312, 166, 178, 154], questPos:[252,115] },
      '11': { polygon: [6, 150, 114, 159, 131, 312, 5, 320], questPos:[69,260] },
      '12': { polygon: [117, 158, 313, 172, 310, 303, 135, 312], questPos:[131,255] },
      '13': { polygon: [5, 326, 77, 322, 118, 469, 6, 470], underPrevButton: true, questPos:[3,361] },
      '14': { polygon: [80, 321, 219, 313, 198, 469, 121, 468], questPos:[126,414] },
      '15': { polygon: [224, 313, 314, 309, 313, 470, 201, 469], questPos:[260,343] }
    },
    'levels-page-3': {
      '16': { polygon: [6, 8, 99, 8, 126, 121, 6, 108], questPos:[72,69] }, 
      '17': { polygon: [103, 9, 313, 9, 311, 141, 130, 121], underProgress:true, questPos:[113,9] },
      '18': { polygon: [6, 114, 311, 152, 311, 244, 6, 265], questPos:[9,118] },
      '19': { polygon: [7, 273, 151, 262, 157, 350, 7, 365] },
      '20': { polygon: [7, 373, 157, 359, 165, 467, 6, 468], underPrevButton: true },
      '21': { polygon: [158, 263, 311, 252, 311, 468, 170, 468] }
    },
    'levels-page-4': {
      '22': { polygon: [6, 8, 184, 8, 149, 130, 7, 118], questPos:[129,8] },
      '23': { polygon: [191, 8, 312, 8, 313, 144, 154, 132], underProgress:true },
      '24': { polygon: [6, 128, 139, 138, 161, 245, 6, 262] }, 
      '25': { polygon: [148, 140, 311, 152, 311, 227, 169, 244], questPos:[156,142] },
      '26': { polygon: [6, 270, 153, 254, 141, 358, 6, 339] },
      '27': { polygon: [159, 253, 311, 236, 310, 382, 148, 360] },
      '28': { polygon: [7, 347, 145, 368, 170, 468, 6, 469], underPrevButton: true },
      '29': { polygon: [156, 369, 312, 393, 311, 467, 177, 469], questPos:[162,373] }
    },
    'levels-page-5': {
      '30': { polygon: [6, 8, 312, 8, 312, 125, 6, 100], underProgress:true, questPos:[265, 8] }, 
      '31': { polygon: [7, 108, 197, 124, 162, 235, 6, 203] },
      '32': { polygon: [207, 125, 311, 134, 311, 293, 160, 278] },
      '33': { polygon: [7, 213, 159, 244, 146, 283, 311, 302, 313, 335, 6, 383]  },
      '34': { polygon: [6, 393, 155, 369, 163, 469, 6, 466], underPrevButton: true },
      '35': { polygon: [162, 366, 310, 344, 311, 468, 172, 468] }
    },
    'levels-page-6': {
      '36': { polygon: [6, 9, 155, 9, 161, 106, 7, 94], questPos:[110,9] },
      '37': { polygon: [161, 8, 311, 9, 311, 122, 169, 108], underProgress:true },
      '38': { polygon: [7, 101, 110, 110, 107, 196, 7, 186] }, 
      '39': { polygon: [118, 110, 214, 120, 209, 208, 115, 197] },
      '40': { polygon: [219, 119, 311, 128, 312, 220, 217, 208] },
      '41': { polygon: [7, 193, 311, 226, 313, 280, 6, 334] },
      '42': { polygon: [7, 342, 312, 289, 311, 468, 6, 468], underPrevButton: true, questPos:[9,338] }
    },
    'levels-page-7': {
      '43': { polygon: [6, 8, 157, 8, 178, 100, 7, 82], questPos:[116,8] }, 
      '44': { polygon: [166, 8, 311, 9, 311, 118, 186, 104], underProgress:true },
      '45': { polygon: [6, 89, 105, 101, 105, 206, 7, 216] },
      '46': { polygon: [113, 104, 312, 128, 311, 186, 114, 204] },
      '47': { polygon: [6, 224, 193, 206, 181, 313, 8, 296] },
      '48': { polygon: [202, 206, 312, 196, 313, 324, 190, 314] },
      '49': { polygon: [7, 302, 150, 317, 164, 468, 7, 468], underPrevButton: true },
      '50': { polygon: [159, 318, 312, 336, 312, 469, 171, 469] }
    }
  }

  function init() {
    // prepare all items to be in place
    addLevelNumbers();
    addQuestItems();
    addBombs();

    updateModeProgress();
    updateLevelProgress();
    updateTowerProgress();

    bindSwipe();
    $(document).on(Utils.touchEnd(), '*[data-panels="true"]', clickPanel);
    $(document).on(Utils.touchEnd(), '#swiper .back', clickBack);
    $(document).on(Utils.touchEnd(), '#swiper .prev-page', clickPrev);
    $(document).on(Utils.touchEnd(), '#swiper .next-page', clickNext);
  }

  function bindSwipe() {
    var swiping, startX, startPixelOffset, currentswipe,
        $el, $html = $('html');

    $(document).on(Utils.touchStart(), '[data-swipe="true"]', swipeStart);
    $(document).on(Utils.touchMove(), 'html.page-swiping', swipe);
    $(document).on(Utils.touchEnd(), 'html.page-swiping', swipeEnd);

    function swipeStart(event) { 
      Utils.eat(event);
      if (_noClick) return;
      if ($(event.target).closest('[data-swipe="false"]').length) return false;
      if (!swiping) {
        _moved = false;
        $el = $(event.target).closest('[data-swipe="true"]');
        if ($el.length) {
          _maxPage = $(event.target).closest('[data-swipe-pages]').attr('data-swipe-pages') * 1;
          $el.css('-webkit-transition', 'none');
          $html.addClass('page-swiping');
          var xyEvent = event.originalEvent.touches? event.originalEvent.touches[0] : event,
                    x = Math.round(xyEvent.clientX - $('#game').offset().left);
                      swiping = 1;
          startX = x;
        }
      }
    }

    function swipe(event) {
      if (!swiping) return;
      if (_noClick) return;

      event.preventDefault();
      var xyEvent = event.originalEvent.touches? event.originalEvent.touches[0] : event,
          x = Math.round(xyEvent.clientX - $('#game').offset().left);
          y = Math.round(xyEvent.clientY - $('#game').offset().top);
      var deltaX = x - startX;

      if (swiping == 1 && deltaX) {
        swiping = 2;
        startPixelOffset = _pixelOffset;
      }

      if (Math.abs(deltaX) > _movedThreshold)
        _moved = true;

      if (swiping == 2) {
        var touchPixelRatio = 1;
        if ((_page == 0 && x > startX) || (_page >= (_maxPage) && x < startX))
          touchPixelRatio = 3;
        _pixelOffset = startPixelOffset + deltaX / touchPixelRatio;        

        $el.css('-webkit-transform', 'translate3d(' + _pixelOffset + 'px, 0, 0)');
      }
    }

    function swipeEnd(event) {
      if (!swiping) return false;
      if (_noClick) return;

      if (swiping == 2) {
        var pageDir = 0;

        if (_pixelOffset < (startPixelOffset - _swipeThreshold) && _page < _maxPage)
          pageDir = 1;
        else if (_pixelOffset > (startPixelOffset + _swipeThreshold)  && _page > 0)
          pageDir = -1;

        // if moved a page
        if (pageDir) {
          setTimeout(function() {          
            loadPage(_page + pageDir);
            _moved = false
          }, 0);
        }
        else {
          loadPage(_page);          
        }
      }
      swiping = 0;
      setTimeout(function() {
        $el.css('-webkit-transition', '');
        $html.removeClass('page-swiping');
      }, 0);
      return false;
    }
  }

  function show() {
    Story.hide();
    _moved = true;
    document.location.hash = '';
    $('#nav').show().siblings('.screen').hide();
    setTimeout(function() {
      _moved = false;
    }, 0);
    return that;
  }

  function loadPage(page) {    

    if (page == undefined) page = _page;
    if (page == undefined) page = 0;
    page = Math.max(0, Math.min(99, page));
    _page = page;

    // if no min/max is provided, show it at the most recent state
    var min = Math.max(1, (_page - 1) * _levelsPerPage + 1),
        max = Math.min(_max, _page * _levelsPerPage);

    // properly set the prev/next buttons
    var showPrev = min > 1;
    var showNext = max < _max;
    _pixelOffset = -(320 * page);

    setTimeout(function() {
      $('#swiper').css('-webkit-transform', 'translate3d(' + _pixelOffset + 'px, 0, 0)');
    }, 0);
    
    // auto unlock the first level!
    if (_page == 1 && !User.hasUnlockedLevel(1) && $('#nav').hasClass('show-levels')) {
      _noClick = true;
      setTimeout(function() {
        User.unlockLevel(1);
        updateLevelProgress();
        Sound.play('valve1');
        Effects.shake();
        _noClick = false;
      }, 700)
    }
  }

  // temporary function to show level numbers in empty comic pages
  function addLevelNumbers() {
    for (var pageNr = 3; pageNr <= _maxPage; pageNr++) {
      var id = 'levels-page-' + pageNr,
          panel = _panels[id];
      $('#' + id + ' .levelnr').remove();
      for (var levelNr in panel) {
        var centroid = Drawing.getCentroid(panel[levelNr].polygon),
            $el = $('<div class="levelnr">' + levelNr + '</div>');
        $el.css({ 'left': centroid.x + 'px', 'top': centroid.y + 'px'});
        $('#' + id).append($el);
      }
    }
  }

  function addQuestItems() {
    for (var pageNr = 1; pageNr <=7; pageNr++) {
      var id = 'levels-page-' + pageNr,
          panel = _panels[id];
      for (var levelNr in panel) {
        var levelInfo = Levels.levels[levelNr],
            duration = 3 + Utils.between(0,9) / 10,
            hasQuests = levelInfo && levelInfo.quests && levelInfo.quests.length,
            x, y;

        if (!hasQuests)
          continue;

        var questPos = panel[levelNr].questPos,
            quests = levelInfo.quests;
        if (questPos) {
          x = questPos[0];
          y = questPos[1];
        } else {
          var polygon = panel[levelNr].polygon,
              xTopLeft = polygon[0],
              yTopLeft = polygon[1],
              xTopRight = polygon[2],
              yTopRight = polygon[3],
              xBottomLeft = polygon[polygon.length - 2],
              yBottomLeft = polygon[polygon.length - 1],            
              x = Math.round(xTopLeft - (xTopLeft - xBottomLeft) / 6) + 2,
              y = Math.round(yTopLeft - (yTopLeft - yTopRight) / 6);
        }

        var $stars = $stars = $('<div id="quest-stars-' + levelNr + '" class="stars">');
        for (var i=0; i<quests.length; i++) {
          var quest = quests[i];
          var $questStar = $('<div id="quest-star-'+ levelNr + '-' + (i + 1) + '" class="quest-item"></div>');
          $stars.css({
            'left': x + 'px',
            'top': y + 'px'
            //'-webkit-animation': 'quest-itemfloat ' + duration + 's infinite ease-in-out'
          });
          $stars.append($questStar);
          $stars.hide();
        }
        $('#' + id).append($stars);
      }
    }
  }

  function addBombs() {
    for (var towerId in TowerSize) {
      var userInfo = User.state.towers[towerId],
          centroid = Drawing.getCentroid(_panels.towers[towerId].polygon),
          duration = 3 + Utils.between(0,9) / 10,
          hasScore = userInfo.score > 0;
      
      $bomb = $('<div id="tower-score-' + towerId + '" class="tower-score">' + 0 + '</div>');
      $bomb.css({
        'left': centroid.x + 'px',
        'top': centroid.y + 'px'        
      });
      $('#towers').append($bomb);
      $bomb.hide();
    }
  }

  // sets the greyed out comic panels and shows/hides quest icons
  function updateLevelProgress() {
    for (var pageNr = 1; pageNr <= 7; pageNr++) {
      var id = 'levels-page-' + pageNr,
          panel = _panels[id],
          had = false,
          underBackButton = 0, // used for drawing a greyed out back/prev/next
          underPrevButton = 0,
          underNextButton = 0,
          underProgress = 0;
          $el = $('#' + id);
      for (var levelNr in panel) {
        var levelInfo = Levels.levels[levelNr], 
            userInfo = User.state.levels[levelNr],
            hasCompleted = User.hasCompletedLevel(levelNr),
            questCount = (levelInfo && levelInfo.quests)? levelInfo.quests.length : 0,
            allQuestsCompleted = User.hasCompletedAllQuestsForLevel(levelNr);

        if (!underBackButton) 
          underBackButton = levelNr;

        if (panel[levelNr].underPrevButton) 
          underPrevButton = levelNr;

        if (panel[levelNr].underProgress) 
          underProgress = levelNr;

        underNextButton = levelNr; // always set, for final

        if (userInfo.unlocked)
          $('.page-locked.page-' + levelNr).hide();
        else
          $('.page-locked.page-' + levelNr).show();

        if (!userInfo.unlocked) 
          continue;

        if (!hasCompleted) 
          continue;

        if (!User.state.questsUnlocked)
          continue;
        
        if (!levelInfo || !levelInfo.quests)
          return;

        var quests = levelInfo.quests;
        var $stars = $('#quest-stars-' + levelNr);
        if ($stars.length)
          $stars.show();
        for (var i=0; i<quests.length; i++) {
          var quest = quests[i],
              $star = $('#quest-star-' + levelNr + '-' + (i + 1));
          if ($star.length && User.hasCompletedQuest(levelNr, quest))
            $star.addClass('completed');
        }
      }

      $el[User.hasUnlockedLevel(underBackButton)? 'removeClass' : 'addClass']('grey-back');
      $el[User.hasUnlockedLevel(underPrevButton)? 'removeClass' : 'addClass']('grey-prev');
      $el[User.hasUnlockedLevel(underNextButton)? 'removeClass' : 'addClass']('grey-next');
      $el[User.hasUnlockedLevel(underProgress)? 'removeClass' : 'addClass']('grey-progress');
    }
  }

  function updateModeProgress() {
    if (User.state.sandboxUnlocked) {
      $('.unlock-mode-sandbox, .mode-locked-sandbox').hide();
    } else {
      $('.unlock-mode-sandbox').text(ModeInfo.sandbox[0]);
    }
    if (User.hasUnlockedTower(1)) {
      $('.unlock-mode-towers, .mode-locked-towers').hide();
    } else {
      $('.unlock-mode-towers').text(TowerSize[1][3]);
    }
  }

  function updateTowerProgress() {    
    for (var towerId in TowerSize) {
      var userInfo = User.state.towers[towerId],
          hasScore = userInfo.score > 0,
          $bomb = $('#tower-score-' + towerId),
          $lock = $('#towers .tower-locked.tower-' + towerId);
          $cost = $('#towers .unlock-tower-' + towerId);
          $cost.find('span').text(TowerSize[towerId][3]);
      
      if (hasScore)
        $bomb.html(userInfo.score).show();

      if (userInfo.unlocked) {
        $lock.hide();
        $cost.hide();
      }
      else {
        $lock.show();
        $cost.show();
      }
    }
    if (!User.state.towers['1'].unlocked)
      $('#towers').addClass('grey-back');
    else
      $('#towers').removeClass('grey-back');
  }

  function prev() {
    loadPage(_page - 1);
  }

  function next() {
    loadPage(_page + 1);
  }

  function clickPanel(event) {    
    if (_moved) return;
    if (_noClick) return;

    if (!Utils.wasClick(event)) return;

    if ($(event.target).closest('[data-swipe="tap"]').length) return;

    function getPanelFromClick() {
      for (var panelName in panel) {
        var polygon = panel[panelName].polygon;
        if (Drawing.inPolygon(x, y, polygon))
          return panelName;
      }
    }

    var $page = $(event.target).closest('*[data-panels="true"]'),
        id = $page.attr('id'),
        panel = _panels[id];
    if (!panel)
      return;

    var xyEvent = event;
    if (event.originalEvent && event.originalEvent.changedTouches)
      xyEvent = event.originalEvent.changedTouches[0];

    x = xyEvent.clientX - $('#game').offset().left;
    y = xyEvent.clientY - $('#game').offset().top;

    var panelName = getPanelFromClick();
    if (panelName)
      clickPanelItem(id, panelName);

    return false;
  }

  function clickBack(event) {
    if (_moved) return;
    if (_noClick) return;
    if (!Utils.wasClick(event)) return;
    Game.showGameModes();
    return false;
  }

  function clickPrev(event) {
    if (_moved) return;
    if (_noClick) return;
    if (!Utils.wasClick(event)) return;
    prev();
    return false;
  }

  function clickNext(event) {
    if (_moved) return;
    if (_noClick) return;
    if (!Utils.wasClick(event)) return;
    next();
    return false;
  }

  function clickPanelItem(id, name) {
    var nr = name * 1;
    if (_noClick) return;
    switch(id) {
      case 'modes':
        switch(name) {
          case 'random':
            if (!User.state.sandboxUnlocked) {
              var cost = ModeInfo.sandbox[0] * 1,
                  stars = User.getStars();

              if (stars >= cost) {
                User.removeStars(cost)
                User.unlockSandbox();
                updateModeProgress();
                Effects.shake();
                Sound.play('valve1');
              }
              else {
                Sound.play('fail1');
                Effects.shakeLite();
              }
            }
            else {
              Game.startMode(name);
            }
            break;
          case 'towers':
            if (!User.hasUnlockedTower(1)) {
              var cost = TowerSize[1][3];
                  stars = User.getStars();

              if (stars >= cost) {
                User.removeStars(cost)
                User.unlockTower(1);
                updateModeProgress();
                updateTowerProgress();
                Effects.shake();
                Sound.play('valve1');
              }
              else {
                Sound.play('fail1');
                Effects.shakeLite();
              }
            }
            else {
              Game.startMode(name);
            }
            break;
          default:
            Game.startMode(name);
            break;
        }
        break;
      case 'towers':

        if (!User.hasUnlockedTower(nr)) {
          var cost = TowerSize[nr][3] * 1,
              stars = User.getStars();

          if (stars >= cost) {
            User.removeStars(cost)
            User.unlockTower(nr);
            updateTowerProgress();
            Effects.shake();
            Sound.play('valve1');
          }
          else {
            Sound.play('fail1');
            Effects.shakeLite();
          }
        }
        else {
          Game.startTower(nr);
        }
        break;
      case 'levels-page-1':
      case 'levels-page-2':
      case 'levels-page-3':
      case 'levels-page-4':
      case 'levels-page-5':
      case 'levels-page-6':
      case 'levels-page-7':

        if (Config.requireUnlockToPlay && !User.hasUnlockedLevel(nr)) {
          Sound.play('fail1');
          Effects.shakeLite();
          return;
        }

        Game.startLevel(nr);
        User.unlockLevel(nr);
        break;
      case 'settings-screen':
        if (name == 'language')
          Settings.toggleLanguage();
        if (name == 'sound')
          Settings.toggleSound();
        if (name == 'music')
          Settings.toggleMusic();
        break;
      case 'quento':
        if (name == 'loadquento')
          Settings.loadQuento();
        break;
    }
  }

  function showTowers() {
    $('#nav').removeClass('show-levels show-settings').addClass('show-towers');
  }

  function showLevels() {
    $('#nav').removeClass('show-towers show-settings').addClass('show-levels');
  }

  function showMain() {
    $('#nav').removeClass('show-levels show-settings').removeClass('show-towers');
  }

  function getPageForLevel(level) {
    for (var name in _panels) {
      if (name.indexOf('levels-page-') == 0) {
        var pageNr = name.substr('levels-page-'.length) * 1,
            obj = _panels[name];
        if (level in obj)
          return pageNr; 
      }
    }
    return 0;
  }


  this.init = init;
  this.loadPage = loadPage;
  this.show = show;
  this.prev = prev;
  this.next = next;
  this.updateLevelProgress = updateLevelProgress;
  this.updateTowerProgress = updateTowerProgress;
  this.showTowers = showTowers;
  this.showLevels = showLevels;
  this.showMain = showMain;
  this.getPageForLevel = getPageForLevel;

  this.__defineGetter__('page', function() { return _page; });

})();