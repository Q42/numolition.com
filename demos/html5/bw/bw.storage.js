// storage allows for sending data to be persisted and retrieved
// keeps data locally which is used as main retrieval (fire an initial .init() to get the local data filled)
$bw.storage = new (function() {
	var that = this,
			_data = {};

	importData(BubbleWrappInfo.storage);

	// imports all the given data
	function importData(data) {
		for (var o in data)
			_data[o] = data[o];
	}

	// persists the value by this name
	function set(name, value) {
		_data[name] = value;
		$bw.doAction('storage.set', { 'name': name, 'value': value });
		return that;
	}

	// don't pass something to the wrapper, return data directly from local (always up to date) storage
	function get(name) {
		return _data[name]; // yes, this is what it should do, trust me
	}

	// clear the value stored by this name
	// @name (optional, leave out to clear all data)
	function clear(name) {
		if (!name) 
			_data = {};
		else
			delete _data[name];
		$bw.doAction('storage.clear', { 'name': name });
		return that;
	}

	// self destructing importer, only to be called by the web implementation
	this.__importData__ = function(data) { importData(data); delete this.__importData__; };

	this.set = set;
	this.get = get;
	this.clear = clear;
	this.__defineGetter__('data', function() { return _data;});
})();