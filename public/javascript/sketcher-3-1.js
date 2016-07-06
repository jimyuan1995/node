// provide sketch interface and collect drawn data points from user.

// drawing coefficients
var gridWidth = 50,
	strkWeight = 2,
	padding = 15,
	h = 600, 
	w = 600;

// point collection
var drawnPtsPartial,
	drawnPoints = [];

// for moving curve
var prevMousePt,
	movedCurveIdx,
	isMoveCurve;

// for moving symbols
var isMoveSymbol,
	movedSymIdx;

// for undo and redo
var logUndo = [],
	logRedo = [];


function setup() {
	createCanvas(w, h);
	noLoop();
	cursor(CROSS);
	drawBackground();
	drawButton();
}

function draw() {
	drawSymbol(symbols, 255);
}

function drawBackground() {
	clear();
	background(255);
	drawGrid();
	drawHorizontalAxis();
	drawVerticalAxis();
	drawLabel();
	//drawScale();
}

function drawHorizontalAxis() {
	push();
	
	strokeWeight(strkWeight);
	strokeJoin(ROUND);
	stroke(0);
	noFill();

	var leftMargin = padding;
	var rightMargin = w - padding;

	beginShape();
	vertex(leftMargin, h/2);
	vertex(rightMargin, h / 2);
	vertex(rightMargin - 10, h / 2 - 5);
	vertex(rightMargin, h / 2);
	vertex(rightMargin - 10, h / 2 + 5);
	endShape();
	
	pop();
}

function drawVerticalAxis() {
	push();
	
	strokeWeight(strkWeight);
	strokeJoin(ROUND);
	stroke(0);
	noFill();

	var upMargin = padding;
	var bottomMargin = h - padding;

	beginShape();
	vertex(w/2, bottomMargin);
	vertex(w/2, upMargin);
	vertex(w/2 - 5, upMargin + 10);
	vertex(w/2, upMargin);
	vertex(w/2 + 5, upMargin + 10);
	endShape();
	
	pop();
}

function drawGrid() {
	push();

	noFill();
	strokeWeight(strkWeight);
	strokeJoin(ROUND);
	stroke(215);

	push();
	translate(0, h / 2);
	var num = h / (gridWidth * 2);
	for (var i = 0; i < num; i++) {
		line(0, -i*gridWidth, w, -i*gridWidth);
		line(0, i*gridWidth, w, i*gridWidth);
	}
	pop();

	push();
	translate(w / 2, 0);
	var num = w / (gridWidth * 2);
	for (var i = 0; i < num; i++) {
		line(-i*gridWidth, 0, -i*gridWidth, h);
		line(i*gridWidth, 0, i*gridWidth, h);
	}
	pop();

	pop();
}

function drawLabel() {
	push();

	textSize(16);
	stroke(0);
	strokeWeight(1);
	fill(0);

	text("O", w/2 - 15, h/2 + 15);
	text("x", w - 12, h/2 + 15);
	text("y", w/2 + 5, 12);

	pop();
}

function drawScale() {
	var len = 3;

	push();
	strokeWeight(1);
	stroke(0);
	textSize(12);

	push();
	translate(0, h / 2);
	var num = h / (gridWidth * 2);
	for (var i = 1; i < num; i++) {
		line(w/2 -len, -i*gridWidth, w/2 + len, -i*gridWidth);
		line(w/2 - len, i*gridWidth, w/2 + len, i*gridWidth);
		text(i, w/2 + 5, -i * gridWidth + 5);
		text(-i, w/2 + 5, i * gridWidth + 5);
	}
	pop();

	push();
	translate(w / 2, 0);
	var num = w / (gridWidth * 2);
	for (var i = 1; i < num; i++) {
		line(-i*gridWidth, h/2 - len, -i*gridWidth, h / 2 + len);
		line(i*gridWidth, h/2 - len, i*gridWidth, h /2 + len);
		text(-i, -i * gridWidth - 5, h / 2 + 15);
		text(i, i * gridWidth - 5, h / 2 + 15);
	}
	pop();

	pop();
}

function drawCurve(pts, color) {
	if (pts.length == 0) return;

	if (pts[0] instanceof Array) {
		for (var i = 0; i < pts.length; i++)
			drawCurve(pts[i], color);
		return;
	}

	push();
	stroke(color);
	strokeWeight(strkWeight);
	for (var i = 1; i < pts.length; i++) {
		line(pts[i-1].x, pts[i-1].y, pts[i].x, pts[i].y);
	}
	pop();

	drawKnots(pts['inter_x'], 255);
	drawKnots(pts['inter_y'], 255);
	drawKnots(pts['turnPts'], 255);
}

function drawKnots(pts, color) {
	if (pts instanceof Array) {
		for (var i = 0; i < pts.length; i++) 
			drawKnots(pts[i], color);
		return;
	}

	push();
	fill(color);
	stroke(100);
	strokeWeight(1);
	ellipse(pts.x, pts.y, 10, 10);
	pop();
}

