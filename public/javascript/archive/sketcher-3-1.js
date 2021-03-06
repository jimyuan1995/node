// functionality:
// 1. provide sketch background, react to mousePressed, mouseDragged and mouseReleased
// 2. collect drawn data points from user

// canvas coefficients
var canvasHeight = 600, 
	canvasWidth = 600,
	gridWidth = 50,
	strkWeight = 2,
	padding = 15;
	

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


// run in the beginning
function setup() {
	createCanvas(canvasWidth, canvasHeight).position(50,50);
	noLoop();
	cursor(CROSS);
	drawBackground();
	drawButton();
}


// run only once
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
	var rightMargin = canvasWidth - padding;

	beginShape();
	vertex(leftMargin, canvasHeight/2);
	vertex(rightMargin, canvasHeight / 2);
	vertex(rightMargin - 10, canvasHeight / 2 - 5);
	vertex(rightMargin, canvasHeight / 2);
	vertex(rightMargin - 10, canvasHeight / 2 + 5);
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
	var bottomMargin = canvasHeight - padding;

	beginShape();
	vertex(canvasWidth/2, bottomMargin);
	vertex(canvasWidth/2, upMargin);
	vertex(canvasWidth/2 - 5, upMargin + 10);
	vertex(canvasWidth/2, upMargin);
	vertex(canvasWidth/2 + 5, upMargin + 10);
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
	translate(0, canvasHeight / 2);
	var num = canvasHeight / (gridWidth * 2);
	for (var i = 0; i < num; i++) {
		line(0, -i*gridWidth, canvasWidth, -i*gridWidth);
		line(0, i*gridWidth, canvasWidth, i*gridWidth);
	}
	pop();

	push();
	translate(canvasWidth / 2, 0);
	var num = canvasWidth / (gridWidth * 2);
	for (var i = 0; i < num; i++) {
		line(-i*gridWidth, 0, -i*gridWidth, canvasHeight);
		line(i*gridWidth, 0, i*gridWidth, canvasHeight);
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

	text("O", canvasWidth/2 - 15, canvasHeight/2 + 15);
	text("x", canvasWidth - 12, canvasHeight/2 + 15);
	text("y", canvasWidth/2 + 5, 12);

	pop();
}

function drawScale() {
	var len = 3;

	push();
	strokeWeight(1);
	stroke(0);
	textSize(12);

	push();
	translate(0, canvasHeight / 2);
	var num = canvasHeight / (gridWidth * 2);
	for (var i = 1; i < num; i++) {
		line(canvasWidth/2 -len, -i*gridWidth, canvasWidth/2 + len, -i*gridWidth);
		line(canvasWidth/2 - len, i*gridWidth, canvasWidth/2 + len, i*gridWidth);
		text(i, canvasWidth/2 + 5, -i * gridWidth + 5);
		text(-i, canvasWidth/2 + 5, i * gridWidth + 5);
	}
	pop();

	push();
	translate(canvasWidth / 2, 0);
	var num = canvasWidth / (gridWidth * 2);
	for (var i = 1; i < num; i++) {
		line(-i*gridWidth, canvasHeight/2 - len, -i*gridWidth, canvasHeight / 2 + len);
		line(i*gridWidth, canvasHeight/2 - len, i*gridWidth, canvasHeight /2 + len);
		text(-i, -i * gridWidth - 5, canvasHeight / 2 + 15);
		text(i, i * gridWidth - 5, canvasHeight / 2 + 15);
	}
	pop();

	pop();
}

// given a set of points, draw the corresponding curve.
function drawCurve(pts, color) {
	if (pts.length == 0) return;

	// if input is multiple curves
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

	// draw x intercepts, y intercepts and turning points
	drawKnots(pts['inter_x'], 255);
	drawKnots(pts['inter_y'], 255);
	drawKnots(pts['turnPts'], 255);
}


