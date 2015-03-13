// Web Events emulation
// ESC simulates a back button press
// SHIFT + ESC simulates a shake
$bw.web.events = new (function() {
	var that = this;

	if (!$bw.isApp)
		init();

	function init() {
		if (!document.addEventListener)
			console.warning('Please note that $bw.web.events emulation requires document.addEventListener');
		document.addEventListener('keyup', handleKeyPress, false);
	}

	function handleKeyPress(event) {
		
		// ESC simulates a back button press
		if (!event.shiftKey && event.keyCode == 27) {
			var handled = $bw.events.trigger('backButtonPressed');
			if (handled) {
				event.preventDefault();
				event.stopPropagation;
				return false;
			}
		}

		// SHIFT + ESC simulates a shake
		if (event.shiftKey && event.keyCode == 27) {
			$bw.events.trigger('shakeDevice');
		}
	}

	function openURL(actionObj) {
		var url = actionObj.url;
		if (url && url != '') {
			document.location.href = url;
		}
	}

	this.openURL = openURL;

})();