$bw.web.debug = new (function() {
	var that = this;

	function log(paramsObj) {
		var args = paramsObj.arguments;

		// pretty lame way to show argument values directly instead of always as an array :(
		switch (args.length) {
			case 0: console.log(''); break;
			case 1: console.log(args[0]); break;
			case 2: console.log(args[0],args[1]); break;
			case 3: console.log(args[0],args[1],args[2]); break;
			case 4: console.log(args[0],args[1],args[2],args[3]); break;
			case 5: console.log(args[0],args[1],args[2],args[3],args[4]); break;
			case 6: console.log(args[0],args[1],args[2],args[3],args[4],args[5]); break;
			default: 
				console.log(args); // hmm ok
		}
		return that;
	}

	this.log = log;
})();