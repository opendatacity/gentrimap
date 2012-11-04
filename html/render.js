var width = 1920;
var height = 1080;
var bubbleSize = 0.003;

var timeResolution = 1;
var repStrength = 1e-6/timeResolution;
var lineThickness = 10;
var gumStrength = repStrength*100;
var gravStrength = repStrength*2000;
var maxSpeed = 0.001/timeResolution;
var spotRadius = 0.025;
var fiberCount = 10;
var quality = 8;

var time = 0;
var maxTime = 100;
var zoom = height/1.5;
var detailed = true;


var server = 'http://127.0.0.1:8888';

var
	canvas,
	context,
	canvasTemp,
	contextTemp,
	nodes = [],
	edges = [],
	connections = [];

$(function () {
	canvas = $('#canvas');
	canvas.attr('width',  width );
	canvas.attr('height', height);
	canvas = canvas.get(0);
	context = canvas.getContext('2d');
	
	canvasTemp = $('#canvasTemp');
	canvasTemp.attr('width',  width/16*quality );
	canvasTemp.attr('height', width/16*quality );
	canvasTemp = canvasTemp.get(0);
	contextTemp = canvasTemp.getContext('2d');
	
	$('body').click(function () {
		abort = true;
	})
	
	init();
	start();
});

function step() {
	for (var i = 0; i < nodes.length; i++) {
		if (detailed) {
			var r = Math.sqrt(nodes[i].x*nodes[i].x + nodes[i].y*nodes[i].y);
			nodes[i].dx = -gravStrength*nodes[i].x*r;
			nodes[i].dy = -gravStrength*nodes[i].y*r;
		} else {
			nodes[i].dx = 0;
			nodes[i].dy = 0;
		}
	}
	
	
	for (var i = 0; i < 100; i++) addCalls();
	
	if (detailed) {
		calcRepulsion();
		calcEdgeForces();
	}
	
	for (var i = 0; i < nodes.length; i++) {
		var r = Math.sqrt(nodes[i].dx*nodes[i].dx + nodes[i].dy*nodes[i].dy);
		if (r > maxSpeed) {
			r = maxSpeed/r;
		} else {
			r = 1;
		}
		
		nodes[i].x += nodes[i].dx*r;
		nodes[i].y += nodes[i].dy*r;
	}
}

function draw() {
	if (quality > 0) {
		var blockSize = width/16;
		var bigBlockSize = blockSize*quality;
		for (var y = 0; y < 9; y++) {
			for (var x = 0; x < 16; x++) {
				contextTemp.fillStyle = '#FFF';
				contextTemp.fillRect(0, 0, bigBlockSize, bigBlockSize);
				if (detailed) drawEdges(contextTemp, quality, x*blockSize, y*blockSize, bigBlockSize, bigBlockSize);
				drawNodes(contextTemp, quality, x*blockSize, y*blockSize, bigBlockSize, bigBlockSize);
				
				var imageData = contextTemp.getImageData(0, 0, bigBlockSize, bigBlockSize);
				for (var iy = 0; iy < blockSize; iy++) {
					for (var ix = 0; ix < blockSize; ix++) {
						var r = 0;
						var g = 0;
						var b = 0;
						var i;
						for (var jy = 0; jy < quality; jy++) {
							for (var jx = 0; jx < quality; jx++) {
								i = (bigBlockSize*(jy + iy*quality) + (jx + ix*quality))*4;
								r += imageData.data[i + 0];
								g += imageData.data[i + 1];
								b += imageData.data[i + 2];
							}
						}
						i = (bigBlockSize*iy + ix)*4;
						imageData.data[i + 0] = Math.round(r/(quality*quality));
						imageData.data[i + 1] = Math.round(g/(quality*quality));
						imageData.data[i + 2] = Math.round(b/(quality*quality));
					}
				}
				
				context.putImageData(imageData, x*blockSize, y*blockSize, 0, 0, blockSize, blockSize);
			}
		}
	} else {
		context.fillStyle = '#FFF';
		context.fillRect(0, 0, width, height);
		if (detailed) drawEdges(context, 1, 0, 0, width, height);
		drawNodes(context, 1, 0, 0, width, height);
	}
}

