/*
Try to blast this tower with as many <img src="img/pause/bomb.png" /> as you can!
Fill a tower with bombs <img src="img/pause/bomb.png" />. We'll crush the tower 
To crush this tower, place as many bombs <img src="img/pause/bomb.png" /> as you can.

*/

window.ModeInfo = {
  'sandbox': [20],
  'towers': [0]
}

// lame towers levels definition: width, height, name, starsRequiredToUnlock, brickRegenerateChance
window.TowerSize = {
  '1': [3, 9, 'Tower Inferno', 10, 4],
  '2': [2, 9, 'Midnight Tower', 5, 5],
  '3': [4, 9, 'Aqua Tower', 5, 4],
  '4': [5, 9, 'Orbit Tower', 5, 4]
};

window.TowerTutorial = {
  isTutorial: true,
  tilesX: 3, tilesY: 4, tileValues: 
  [
    0,97,0,
    99,3,99,
    99,7,97,
    4,97,6
  ],
  hint: function(c) {
    Hand.startAt(2,-1,c).moveTo(1,1).down().moveTo(1,2).up().moveTo(1,2);
  },
  condition: function() {
    return grid.getCurrentTileValue(1,1) == 3;
  }, 
  title: 'Wait!',
  title2: 'Make 2 bombs...',
  desc: 'You need a lesson in making bombs!',
  desc2: 'Make a 10 to get a <img src="img/pause/bomb.png">.<br/> Tap it to blow up numbers or walls <img class="brickborder" src="img/tile__rock.png"/> next to it.'
}

window.RandomLevel = {
  tilesX: 7,
  tilesY: 9,
  title: 'Have fun!',
  desc: 'Clear the level for a <img src="img/quests/star.png" /> Remember, 10 is a <img src="img/pause/bomb.png" /> !'
}


