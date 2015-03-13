window.Sound = new (function(){
  var that = this,
      _soundEnabled = true,
      _musicEnabled = true,
      _currentMusic,
      _effects = {
        'track1': { channels: 1, isMusic: true, loop: true, volume: .6 },
        'track2': { channels: 1, isMusic: true, loop: true, volume: .6 },
        'explosion1': { channels: 5 },
        'explosion2': { channels: 5 },
        'explosion3': { channels: 5 },
        'explosion4': { channels: 5 },
        'pling1': { channels: 5 }, // combine
        'pling3': { channels: 2 }, // level completed
        'pling5': { channels: 2, volume: .4 }, // quest completed
        'pling6': { channels: 2 }, // all quests completed
        'fail1': { channels: 2 }, // tap on a locked item
        'fail2': { channels: 2, volume: .4 }, // level fail
        'swipe1': { channels: 3 }, // panel swipe
        'trigger2': { channels: 2 }, // move tile
        'valve1': { channels: 2 }, // unlock
        'valve2': { channels: 2 }
      };
      

  function init() {
    if (!Config.sound) return;
    _soundEnabled = User.state.soundEnabled;
    _musicEnabled = User.state.musicEnabled;
    for (var name in _effects) {
      var e = _effects[name],
          extension = '.mp3';
      if (!_effects[name].isMusic && $bw.isApp)
        extension = '.wav';
      var url = 'sound/' + name + extension,
          obj = new $bw.audio.fragment(name, url, e.volume, e.isMusic, e.loop, e.channels);
      _effects[name] = obj;
    }
  }

  function playExplosion() {
    var name = 'explosion' + Utils.between(1, 4);
    play(name);
  }

  function play(name, volume) {
    if (!Config.sound) return;

    var effect = _effects[name];
    if (effect.isMusic) {
      // if this music track is playing, don't interfere
      if (_currentMusic == name && effect.isPlaying)
        return that;

      _currentMusic = name;
    }

    if (!effect.isMusic && !_soundEnabled) return that;
    if (effect.isMusic && !_musicEnabled) return that;

    effect.play(volume);
    effect.isPlaying = true;
    return that;
  }

  function stop(name) {
    if (!Config.sound) return;

    var effect = _effects[name];
    if (effect.isMusic)
      _currentMusic = undefined;

    effect.stop(volume);
    effect.isPlaying = false;
    return that;
  }

  function enableSound() {
    if (!Config.sound) return;

    _soundEnabled = true;
    persist();
    return that;
  }

  function disableSound() {
    if (!Config.sound) return;

    for (var name in _effects) {
      var effect = _effects[name];
      if (!effect.isMusic) {
        effect.stop();  
      }
    }
    _soundEnabled = false;
    persist();
    return that;
  }

  function enableMusic() {
    if (!Config.sound) return;

    _musicEnabled = true;
    persist();
    if (_currentMusic)
      play(_currentMusic);
    return that;
  }

  function disableMusic() {
    if (!Config.sound) return;

    for (var name in _effects) {
      var effect = _effects[name];
      if (effect.isMusic) {
        effect.stop();   
        effect.isPlaying = false; 
      }
    }
    _musicEnabled = false;
    persist();
    return that;
  }

  function toggleSound() {
    _soundEnabled = !_soundEnabled;
    persist();
    return that;
  }

  function toggleMusic() {
    _musicEnabled = !_musicEnabled;
    persist();
    return that;
  }

  function persist() {
    User.state.soundEnabled = _soundEnabled;
    User.state.musicEnabled = _musicEnabled;
    User.persistState();
  }

  function pauseAll() {
    if (!Config.sound) return;

    for (var name in _effects) {
      _effects[name].stop();
      _effects[name].isPlaying = false;
    }
  }

  function resumeAll() {
    if (!Config.sound) return;

    if (_currentMusic)
      play(_currentMusic);
  }

  this.__defineGetter__('soundEnabled', function() { return _soundEnabled; });
  this.__defineSetter__('soundEnabled', function(value) { _soundEnabled = value; });
  this.__defineGetter__('musicEnabled', function() { return _musicEnabled; });
  this.__defineSetter__('musicEnabled', function(value) { _musicEnabled = value; });

  this.init = init;

  this.play = play;
  this.stop = stop;

  this.enableSound = enableSound;
  this.disableSound = disableSound;
  this.toggleSound = toggleSound;

  this.enableMusic = enableMusic;
  this.disableMusic = disableMusic;
  this.toggleMusic = toggleMusic;

  this.pauseAll = pauseAll;
  this.resumeAll = resumeAll;

  this.playExplosion = playExplosion;

  this.__defineGetter__('currentMusic', function() { return _currentMusic; })
})();