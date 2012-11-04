var fs = require('fs');

var gm = require('./Gentrimap.node.js');
var gmdb = new gm.DB();
var merge = gm.merge;

var data = readCSV('../../Daten/Daten normalisiert/Proto_CSV_Dateien/alter_1992_2011.csv', ';', ['ZEIT', 'Anzahl', 'Anteil', 'Fert']);

var options = {
	geoIdFunction: function (obj) { switch (obj.RAUMID.length) {
		case 8:
			return obj.RAUMID;
		case 7:
			return '0'+obj.RAUMID;
		default:
			console.error('Unknown length: '+obj.RAUMID.length+' ('+obj.RAUMID+')');
		 	return undefined
	} },
	geoName: 'Planungsraum'
};


for (var year = 1992; year <= 2011; year++) {
	/*
	gmdb.addData(data, merge(options, { filterFunction: function (obj) { return (obj.ZEIT==year) },	year:year,
		tableName:'Anzahl der Neugeborenen', valueFunction: function (obj) { return obj['Anzahl Neugeboren'] }, minValue:0
	}));
	
	gmdb.addData(data, merge(options, { filterFunction: function (obj) { return (obj.ZEIT==year) },	year:year,
		tableName:'Anzahl der 25-45 Jährigen', valueFunction: function (obj) { return obj['Anzahl der 25-45'] }, minValue:0
	}));
	
	gmdb.addData(data, merge(options, { filterFunction: function (obj) { return (obj.ZEIT==year) },	year:year,
		tableName:'Anzahl der 25-35 Jährigen', valueFunction: function (obj) { return obj['Anzahl der 25-35'] }, minValue:0
	}));
	
	gmdb.addData(data, merge(options, { filterFunction: function (obj) { return (obj.ZEIT==year) },	year:year,
		tableName:'Anzahl Einwohner insgesamt', valueFunction: function (obj) { return obj['Anzahl insgesamt'] }, minValue:0
	}));
	*/
	gmdb.addData(data, merge(options, { filterFunction: function (obj) { return (obj.ZEIT==year) },	year:year,
		tableName:'Anteil der Neugeborenen', valueFunction: function (obj) { return obj['Anteil Neugeboren'] }, minValue:0, maxValue:3
	}));
	
	gmdb.addData(data, merge(options, { filterFunction: function (obj) { return (obj.ZEIT==year) },	year:year,
		tableName:'Fertilitätsrate', valueFunction: function (obj) { return obj['Fertilitaetsrate'] }, minValue:0, maxValue:4
	}));
	
	gmdb.addData(data, merge(options, { filterFunction: function (obj) { return (obj.ZEIT==year) },	year:year,
		tableName:'Anteil der 25-35 Jährigen', valueFunction: function (obj) { return obj['Anteil der 25-35'] }, minValue:0, maxValue:30
	}));
	
	gmdb.addData(data, merge(options, { filterFunction: function (obj) { return (obj.ZEIT==year) },	year:year,
		tableName:'Anteil der 25-45 Jährigen', valueFunction: function (obj) { return obj['Anteil der 25-45'] }, minValue:0, maxValue:60
	}));
	
	gmdb.addData(data, merge(options, { filterFunction: function (obj) { return (obj.ZEIT==year) },	year:year,
		tableName:'Anteil der 25-35 an 25-45 Jährigen', valueFunction: function (obj) { return obj['Anteil der 25-35 an 25-45'] }, minValue:25, maxValue:70
	}));
}

var data = readCSV('../../Daten/Daten normalisiert/Proto_CSV_Dateien/Sozialmonitoring PLR 2007-2009.csv', ';', ['A', 'L', 'N', 'M', 'J']);

var options = {
	geoIdFunction: function (obj) { switch (obj.Raum.length) {
		case 9:
			return '0'+obj.Raum.substr(0,7);
		case 8:
			return obj.Raum;
		case 7:
			return '0'+obj.Raum;
		default:
			console.error('Unknown length: '+obj.Raum.length+' ('+obj.Raum+')');
		 	return undefined
	} },
	geoName: 'Planungsraum'
};


