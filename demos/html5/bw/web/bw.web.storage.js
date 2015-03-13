// Web Storage library for BubbleWrapp
// Uses localStorage for persisting data
// (do not call these methods directly! Use $bw.storage API in your app)
$bw.web.storage = new (function() {
	var that = this,
			_data,
			_storageId = 'bw-storage-data'; // all data is stored within an object using this key

  if (!$bw.isApp)
    init();

	// loads data from localStorage and passes it into 
	function init() {
		var dataStr = localStorage.getItem(_storageId);
		if (!dataStr || dataStr == '')
			dataStr = '{}';

		_data = JSON.parse(dataStr);
		$bw.storage.__importData__(_data);
		return that;
	}

	// stores a value in the _data object and persists the data in localStorage
	function set(actionObj) {
		_data[actionObj.name] = actionObj.value;
		persist();
		return that;
	}

	function clear(actionObj) {
		if (actionObj.name)
			delete _data[actionObj.name];
		else {
			_data = {};
		}
		console.log(_data)
		persist();
		return that;
	}

	// stores the _data object as a string in localStorage
	function persist() {
		localStorage.setItem(_storageId, JSON.stringify(_data));
	}

	this.init = init;
	this.set = set;
	this.clear = clear;
})();