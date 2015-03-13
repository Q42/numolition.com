/*
	@name = name of the audio fragment
	@filenName = relative path and fileName
	@volume = (optional, default 1) between 0 and 1
	@isMusic = (optional, default false) boolean to indicate if this is a background music track or a (short) sound effect
	@loop = (optional, default false) if the music should loop (only for when @isMusic is enabled)
	@channels = (optional, default 1 for music, 4 for sfx) how many times this sound can be played in parallel (only for when @isMusic is disabled)
*/
$bw.audio.fragment = function(name, fileName, volume, isMusic, loop, channels) {	
	var that = this;
	
	this.name = name;
	this.fileName = fileName;
	this.volume = Math.min(1, Math.max(0, volume || 1));
	this.isMusic = isMusic? true : false;
	this.loop = this.isMusic? (loop? true: false) : false;
	this.channels = this.isMusic? 1 : (channels? channels : 4);

	$bw.audio.register(this);

	this.play = function(volume) {
		$bw.audio.play(name, volume);
		return that;
	}

	this.stop = function() {
		$bw.audio.stop(name);
		return that;
	}

	this.pause = function() {
		$bw.audio.pause(name);
		return that;
	}

	this.resume = function() {
		$bw.audio.resume(name);
		return that;
	}
};