for (var year = 2007; year <= 2009; year++) {
	gmdb.addData(data, merge(options, { filterFunction: function (obj) { return (obj.Jahr==year) },	year:year,
		tableName:'Arbeitslose in % der 15-65-Jährigen', valueFunction: function (obj) { return obj['Arbeitslose'] }, minValue:0, maxValue:21
	}));
	
	gmdb.addData(data, merge(options, { filterFunction: function (obj) { return (obj.Jahr==year) },	year:year,
		tableName:'Arbeitslose unter 25 Jahren in % der 15-25-Jährigen', valueFunction: function (obj) { return obj['Arbeitslose unter 25 Jahren'] }, minValue:0, maxValue:13
	}));
	
	gmdb.addData(data, merge(options, { filterFunction: function (obj) { return (obj.Jahr==year) },	year:year,
		tableName:'Langzeitarbeitslose', valueFunction: function (obj) { return obj['Langzeitarbeitslose'] }, minValue:0, maxValue:10
	}));
	
	gmdb.addData(data, merge(options, { filterFunction: function (obj) { return (obj.Jahr==year) },	year:year,
		tableName:'Nichtarbeitslose Empfänger_innen von Existenzsicherungsleistungen', valueFunction: function (obj) { return obj['Nichtarbeitslose Empfaenger'] }, minValue:0, maxValue:40
	}));
	
	gmdb.addData(data, merge(options, { filterFunction: function (obj) { return (obj.Jahr==year) },	year:year,
		tableName:'Nichterwerbsfähige Empfänger_innen von Existenzsicherungsleistungen unter 15 Jahren', valueFunction: function (obj) { return obj['Nichterwerbsfaehige Empfaenger'] }, minValue:0, maxValue:80
	}));
	
	gmdb.addData(data, merge(options, { filterFunction: function (obj) { return (obj.Jahr==year) },	year:year,
		tableName:'Kinder und Jugendliche unter 18 Jahren mit Migrationshintergrund', valueFunction: function (obj) { return obj['Migrationshintergrund'] }, minValue:0, maxValue:90
	}));
}


gmdb.addGeo(readGeoJSON('./geo/Planungsraum_25833.geojson').features, {
	geoName: 'Planungsraum',
	geoIdFunction: function (obj) { return obj.SCHLUESSEL },
	synonyms:[
		["12103015","12103115"],
		["12103016","12103116"],
		["12103017","12103117"],
		["12103018","12103218"],
		["12103019","12103219"],
		["12103020","12103220"],
		["12214121","12214421"],
		["12214122","12214422"],
		["12214123","12214423"],
		["12214124","12214424"],
		["12214127","12214527"],
		["12214128","12214528"],
		["12302007","12302107"],
		["12302008","12302108"],
		["12302009","12302109"],
		["12302010","12302110"],
		["12302011","12302211"],
		["12302012","12302212"]
	]
});

gmdb.match();

fs.writeFileSync('../html/data.js', 'var data ='+JSON.stringify(gmdb.exportJSON(), null, '\t'), 'utf8');



function readCSV(filename, fieldSeparator, valueFields) {
	fieldSeparator = fieldSeparator || ';';
	valueFields = valueFields || [];
	
	var lines = fs.readFileSync(filename, 'utf8');
	lines = lines.replace(/[\n\r]+/g, '\r');
	lines = lines.replace(new RegExp('\;+\r', 'g'), '\r');
	lines = lines.split('\r');
	
	var headFields = lines[0].split(fieldSeparator);
	
	var r = [];
	for (var j = 0; j < headFields.length; j++) {
		var useThis = false;
		for (var k = 0; k < valueFields.length; k++) {
			if (headFields[j].substr(0, valueFields[k].length) == valueFields[k]) useThis = true;
		}
		if (useThis) r.push(headFields[j]);
	};
	valueFields = r;
	
	var result = [];
	for (var i = 1; i < lines.length; i++) {
		var line = lines[i];
		if (line.length > 0) {
			var fields = line.split(fieldSeparator);
			if (fields.length != headFields.length) console.error('Äääh: "'+line+'"');
			var obj = {};
			for (var j = 0; j < fields.length; j++) obj[headFields[j]] = fields[j];
			for (var j = 0; j < valueFields.length; j++) {
				var s = obj[valueFields[j]];
				s = s.replace(',','.');
				obj[valueFields[j]] = parseFloat(s);
			}
			result.push(obj);
		}
	}
	return result;
}

function readGeoJSON(filename) {
	var json = fs.readFileSync(filename, 'utf8');
	return JSON.parse(json);
}