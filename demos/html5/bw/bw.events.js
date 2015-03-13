// BubbleWrapp events object for listening to events triggers by the device
// use $bw.events.on('backButtonPressed', myHandler) and return true if the device should NOT use its default back-action
// use $bw.events.on('shakeDevice', myHandler) to listen to a shake
$bw.events = new (function() {
	var that = this,
			_eventNames = {
				'backButtonPressed': 'backButtonPressed',
				'shakeDevice': 'shakeDevice'
			},
			_handlers = {};

	function on(eventName, handler) {
		_handlers[eventName] = handler;
		return that;
	}

	function trigger(eventName, data) {
		var handler = _handlers[eventName],
				handled = false;
		if (handler)
			handled = handler(data);
		return handled;
	}

	function openURL(url) {
		$bw.doAction('events.openURL', { 'url': url });
		return that;
	}

	this.on = on;
	this.trigger = trigger;
	this.openURL = openURL;
	this.__defineGetter__('eventNames', function() { return _eventNames; });
})();