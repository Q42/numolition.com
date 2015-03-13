$bw.effects = new (function() {
	var that = this,
			_effects = {};

	function registerSprite(effectObj) {
		_effects[effectObj.name] = effectObj;
		$bw.doAction('effects.registerSprite', effectObj);
	}

	function playSprite(name, x, y, delay) {
		var effect = _effects[name];
		if (!effect) {
			console.error('Special effect "' + name + '" not found. Was it registered?\n$bw.effects.play(', name, ',', x, ',', y, ',', delay, ')');
			return that;
		}

		$bw.doAction('effects.playSprite', {
			'name': name,
			'x': x,
			'y': y,
			'delay': delay? delay : 0
		});
		return that;
	}

	// @pixels = (optional) number of pixels to offset the screen in pos/neg horizontal/vertical position
	// @duration = (optional) time in seconds for the entire shake effect
	// @shakeCount = (optional) the number of actual shakes (offsetting the screen) to take place
	function shake(pixels, duration, shakeCount, useLinearPattern) {
		pixels = pixels || 5;
		duration = duration || .5;
		shakeCount = shakeCount || 20;

		$bw.doAction('effects.shake', {
			'pixels': pixels,
			'duration': duration,
			'shakeCount': shakeCount,
			'useLinearPattern': useLinearPattern? true : false
		});
		return that;
	}

	this.registerSprite = registerSprite;
	this.playSprite = playSprite;
	this.shake = shake;
})();