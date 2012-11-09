var matrix = {
	conf: {},
	canvas: false,
	controls: false,
	data: {},
	elements: [],
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
		matrix.padding = { top: 20, bottom: 30, left: 60, right: 30 };
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
			year: $('#year').val()
		};
	
		$("select.table", matrix.controls).each(function(idx,e){
			drawdata.tables.push($(e).val());
		});
		
		if (drawdata.tables[0] === drawdata.tables[1]) {
			
			alert("FAIL");
			return;
			
		}
		
		drawdata.axid[drawdata.tables[0]] = "y";
		drawdata.axid[drawdata.tables[1]] = "x";
		
		$(drawdata.tables).each(function(idx,e){
			
			if (matrix.data.tables[e].years[drawdata.year] === undefined) {
				
				alert("FAIL!");
				return;
				
			}
			
			drawdata.min[drawdata.axid[e]] = matrix.data.tables[e].minValue;
			drawdata.max[drawdata.axid[e]] = matrix.data.tables[e].maxValue;
			
			var x = e;
			
			$(data.data[matrix.data.tables[e].years[drawdata.year]].data).each(function(idx,d){

				if (drawdata.data[d.geoIndex] === undefined) {
					
					drawdata.data[d.geoIndex] = {};
					
				}

				drawdata.data[d.geoIndex][drawdata.axid[e]] = d.value;
				
			});
			
		});
		
		// console.log(drawdata);
		
		/* clear paper */
	
		matrix.elements = [];
		matrix.paper.clear();
		
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
				
		/* axes drawing */
		
		/*var axwidth = (matrix.conf.width - 80);
		var axheight = (matrix.conf.height - 80);
		
		var yrange = (drawdata.max.y-drawdata.min.y);
		var xrange = (drawdata.max.x-drawdata.min.x);
		
		matrix.elements.push(Raphael.g.axis(40, (matrix.conf.height-40), axheight, drawdata.min.y, drawdata.max.y, yrange, 1, [], "t", 2, matrix.canvas).attr('stroke','#999999'));
		matrix.elements.push(Raphael.g.axis(40, (matrix.conf.height-40), axwidth, drawdata.min.x, drawdata.max.x, xrange, 0, [], "t", 2, matrix.canvas).attr('stroke','#999999'));
		
		/* data drawing */
		
		var item;
		
		for (var key in drawdata.data) {
		
			item = drawdata.data[key];
			
			if (item.x !== 0 && item.y !== 0) {
								
				item.drawx = xAxis.project(item.x);
				item.drawy = yAxis.project(item.y);
				
				item.element = matrix.paper.circle(item.drawx,item.drawy,5);
				
				item.element.attr({
					fill: '#124',
					opacity: 0.3,
					title: 'x: '+item.x+', y: '+item.y
				});
				
				matrix.elements.push(item.element);
				
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

		var change = function(el,evt) {

			matrix.uiupdate();
			matrix.controls.submit();

		}

		$(ui_select).change(function(event){
			change(this,event);
		});
		
		$(ui_select_2).change(function(event){
			change(this,event);
		});

		matrix.controls.append(ui_select);
		matrix.controls.append(ui_select_2);
		
		/* fixme: year slider */
		
		var year_select = $('<select name="year" id="year" size="1"><option value="1992">1992</option><option value="1993">1993</option><option value="1994">1994</option><option value="1995">1995</option><option value="1996">1996</option><option value="1997">1997</option><option value="1998">1998</option><option value="1999">1999</option><option value="2000">2000</option><option value="2001">2001</option><option value="2002">2002</option><option value="2003">2003</option><option value="2004">2004</option><option value="2005">2005</option><option value="2006">2006</option><option value="2007">2007</option><option value="2008">2008</option><option value="2009">2009</option><option value="2010">2010</option><option value="2011">2011</option></select>')

		$(year_select).change(function(){
			change();
		});
		
		matrix.uiupdate();

		matrix.controls.append(year_select);
		
		matrix.controls.append($('<input type="submit" value="Vergleichen" />'));
		
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
		
		var yearsel = $('<select name="year" size="1"></select>');
		
		for (var year in matrix.data.tables[$('#table_1').val()].years) {

			if (matrix.data.tables[$('#table_2').val()].years[year] !== undefined) {
				
				if ($('#year').val() === year) {
					
					$(yearsel).append($('<option value="'+year+'" selected="selected">'+year+'</option>'));
					
				} else {
					
					$(yearsel).append($('<option value="'+year+'">'+year+'</option>'));

				}
				
			}
			
		}
		
		$(yearsel).change(function(){
			change();
		});
		
		$('#year').replaceWith($(yearsel).attr('id','year'));
		
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
		var obj = {};
		matrix.data.table_index = -1;
		matrix.data.table_names = [];
		for (var i = 0; i < data.data.length; i++) {
			var name = data.data[i].options.tableName;
			var year = data.data[i].options.year;
			if (obj[name] === undefined) {
				matrix.data.table_index++;
				matrix.data.tables[matrix.data.table_index] = {
					tableName: name,
					years: [],
					minYear:  1e10,
					maxYear: -1e10,
					minValue: 0,
					maxValue: -1e10
				}
				obj[name] = matrix.data.table_index;
				matrix.data.table_names[matrix.data.table_index] = name;
			}
			var tl = matrix.data.tables[obj[name]];
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
	
	var paramA = (pixelMax - pixelMin)/(valueMax - valueMin);
	var paramB = (-valueMin)*paramA + pixelMin;
		
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