var Levels = new (function Levels() {
  var that = this;

  var classicLevels = [
    { complexity: 1,
      tilesX: 1, tilesY: 4, tileValues: [9,6,6,9],
      desc: 'Hi! I\'m Anique! <br/>I\'ll show you how to blow up bricks...',
      descAfter: 'Awesome!',
      hint: function(c) {
        Hand.startAt(2,1.5,c).moveTo(0,2).tap().moveTo(2,1.5);
      },
      condition: function() {
        return grid.getCurrentTileValue(0, 2) != 0;
      },
      quests:[]
    },
    { complexity: 2,
      tilesX: 2, tilesY: 5, tileValues: [7,7,7,8,8,8,8,7,7,7],
      desc: 'Blow up everything... Always !',
      descAfter: 'Feels good, doesn\'t it?',
      hint: function(c) {
        Hand.startAt(2,-1,c).moveTo(1,1).tap().moveTo(1,3).tap();
      },
      condition: function() {
        return grid.getCurrentTileValue(0,2) == 8 &&
          grid.getCurrentTileValue(0,4) == 7;
      },
      quests: []
    },
    { complexity: 3,
      tilesX: 2, tilesY: 6, tileValues: [5,5,5,5,7,7,7,9,8,9,8,5],
      desc: 'Never forget a brick.',
      quests: [5,7],
      descFail: 'Aw! Hold the fives...',
    },
    { complexity: 4,
      tilesX: 3, tilesY: 2, tileValues: [6,0,6,8,8,6],
      desc: 'You can move bricks <br/>too !',
      hint: function(c) {
        Hand.startAt(1,-2,c).moveTo(0,0).down().moveTo(1,0).up().moveTo(2,-2);
      },
      quests: [6],
      condition: function() {
        return grid.getCurrentTileValue(0, 0) == 6;
      }
    },
    { complexity: 5,
      tilesX: 2, tilesY: 5, tileValues: [6,0,8,0,5,0,6,8,6,5],
      quests: [6],
      descAfter: 'Good job!'
    },
    { complexity: 6,
      tilesX: 4, tilesY: 1, tileValues: [3,4,0,7],
      desc: 'combine numbers<br/> to make new bricks.',
      hint: function(c) {
        Hand.startAt(1,-3,c).moveTo(0,0).down().moveTo(1,0).up().moveTo(1,0);
      },
      condition: function() {
        return grid.getCurrentTileValue(0,0) == 3 &&
          grid.getCurrentTileValue(1,0) == 4;
      },
      quests: [],
    },
    { complexity: 7,
      tilesX: 2, tilesY: 4, tileValues: [8,1,6,3,3,6,1,8],
      desc: 'you can\'t make bricks higher than 9.',
      quests: [2,6,8],
      bonusquests: [9]
    },
    { complexity: 8,
      tilesX: 2, tilesY: 7, tileValues: [1,4,99,9,9,9,4,99,9,9,99,9,1,4],
      quests: [2,5,6],
      descAfter: 'Meet my friend CSS3-PO...'
    },
    { complexity: 11,
      character: 'robot',
      desc: function() {
        if (User.hasCompletedAllQuestsForLevel(Game.level))
          return 'To proceed you always need to clear the level too.';
        else
          return 'Tap the <img src="img/quests/star_white.png" /> above for a bonus challenge!';
      },
      hint: function(c) {
        Hand.startAt(3,-2,c, true).moveTo(1,-4.8).tap();
      },
      condition: function() {
        return ((Hand.loop < 3) && 
          !$('#quests-toggles').hasClass('completed') && 
          $('.retry-balloons').css('display') != 'block' &&
          !$('html').hasClass('quest-screen-objectives-enabled'));
      },
      tilesX: 3, tilesY: 5, tileValues: [
      3,4,7,
      99,99,99,
      0,4,0,
      5,99,0,
      3,6,9],
      quests: [9],
      questAfter: function(){
        if (!User.hasCompletedLevel(Game.level))
          return 'Whoo! Now retry and blow up all bricks too...';
        return 'Yippee!';
      },
      descAfter: function(){
        if (!User.hasCompletedAllQuestsForLevel(Game.level))
          return 'Well done! Now retry for that bonus challenge...';
        return 'Yippee!';
      },
      unlockFeatureAtStart: 'quests'
    },
    { 
      complexity: 10,
      character: 'robot',
      desc: 'Some levels have more bonus stars, see?',
      tilesX: 5, tilesY: 4, tileValues: [0,0,1,0,0,0,1,2,3,0,0,99,5,99,0,5,5,5,5,5],
      quests: [3,6,7],
      bonusquests: [1,2,5],
      questAfter: function(){
        if (User.countCompletedQuests(Game.level) == 1)
          return 'That\'s 1 bonus star. Retry to go after the others...';
        else if (User.countCompletedQuests(Game.level) == 2)
          return 'Yay! Just one more...';
      }
    },
    { complexity: 9,
      character: 'robot',
      desc: 'You can replay early levels for new bonus challenges too !',
      tilesX: 2, tilesY: 4, tileValues: [1,0,2,0,3,4,5,5],
      quests: [4,6,8],
      bonusquests: [2,5]
    },
    { complexity: 12,
      tilesX: 7, tilesY: 7, tileValues: [
      0,0,0,0,0,0,99,
      0,0,0,0,0,99,99,
      0,0,0,0,9,99,99,
      0,0,0,7,8,9,99,
      0,0,5,6,7,8,9,
      0,3,4,5,6,7,8,
      1,2,3,4,5,6,7],
      quests: [1,2,3],
      bonusquests: [4,5,6,7,8,9]
    },

    { complexity: 13,
      tilesX: 7, tilesY: 7, tileValues: [
      0,0,0,0,0,0,7,
      0,0,0,0,0,99,99,
      0,0,0,0,4,4,1,
      0,0,0,99,99,99,99,
      0,0,6,3,5,1,4,
      0,99,99,99,99,99,99,
      5,1,3,2,2,3,5
    ] },

    { complexity: 14,
      tilesX: 3, tilesY: 8, tileValues: [
      1,0,5,
      99,4,99,
      0,2,0,
      0,99,0,
      1,0,0,
      99,9,99,
      8,3,99,
      2,5,4],
      quests: [4,5,8],
      bonusquests: [1,2,3]
    },

    { complexity: 26,
      tilesX: 7, tilesY: 9, tileValues: [
      9,3,5,99,5,3,2,
      8,9,99,99,99,1,1,
      1,99,3,4,99,2,3,
      9,99,99,4,99,99,5,
      8,8,99,1,8,99,99,
      1,1,8,99,1,9,99,
      9,9,1,8,99,2,3,
      8,8,9,1,9,1,1,
      1,1,99,1,99,99,99
    ] },

    { complexity: 30,
      tilesX: 7, tilesY: 9, tileValues: [
      2,0,1,0,1,0,2,
      99,0,99,0,99,0,99,
      0,0,0,0,0,0,0,
      0,0,4,0,3,0,0,
      99,0,99,0,99,0,99,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      99,0,99,0,99,0,99,
      8,5,99,2,99,3,9

    ] },

    { complexity: 40,
      tilesX: 7, tilesY: 6, tileValues: [
      0,4,3,0,3,2,0,
      0,99,99,0,99,99,0,
      0,0,3,6,2,0,0,
      0,0,2,99,7,0,0,
      5,99,1,99,9,99,5,
      3,99,5,4,2,99,4
    ] },

    { complexity: 40,
      tilesX: 7, tilesY: 7, tileValues: [
      3,0,0,0,0,0,1,
      2,99,3,2,4,99,2,
      2,99,2,4,3,99,2,
      2,9,4,3,2,9,4,
      99,99,99,99,99,99,99,
      0,0,0,99,0,0,0,
      0,0,0,99,0,0,0
    ] },

    { complexity: 50,
      tilesX: 5, tilesY: 7, tileValues: [
      0,0,1,0,0,
      0,0,2,0,0,
      0,2,3,5,0,
      0,99,6,99,0,
      99,2,7,6,99,
      0,2,8,7,0,
      3,3,9,8,9
    ] },

    { complexity: 51,
      tilesX: 7, tilesY: 9, tileValues: [
      0,0,0,0,8,99,4,
      1,2,3,3,4,3,1,
      99,99,99,99,1,99,1,
      6,9,99,1,9,99,1,
      3,99,8,9,8,99,2,
      99,99,99,99,1,99,99,
      4,4,99,9,9,99,0,
      8,99,3,99,9,99,0,
      99,1,1,1,99,99,0
    ] },

    { complexity: 55,
      tilesX: 5, tilesY: 8, tileValues: [
      1,1,0,0,0,
      99,99,0,3,0,
      0,0,0,8,0,
      0,4,0,99,99,
      0,2,0,0,0,
      0,99,0,99,0,
      0,99,3,99,0,
      0,9,99,7,0
    ] },

    { complexity: 60,
      tilesX: 3, tilesY: 9, tileValues: [
      1,0,1,
      2,0,2,
      3,0,99,
      4,0,4,
      99,0,99,
      5,0,5,
      6,0,99,
      7,0,7,
      8,0,99
    ] },

    { complexity: 63,
      tilesX: 3, tilesY: 8, tileValues: [
      8,99,2,
      7,0,3,
      6,99,4,
      5,0,5,
      4,99,6,
      3,0,7,
      2,99,8,
      1,0,9
    ] },

    { complexity: 65,
      tilesX: 5, tilesY: 7, tileValues: [
      9,0,1,0,7,
      8,0,99,0,5,
      5,0,99,0,5,
      6,0,99,0,4,
      6,0,99,0,4,
      6,0,99,0,3,1,0,99,0,3
    ] },

    { complexity: 65,
      tilesX: 7, tilesY: 9, tileValues: [
      0,0,0,8,0,0,0,
      0,0,0,1,0,0,0,
      2,99,99,99,99,99,3,
      4,99,0,0,0,99,5,
      4,99,0,0,0,99,1,
      6,99,0,0,0,99,2,
      1,99,0,0,0,99,8,
      5,99,0,0,0,99,3,
      3,99,0,0,0,99,2
    ] },

    { complexity: 69,
      tilesX: 7, tilesY: 9, tileValues: [
      1,4,3,99,5,0,4,
      99,1,99,8,2,2,5,
      4,3,1,8,1,99,9,
      99,3,8,1,99,5,5,
      1,99,99,99,99,4,99,
      2,99,99,4,99,4,3,
      3,99,8,4,99,3,7,
      3,99,3,4,99,7,7,
      9,99,4,3,99,9,99

    ] },

    { complexity: 75,
      tilesX: 7, tilesY: 9, tileValues: [
      5,0,0,1,2,3,3,
      99,1,0,99,99,99,99,
      6,99,0,0,0,0,0,
      9,1,99,2,99,1,0,
      99,1,1,99,1,1,0,
      0,99,1,1,1,99,0,
      1,0,99,99,99,0,0,
      99,0,7,4,2,0,0,
      99,99,99,3,99,99,99
    ] },

    { complexity: 80,
      tilesX: 1, tilesY: 7, tileValues: [
      7,3,1,2,2,5,4
    ] },

    { complexity: 82,
      tilesX: 5, tilesY: 5, tileValues: [
      0,5,0,0,0,
      0,4,0,0,0,
      0,9,0,5,0,
      0,99,0,99,0,
      5,99,9,0,4
    ] },

    { complexity: 84,
      tilesX: 6, tilesY: 7, tileValues: [
      2,4,0,0,3,6,
      99,99,0,0,99,99,
      0,0,5,5,0,0,
      0,0,99,99,0,0,
      8,9,0,0,9,8,
      99,99,0,0,99,99,
      0,0,1,3,0,0
    ] },

    { complexity: 90,
      tilesX: 2, tilesY: 8, tileValues: [
      8,1,
      1,99,
      6,99,
      2,99,
      2,0,
      2,99,
      5,99,
      1,99
    ] },

    { complexity: 95,
      tilesX: 7, tilesY: 9, tileValues: [ // zias
      9,0,0,0,0,4,0,
      99,2,2,3,3,99,0,
      99,99,99,99,99,99,0,
      4,0,0,0,0,0,0,
      99,99,9,99,99,0,99,
      0,99,3,99,9,99,7,
      99,99,6,99,4,3,4,
      2,1,99,99,2,99,99,
      99,3,99,1,1,1,99
    ] },

    { complexity: 98,
      tilesX: 2, tilesY: 5, tileValues: [
      2,1,
      2,3,
      4,5,
      4,8,
      6,8
    ] },

    { complexity: 99,
      tilesX: 3, tilesY: 4, tileValues: [
      0,7,0,
      2,2,3,
      5,4,4,
      4,6,6
    ] },
    { complexity: 99,
      tilesX: 2, tilesY: 4, tileValues: [
      7,0,
      1,6,
      3,8,
      5,2
    ] },

    { complexity: 0,
      tilesX: 7, tilesY: 2, tileValues: [0,0,0,1,0,0,0,2,2,2,2,2,2,2] }




    //tilesX: 5, tilesY: 4, tileValues: [0,0,103,0,0,0,0,99,0,0,0,0,0,0,0,1,0,1,0,1], desc: 'flashing numbers vanish by clearing its total amount' },
    //tilesX: 6, tilesY: 8, tileValues: [0,0,115,112,0,0,0,0,99,99,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,5,1,3,1,4,5,8,8,2,2,9,99,2,99,99,5,99] }
  ];
  var levels = {},
      _possibleTiles = [1,2,3,4,5,6,7,8,9],
      _possibleTilesAndBombs = [1,2,3,4,5,6,7,8,9,98],
      _possibleTilesAndBombsAndRocks = [1,2,3,4,5,6,7,8,9,98,97],
      _possibleTilesWithMoreLowNumbers = [1,1,1,2,2,2,3,3,4,4,5,6,7,8,9],
      _possibleTilesAndBombsWithMoreLowNumbers = [1,1,1,2,2,2,3,3,4,4,5,6,7,8,9, 98,98],
      _possibleTilesAndBombsAndRocksWithMoreLowNumbers = [1,1,1,2,2,2,3,3,4,4,5,6,7,8,9,98,98,97,97];

  for (var i=0; i<classicLevels.length; i++)
    levels[(i + 1) + ''] = classicLevels[i];

  // convert values to a level object
  function toLevelObj(tilesX, tilesY, tileValues) {
    var levelObj = {
      'tilesX' : tilesX * 1,
      'tilesY' : tilesY * 1,
      'tileValues' : tileValues
    };
    for (var i=0; i<levelObj.tileValues.length; i++)
      levelObj.tileValues[i] = levelObj.tileValues[i] * 1;

    return levelObj;
  }

  // get the level object for the given level nr,
  // attempt to load it from localstorage
  this.load = function(level, destX, destY) {
    var id = 'level' + level;
    var levelObj = levels[level];
    // see if we need to convert the level
    if (destX && destY && levelObj)
      levelObj = this.convert(levelObj.tilesX, levelObj.tilesY, levelObj.tileValues, destX, destY);
    return levelObj;
  }

  this.createEmptyTileValues = function(tilesX, tilesY) {
    var tileValues = [];
    for (var i = 0; i < tilesX * tilesY; i++)
      tileValues.push(0);
    return tileValues;
  };

  // loads a level for editing, meaning it is surrounded with 0-tiles to fill the destX/destY canvas
  // (destX and destY are optional, otherwise defaults from Settings are used)
  this.loadForEditing = function(level, destX, destY) {
    // use default settings if none passed
    if (!destX) destX = GameOptions.editorTilesX;
    if (!destY) destY = GameOptions.editorTilesY;
    return this.load(level, destX, destY);
  }

  this.save = function(level, tilesX, tilesY, tileValues) {
    var croppedLevelObj = toLevelObj(tilesX, tilesY, tileValues)
    croppedLevelObj = that.crop(tilesX, tilesY, tileValues);
    var levelStr = croppedLevelObj.tilesX + '|' + croppedLevelObj.tilesY + '|' + croppedLevelObj.tileValues;
    localStorage.setItem('level' + level, levelStr);
  }

  // converts a level to the size of a larger one, for editing purposes mainly
  this.convert = function(tilesX, tilesY, tileValues, destX, destY) {
    // use default settings if none passed
    if (!destX) destX = GameOptions.editorTilesX;
    if (!destY) destY = GameOptions.editorTilesY;

    // if the editor grid is smaller than the original, return original
    if (tilesX > destX || tilesY > destY)
      return toLevelObj(tilesX, tilesY, tileValues);

    // center the original level in the new grid
    var tileSpaceLeft = Math.floor((destX - tilesX) / 2),
        tileSpaceTop = destY - tilesY,
        destTileValues = [];
    // prepare the tile values
    for (var i=0; i<destX * destY; i++)
      destTileValues[i] = 0;
    for (var y=0; y<tilesY; y++) {
      for (var x=0; x<tilesX; x++) {
        var index = y * tilesX + x,
            destIndex = (y + tileSpaceTop) * destX + x + tileSpaceLeft;

        value = tileValues? tileValues[index] : this.generateTileNumber();
        destTileValues[destIndex] = value;
      }
    }
    return toLevelObj(destX, destY, destTileValues);
  }

  // crops a level to the minimum tileset
  // when passed only one parameter it is the level
  // otherwise it is considered as tilesX, tilesY and the values array
  this.crop = function(tilesXOrLevel, tilesY, tileValues) {
    var tilesX = tilesXOrLevel;
    // when one (level) param is passed, load it and set vars correctly
    if (arguments.length == 1) {
      var level = tilesXOrLevel;
      var levelData = that.load(level);
      tilesX = levelData.tilesX;
      tilesY = levelData.tilesY;
      tileValues = levelData.tileValues;
    }
    // these will define the bounding box of the actual level
    var top, right, bottom, left;

    // declare some helper fuctions for clarity

    function getValue(x, y) {
      return tileValues[y * tilesX + x];
    }

    function areAllEmptyY(x, log) {
      for (var y = 0; y < tilesY; y++) {
        if (getValue(x, y) != 0)
          return false;
      }
      return true;
    }

    function areAllEmptyX(y) {
      for (var x = 0; x < tilesX; x++)
        if (getValue(x, y) != 0)
          return false;
      return true;
    }

    // get the bounding box
    for (left = 0; left < tilesX; left++) if (!areAllEmptyY(left)) break;
    for (right = tilesX - 1; right >= 0; right--) if (!areAllEmptyY(right)) break;
    for (top = 0; top < tilesY; top++) if (!areAllEmptyX(top)) break;
    for (bottom = tilesY - 1; bottom >= 0; bottom--) if (!areAllEmptyX(bottom)) break;

    var newTilesX = right - left + 1,
        newTilesY = bottom - top + 1,
        newTileValues = [];
    for (var y=0; y<newTilesY;y++) {
      for (var x = 0; x < newTilesX; x++) {
        var oriY = top + y,
            oriX = left + x,
            index = y * newTilesX + x;
        newTileValues[index] = getValue(oriX, oriY);
      }
    }
    var levelObj = toLevelObj(newTilesX, newTilesY, newTileValues);
    return levelObj;
  }

  // for filling up levels
  this.generateTileNumber = function(allowBombs, useLowNumbersMore, allowRocks) {
    var pool;
    if (useLowNumbersMore) {
      if (allowBombs && allowRocks) 
        pool = _possibleTilesAndBombsAndRocksWithMoreLowNumbers
      else if (allowBombs)
        pool = _possibleTilesAndBombsWithMoreLowNumbers
      else
        pool = _possibleTilesWithMoreLowNumbers
    }
    else {
      if (allowBombs && allowRocks) 
        pool = _possibleTilesAndBombsAndRocks;
      else if (allowBombs)
        pool = _possibleTilesAndBombs;
      else
        pool = _possibleTiles;
    }

    return Utils.pick(pool);
  };

  // generates a random level with a minimum amount of blocks dependant on brickChance (between 0 and 1)
  this.generatetowers = function(x, y, brickChance) {
    var len = x * y,
        brickChance = brickChance || 0,
        bricks = Math.ceil(len * brickChance),
        indices = Utils.fillArray(0, len - 1),
        tileValues = Utils.fillArray(0, 0, len - 1);

    // put the minimum required bricks somewhere in the tileValues
    for (var i=0; i<bricks; i++) {
      var index = Utils.draw(indices);
      tileValues[index] = 98;
    }

    // fill remaining spots with randomly picked numbers or walls
    for (var i=0; i<len; i++) {
      if (!tileValues[i])
        tileValues[i] = that.generateTileNumber(brickChance? true : false, true);
    }

    return tileValues;
  }

  function hasQuests(nr) {
    var level = levels[nr];
    return (level && level.quests && level.quests.length)? true : false;
  }

  // nr is optional, if none specified it will return all quests
  function getQuestCount(nr) {
    if (nr == undefined) {
      var count = 0;
      for (var nr in levels)
        count += getQuestCount(nr * 1);
      return count;
    }
    var level = levels[nr];
    if (level && level.quests)
      return level.quests.length;
    return 0;
  }

  this.levels = levels;
  this.hasQuests = hasQuests;
  this.getQuestCount = getQuestCount;

})();