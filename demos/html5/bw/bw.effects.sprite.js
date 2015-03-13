$bw.effects.sprite = function(name, fileName, spriteWidth, spriteHeight, imageWidth, frameCount, interval) {	
	var that = this;
	
	this.name = name;
	this.fileName = fileName;
	this.width = spriteWidth;
	this.height = spriteHeight;
	this.imageWidth = imageWidth;
	this.interval = interval;
	this.frameCount = frameCount;

	$bw.effects.registerSprite(this);

	this.play = function(x, y, delay) {
		delay = delay || 0;
		$bw.effects.playSprite(name, x, y, delay);
		return that;	
	}
};
