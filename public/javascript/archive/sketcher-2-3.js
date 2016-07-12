// provide sketch interface and collect drawn data points from user.

// drawing coefficients
var gridWidth = 50,
	strkWeight = 2,
	padding = 15,
	h = 600, 
	w = 600;

// point collection
var drawnPtsPartial;
var drawnPoints = [];


// for moving curve
var prevMousePt;
var movedCurveIdx;
var isMoveCurve;

// for moving symbols
var isMoveSymbol;
var movedSymIdx;


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
		line(0, -i*gridWidth, width, -i*gridWidth);
		line(0, i*gridWidth, width, i*gridWidth);
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

function drawButton() {
	var buttonClear = createButton('clear');
	buttonClear.position(width - 100, padding);
	buttonClear.mousePressed(function() {
		drawBackground();
		drawnPoints = [];
		def_symbols();
		drawSymbol(symbols, 255);
	});

	var buttonTest = createButton("test");
	buttonTest.position(width - 100, padding+20);
	buttonTest.mousePressed(function() {
		send(drawnPoints);
	});

	var buttonTestcase = createButton("show test case");
	buttonTestcase.position(width - 100, padding+40);
	buttonTestcase.mousePressed(function() {
		drawCurve(testPoints, [0]);
	});

	var buttonUndo = createButton("undo");
	buttonUndo.position(width - 100, padding + 60);
	buttonUndo.mousePressed(function() {

	});
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

function drawSymbol(symbols, color) {
	if (symbols.length == 0) return;

	if (symbols instanceof Array) {
		for (var i = 0; i < symbols.length; i++)
			drawSymbol(symbols[i], color);
		return;
	}

	push();
	stroke(100);
	strokeWeight(1);
	textSize(14);
	fill(color);
	ellipse(symbols.x, symbols.y, 10, 10);
	fill(0);
	text(symbols.text, symbols.x - 4, symbols.y + 20);
	pop();
}


function transform(pts, dx, dy) {
	for (var i = 0; i < pts.length; i++) {
		pts[i].x += dx;
		pts[i].y += dy;
	}

	pts['inter_x'] = findInterceptX(pts);
	pts['inter_y'] = findInterceptY(pts);

	var sym = pts.bindSym,
		idx = 0;
	while (idx < sym.length) {
		var category = sym[idx].category;
		if (category == 'turnPts') {
			sym[idx].x += dx;
			sym[idx].y += dy;
			idx++;
		} else {
			var found = false;
			var inter = pts[category];
			for (var j = 0; j < inter.length; j++) {
				if (getDist(inter[j], sym[idx]) < 25) {
					sym[idx].x = inter[j].x;
					sym[idx].y = inter[j].y;
					found = true;
					break;
				}
			}
			if (found) {
				idx++;
			} else {
				sym[idx].x = sym[idx].default_x;
				sym[idx].y = sym[idx].default_y;
				sym[idx]['bindCurve'] = undefined;
				sym[idx]['category'] = undefined;
				sym.splice(idx, 1);
			}
		}
	}

	return pts;
}


function mousePressed() {
	var current = new Point(mouseX, mouseY);

	for (var i = 0; i < symbols.length; i++) {
		if (getDist(symbols[i], current) < 10) {
			movedSymIdx = i;
			isMoveSymbol = true;
			if (symbols[movedSymIdx].bindCurve != undefined) {
				var idx = symbols[movedSymIdx].bindCurve.bindSym.indexOf(symbols[i]);
				symbols[movedSymIdx].bindCurve.bindSym.splice(idx, 1);
				symbols[movedSymIdx]['bindCurve'] = undefined;
				symbols[movedSymIdx]['category'] = undefined;
			}
			prevMousePt = current;
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
				drawCurve(drawnPoints[i], [135]);
				return false;
			}
		}
	}


	isMoveCurve = false;
	isMoveSymbol = false;
	drawnPtsPartial = [];
}


function mouseDragged() {
	var current = new Point(mouseX, mouseY);
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
	} else if (isMoveSymbol) {
		var current = new Point(mouseX, mouseY);
		
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

		drawBackground();
		drawCurve(drawnPoints, [0, 155, 255]);
		drawSymbol(symbols, 255);
		isMoveSymbol = false;
	} else {
		if (drawnPtsPartial.length == 0) return;
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


	










