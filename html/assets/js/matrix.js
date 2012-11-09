var matrix = {
	conf: {},
	canvas: false,
	controls: false,
	data: {},
	elements: [],
	slider: false,
	olddata: {},
	changeyear: 0,
	init: function() {
		matrix.configure();
		
		/* initialize data */
		
		matrix.parse();
		matrix.ui();
		
	},
	configure: function() {
		matrix.conf.width = $('#canvas').width();
		matrix.conf.height = $('#canvas').height();
		matrix.conf.ratio = matrix.conf.height / matrix.conf.width;
		matrix.paper = Raphael('canvas', matrix.conf.width, matrix.conf.height);
		matrix.controls = $('#controls');
		matrix.padding = { top: 20, bottom: 40, left: 60, right: 30 };
	},
	reload: function() {
		matrix.configure();
		matrix.redraw();
	},
	redraw: function() {
	
		var compare = [];
		var year = 0;
	
		var drawdata = {
			data: {},
			tables: [],
			min: {},
			max: {},
			axid: {},
			year: matrix.changeyear
		};
	
		$("select.table", matrix.controls).each(function(idx,e){
			drawdata.tables.push($(e).val());
		});
		
		if (drawdata.tables[0] === drawdata.tables[1]) {
			
			return;
			
		}
		
		drawdata.axid[drawdata.tables[0]] = "y";
		drawdata.axid[drawdata.tables[1]] = "x";
		
		var recyclingMode = false;
		
		if (matrix.olddata.x === drawdata.tables[0] && matrix.olddata.y === drawdata.tables[1]) {
			if (matrix.olddata.z === drawdata.year) {
				return;
			} else {
				recyclingMode = true;
			}
		}
		
		matrix.olddata.x = drawdata.tables[0];
		matrix.olddata.y = drawdata.tables[1];
		matrix.olddata.z = drawdata.year;
		
		$(drawdata.tables).each(function(idx, e){
			var axisId = drawdata.axid[e];
			
			if (matrix.data.tables[e].years[drawdata.year] === undefined) {
				return;
			}
			
			drawdata.min[drawdata.axid[e]] = matrix.data.tables[e].minValue;
			drawdata.max[drawdata.axid[e]] = matrix.data.tables[e].maxValue;
			
			$(data.data[matrix.data.tables[e].years[drawdata.year]].data).each(function(idx,d){

				if (drawdata.data[d.geoIndex] === undefined) {
					drawdata.data[d.geoIndex] = {};
				}

				drawdata.data[d.geoIndex][axisId] = d.value;
			});
		});
		
	
		
		
		
		var xAxis = new Axis(
			matrix.padding.left,
			matrix.conf.width - matrix.padding.right,
			drawdata.min.x,
			drawdata.max.x
		);
		
		var yAxis = new Axis(
			matrix.conf.height - matrix.padding.bottom,
			matrix.padding.top,
			drawdata.min.y,
			drawdata.max.y
		);
		
		if (!recyclingMode) {
			/* clear paper */
			
			matrix.elements = {};
			matrix.paper.clear();
			
			/* axes drawing */
		
			// x-Axis
			
			Raphael.g.axis(
				xAxis.minPixel,
				yAxis.minPixel,
				xAxis.maxPixel-xAxis.minPixel,
				xAxis.minValue,
				xAxis.maxValue,
				xAxis.tickCount-1,
				0,
				[],
				"t",
				2,
				matrix.paper
			).attr('stroke','#999999');
			
			matrix.paper.text(matrix.conf.width/2, matrix.conf.height-10, matrix.data.tables[drawdata.tables[1]].tableName).attr({"font-size":12});
			
			// y-Axis
			
			Raphael.g.axis(
				xAxis.minPixel,
				yAxis.minPixel,
				yAxis.minPixel-yAxis.maxPixel,
				yAxis.minValue,
				yAxis.maxValue,
				yAxis.tickCount-1,
				1,
				[],
				"t",
				2,
				matrix.paper
			).attr('stroke','#999999');
	
			matrix.paper.text(15, matrix.conf.height/2, matrix.data.tables[drawdata.tables[0]].tableName)
				.attr({"font-size":12})
				.transform('r-90');
		
		}
		/* data drawing */
		
		for (var key in drawdata.data) {
			var item = drawdata.data[key];
			item.draw = (item.x !== 0 && item.y !== 0);
			
			if (item.draw) {
				item.drawx = xAxis.project(item.x);
				item.drawy = yAxis.project(item.y);
				
				if (recyclingMode && (matrix.elements[key] !== undefined)) {
					matrix.elements[key].attr({
						cx: item.drawx,
						cy: item.drawy
					}).show();
				} else {
					item.element = matrix.paper.circle(item.drawx,item.drawy,5);
					
					item.element.attr({
						fill: '#124',
						opacity: 0.3,
						title: key
					});
					
					matrix.elements[key] = item.element;
				}
			}
		}
		
		/* hide all unused elements */
		if (recyclingMode) {
			for (var key in matrix.elements) {
				if ((drawdata.data[key] === undefined) || (!drawdata.data[key].draw)) {
					//matrix.elements[key].attr('visibility', 'hidden');
					matrix.elements[key].hide();
				}
			}
		}
	},
	ui: function() {
	
		/* build controls ui */
		
		var ui_select = $('<select name="table[]" class="table" size="1"></select>');
		$(matrix.data.table_names).each(function(idx,e){
			ui_select.append('<option value="'+idx+'">'+e+'</option>');
		});
		
		ui_select_2 = ui_select.clone()

		$(ui_select).attr("id","table_1");
		$(ui_select_2).attr("id","table_2");

		var change = function() {

			matrix.uiupdate();
			matrix.controls.submit();

		}

		$(ui_select).change(function(){
			change();
		});
		
		$(ui_select_2).change(function(){
			change();
		});

		matrix.controls.append(ui_select);
		matrix.controls.append(ui_select_2);
		
		/* fixme: year slider */
		
		matrix.controls.append($('<div id="slider-area"><div id="slider-element"></div><div id="slider-selection"></div></div>'));

		matrix.slider = $('#slider-element').slider({
			min: 1992,
			max: 2011,
			slide: function( event, ui ) {
				$("#slider-selection").html(ui.value);
				if (ui.value !== matrix.slider.slider("value")) {
					matrix.changeyear = ui.value;
					matrix.controls.submit();
				}
			},
			change: function( event, ui ) {
				$("#slider-selection").html(ui.value);
				if (ui.value !== matrix.slider.slider("value")) {
					matrix.changeyear = ui.value;
					matrix.controls.submit();
				}
			}
		});

		matrix.uiupdate();
		
		// matrix.controls.append($('<input type="submit" value="Vergleichen" />'));
		
		matrix.controls.submit(function(x){
			matrix.redraw();
		});
		
		matrix.redraw();
		
	},
	uiupdate: function() {
	
		$('#table_1 option:disabled').removeAttr('disabled');
		$('#table_2 option:disabled').removeAttr('disabled');
	
		$('#table_2 option[value=\''+$('#table_1').val()+'\']').attr('disabled','disabled');
		
		if ($('#table_2 option[value=\''+$('#table_2').val()+'\']').attr('disabled')) {

			$('#table_2').val($('#table_2 option:enabled').eq(0).attr('value'));

		}

		setTimeout(function(){

			$('#table_1 option[value=\''+$('#table_2').val()+'\']').attr('disabled','disabled');

			if ($('#table_1 option[value=\''+$('#table_1').val()+'\']').attr('disabled')) {

				$('#table_1').val($('#table_1 option:enabled').eq(0).attr('value'));

			}
			
		},200);
		
		var years = [];
		
		for (var year in matrix.data.tables[$('#table_1').val()].years) {

			if (matrix.data.tables[$('#table_2').val()].years[year] !== undefined) {

				years.push(year);
				
			}
			
		}
		
		years.sort();
		
		var selected = matrix.slider.slider("value");
		
		if (years.indexOf(parseInt(selected)) === -1) {
			
			selected = years[0];
			
		}

		matrix.slider.slider("option", {
			min: parseInt(years[0]),
			max: parseInt(years.pop())
		});
		
		$("#slider-selection").html(matrix.slider.slider("value"));
		
		matrix.changeyear = matrix.slider.slider("value");
				
	},
	parse: function() {
		
		/* geodaten */

		matrix.data.regions = [];
		var geo = data.geo[0].data;
		for (var i = 0; i < geo.length; i++) {
			matrix.data.regions.push(geo[i].geometry.coordinates);
		}

		/* datensätze */
		
		matrix.data.tables = [];
		
		var tableName2Index = {};
		
		matrix.data.table_index = -1;
		matrix.data.table_names = [];
		
		for (var i = 0; i < data.data.length; i++) {
			var name = data.data[i].options.tableName;
			var year = data.data[i].options.year;
			if (tableName2Index[name] === undefined) {
				matrix.data.table_index++;
				matrix.data.tables[matrix.data.table_index] = {
					tableName: name,
					years: [],
					minYear:  1e10,
					maxYear: -1e10,
					minValue: 0,
					maxValue: 0
				}
				tableName2Index[name] = matrix.data.table_index;
				matrix.data.table_names[matrix.data.table_index] = name;
			}
			
			var tl = matrix.data.tables[tableName2Index[name]];
			tl.years[year] = i;
			
			if (tl.minYear > year) tl.minYear = year;
			if (tl.maxYear < year) tl.maxYear = year;
			
			var values = data.data[i].data;
			for (var j = 0; j < values.length; j++) {
				value = values[j].value;
				if (tl.minValue > value) tl.minValue = value;
				if (tl.maxValue < value) tl.maxValue = value;
			}
		}
		
		/*

		for (var i = 0; i < matrix.data.tables.length; i++) {
			var t = matrix.data.tables[i];

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
		
		*/
	}
}