// given a set of points, draw the corresponding points (knots).
function drawKnots(pts, color) {
	// if input has multiple points
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

// draw symbols, e.g. "A", "B".
function drawSymbol(symbol, color) {
	if (symbol.length == 0) return;


	// if input has multiple symbols.
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
	buttonClear.position(canvasWidth - 150, padding);
	buttonClear.mousePressed(function() {
		drawBackground();
		drawnPoints = [];
		def_symbols();
		drawSymbol(symbols, 255);
		logUndo = [];
		logRedo = [];
	});

	var buttonTest = createButton("test");
	buttonTest.position(canvasWidth - 150, padding + 20);
	buttonTest.mousePressed(function() {
		send();
	});

	var buttonTestcase = createButton("show test case");
	buttonTestcase.position(canvasWidth - 100, padding + 20);
	buttonTestcase.mousePressed(function() {
		drawCurve(testPoints, 0);
	});

	// redo and undo is essentially the reverse of each other.

	var buttonUndo = createButton("undo");
	buttonUndo.position(canvasWidth - 100, padding);
	buttonUndo.mousePressed(function() {
		if (logUndo.length == 0) return;

		var rec = logUndo.pop(),
			recc = {};

		if (rec['type'] == 'moveSym') {
			// produce record for redo
			recc.type = 'moveSym';
			recc.movedSymIdx = rec.movedSymIdx;
			recc.sym = clone(symbols[rec.movedSymIdx]);
			logRedo.push(recc);

			
			var sym = symbols[rec.movedSymIdx];
			// remove sym from previously binded curve
			if (sym.bindCurve != undefined) {
				var idx = sym.bindCurve.bindSym.indexOf(sym);
				sym.bindCurve.bindSym.splice(idx, 1);
			}

			symbols[rec.movedSymIdx] = rec.sym;
			var sym = symbols[rec.movedSymIdx];
			// bind sym to the current curve
			if (sym.bindCurve != undefined) {
				sym.bindCurve.bindSym.push(sym);
			}

		} else if (rec['type'] == 'moveCurve') {
			var pts = drawnPoints[rec.movedCurveIdx];

			// produce record for redo
			recc.type = 'moveCurve';
			recc.movedCurveIdx = rec.movedCurveIdx;
			recc.dx = -rec.dx;
			recc.dy = -rec.dy;
			recc.bindSym = [];
			for (var i = 0; i < pts.bindSym.length; i++) {
				var sym = clone(pts.bindSym[i]);
				sym.idx = symbols.indexOf(pts.bindSym[i]);
				recc.bindSym.push(sym);
			}
			logRedo.push(recc);
			
			// reversly translate the curve
			transCurve(pts, -rec.dx, -rec.dy);
			// restore binded symbols
			pts.bindSym = [];
			for (var i = 0; i < rec.bindSym.length; i++) {
				var sym = rec.bindSym[i];
				symbols[sym.idx] = clone(sym);
				pts.bindSym.push(symbols[sym.idx]);
			}
		} else if (rec['type'] == 'drawCurve') {
			// produce record for redo
			recc['type'] = 'drawCurve';
			recc['pts'] = drawnPoints.pop();
			logRedo.push(recc);
		}

		drawBackground();
		drawCurve(drawnPoints, [0, 155, 255]);
		drawSymbol(symbols, [255]);
	});

	var buttonRedo = createButton("redo");
	buttonRedo.position(canvasWidth - 50, padding);
	buttonRedo.mousePressed(function() {
		if (logRedo.length == 0) return;

		var rec = {},
			recc = logRedo.pop();

		if (recc.type == 'moveSym') {

			// produce record for undo
			rec.type = 'moveSym';
			rec.movedSymIdx = recc.movedSymIdx;
			rec.sym = clone(symbols[recc.movedSymIdx]);
			logUndo.push(rec);

			var sym = symbols[recc.movedSymIdx];
			// remove sym from previously binded curve
			if (sym.bindCurve != undefined) {
				var idx = sym.bindCurve.bindSym.indexOf(sym);
				sym.bindCurve.bindSym.splice(idx, 1);
			}
			symbols[recc.movedSymIdx] = clone(recc.sym);
			var sym = symbols[recc.movedSymIdx];
			// bind sym to the current curve
			if (sym.bindCurve != undefined) {
				sym.bindCurve.bindSym.push(sym);
			}

		} else if (recc.type == 'moveCurve') {
			var pts = drawnPoints[recc.movedCurveIdx];

			// produce record for undo
			rec.type = 'moveCurve';
			rec.movedCurveIdx = recc.movedCurveIdx;
			rec.dx = -recc.dx;
			rec.dy = -recc.dy;
			rec.bindSym = [];
			for (var i = 0; i < pts.bindSym.length; i++) {
				var sym = clone(pts.bindSym[i]);
				sym.idx = symbols.indexOf(pts.bindSym[i]);
				rec.bindSym.push(sym);
			}
			logUndo.push(rec);
			
			// reversely translate the curve
			transCurve(pts, -recc.dx, -recc.dy);
			
			// restore binded symbols
			// tmp is the new bindSym
			var tmp = [];
			for (var i = 0; i < recc.bindSym.length; i++) {
				var sym = recc.bindSym[i];
				symbols[sym.idx] = clone(sym);
				tmp.push(symbols[sym.idx]);
			}
			// handle cases: symbols drop off when curve moves
			for (var i = 0; i < pts.bindSym.length; i++) {
				if (!tmp.includes(pts.bindSym[i])) {
					pts.bindSym[i].x = pts.bindSym[i].default_x;
					pts.bindSym[i].y = pts.bindSym[i].default_y;
					pts.bindSym[i].category = undefined;
					pts.bindSym[i].bindCurve = undefined;
				}
			}
			pts.bindSym = tmp;

		} else if (recc.type == 'drawCurve') {
			// produce record for undo
			rec.type = 'drawCurve';
			logUndo.push(rec);
			drawnPoints.push(recc.pts);
		}

		drawBackground();
		drawCurve(drawnPoints, [0, 155, 255]);
		drawSymbol(symbols, 255);
	});
}

// given a curve, translate the curve
function transCurve(pts, dx, dy) {
	for (var i = 0; i < pts.length; i++) {
		pts[i].x += dx;
		pts[i].y += dy;
	}

	pts['inter_x'] = findInterceptX(pts);
	pts['inter_y'] = findInterceptY(pts);


	// tmp is the new "bindSym" array. It is done in this way to avoid removing elements from the array when traversing it. 
	var tmp = [];
	for (var i = 0; i < pts.bindSym.length; i++) {
		var sym = pts.bindSym[i];
		if (sym.category == 'turnPts') {
			sym.x += dx;
			sym.y += dy;
			tmp.push(sym);
		} else {
			// look for the new intercept which derives from the intercept binded by sym, if found, then bind sym to new intercept,
			// otherwise, put sym back to default position (note in this case sym is not pushed into tmp).
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
	console.log(current);

	for (var i = 0; i < symbols.length; i++) {
		if (getDist(symbols[i], current) < 10) {
			isMoveSymbol = true;
			movedSymIdx = i;

			// produce record for undo
			var sym = symbols[i];
			rec['type'] = 'moveSym';
			rec['movedSymIdx'] = i;
			rec['sym'] = clone(sym);
			logUndo.push(rec);

			// remove symbol from previously binded curve
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

				// produce record for undo
				rec['type'] = 'moveCurve';
				rec['movedCurveIdx'] = i;
				rec['init'] = current;
				rec['bindSym'] = [];
				// store binded symbols
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

	// produce record for undo
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
		drawnPoints[movedCurveIdx] = transCurve(drawnPoints[movedCurveIdx], dx, dy);
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
		drawSymbol(symbols, 255);
		drawSymbol(symbols[movedSymIdx], 151);

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

		// produce record for undo
		var rec = logUndo.pop();
		rec.dx = mouseX - rec['init'].x;
		rec.dy = mouseY - rec['init'].y;
		logUndo.push(rec);
		logRedo = [];
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

		logRedo = [];
		drawBackground();
		drawCurve(drawnPoints, [0, 155, 255]);
		drawSymbol(symbols, 255);
		isMoveSymbol = false;
	} else {
		// neglect if curve drawn is too short
		if (sample(drawnPtsPartial).length < 2) {
			logUndo.pop();
			return;
		}

		var drawBez = genericBezier(sample(drawnPtsPartial));
		drawBez['inter_x'] = findInterceptX(drawBez);
		drawBez['inter_y'] = findInterceptY(drawBez);
		drawBez['turnPts'] = findTurningPts(drawBez);
		drawBez['bindSym'] = [];
		drawnPoints.push(drawBez);

		logRedo = [];
		drawBackground();
		drawCurve(drawnPoints, [0, 155, 255]);
		drawSymbol(symbols, 255);
	}
}


	










