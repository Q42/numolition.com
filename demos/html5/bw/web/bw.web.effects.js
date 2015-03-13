// Web Effects library for BubbleWrapp
$bw.web.effects = new (function() {
	var that = this,
			_spriteInstances = 10,
			_spriteContainer,
			_effects = {};

  // helper method
  function between(min, max, decimals) {
    if (decimals)
      return ((Math.random() * (max - min)) + min).toFixed(decimals) * 1;
    return Math.floor((Math.random() * (max - min + 1)) + min);
  }

	// register a spriteSheet animation
	function registerSprite(actionObj) {
		var effect = {
			name: actionObj.name,
			fileName: actionObj.fileName,
			frameCount: actionObj.frameCount,
			interval: actionObj.interval,
			width: actionObj.width,
			height: actionObj.height,
			imageWidth: actionObj.imageWidth,
			elements: [],
			current: 0
		};
		for (var i=0; i<_spriteInstances; i++) {
			var element = document.createElement('div');
			element.className = 'bw-sprite bw-sprite-' + actionObj.name;
			effect.elements.push(element);
			
			// create a sprite container if we need it
			if (!_spriteContainer) {
				_spriteContainer = document.createElement('div');
				_spriteContainer.setAttribute('id', 'bw-sprites');
				$bw.web.createCSS(
					'#bw-sprites { position: absolute; left: 0; top: 0; z-index: 42; }\n' +
					'.bw-sprite { position: absolute; overflow: hidden; pointer-events: none; visibility: hidden; background-repeat: no-repeat; }');
				document.body.appendChild(_spriteContainer);
			}

			_spriteContainer.appendChild(element);
		}

		_effects[actionObj.name] = effect;
		createSpriteCSS(actionObj.name);
	}

	function createSpriteCSS(name) {
		var effect = _effects[name],
		    offsetX = 0,
		    offsetY = 0,
				cssStr = '';

		cssStr += '.bw-sprite-' + effect.name + '{' +
			'width:' + effect.width + 'px;' +
			'height:' + effect.height + 'px;' +
			'margin:' + -Math.round(effect.height / 2) + 'px 0 0 ' + -Math.round(effect.width / 2) + 'px;' +
			'background-image: url(' + effect.fileName + ')' + 
			'}\n';

		for (var i=0; i<effect.frameCount; i++) {
	    if (offsetX >= effect.imageWidth - effect.width) {
	      offsetX = 0;
	      offsetY += effect.height;
	    }
		  cssStr += '.bw-sprite-' + effect.name + '-frame-' + i + ' { background-position: ' + -offsetX + (offsetX?'px':'') + ' ' + -offsetY + (offsetY?'px':'') + ' }\n';
		  offsetX += effect.width;
		}
		$bw.web.createCSS(cssStr);
	}

	// play a spriteSheet animation
	function playSprite(actionObj) {
		var effect = _effects[actionObj.name],
				x = actionObj.x,
				y = actionObj.y,
				frame = 0,
				el,
				left = x,
				top = y,
				delay = actionObj.delay? actionObj.delay * 1000 : 0;

    effect.current = (effect.current + 1) % _spriteInstances;
    el = effect.elements[effect.current];

    function nextFrame() {
      el.className = 'bw-sprite bw-sprite-' + effect.name + ' bw-sprite-' + effect.name + '-frame-' + frame;

    	// show the sprite when the animation starts
    	if (frame == 0) {
		    el.style.visibility = 'visible';
		    el.style.top = top + 'px';
		    el.style.left = left + 'px';
    	}
      frame++;

      if (frame < effect.frameCount)
        setTimeout(nextFrame, effect.interval * 1000);
      else {
        el.style.visibility = 'hidden';
        el.className = 'bw-sprite bw-sprite-' + effect.name;
      }
    }

    setTimeout(nextFrame, delay);
	}

	// sjimmy shake the screen
	function shake(actionObj) {
    var pixels = actionObj.pixels || 5,
    		duration = actionObj.duration || .5,
    		shakeCount = actionObj.shakeCount || duration * 40,
    		useLinearPattern = actionObj.useLinearPattern? true : false,
    		el = document.documentElement;
        max = pixels,
        i = 0,
        delay = ((duration * 1000) / shakeCount).toFixed(2);

    nextShake();

    function nextShake() {
      if (i >= shakeCount) {
        el.style['-webkit-transform'] = 'none';
        return;
      }
      var perc = i / shakeCount,
          simpleCurveFactor = useLinearPattern? 1 : Math.cos(Math.PI * perc / 2), // hi,lo
          max = pixels * simpleCurveFactor,
          xOffset = between(-max, max),
          yOffset = between(-max, max);
      el.style['-webkit-transform'] = 'translate3d(' + xOffset + 'px, ' + yOffset + 'px, 0)';
      i++;
      setTimeout(nextShake, delay);
    }
	}

	this.registerSprite = registerSprite;
	this.playSprite = playSprite;
	this.shake = shake;

})();