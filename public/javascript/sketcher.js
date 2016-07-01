// provide sketch interface and collect drawn data points from user.

// drawing coefficients
var gridWidth = 30;
var strkWeight = 2;
var padding = 15;

// point collection
var drawnPtsPartial;
var drawnPoints = [];

// for moving curve
var movedPtsIdx;
var isMoveCurve;
var prevMousePt;


function setup() {
	createCanvas(600, 600);
	noLoop();
	cursor(CROSS);
	drawBackground();
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
	var rightMargin = width - padding;

	beginShape();
	vertex(leftMargin, height/2);
	vertex(rightMargin, height / 2);
	vertex(rightMargin - 10, height / 2 - 5);
	vertex(rightMargin, height / 2);
	vertex(rightMargin - 10, height / 2 + 5);
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
	var bottomMargin = height - padding;

	beginShape();
	vertex(width/2, bottomMargin);
	vertex(width/2, upMargin);
	vertex(width/2 - 5, upMargin + 10);
	vertex(width/2, upMargin);
	vertex(width/2 + 5, upMargin + 10);
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
	translate(0, height / 2);
	var num = height / (gridWidth * 2);
	for (var i = 0; i < num; i++) {
		line(0, -i*gridWidth, width, -i*gridWidth);
		line(0, i*gridWidth, width, i*gridWidth);
	}
	pop();

	push();
	translate(width / 2, 0);
	var num = width / (gridWidth * 2);
	for (var i = 0; i < num; i++) {
		line(-i*gridWidth, 0, -i*gridWidth, height);
		line(i*gridWidth, 0, i*gridWidth, height);
	}
	pop();

	pop();
}

function drawLabel() {
	push();

	textSize(16);
	stroke(0);
	strokeWeight(1);

	text("O", width/2 - 15, height/2 + 15);
	text("x", width - 12, height/2 + 15);
	text("y", width/2 + 5, 12);

	pop();
}

function drawScale() {
	var len = 3;

	push();
	strokeWeight(1);
	stroke(0);
	textSize(12);

	push();
	translate(0, height / 2);
	var num = height / (gridWidth * 2);
	for (var i = 1; i < num; i++) {
		line(width/2 -len, -i*gridWidth, width/2 + len, -i*gridWidth);
		line(width/2 - len, i*gridWidth, width/2 + len, i*gridWidth);
		text(i, width/2 + 5, -i * gridWidth + 5);
		text(-i, width/2 + 5, i * gridWidth + 5);
	}
	pop();

	push();
	translate(width / 2, 0);
	var num = width / (gridWidth * 2);
	for (var i = 1; i < num; i++) {
		line(-i*gridWidth, height/2 - len, -i*gridWidth, height / 2 + len);
		line(i*gridWidth, height/2 - len, i*gridWidth, height /2 + len);
		text(-i, -i * gridWidth - 5, height / 2 + 15);
		text(i, i * gridWidth - 5, height / 2 + 15);
	}
	pop();

	pop();
}

function drawButton() {
	var buttonClear = createButton('clear');
	buttonClear.position(width - 50, padding);
	buttonClear.mousePressed(function() {
		drawBackground();
		drawnPoints = [];
	});

	var buttonTest = createButton("test");
	buttonTest.position(width - 50, padding+20);
	buttonTest.mousePressed(function() {
		send(drawnPoints);
	});
}

function drawCurve(pts, color) {
	if (pts.length == 0) return;

	if (pts[0] instanceof Array) {
		for (var i = 0; i < pts.length; i++)
			drawCurve(pts[i], color);
	}

	push();
	stroke(color);
	strokeWeight(strkWeight);
	for (var i = 1; i < pts.length; i++) {
		line(pts[i-1].x, pts[i-1].y, pts[i].x, pts[i].y);
	}
	pop();

	drawKnots(findInterceptX(pts));
	drawKnots(findInterceptY(pts));
	drawKnots(findTurningPts(pts));
}

function drawKnots(pts, color) {
	var radius = 8;

	push();
	fill(255);
	stroke(100);
	strokeWeight(1);

	for (var i = 0; i < pts.length; i++) {
		ellipse(pts[i].x, pts[i].y, radius, radius);
	}
	pop();
}


function mouseDragged() {
	if (!isMoveCurve) {
		var current = new Point(mouseX, mouseY);
	
		push();
		stroke(0, 155, 255);
		strokeWeight(strkWeight);
		if (drawnPtsPartial.length > 0) {
			var prev = drawnPtsPartial[drawnPtsPartial.length - 1];
			line(prev.x, prev.y, current.x, current.y);
		}
		pop();

		drawnPtsPartial.push(current);	
	} else {
		var current = new Point(mouseX, mouseY);
		var dx = current.x - prevMousePt.x;
		var dy = current.y - prevMousePt.y;
		drawnPoints[movedPtsIdx] = transform(drawnPoints[movedPtsIdx], 1, 1, dx, dy);
		prevMousePt = current;

		drawBackground();
		for (var i = 0; i < drawnPoints.length; i++) {
			if (i == movedPtsIdx) {
				drawCurve(drawnPoints[i], [135]);
			} else {
				drawCurve(drawnPoints[i], [0, 155, 255]);
			}
		}
	}

}

function mousePressed() {
	var p = new Point(mouseX, mouseY);
	for (var i = 0; i < drawnPoints.length; i++) {
		var pts = drawnPoints[i];
		for (var j = 0; j < pts.length; j++) {
			if (getDist(pts[j], p) < 10) {
				movedPtsIdx = i;
				isMoveCurve = true;
				prevMousePt = p;
				drawCurve(drawnPoints[i], [135]);
				return false;
			}
		}
	}

	isMoveCurve = false;
	drawnPtsPartial = [];
}

function mouseReleased() {
	if (!isMoveCurve) {
		if (drawnPtsPartial.length == 0) return;
		var drawBez = genericBezier(sample(drawnPtsPartial));
		if (drawBez.length > 0) drawnPoints.push(drawBez);

		drawBackground();
		drawCurve(drawnPoints, [0, 155, 255]);
	} else {
		drawCurve(drawnPoints[movedPtsIdx], [0, 155, 255]);
		isMoveCurve = false;
	}
}


	










