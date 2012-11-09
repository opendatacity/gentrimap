var matrix = {
	conf: {},
	canvas: false,
	controls: false,
	data: {},
	elements: [],
	init: function() {

		matrix.configure();
		
		/* iniitialize data */
		
		matrix.parse();
		matrix.ui();
		
		
	},
	configure: function() {
		matrix.conf.width = $('#canvas').width();
		matrix.conf.height = $('#canvas').height();
		matrix.conf.ratio = matrix.conf.height / matrix.conf.width;
		matrix.canvas = Raphael('canvas', matrix.conf.width, matrix.conf.height);
		matrix.controls = $('#controls');
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

		while (matrix.elements.length > 0) {
			
			matrix.elements.shift().remove();
			
		}
				
		/* axes drawing */
		
		var axwidth = (matrix.conf.width - 80);
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
								
				item.drawx = (40+(axwidth*((item.x-drawdata.min.x)/xrange)));
				item.drawy = (matrix.conf.height-(40+(axheight*((item.y-drawdata.min.y)/yrange))));
				
				item.element = matrix.canvas.circle(item.drawx,item.drawy,5);
				
				item.element.attr('fill','#cccccc');
				item.element.attr('stroke','#999999');
				item.element.attr('title','x: '+item.x+', y: '+item.y);
				
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
					minValue: 1e10,
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

$(document).ready(function(){
	matrix.init();
});

$(window).resize(function(){
	matrix.reload();
});