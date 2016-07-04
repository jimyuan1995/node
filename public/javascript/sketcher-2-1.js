// provide sketch interface and collect drawn data points from user.

// drawing coefficients
var gridWidth = 60;
var strkWeight = 2;
var padding = 15;
var h = 600, w = 600;

// point collection
var drawnPtsPartial;
var drawnPoints = [];
var prevMousePt;


// for moving curve
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

	drawKnots(findInterceptX(pts), 255);
	drawKnots(findInterceptY(pts), 255);
	drawKnots(findTurningPts(pts), 255);
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



function mouseDragged() {
	var current = new Point(mouseX, mouseY);
	if (isMoveCurve) {
		var dx = current.x - prevMousePt.x;
		var dy = current.y - prevMousePt.y;
		drawnPoints[movedCurveIdx] = transform(drawnPoints[movedCurveIdx], 1, 1, dx, dy);
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

		for (var i = 0; i < drawnPoints.length; i++) {
			var turnPts = findTurningPts(drawnPoints[i]);
			for (var j = 0; j < turnPts.length; j++) 
				if (getDist(current, turnPts[j]) < 10) {
					drawKnots(turnPts[j], 151);
					break;
				}
		}

		
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

function mousePressed() {
	var p = new Point(mouseX, mouseY);
	for (var i = 0; i < drawnPoints.length; i++) {
		var pts = drawnPoints[i];
		for (var j = 0; j < pts.length; j++) {
			if (getDist(pts[j], p) < 10) {
				movedCurveIdx = i;
				isMoveCurve = true;
				prevMousePt = p;
				drawCurve(drawnPoints[i], [135]);
				return false;
			}
		}
	}

	for (var i = 0; i < symbols.length; i++) {
		if (getDist(symbols[i], p) < 10) {
			movedSymIdx = i;
			isMoveSymbol = true;
			prevMousePt = p;
			return false;
		}
	}


	isMoveCurve = false;
	isMoveSymbol = false;
	drawnPtsPartial = [];
}

function mouseReleased() {
	if (isMoveCurve) {
		drawCurve(drawnPoints[movedCurveIdx], [0, 155, 255]);
		isMoveCurve = false;
	} else if (isMoveSymbol) {
		var current = new Point(mouseX, mouseY);
		for (var i = 0; i < drawnPoints.length; i++) {
			var turnPts = findTurningPts(drawnPoints[i]);
			for (var j = 0; j < turnPts.length; j++) 
				if (getDist(current, turnPts[j]) < 10) {
					symbols[movedSymIdx].x = turnPts[j].x;
					symbols[movedSymIdx].y = turnPts[j].y;
					break;
				}
		}

		drawBackground();
		drawCurve(drawnPoints, [0, 155, 255]);
		drawSymbol(symbols, 255);
		isMoveSymbol = false;
	} else {
		if (drawnPtsPartial.length == 0) return;
		var drawBez = genericBezier(sample(drawnPtsPartial));
		if (drawBez.length > 0) drawnPoints.push(drawBez);

		drawBackground();
		drawCurve(drawnPoints, [0, 155, 255]);
		drawSymbol(symbols, 255);
	}
}


	