function drawEdges(context, q, xOffset, yOffset, subWidth, subHeight) {
	var viewMinX = -width/(2*zoom);
	var viewMinY = -height/(2*zoom);
	var viewMaxX =  width/(2*zoom);
	var viewMaxY =  height/(2*zoom);
	
	for (var i = 0; i < edges.length; i++) {
		var edge = edges[i];
		var node1 = nodes[edge.id1];
		var node2 = nodes[edge.id2];
		
		var edgeMinX = Math.min(node1.x, node2.x);
		var edgeMinY = Math.min(node1.y, node2.y);
		var edgeMaxX = Math.max(node1.x, node2.x);
		var edgeMaxY = Math.max(node1.y, node2.y);
		
		var ex = edgeMaxX - edgeMinX;
		var ey = edgeMaxY - edgeMinY;
		var r = Math.sqrt(ex*ex + ey*ey)*0.5;
		
		if (edge.a) {
			if (
				(edgeMaxX+r > viewMinX) &&
				(edgeMaxY+r > viewMinY) &&
				(edgeMinX-r < viewMaxX) &&
				(edgeMinY-r < viewMaxY)) {
					
				var x1 = (node1.x*zoom + width/2  - xOffset)*q;
				var y1 = (node1.y*zoom + height/2 - yOffset)*q;
				
				var x2 = (node2.x*zoom + width/2  - xOffset)*q;
				var y2 = (node2.y*zoom + height/2 - yOffset)*q;
				
				context.lineWidth = 5e-5*zoom*q;
				
				var dx = (node2.x-node1.x)*zoom*q;
				var dy = (node2.y-node1.y)*zoom*q;
				
				for (var j = 0; j < edge.fiber.length; j++) {
					var fiber = edge.fiber[j];
					
					var len = fiber[4]*1;
					if (len > 1) {
						context.strokeStyle = '#000';
					} else {
						
					  var lingrad = context.createLinearGradient(x1,y1,x2,y2);
					  lingrad.addColorStop(0,   '#000');
					  lingrad.addColorStop(len, '#000');
					  lingrad.addColorStop(len, 'rgba(0,0,0,0)');
					  lingrad.addColorStop(1,   'rgba(0,0,0,0)');
					
					  context.strokeStyle = lingrad;
					}
					context.beginPath();
					
					context.moveTo(
						x1,
						y1
					);
					
					var s = fiber[4]*2;
					s = 1/(s*s+1);
					context.bezierCurveTo(
						x1 + s*fiber[0]*dy + fiber[1]*dx,
						y1 - s*fiber[0]*dx + fiber[1]*dy,
						x2 + s*fiber[2]*dy + fiber[3]*dx,
						y2 - s*fiber[2]*dx + fiber[3]*dy,
						x2,
						y2
					);
					context.stroke();
				}
			}
		}
	}
}

function drawNodes(context, q, xOffset, yOffset, subWidth, subHeight) {
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		
		if (node.a > 0) {
			var x = node.x*zoom + width/2;
			var y = node.y*zoom + height/2;
			x = (x-xOffset)*q;
			y = (y-yOffset)*q;
			var radius = bubbleSize*(node.a*node.a);
			context.fillStyle = '#000';
			context.beginPath();
			context.arc(x, y, radius*zoom*q, 0, Math.PI*2, false);
			context.closePath();
			context.fill();
		}
	}
}

function addCalls() {
	time += 1/timeResolution;
	spotRadius = Math.pow(0.025, 1-time/maxTime);
	
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		if (node.d < spotRadius) node.a = Math.min(1, node.a+0.1/timeResolution);
	}
	
	for (var i = 0; i < edges.length; i++) {
		var edge = edges[i];
		var node1 = nodes[edge.id1];
		var node2 = nodes[edge.id2];
		var p = (node1.a*node2.a);
		
		if ((p > 0) && (edge.a < edge.w)) {
			if (Math.random()*(fiberCount*timeResolution*0) < p) {
				edge.a = edge.a + 1/fiberCount;
				var r1 = Math.random()*0.2+0.1;
				var r2 = Math.random()*0.2+0.1;
				r1 = 0.25;
				r2 = 0.25;
				var a1 = (Math.random()*2-1)*1.5;
				var a2 = (Math.random()*2-1)*1.5;
				edge.fiber.push([
					r1*Math.sin(a1),
					r1*Math.cos(a1),
					r2*Math.sin(a2),
				  -r2*Math.cos(a2),
				  0
				]);
			}
		}
		
		for (var j = 0; j < edge.fiber.length; j++) {
			edge.fiber[j][4] += 0.3/timeResolution;
		}
	}
}

function start() {
	var n = 0;
	var startTime = (new Date()).getTime();
	var timer = setInterval(function () {
		step();
		if (n % 1 == 0) draw();
		n++;
		if ((new Date()).getTime() - startTime > 30*1000) clearInterval(timer);
		if (zoom < height*0.5) clearInterval(timer);
	}, 40);
}