function drawSymbol(symbol, color) {
	if (symbol.length == 0) return;

	if (symbol instanceof Array) {
		for (var i = 0; i < symbol.length; i++)
			drawSymbol(symbol[i], color);
		return;
	}

	push();
	stroke(100);
	strokeWeight(1);
	textSize(14);
	fill(color);
	ellipse(symbol.x, symbol.y, 10, 10);
	fill(0);
	text(symbol.text, symbol.x - 4, symbol.y + 20);
	pop();
}


function drawButton() {
	var buttonClear = createButton('clear');
	buttonClear.position(w - 150, padding);
	buttonClear.mousePressed(function() {
		drawBackground();
		drawnPoints = [];
		def_symbols();
		drawSymbol(symbols, 255);
		logUndo = [];
		logRedo = [];
	});

	var buttonTest = createButton("test");
	buttonTest.position(w - 150, padding + 20);
	buttonTest.mousePressed(function() {
		send();
	});

	var buttonTestcase = createButton("show test case");
	buttonTestcase.position(w - 100, padding + 20);
	buttonTestcase.mousePressed(function() {
		drawCurve(testPoints, [0]);
	});

	var buttonUndo = createButton("undo");
	buttonUndo.position(w - 100, padding);
	buttonUndo.mousePressed(function() {
		if (logUndo.length == 0) return;

		var rec = logUndo.pop(),
			recc = {};

		if (rec['type'] == 'moveSym') {
			var sym = symbols[rec.movedSymIdx];
			if (sym.bindCurve != undefined) {
				var idx = sym.bindCurve.bindSym.indexOf(sym);
				sym.bindCurve.bindSym.splice(idx, 1);
			}

			symbols[rec.movedSymIdx] = rec.sym;
			var sym = symbols[rec.movedSymIdx];
			if (sym.bindCurve != undefined) {
				sym.bindCurve.bindSym.push(sym);
			}

		} else if (rec['type'] == 'moveCurve') {
			var pts = drawnPoints[rec.movedCurveIdx];
			transform(pts, -rec.dx, -rec.dy);
			
			pts.bindSym = [];
			for (var i = 0; i < rec.bindSym.length; i++) {
				var sym = rec.bindSym[i];
				symbols[sym.idx] = clone(sym);
				pts.bindSym.push(symbols[sym.idx]);
			}

			recc = rec;
		} else if (rec['type'] == 'drawCurve') {
			recc['type'] = 'drawCurve';
			recc['pts'] = drawnPoints.pop();
		}

		drawBackground();
		drawCurve(drawnPoints, [0, 155, 255]);
		drawSymbol(symbols, [255]);
	});

	var buttonRedo = createButton("redo");
	buttonRedo.position(w - 50, padding);
	buttonRedo.mousePressed(function() {

	});
}



function transform(pts, dx, dy) {
	for (var i = 0; i < pts.length; i++) {
		pts[i].x += dx;
		pts[i].y += dy;
	}

	pts['inter_x'] = findInterceptX(pts);
	pts['inter_y'] = findInterceptY(pts);

	var tmp = [];
	for (var i = 0; i < pts.bindSym.length; i++) {
		var sym = pts.bindSym[i];
		if (sym.category == 'turnPts') {
			sym.x += dx;
			sym.y += dy;
			tmp.push(sym);
		} else {
			var found = false,
				inter = pts[sym.category],
				min = 50,
				knot;
			for (var j = 0; j < inter.length; j++) {
				if (getDist(sym, inter[j]) < min) {
					min = getDist(sym, inter[j]);
					knot = inter[j];
					found = true;
				}
			}
			if (found) {
				sym.x = knot.x;
				sym.y = knot.y;
				tmp.push(sym);
			} else {
				if (sym.bindCurve != undefined) {
					var idx = sym.bindCurve.bindSym.indexOf(sym);
					sym.bindCurve.bindSym.splice(idx, 1);
				}
				sym.x = sym.default_x;
				sym.y = sym.default_y;
				sym.bindCurve = undefined;
				sym.category = undefined;
			}
		}
	}

	pts.bindSym = tmp;
	return pts;
}


function mousePressed() {
	var rec = {};
	var current = createPoint(mouseX, mouseY);

	for (var i = 0; i < symbols.length; i++) {
		if (getDist(symbols[i], current) < 10) {
			isMoveSymbol = true;
			movedSymIdx = i;

			var sym = symbols[i];
			rec['type'] = 'moveSym';
			rec['movedSymIdx'] = i;
			rec['sym'] = clone(sym);
			logUndo.push(rec);

			if (sym.bindCurve != undefined) {
				var idx = sym.bindCurve.bindSym.indexOf(sym);
				sym.bindCurve.bindSym.splice(idx, 1);
				sym['bindCurve'] = undefined;
				sym['category'] = undefined;
			}

			return false;
		}
	}


	for (var i = 0; i < drawnPoints.length; i++) {
		var pts = drawnPoints[i];
		for (var j = 0; j < pts.length; j++) {
			if (getDist(pts[j], current) < 10) {
				movedCurveIdx = i;
				isMoveCurve = true;
				prevMousePt = current;

				rec['type'] = 'moveCurve';
				rec['movedCurveIdx'] = i;
				rec['init'] = current;
				rec['bindSym'] = [];
				for (var i = 0; i < pts.bindSym.length; i++) {
					var sym = clone(pts.bindSym[i]);
					sym.idx = symbols.indexOf(pts.bindSym[i]);
					rec.bindSym.push(sym);
				}
				logUndo.push(rec);

				drawCurve(pts, [135]);
				return false;
			}
		}
	}

	isMoveCurve = false;
	isMoveSymbol = false;

	rec['type'] = 'drawCurve';
	logUndo.push(rec);
	drawnPtsPartial = [];

	return false;
}


