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
var drawnPtsPartial = [],
	drawnPoints = [],
	isDrawing;

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

// run in the beginning by p5 library
function setup() {
	createCanvas(canvasWidth, canvasHeight).position(50,50);

	noLoop();
	cursor(CROSS);

	drawBackground();
	drawSymbols(symbols, 255);

	drawButton();
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
function drawCurves(ptss, color) {
	if (ptss.length == 0) return;

	// if input is multiple curves
	if (ptss[0] instanceof Array) {
		for (var i = 0; i < ptss.length; i++)
			drawCurves(ptss[i], color);
		return;
	}

	var pts = ptss;
	push();
	stroke(color);
	strokeWeight(strkWeight);
	for (var i = 1; i < pts.length; i++) {
		line(pts[i-1].x, pts[i-1].y, pts[i].x, pts[i].y);
	}
	pop();

	// draw x intercepts, y intercepts and turning points
	drawKnots([].concat(pts['inter_x'], pts['inter_y'], pts['maxima'], pts['minima']), 255);
}


// given a set of points, draw the corresponding points (knots).
function drawKnots(knots, color) {
	if (knots.length == 0) return;

	// if input has multiple points
	if (knots instanceof Array) {
		for (var i = 0; i < knots.length; i++) {
			// var dup = false;
			// for (var j = 0; j < i; j++) 
			// 	if (getDist(knots[i], knots[j]) < 3) 
			// 		dup = true;
			// if (!dup) drawKnots(knots[i], color);
			drawKnots(knots[i], color);
		}
		return;
	}

	var knot = knots;
	push();
	fill(color);
	stroke(100);
	strokeWeight(1);
	// if (getDist(knot, createPoint(canvasWidth/2, canvasHeight/2)) < 3) 
	// 	knot = createPoint(canvasWidth/2, canvasHeight/2);
	ellipse(knot.x, knot.y, 10, 10);
	pop();
}

// draw symbols, e.g. "A", "B".
function drawSymbols(symbols, color) {
	if (symbols.length == 0) return;

	// if input has multiple symbols.
	if (symbols instanceof Array) {
		for (var i = 0; i < symbols.length; i++) {
			// var dup = false;
			// for (var j = 0; j < i; j++) {
			// 	if (getDist(symbols[i], symbols[j]) < 3) {
			// 		dup = true;
			// 	}
			// }
			// if (!dup) drawSymbols(symbols[i], color);
			drawSymbols(symbols[i], color);
		}
		return;
	}

	var symbol = symbols;
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
	var current = createPoint(mouseX, mouseY);
	if (current.x < 0 || current.x > canvasWidth || current.y < 0 || current.y > canvasHeight) return;
	var rec = {};


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

			return;
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

				drawCurves(pts, [135]);
				return;
			}
		}
	}

	isDrawing = true;
	// produce record for undo
	rec['type'] = 'drawCurve';
	logUndo.push(rec);

	return;
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
				drawCurves(drawnPoints[i], [135]);
			} else {
				drawCurves(drawnPoints[i], [0, 155, 255]);
			}
		}
		drawSymbols(symbols, 255);
	} else if (isMoveSymbol) {
		symbols[movedSymIdx].x = current.x;
		symbols[movedSymIdx].y = current.y;

		drawBackground();
		drawCurves(drawnPoints, [0, 155, 255]);
		drawSymbols(symbols, 255);
		drawSymbols(symbols[movedSymIdx], 151);

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
		detect('maxima');
		if (!found) detect('minima');
		if (!found) detect('inter_x');
		if (!found) detect('inter_y');

		
	} else if (isDrawing) {
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
		isMoveCurve = false;
		drawCurves(drawnPoints[movedCurveIdx], [0, 155, 255]);

		// produce record for undo
		var rec = logUndo.pop();
		rec.dx = mouseX - rec['init'].x;
		rec.dy = mouseY - rec['init'].y;
		logUndo.push(rec);
		logRedo = [];
	} else if (isMoveSymbol) {
		isMoveSymbol = false;
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
		attach('maxima');
		if (!found) attach('minima');
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
		drawCurves(drawnPoints, [0, 155, 255]);
		drawSymbols(symbols, 255);
		
	} else if (isDrawing) {
		isDrawing = false;
		// neglect if curve drawn is too short
		if (sample(drawnPtsPartial).length < 3) {
			logUndo.pop();
			drawnPtsPartial = [];
			return;
		}

		if (Math.abs(drawnPtsPartial[0].y - canvasHeight/2) < 5) 
			drawnPtsPartial[0].y = canvasHeight/2;
		if (Math.abs(drawnPtsPartial[0].x - canvasWidth/2) < 5) 
			drawnPtsPartial[0].x = canvasWidth/2;
		if (Math.abs(drawnPtsPartial[drawnPtsPartial.length - 1].y - canvasHeight/2) < 5) 
			drawnPtsPartial[drawnPtsPartial.length - 1].y = canvasHeight/2;
		if (Math.abs(drawnPtsPartial[drawnPtsPartial.length - 1].x - canvasWidth/2) < 5) 
			drawnPtsPartial[drawnPtsPartial.length - 1].x = canvasWidth/2;

		var bez = genericBezier(sample(drawnPtsPartial));
		bez['inter_x'] = findInterceptX(bez);
		bez['inter_y'] = findInterceptY(bez);
		bez['maxima'] = findMaxima(bez);
		bez['minima'] = findMinima(bez);
		bez['bindSym'] = [];
		drawnPoints.push(bez);

		logRedo = [];
		drawnPtsPartial = [];
		drawBackground();
		drawCurves(drawnPoints, [0, 155, 255]);
		drawSymbols(symbols, 255);
	}
}




	










