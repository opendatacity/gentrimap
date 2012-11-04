

var DB = function () {
	var me = this;
	var dataList = [];
	var geoList = [];
	
	me.addData = function (data, options) {
		extend(options, {
			filterFunction: function () { return true },
			geoName: '?'
		});
		
		var result = [];
		data.forEach(function (obj) {
			if (options.filterFunction(obj)) {
				var value = options.valueFunction(obj);
				var geoId = options.geoIdFunction(obj);
				if ((value || (value === 0)) && (geoId !== undefined)) {
					result.push({
						value: value,
						geoId: geoId
					});
				}
			}
		});
		
		if (result.length > 0) {
			dataList.push({
				data:result,
				options:options
			});
		} else {
			console.log(options.tableName + ' (' + options.year + ') wurde nicht hinzugefügt, weil leer');
		}
	}
	
	me.addGeo = function (data, options) {
		extend(options, {
			synonyms:[]
		});
		
		var index = {};
		for (var i = 0; i < data.length; i++) index['_'+options.geoIdFunction(data[i].properties)] = i;
		
		for (var i = 0; i < options.synonyms.length; i++) {
			var synonymList = options.synonyms[i];
			var synonymId = index['_'+synonymList[0]];
			if (synonymId === undefined) console.error('Unbekannt: "' + synonymList[0] + '"');
			for (var j = 1; j < synonymList.length; j++) {
				index['_'+synonymList[j]] = synonymId;
			}
		}
		
		geoList.push({data:data, options:options, index:index});
	}
	
	me.match = function () {
		for (var i = 0; i < dataList.length; i++) {
			var data = dataList[i].data;
			var geo = getGeoByName(dataList[i].options.geoName);
			var index = geo.index;
			for (var j = 0; j < data.length; j++) {
				var geoIndex = index['_'+data[j].geoId];
				if (geoIndex === undefined) console.log('Was ist "'+data[j].geoId+'"?');
				data[j].geoIndex = geoIndex;
			}
		}
	}
	
	me.exportJSON = function () {
		return {
			data:dataList,
			geo:geoList
		}
	}
	
	function getGeoByName(geoName) {
		for (var i = 0; i < geoList.length; i++) {
			if (geoList[i].options.geoName == geoName) return geoList[i];
		}
		return undefined;
	}
	
	return me;
}

exports.DB = DB;
exports.extend = extend;
exports.merge = merge;

function extend(obj1, obj2) {
	Object.keys(obj2).forEach(function(key) {
		if (obj1[key] === undefined) obj1[key] = obj2[key];
	});
}

function merge(obj1, obj2) {
	var r = {};
	Object.keys(obj2).forEach(function(key) { r[key] = obj2[key] });
	Object.keys(obj1).forEach(function(key) { r[key] = obj1[key] });
	return r;
}