function mouseDragged() {
	var current = createPoint(mouseX, mouseY);
	if (isMoveCurve) {
		var dx = current.x - prevMousePt.x;
		var dy = current.y - prevMousePt.y;
		drawnPoints[movedCurveIdx] = transform(drawnPoints[movedCurveIdx], dx, dy);
		prevMousePt = current;

		drawBackground();
		for (var i = 0; i < drawnPoints.length; i++) {
			if (i == movedCurveIdx) {
				drawCurve(drawnPoints[i], [135]);
			} else {
				drawCurve(drawnPoints[i], [0, 155, 255]);
			}
		}
		drawSymbol(symbols, 255);
	} else if (isMoveSymbol) {
		symbols[movedSymIdx].x = current.x;
		symbols[movedSymIdx].y = current.y;

		drawBackground();
		drawCurve(drawnPoints, [0, 155, 255]);

		var found = false;
		function detect(category) {
			for (var i = 0; i < drawnPoints.length; i++) {
				var pts = drawnPoints[i][category];
				for (var j = 0; j < pts.length; j++) 
					if (getDist(current, pts[j]) < 10) {
						drawKnots(pts[j], 151);
						found = true;
						break;
					}
				if (found) break;
			}
		}
		detect('turnPts');
		if (!found) detect('inter_x');
		if (!found) detect('inter_y');

		drawSymbol(symbols, 255);
		drawSymbol(symbols[movedSymIdx], 151);
	} else {
		push();
		stroke(0, 155, 255);
		strokeWeight(strkWeight);
		if (drawnPtsPartial.length > 0) {
			var prev = drawnPtsPartial[drawnPtsPartial.length - 1];
			line(prev.x, prev.y, current.x, current.y);
		}
		pop();

		drawnPtsPartial.push(current);	
	}

}

function mouseReleased() {
	if (isMoveCurve) {
		drawCurve(drawnPoints[movedCurveIdx], [0, 155, 255]);
		isMoveCurve = false;

		// history
		var rec = logUndo.pop();
		rec.dx = mouseX - rec['init'].x;
		rec.dy = mouseY - rec['init'].y;
		logUndo.push(rec);
	} else if (isMoveSymbol) {
		var current = createPoint(mouseX, mouseY);
		
		var found = false;
		function attach(category) {
			for (var i = 0; i < drawnPoints.length; i++) {
				var pts = drawnPoints[i][category];
				for (var j = 0; j < pts.length; j++) 
					if (getDist(current, pts[j]) < 10) {
						symbols[movedSymIdx].x = pts[j].x;
						symbols[movedSymIdx].y = pts[j].y;
						drawnPoints[i].bindSym.push(symbols[movedSymIdx]);
						symbols[movedSymIdx]['bindCurve'] = drawnPoints[i];
						symbols[movedSymIdx]['category'] = category;
						found = true;
						break;
					}
				if (found) break;
			}
		}
		attach('turnPts');
		if (!found) attach('inter_x');
		if (!found) attach('inter_y');
		if (!found) {
			symbols[movedSymIdx].x = symbols[movedSymIdx].default_x;
			symbols[movedSymIdx].y = symbols[movedSymIdx].default_y;
		}

		var rec = logUndo.pop();
		if (!(rec.sym.x == symbols[movedSymIdx].x) || !(rec.sym.y == symbols[movedSymIdx].y)) logUndo.push(rec);

		drawBackground();
		drawCurve(drawnPoints, [0, 155, 255]);
		drawSymbol(symbols, 255);
		isMoveSymbol = false;
	} else {
		if (sample(drawnPtsPartial).length < 3) {
			logUndo.pop();
			return;
		}
		var drawBez = genericBezier(sample(drawnPtsPartial));
		if (drawBez.length > 0) {
			drawBez['inter_x'] = findInterceptX(drawBez);
			drawBez['inter_y'] = findInterceptY(drawBez);
			drawBez['turnPts'] = findTurningPts(drawBez);
			drawBez['bindSym'] = [];
			drawnPoints.push(drawBez);
		}
		drawBackground();
		drawCurve(drawnPoints, [0, 155, 255]);
		drawSymbol(symbols, 255);
	}
}


	










