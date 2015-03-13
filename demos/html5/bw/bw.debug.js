$bw.debug = new (function() {
	var that = this;

	function log() {
		var args = [];
		for (var i=0; i<arguments.length; i++)
			args.push(arguments[i]);

		$bw.doAction('debug.log', {
			'arguments': args
		});
		return that;
	}

	this.log = log;
})();