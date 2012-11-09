/*
ToDo:
	Deterministisch oder automatische Backups
*/


var width = 700;
var height = 600;
var aspectRatio = 0.62;

var xMin = 13.05;
var xMax = 13.80;
var yMin = 52.3;
var yMax = 52.7;

var sliderMousePressed = false;

var zoom = Math.min(width/(xMax-xMin)/aspectRatio, height/(yMax-yMin));

var
	canvas,
	context,
	regions,
	selectedTable,
	selectedYear = -1,
	minYear =  1e10,
	maxYear = -1e10,
	tableList = [],
	slider;
	
var frame = 0;

$(function () {
	canvas = $('#canvas');
	canvas.attr('width',  width );
	canvas.attr('height', height);
	canvas = canvas.get(0);
	context = canvas.getContext('2d');
	
	$('body').click(function () {
		abort = true;
	})
	
	init();
	start();
});

function init() {
	regions = [];
	var geo = data.geo[0].data;
	for (var i = 0; i < geo.length; i++) {
		regions.push(geo[i].geometry.coordinates);
	}
	
	// Initialisiere Datensätze
	tableList = [];
	var obj = {};
	var tableListIndex = -1;
	for (var i = 0; i < data.data.length; i++) {
		var name = data.data[i].options.tableName;
		var year = data.data[i].options.year;
		if (obj[name] === undefined) {
			tableListIndex++;
			tableList[tableListIndex] = {
				tableName: name,
				years: [],
				minYear:  1e10,
				maxYear: -1e10,
				minValue: 1e10,
				maxValue: -1e10
			}
			obj[name] = tableListIndex;
		}
		var tl = tableList[obj[name]];
		tl.years[year] = i;
		if (tl.minYear > year) tl.minYear = year;
		if (tl.maxYear < year) tl.maxYear = year;
		
		var d = data.data[i].data;
		for (var j = 0; j < d.length; j++) {
			var v = d[j].value;
			if (tl.minValue > v) tl.minValue = v;
			if (tl.maxValue < v) tl.maxValue = v;
		}
		
		if (data.data[i].options.minValue !== undefined) tl.minValue = data.data[i].options.minValue;
		if (data.data[i].options.maxValue !== undefined) tl.maxValue = data.data[i].options.maxValue; 
	}
	
	for (var i = 0; i < tableList.length; i++) {
		var t = tableList[i];
		
		if (minYear > t.minYear) minYear = t.minYear;
		if (maxYear < t.maxYear) maxYear = t.maxYear;
		
		t.node = $('<p class="button">'+t.tableName+'</p>');
		$('#datasets').append(t.node);
		t.node.click((function () {
			var id = i;
			return function () {
				selectTable(id);
			}
		})());
		
	}
	
	$(document).mouseup(function () { sliderMousePressed = false })
	
	slider = $('#slider-element').slider({
		min: minYear,
		max: maxYear,
		slide: function( event, ui ) {
			$("#slider-selection").html(ui.value);
			selectYear(ui.value);
		},
		change: function( event, ui ) {
			$("#slider-selection").html(ui.value);
		}
	});
		
}


function start() {
	selectTable(0);
	//selectYear(0);
}

function selectYear(year) {
	if (year == selectedYear) return;
	
	selectedYear = year;
	if (selectedYear < tableList[selectedTable].minYear) selectedYear = tableList[selectedTable].minYear;
	if (selectedYear > tableList[selectedTable].maxYear) selectedYear = tableList[selectedTable].maxYear;
	
	slider.slider('value', selectedYear);
	
	redraw();
}

function selectTable(id) {
	for (var i = 0; i < tableList.length; i++) tableList[i].node.removeClass('selected');
	tableList[id].node.addClass('selected');
	selectedTable = id;
	
	var year = selectedYear;
	if (year < tableList[selectedTable].minYear) year = tableList[selectedTable].minYear;
	if (year > tableList[selectedTable].maxYear) year = tableList[selectedTable].maxYear;
	selectYear(year);
	
	slider.slider("option", {
		min: tableList[selectedTable].minYear,
		max: tableList[selectedTable].maxYear,
		value: year
	});
	
	redraw();
}

function p2(x) {
	return x*x;
}
function redraw() {
	id = tableList[selectedTable].years[selectedYear];
	if (id === undefined) return;
	
	var minValue = tableList[selectedTable].minValue;
	var maxValue = tableList[selectedTable].maxValue;
	
	/*
	var colors = [
		[0.0, 0.0, 1.0],
		[0.9, 0.9, 0.9],
		[1.0, 0.0, 0.0]
	];*/
	
	
	var colors = [
		[0.26, 0.41, 0.70],
		[0.81, 0.82, 0.83],
		[0.92, 0.10, 0.23]
	];
	if (tableList[selectedTable].colors !== undefined) colors = tableList[selectedTable].colors;
	
	context.fillStyle = '#F7F7F7';
	context.fillRect(0, 0, width, height);
	
	var d = data.data[id].data;
	
	for (var i = 0; i < d.length; i++) {
		var obj = d[i];
		var region = regions[obj.geoIndex];
		
		var value = obj.value;
		
		value = (value-minValue)/(maxValue-minValue); 
		
		if (value > 1) value = 1;
		if (value < 0) value = 0;
		
		value = value*(colors.length-1);
		
		var colorIndex = Math.floor(value);
		if (colorIndex >= (colors.length-1)) colorIndex = (colors.length-2);
		
		value = value - colorIndex;
		if (value > 1) value = 1;
		if (value < 0) value = 0;
		
		var cr = (1-value)*colors[colorIndex][0] + value*colors[colorIndex+1][0];
		var cg = (1-value)*colors[colorIndex][1] + value*colors[colorIndex+1][1];
		var cb = (1-value)*colors[colorIndex][2] + value*colors[colorIndex+1][2];
		
		context.fillStyle = 'rgb('+ Math.round(255*cr)+','+ Math.round(255*cg)+','+ Math.round(255*cb)+')';
		
		cr = Math.round(cr*240);
		cg = Math.round(cg*240);
		cb = Math.round(cb*240);
		
		context.strokeStyle = 'rgb('+cr+','+cg+','+cb+')';
		
		for (var j = 0; j < region.length; j++) {
			context.beginPath();
			var r = region[j];
			for (var k = 0; k < r.length; k++) {
				var x = aspectRatio*zoom*(r[k][0] - (xMax+xMin)/2) + width/2;
				var y =            -zoom*(r[k][1] - (yMax+yMin)/2) + height/2;
				if (k == 0) {
					context.moveTo(x, y);
				} else {
					context.lineTo(x, y);
				}
			}
			context.closePath();
			context.fill();
			context.stroke();
		}
	}
}