function init() {
	for (var i = 0; i < nodeData.length; i++) {
		var data = nodeData[i];
		nodes[data[0]] = {
			id:data[0],
			x:data[1],
			y:data[2],
			l:data[3],
			dx:0,
			dy:0,
			a:1,
			d:Math.sqrt(data[1]*data[1] + data[2]*data[2])
		};
	}
	nodes[0].a = 1;
	
	for (var i = 0; i < edgeData.length; i++) {
		var data = edgeData[i];
		var id1 = data[0];
		var id2 = data[1];
		
		if (connections[id1] === undefined) connections[id1] = [];
		connections[id1].push({id:id2, w:data[2]});
		
		if (connections[id2] === undefined) connections[id2] = [];
		connections[id2].push({id:id1, w:data[2]});
		
		var dx = nodes[id1].x - nodes[id2].x;
		var dy = nodes[id1].y - nodes[id2].y;
		var r2 = dx*dx + dy*dy;
		
		edges.push({
			id1:id1,
			id2:id2,
			w:data[2],
			a:0,
			r:r2,
			fiber:[]
		});
	}
}

var subTreeIndex = [[0,1],[2,3]];

function emptyNode(x0, y0, size) {
	return {leaf:true, count:0, x0:x0, y0:y0, x:0, y:0, xm:x0+size/2, ym:y0+size/2, size:size, children:[]};
}

function getSubTreeIndex(node, tree) {
	var x = Math.floor(2*(node.x - tree.x0) / tree.size);
	var y = Math.floor(2*(node.y - tree.y0) / tree.size);
	var index = subTreeIndex[x][y];
	if (index === undefined) throw('index');
	return index;
}

function addNode(node, tree) {
	if (
		(node.x < tree.x0) ||
		(node.x > tree.x0+tree.size) ||
		(node.y < tree.y0) ||
		(node.y > tree.y0+tree.size)) {
		throw('node-Problem')
	}

	if (tree.leaf) {
		tree.children.push(node);
		tree.count++;
		if (tree.count > 1) {
			tree.leaf = false;
			var newNodes = tree.children;
			//tree.count = -1;
			var s = tree.size/2;
			tree.children = [
				emptyNode(tree.x0, tree.y0, s),
				emptyNode(tree.x0, tree.ym, s),
				emptyNode(tree.xm, tree.y0, s),
				emptyNode(tree.xm, tree.ym, s)
			];
			for (var i = 0; i < newNodes.length; i++) {
				addNode(newNodes[i], tree);
			}
		}
	} else {
		var index = getSubTreeIndex(node, tree);
		addNode(node, tree.children[index]);
	}
}

function finalizeTree(tree) {
	var o = {count:0, x:0, y:0};
	var children = tree.children;
	if (tree.leaf) {
		for (var i = 0; i < children.length; i++) {
			o.count++;
			o.x += children[i].x;
			o.y += children[i].y;
		}
	} else {
		for (var i = 0; i < 4; i++) {
			var child = finalizeTree(children[i]);
			o.count += child.count;
			o.x += child.x;
			o.y += child.y;
		}
	}
	
	if (o.count <= 0) {
		tree.count = 0;
		tree.x = 0;
		tree.y = 0;
	} else {
		tree.count = o.count;
		tree.x = o.x / o.count;
		tree.y = o.y / o.count;
	}
	return o;
}

function treeRepulsion(node, tree) {
	var dx = node.x - tree.x;
	var dy = node.y - tree.y;
	var r  = Math.sqrt(dx*dx + dy*dy);
	if ((tree.leaf) || (tree.size < r*0.1)) {
		if (r > 1e-10) {
			var f = repStrength/(r*r+1e-5);
			f = f/r;
			node.dx += f*dx;
			node.dy += f*dy;
			if (isNaN(node.dx) || isNaN(node.dy)) {
				throw('noch ein fehler');
			}
		}
	} else {
		for (var i = 0; i < 4; i++) {
			if (tree.children[i].count > 0) {
				treeRepulsion(node, tree.children[i]);
			}
		}
	}
}

function calcRepulsion() {
	nodes[0].x = 0;
	nodes[0].y = 0;
	
	var m = 0;
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		if (node.a > 0) {
			if (m < Math.abs(nodes[i].x)) m = Math.abs(nodes[i].x);
			if (m < Math.abs(nodes[i].y)) m = Math.abs(nodes[i].y);
		}
	}
	m *= 1.1;
	var tree = emptyNode(-m, -m, 2*m);
	
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		if (node.a > 0) addNode(node, tree);
	}
	
	finalizeTree(tree);
	
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		if (node.a > 0) treeRepulsion(node, tree);
	}
}

function calcEdgeForces() {
	for (var i = 0; i < edges.length; i++) {
		var edge = edges[i];
		var id1 = edge.id1;
		var id2 = edge.id2;
		
		var dx = nodes[id1].x - nodes[id2].x;
		var dy = nodes[id1].y - nodes[id2].y;
		var r2 = dx*dx + dy*dy;
		var r = Math.sqrt(r2);
		var f = gumStrength*edge.w*r;
		f = edge.w*f/r;
		
		nodes[id1].dx -= f*dx;
		nodes[id1].dy -= f*dy;
		
		nodes[id2].dx += f*dx;
		nodes[id2].dy += f*dy;
	}
}




