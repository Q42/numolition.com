$bw.audio = new (function() {
	var that = this,
			_fragments = {};

	function register(soundObj) {
		_fragments[soundObj.name] = soundObj;
		$bw.doAction('audio.register', soundObj);
	}

	// plays the sound effect that was registered
	// @name = sound effect to play
	// @volume = (optional) volume between 0 and 1, default is volume specified in the registered sound effect
	function play(name, volume) {
		var fragment = _fragments[name];
		if (!fragment) {
			console.error('Sound effect "' + name + '" not found. Was it registered?\n$bw.sound.play(', name, ',', volume, ')');
			return that;
		}
		var actionObj = { 'name': name };
		if (volume)
			actionObj.volume = Math.min(1, Math.max(0, volume || fragment.volume));

		$bw.doAction('audio.play', actionObj);
		return that;
	}

	// stops the sound, doesn't allow resuming
	// @name = (optional) name of the sound.effect to stop. Pass no name to stop all effects
	function stop(name) {
		var actionObj = {};
		if (name)
			actionObj.name = name;
		$bw.doAction('audio.stop', actionObj);
		return that;		
	}

	// // pauses the sound, so it's possible to resume it later on
	// // @name = (optional) name of the sound.effect to pause. Pass no name to pause all effects
	// function pause(name) {
	// 	var actionObj = {};
	// 	if (name)
	// 		actionObj.name = name;
	// 	$bw.doAction('audio.pause', actionObj);
	// 	return that;				
	// }

	// // resumes the sound, only if it has been paused before
	// function resume(name) {
	// 	var actionObj = {};
	// 	if (name)
	// 		actionObj.name = name;
	// 	$bw.doAction('audio.resume', actionObj);
	// 	return that;						
	// }

	this.play = play;
	this.stop = stop;
	// this.pause = pause;
	// this.resume = resume;
	this.register = register;

})();