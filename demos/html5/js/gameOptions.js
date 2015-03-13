function GameOptions() {
  this.gravity                    = true;
  this.allowRepositionX           = true;
  this.allowRepositionY           = false;
  this.regenerateOnClear          = false;
  this.regenerateOnCombine        = false;
  this.regenerateBombs            = false;
  this.autoClear                  = false;
  this.editorTilesX               = 7;
  this.editorTilesY               = 9;
  this.clearOnMatchingTileCount   = 2;
  this.maxNumber                  = 9;
  this.splitAboveNineIntoWalls    = false,
  this.collectTens                = false,
  this.blowUpBombs                = false;
  this.moveBombs                  = false;
  this.blowUpOneBomb              = false;
}

window.GameOptionsClassic = new GameOptions();

window.GameOptionsTowers = new GameOptions();
GameOptionsTowers.regenerateOnClear = true;
GameOptionsTowers.regenerateOnCombine = true;
GameOptionsTowers.regenerateBombs = false;
GameOptionsTowers.regenerateRocks = true;
GameOptionsTowers.autoClear = false;
GameOptionsTowers.collectTens = true;
GameOptionsTowers.blowUpBombs = true;
GameOptionsTowers.moveBombs = false;
GameOptionsTowers.blowUpOneBomb = true;
GameOptionsTowers.bombsTakeOtherBricksDown = true;
GameOptionsTowers.bombsTakeDiagonalBricksDown = false;

window.GameOptionsTowerTutorial = new GameOptions();
GameOptionsTowerTutorial.regenerateOnClear = false;
GameOptionsTowerTutorial.regenerateOnCombine = false;
GameOptionsTowerTutorial.regenerateBombs = false;
GameOptionsTowerTutorial.autoClear = false;
GameOptionsTowerTutorial.collectTens = true;
GameOptionsTowerTutorial.blowUpBombs = true;
GameOptionsTowerTutorial.moveBombs = false;
GameOptionsTowerTutorial.blowUpOneBomb = true;
GameOptionsTowerTutorial.bombsTakeOtherBricksDown = true;
GameOptionsTowerTutorial.bombsTakeDiagonalBricksDown = false;

window.GameOptionsRandom = new GameOptions();
GameOptionsRandom.collectTens = true;
GameOptionsRandom.blowUpBombs = true;
GameOptionsRandom.regenerateOnClear = false;
GameOptionsRandom.regenerateOnCombine = false;
GameOptionsRandom.regenerateBombs = false;
GameOptionsRandom.moveBombs = false;
GameOptionsRandom.blowUpOneBomb = true;
GameOptionsRandom.bombsTakeOtherBricksDown = true;

window.GameOptions = GameOptionsClassic;