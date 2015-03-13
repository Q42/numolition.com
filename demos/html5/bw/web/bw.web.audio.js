// Web Audio player for BubbleWrapp
$bw.web.audio = new (function() {
	var that = this,
			_effects = {};

	function register(soundObj) {
		// create an effect based on the soundObj info
		var effect = {
			name: soundObj.name,
			fileName: soundObj.fileName,
			volume: soundObj.volume,
			channelCount: soundObj.channels, 
			channels: [], 
			currentChannel: 0, 
			playing: false, 
			isMusic: soundObj.isMusic, 
			loop: soundObj.loop
		}
		_effects[soundObj.name] = effect;
  
		// for each audio channel, create a separate audio object
    for (var i=0; i<effect.channelCount; i++) {
      var audio = new Audio(effect.fileName);
      audio.preload = true;
      audio.load();
      if (effect.loop)
        audio.loop = true;
      effect.channels.push(audio);
    } 
	}

	// internal player object, different from public api that gets called from bw
	var player = {
	
		play: function(name, volume) {
			var effect = _effects[name];
			if (effect.isMusic)
				return player.playMusic(name, volume);

			// todo: something with volume...
	    effect.currentChannel = ++effect.currentChannel % effect.channelCount;
	    var audio = effect.channels[effect.currentChannel];
	    if (audio.duration > 0)
	    	audio.currentTime = 0;
	    if (!volume) 
	    	volume = effect.volume;
	    audio.volume = volume;
	   	audio.play();
			return that;
		},

		playMusic: function(name, volume) {
			var effect = _effects[name];
	    // first stop all other music playing
	    player.stopMusic();
	    effect.currentChannel = ++effect.currentChannel % effect.channelCount;
	    var audio = effect.channels[effect.currentChannel];
	    if (!volume) 
	    	volume = effect.volume;
	    if (audio.duration > 0)
	    	audio.currentTime = 0;
	    audio.volume = volume;
	    audio.play();
		},

		// paused is passed from the pause method, indicating that .playing is left enabled...
		stop: function(name, paused) {
			var effect = _effects[name];
	    if (effect.isMusic)
	      effect.playing = paused? true : false;
	    for (var i=0; i<effect.channelCount; i++) {
	      var audio = effect.channels[i];
	      if (audio) 
	        audio.pause();
	    }       
			return that;		
		},

	  stopMusic: function() {
	    for (var name in _effects) {
	      if (_effects[name].isMusic)
	        player.stop(name);
	    }
	    return that;
	  }

	}

	function play(soundObj) {
		player.play(soundObj.name, soundObj.volume);
		return that;
	}

	function stop(soundObj) {
		player.stop(soundObj.name);
		return that;
	}

	/*
	function pause(soundObj) {
		player.stop(soundObj.name, true);
		return that;
	}

	function resume(soundObj) {
		player.play(soundObj.name);
		return that;
	}
	*/

	this.play = play;
	this.stop = stop;
	//this.pause = pause;
	//this.resume = resume;
	this.register = register;
})();