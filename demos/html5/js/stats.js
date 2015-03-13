// user object that stores the entire state of the user's progress
window.Stats = new (function(){
  var that = this,
  		_moves = 0,
  		_combinations = 0,
  		_bombsBlownUp = 0,
  		_tilesBlownUp = 0,
  		_bombsMade = 0,
  		_detonations = 0;

  function init() {
  }

  function newGame() {
  	_moves = 0;
  	_combinations = 0;
    _bombsBlownUp = 0;
  	_tilesBlownUp = 0;
  	_bombsMade = 0;
  	_detonations = 0;
  }

  this.init = init;
  this.newGame = newGame;
  this.__defineGetter__('moves', function() {return _moves});
  this.__defineSetter__('moves', function(value) {_moves = value});
  this.__defineGetter__('combinations', function() {return _combinations});
  this.__defineSetter__('combinations', function(value) {_combinations = value});
  this.__defineGetter__('tilesBlownUp', function() {return _tilesBlownUp});
  this.__defineSetter__('tilesBlownUp', function(value) {_tilesBlownUp = value});
  this.__defineGetter__('bombsMade', function() {return _bombsMade});
  this.__defineSetter__('bombsMade', function(value) {_bombsMade = value});
  this.__defineGetter__('detonations', function() {return _detonations});
  this.__defineSetter__('detonations', function(value) {_detonations = value});
  this.__defineGetter__('bombsBlownUp', function() {return _bombsBlownUp});
  this.__defineSetter__('bombsBlownUp', function(value) {_bombsBlownUp = value});

})();