var Axis = function (pixelMin, pixelMax, valueMin, valueMax) {
	var pixelWidth = Math.abs(pixelMax - pixelMin);
	var valueWidth = Math.abs(valueMax - valueMin);
	
	var minTickSpace = 80;
	var step = valueWidth/pixelWidth*minTickSpace;
	var e = Math.pow(10, Math.floor(Math.log(step)/Math.LN10));
	var v = step/e; // (1.0 ... 9.999)
	
	var majorTick, minorTick;
		
	if (v < 2) {
		majorTick =  2*e;
		minorTick =  1*e;
	} else if (v < 5) {
		majorTick =  5*e;
		minorTick =  1*e;
	} else {
		majorTick = 10*e;
		minorTick =  2*e;
	}
	
	var maxTickValue = Math.ceil( valueMax/majorTick - 1e-8)*majorTick;
	var minTickValue = Math.floor(valueMin/majorTick + 1e-8)*majorTick;
	
	var paramA = (pixelMax - pixelMin)/(maxTickValue - minTickValue);
	var paramB = (-minTickValue)*paramA + pixelMin;
		
	function project(value) {
		return value*paramA + paramB;
	}
	
	
	var me = this;
	me.majorTick = majorTick;
	me.minorTick = minorTick;
	me.maxValue = maxTickValue;
	me.minValue = minTickValue;
	me.maxPixel = project(maxTickValue);
	me.minPixel = project(minTickValue);
	me.tickCount = Math.round(Math.abs(maxTickValue-minTickValue)/majorTick)+1;
	me.project = project;
	
	return me;
}

$(document).ready(function(){
	matrix.init();
});

$(window).resize(function(){
	matrix.reload();
});