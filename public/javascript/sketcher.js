/**
 * Copyright 2016 Junwei Yuan
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var cnv;

var key = undefined;
var lineStart;

// canvas coefficients
var canvasHeight = 600,
	canvasWidth = 600;

var GRID_WIDTH = 50,
	CURVE_STRKWEIGHT = 1.5,
	PADDING = 0.025 * canvasWidth,
	DOT_LINE_STEP = 5,
	MOUSE_DETECT_RADIUS = 10;
	
var CURVE_COLORS = [[93,165,218], [250,164,58], [96,189,104], [241,124,176], [241,88,84], [178,118,178]],
	KNOT_COLOR = [77,77,77],
	DOT_LINE_COLOR = [123],
	MOVE_LINE_COLOR = [135],
	MOVE_SYMBOL_COLOR = [151],
	KNOT_DETECT_COLOR = [151];

// action recorder
var action = undefined,
	drawMode,
	isMouseDragged;

var freeSymbols = [],
	curves = [];

// for drawing curve
var drawnPts = [],
	drawnColorIdx;

// for moving curve
var prevMousePt,
	movedCurveIdx;

// for moving symbols
var movedSymbol,
	bindedKnot,
	symbolType;

var clickedKnot = null;

// for redo and undo
var checkPoint,
	checkPointsUndo = [],
	checkPointsRedo = [];

var junkPt = createPoint(canvasWidth - 25, 25);

function initiateFreeSymbols() {
	freeSymbols = [];
	freeSymbols.push(createSymbol('A'));
	freeSymbols.push(createSymbol('B'));
	freeSymbols.push(createSymbol('C'));
}

function refreshFreeSymbols() {
	var start = 15, 
		separation = 30;

	for (var i = 0; i < freeSymbols.length; i++) {
		var symbol = freeSymbols[i];
		symbol.x = start + i * separation;
		symbol.y = start;
	}
}

// run in the beginning by p5 library
function setup() {
	// p5.createCanvas
	cnv = createCanvas(canvasWidth, canvasHeight).position(50,50);

	noLoop();
	cursor(CROSS);

	initiateFreeSymbols();

	reDraw();
	drawButton();
}

function drawBackground() {

	function drawHorizontalAxis() {
		// p5.strokeWeight, p5.strokeJoin, p5.ROUND, p5.stroke, p5.noFill, p5.beginShape, p5.vertex, p5.endShape, p5.push, p5.pop
		push();
		
		strokeWeight(CURVE_STRKWEIGHT);
		strokeJoin(ROUND);
		stroke(0);
		noFill();

		var leftMargin = PADDING;
		var rightMargin = canvasWidth - PADDING;

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
		// p5.strokeWeight, p5.strokeJoin, p5.ROUND, p5.stroke, p5.noFill, p5.beginShape, p5.vertex, p5.endShape, p5.push, p5.pop

		push();
		
		strokeWeight(CURVE_STRKWEIGHT);
		strokeJoin(ROUND);
		stroke(0);
		noFill();

		var upMargin = PADDING;
		var bottomMargin = canvasHeight - PADDING;

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
		// p5.strokeWeight, p5.strokeJoin, p5.ROUND, p5.stroke, p5.translate, p5.line, p5.push, p5.pop
		push();

		noFill();
		strokeWeight(CURVE_STRKWEIGHT);
		strokeJoin(ROUND);
		stroke(215);

		push();
		translate(0, canvasHeight / 2);
		var num = canvasHeight / (GRID_WIDTH * 2);
		for (var i = 0; i < num; i++) {
			line(0, -i*GRID_WIDTH, canvasWidth, -i*GRID_WIDTH);
			line(0, i*GRID_WIDTH, canvasWidth, i*GRID_WIDTH);
		}
		pop();

		push();
		translate(canvasWidth / 2, 0);
		var num = canvasWidth / (GRID_WIDTH * 2);
		for (var i = 0; i < num; i++) {
			line(-i*GRID_WIDTH, 0, -i*GRID_WIDTH, canvasHeight);
			line(i*GRID_WIDTH, 0, i*GRID_WIDTH, canvasHeight);
		}
		pop();

		pop();
	}

	function drawLabel() {
		// p5.push, p5.textSize, p5.stroke, p5.strokeWeight, p5.fill, p5.text, p5.pop
		push();

		textSize(16);
		stroke(0);
		strokeWeight(0.5);
		fill(0);

		text("O", canvasWidth/2 - 15, canvasHeight/2 + 15);
		text("x", canvasWidth - 12, canvasHeight/2 + 15);
		text("y", canvasWidth/2 + 5, 12);

		pop();
	}

	// function drawScale() {
	// 	var len = 3;

	// 	push();
	// 	strokeWeight(1);
	// 	stroke(0);
	// 	textSize(12);

	// 	push();
	// 	translate(0, canvasHeight / 2);
	// 	var num = canvasHeight / (GRID_WIDTH * 2);
	// 	for (var i = 1; i < num; i++) {
	// 		line(canvasWidth/2 -len, -i*GRID_WIDTH, canvasWidth/2 + len, -i*GRID_WIDTH);
	// 		line(canvasWidth/2 - len, i*GRID_WIDTH, canvasWidth/2 + len, i*GRID_WIDTH);
	// 		text(i, canvasWidth/2 + 5, -i * GRID_WIDTH + 5);
	// 		text(-i, canvasWidth/2 + 5, i * GRID_WIDTH + 5);
	// 	}
	// 	pop();

	// 	push();
	// 	translate(canvasWidth / 2, 0);
	// 	var num = canvasWidth / (GRID_WIDTH * 2);
	// 	for (var i = 1; i < num; i++) {
	// 		line(-i*GRID_WIDTH, canvasHeight/2 - len, -i*GRID_WIDTH, canvasHeight / 2 + len);
	// 		line(i*GRID_WIDTH, canvasHeight/2 - len, i*GRID_WIDTH, canvasHeight /2 + len);
	// 		text(-i, -i * GRID_WIDTH - 5, canvasHeight / 2 + 15);
	// 		text(i, i * GRID_WIDTH - 5, canvasHeight / 2 + 15);
	// 	}
	// 	pop();

	// 	pop();
	// }



	// p5.clear, p5.background
	clear();
	background(255);
	drawGrid();
	drawHorizontalAxis();
	drawVerticalAxis();
	drawLabel();
}

// given a set of points, draw the corresponding curve.
function drawCurve(curve, color) {
	if (color == undefined) {
		color = CURVE_COLORS[curve.colorIdx];
	} 

	push();
	stroke(color);
	strokeWeight(CURVE_STRKWEIGHT);

	var pts = curve.pts;
	for (var i = 1; i < pts.length; i++) {
		line(pts[i-1].x, pts[i-1].y, pts[i].x, pts[i].y);
	}
	
	pop();

	// draw x intercepts, y intercepts and turning points
	drawKnots(curve['interX']);
	drawKnots(curve['interY']);
	drawKnots2(curve['maxima']);
	drawKnots2(curve['minima']);

}

function drawCurves(curves, color) {
	for (var i = 0; i < curves.length; i++) {
		drawCurve(curves[i], color);	
	}
}


// given a set of points, draw the corresponding points (knots).
function drawKnot(knot, color) {
	if (color == undefined) {
		color = KNOT_COLOR;
	}

	if (knot.symbol != undefined) {
		drawSymbol(knot.symbol);
	} else {
		push();
		noFill();
		stroke(color);
		strokeWeight(1.5);
		line(knot.x - 3, knot.y - 3, knot.x + 3, knot.y + 3);
		line(knot.x + 3, knot.y - 3, knot.x - 3, knot.y + 3);
		pop();
	}
}

function drawKnots(knots, color) {
	for (var i = 0; i < knots.length; i++) {
		drawKnot(knots[i], color);
	}	
}

function drawKnot2(knot) {
	drawKnot(knot);

	if (knot.xSymbol != undefined) {
		drawVerticalDotLine(knot.x, knot.y, canvasHeight/2);
		drawSymbol(knot.xSymbol);
	}

	if (knot.ySymbol != undefined) {
		drawHorizontalDotLine(knot.y, knot.x, canvasWidth/2);
		drawSymbol(knot.ySymbol);
	}
}

function drawKnots2(knots) {
	for (var i = 0; i < knots.length; i++) {
		drawKnot2(knots[i]);
	}	
}

function drawKnot3(knot) {
	if (knot == null) {
		return;
	}

	drawVerticalDotLine(knot.x, knot.y, canvasHeight/2);
	drawHorizontalDotLine(knot.y, knot.x, canvasWidth/2);

	if (knot.xSymbol != undefined) {
		drawSymbol(knot.xSymbol);
	} else {
		drawKnot(createPoint(knot.x, canvasHeight/2));
	}

	if (knot.ySymbol != undefined) {
		drawSymbol(knot.ySymbol);
	} else {
		drawKnot(createPoint(canvasWidth/2, knot.y));	
	}
}

// draw symbols, e.g. "A", "B".
function drawSymbol(symbol, color) {
	if (color == undefined) {
		color = KNOT_COLOR;
	}
	
	push();
	
	stroke(color);
	strokeWeight(1.5);
	noFill();
	line(symbol.x - 3, symbol.y - 3, symbol.x + 3, symbol.y + 3);
	line(symbol.x + 3, symbol.y - 3, symbol.x - 3, symbol.y + 3);	
	
	stroke(0);
	strokeWeight(0.5);
	fill(0);
	textSize(14);
	text(symbol.text, symbol.x - 4, symbol.y + 20);
	
	pop();
}

function drawSymbols(symbols, color) {	
	for (var i = 0; i < symbols.length; i++) {
		drawSymbol(symbols[i], color);
	}
}

function drawVerticalDotLine(x, begin, end) {
	if (x < 0 || x > canvasWidth) {
		return;
	}

	if (begin > end) {
		var tmp = begin;
		begin = end;
		end = tmp;
	}

	push();
	stroke(DOT_LINE_COLOR);
	strokeWeight(CURVE_STRKWEIGHT);

	var step = DOT_LINE_STEP;
	var toDraw = true;
	var y = begin;
	while (y + step < end) {
		if (toDraw) {
			line(x, y, x, y+step);
		}
		y += step;
		toDraw = !toDraw;
	}
	if (toDraw) {
		line(x, y, x, end);
	}

	pop();
}

function drawHorizontalDotLine(y, begin, end) {
	if (y < 0 || y > canvasHeight) {
		return;
	}

	if (begin > end) {
		var tmp = begin;
		begin = end;
		end = tmp;
	}

	push();
	stroke(DOT_LINE_COLOR);
	strokeWeight(CURVE_STRKWEIGHT);

	var step = DOT_LINE_STEP;
	var toDraw = true;
	var x = begin;
	while (x + step < end) {
		if (toDraw) {
			line(x, y, x+step, y);
		}
		x += step;
		toDraw = !toDraw;
	}
	if (toDraw) {
		line(x, y, end, y);
	}

	pop();
}



function drawJunkArea(color) {
	push();
	stroke(color)
	strokeWeight(10);
	line(junkPt.x - 15, junkPt.y - 15, junkPt.x + 15, junkPt.y + 15);
	line(junkPt.x + 15, junkPt.y - 15, junkPt.x - 15, junkPt.y + 15);	
	pop();
}

function reDraw() {
	drawBackground();
	drawCurves(curves);
	refreshFreeSymbols();
	drawSymbols(freeSymbols);
	drawKnot3(clickedKnot);
}

function findInterceptX(pts) {
	if (pts.length == 0) return [];

	var intercepts = [];

	if (pts[0].y == canvasHeight/2) intercepts.push(pts[0]);
	for (var i = 1; i < pts.length; i++) {
		if (pts[i].y == canvasHeight/2) {
			intercepts.push(createPoint(pts[i].x, pts[i].y));
			continue;
		}

		if ((pts[i-1].y - canvasHeight/2) * (pts[i].y - canvasHeight/2) < 0) {
			var dx = pts[i].x - pts[i-1].x;
			var dy = pts[i].y - pts[i-1].y;
			var grad = dy/dx;
			var esti = pts[i-1].x + (1 / grad) * (canvasHeight/2 - pts[i-1].y);
			intercepts.push(createPoint(esti, canvasHeight/2));
		}
	}

	return intercepts;
}

function findInterceptY(pts) {
	if (pts.length == 0) return [];

	var intercepts = [];

	if (pts[0].x == canvasWidth/2) intercepts.push(pts[0]);
	for (var i = 1; i < pts.length; i++) {
		if (pts[i].x == canvasWidth/2) {
			intercepts.push(createPoint(pts[i].x, pts[i].y));
			continue;
		}

		if ((pts[i-1].x - canvasWidth/2) * (pts[i].x - canvasWidth/2) < 0) {
			var dx = pts[i].x - pts[i-1].x;
			var dy = pts[i].y - pts[i-1].y;
			var grad = dy/dx;
			var esti = pts[i-1].y + grad * (canvasWidth/2 - pts[i-1].x);
			intercepts.push(createPoint(canvasWidth/2, esti));
		}
	}

	return intercepts;
}

function findTurnPts(pts, mode) {
	if (pts.length == 0) return [];

	var grad = [];
	for (var i = 0; i < pts.length - 1; i++) {
		var dx = pts[i+1].x - pts[i].x;
		var dy = pts[i+1].y - pts[i].y;
		grad.push(dy/dx);
	}

	var turnPts = [];

	for (var i = 1; i < grad.length; i++) {
		if (grad[i-1] != NaN && grad[i] != NaN) {
			if (grad[i] * grad[i-1] < 0 || grad[i] == 0) {
				if ((pts[i].x - pts[i-1].x) * (pts[i+1].x - pts[i].x) > 0) {
					var range = 30;
					var limit = 0.05;

					var l = i - 1;
		            while (l >= 0 && getDist(pts[l], pts[i]) < range && Math.abs(grad[l]) < limit) {
		                l--;
		            }
		            if (l < 0 || getDist(pts[l], pts[i]) >= range) {
		                continue;
		            }

		            var r = i;
		            while (r < grad.length && getDist(pts[i], pts[r + 1]) < range && Math.abs(grad[r]) < limit) {
		                r++;
		            }
		            if (r >= grad.length || getDist(pts[i], pts[r + 1]) >= range) {
		                continue;
		            }

		            var acc1 = grad[l];
		            var acc2 = grad[r];

					if (mode == 'maxima') {
						if ((pts[i].x > pts[i-1].x && acc1 < 0 && acc2 > 0) || (pts[i].x < pts[i-1].x && acc1 > 0 && acc2 < 0)) {
							turnPts.push(createPoint(pts[i].x, pts[i].y));
						} 
					} else {
						if ((pts[i].x > pts[i-1].x && acc1 > 0 && acc2 < 0) || (pts[i].x < pts[i-1].x && acc1 < 0 && acc2 > 0)) {
							turnPts.push(createPoint(pts[i].x, pts[i].y));
						} 
					}	
				}
			}
		}
	}

	return turnPts;
}		


// given a curve, translate the curve
function transCurve(curve, dx, dy) {
	var pts = curve.pts;
	for (var i = 0; i < pts.length; i++) {
		pts[i].x += dx;
		pts[i].y += dy;
	}

	function moveTurnPts(knots) {
		for (var i = 0; i < knots.length; i++) {
			var knot = knots[i];
			
			knot.x += dx;
			knot.y += dy;
			
			if (knot.symbol != undefined) {
				knot.symbol.x += dx;
				knot.symbol.y += dy;
			}

			if (knot.xSymbol != undefined) {
				knot.xSymbol.x = knot.x;
			}

			if (knot.ySymbol != undefined) {
				knot.ySymbol.y = knot.y;
			}
		}
	}

	var maxima = curve.maxima;
	moveTurnPts(maxima);

	var minima = curve.minima;
	moveTurnPts(minima);


	function moveInter(inter, newInter) {
		for (var i = 0; i < inter.length; i++) {
			if (inter[i].symbol != undefined) {
				var symbol = inter[i].symbol;

				var found = false,
					min = 50,
					knot;
				for (var j = 0; j < newInter.length; j++) {
					if (getDist(inter[i], newInter[j]) < min) {
						min = getDist(inter[i], newInter[j]);
						knot = newInter[j];
						found = true;
					}
				}

				if (found) {
					symbol.x = knot.x;
					symbol.y = knot.y;
					knot.symbol = symbol;
				} else {
					freeSymbols.push(symbol);
				}
			}
		}
		return newInter;
	}

	var interX = curve.interX,
		newInterX = findInterceptX(pts);
	curve.interX = moveInter(interX, newInterX);


	var interY = curve.interY,
		newInterY = findInterceptY(pts);
	curve.interY = moveInter(interY, newInterY);

	return;
}



function mousePressed() {
	var current = createPoint(mouseX, mouseY);
	isMouseDragged = false;
	action = undefined;
	drawMode = undefined;

	movedSymbol = undefined;
	bindedKnot = undefined;
	symbolType = undefined;

	drawnPts = [];
	drawnColorIdx = undefined;

	movedCurveIdx = undefined;
	prevMousePt = undefined;


	// does not react if mouse is outside canvas
	if (current.x < 0 || current.x > canvasWidth || current.y < 0 || current.y > canvasHeight) {
		return;
	}
	

	// record down current status, may be used later for undo.
	checkPoint = {};
	checkPoint.freeSymbolsJSON = JSON.stringify(freeSymbols);
	checkPoint.curvesJSON = JSON.stringify(curves);


	// check if it is to move a symbol
	for (var i = 0; i < freeSymbols.length; i++) {
		if (getDist(current, freeSymbols[i]) < MOUSE_DETECT_RADIUS) {
			movedSymbol = freeSymbols[i];
			freeSymbols.splice(i, 1);
			action = "MOVE_SYMBOL";
			return;
		}
	}

	var found = false;
	function detach1(knots) {
		if (found) {
			return;
		}
		for (var j = 0; j < knots.length; j++) {
			var knot = knots[j];
			if (knot.symbol != undefined && getDist(current, knot) < MOUSE_DETECT_RADIUS) {
				movedSymbol = knot.symbol;
				knot.symbol = undefined;
				bindedKnot = knot;
				symbolType = 'symbol';
				found = true;
			}
		}	
	}

	function detach2(knots) {
		if (found) {
			return;
		}
		detach1(knots);
		for (var j = 0; j < knots.length; j++) {
			var knot = knots[j];
			if (knot.xSymbol != undefined && getDist(current, knot.xSymbol) < MOUSE_DETECT_RADIUS) {
				movedSymbol = knot.xSymbol;
				knot.xSymbol = undefined;
				bindedKnot = knot;
				symbolType = 'xSymbol';
				found = true;
			}
			if (knot.ySymbol != undefined && getDist(current, knot.ySymbol) < MOUSE_DETECT_RADIUS) {
				movedSymbol = knot.ySymbol;
				knot.ySymbol = undefined;
				bindedKnot = knot;
				symbolType = 'ySymbol';
				found = true;
			}
		}
	}

	for (var i = 0; i < curves.length; i++) {
		var interX = curves[i]['interX'];
		detach1(interX);

		var interY = curves[i]['interY'];
		detach1(interY);

		var maxima = curves[i]['maxima'];
		detach2(maxima);

		var minima = curves[i]['minima'];
		detach2(minima);

		if (found) {
			break;
		}
	}

	if (found) {
		action = "MOVE_SYMBOL";
		return;
	}


	// check if it is moving curve.
	for (var i = 0; i < curves.length; i++) {
		var pts = curves[i].pts;
		for (var j = 0; j < pts.length; j++) {
			if (getDist(pts[j], current) < MOUSE_DETECT_RADIUS) {
				movedCurveIdx = i;
				action = "MOVE_CURVE";
				clickedKnot = null;
				prevMousePt = current;
				return;
			}
		}
	}


	// if it is drawing curve
	if (curves.length < CURVE_COLORS.length) {
		action = "DRAW_CURVE";

		if (keyIsPressed && key == "Shift") {
			console.debug("Draw Line");
			lineStart = current;
			drawMode = "line";
		} else {
			console.debug("Draw Curve");
			drawMode = "curve";
		}

		var alreadyUsedColors = [];
		for (var i = 0; i < curves.length; i++) {
			alreadyUsedColors.push(curves[i].colorIdx);
		}
		for (var i = 0; i < CURVE_COLORS.length; i++) {
			if (alreadyUsedColors.indexOf(i) == -1) {
				drawnColorIdx = i;
				return;
			}
		}

	} else {
		alert("Too much lines being drawn.");
		checkPointsUndo.pop();
	}
	
}

function mouseDragged() {
	isMouseDragged = true;
	var current = createPoint(mouseX, mouseY);

	if (action == "MOVE_CURVE") {
		var dx = current.x - prevMousePt.x;
		var dy = current.y - prevMousePt.y;
		transCurve(curves[movedCurveIdx], dx, dy);
		prevMousePt = current;

		reDraw();
		drawCurve(curves[movedCurveIdx], MOVE_LINE_COLOR);
		drawJunkArea(KNOT_COLOR);

		if (getDist(current, junkPt) < 15) {
			drawJunkArea(KNOT_DETECT_COLOR);
		}

	} else if (action == "MOVE_SYMBOL") {
		movedSymbol.x = current.x;
		movedSymbol.y = current.y;

		reDraw();
		drawSymbol(movedSymbol, MOVE_SYMBOL_COLOR);

		function detect(knots) {
			for (var j = 0; j < knots.length; j++) {
				if (knots[j].symbol == undefined && getDist(current, knots[j]) < MOUSE_DETECT_RADIUS) {
					drawKnot(knots[j], KNOT_DETECT_COLOR);
					return;
				}
			}
		}

		for (var i = 0; i < curves.length; i++) {
			var interX = curves[i]['interX'];
			detect(interX);

			var interY = curves[i]['interY'];
			detect(interY);

			var maxima = curves[i]['maxima'];
			detect(maxima);

			var minima = curves[i]['minima'];
			detect(minima);
		}


		if (clickedKnot != null) {
			var knot = clickedKnot;
			if (knot.xSymbol == undefined && getDist(current, createPoint(knot.x, canvasHeight/2)) < MOUSE_DETECT_RADIUS) {
				drawKnot(createPoint(knot.x, canvasHeight/2), KNOT_DETECT_COLOR);
				return;
			}
			if (knot.ySymbol == undefined && getDist(current, createPoint(canvasWidth/2, knot.y)) < MOUSE_DETECT_RADIUS) {
				drawKnot(createPoint(canvasWidth/2, knot.y), KNOT_DETECT_COLOR);
				return;
			}
		}
		

	} else if (action == "DRAW_CURVE") {
		if (drawMode == "curve") {
			push();
			stroke(CURVE_COLORS[drawnColorIdx]);
			strokeWeight(CURVE_STRKWEIGHT);
			if (drawnPts.length > 0) {
				var prev = drawnPts[drawnPts.length - 1];
				line(prev.x, prev.y, current.x, current.y);
			}
			pop();
			drawnPts.push(current);	
		} else {
			reDraw();

			push();
			stroke(CURVE_COLORS[drawnColorIdx]);
			strokeWeight(CURVE_STRKWEIGHT);
			line(lineStart.x, lineStart.y, current.x, current.y);
			pop();
		}
	}
}

function mouseReleased() {
	var current = createPoint(mouseX, mouseY);

	// if it is just a click
	if (!isMouseDragged) {
		return;
	}

	if (action == "MOVE_CURVE") {
		checkPointsUndo.push(checkPoint);
		checkPointsRedo = [];

		// for deletion
		if (getDist(current, junkPt) < 15) {
			var curve = (curves.splice(movedCurveIdx, 1))[0];

			function freeAllSymbols(knots) {
				for (var i = 0; i < knots.length; i++) {
					var knot = knots[i];
					if (knot.symbol != undefined) {
						freeSymbols.push(knot.symbol);
					}
					if (knot.xSymbol != undefined) {
						freeSymbols.push(knot.xSymbol);
					}
					if (knot.ySymbol != undefined) {
						freeSymbols.push(knot.ySymbol);
					}
				}
			}

			var interX = curve.interX;
			freeAllSymbols(interX);

			var interY = curve.interY;
			freeAllSymbols(interY);

			var maxima = curve.maxima;
			freeAllSymbols(maxima);

			var minima = curve.minima;
			freeAllSymbols(minima);	
		}
		
		reDraw();
	} else if (action == "MOVE_SYMBOL") {	
		checkPointsUndo.push(checkPoint);
		checkPointsRedo = [];

		var found = false;

		function attach(knots) {
			if (found) {
				return;
			}
			for (var j = 0; j < knots.length; j++) {
				var knot = knots[j];
				if (knot.symbol == undefined && getDist(current, knot) < MOUSE_DETECT_RADIUS) {
					movedSymbol.x = knot.x;
					movedSymbol.y = knot.y;
					knot.symbol = movedSymbol;
					found = true;
				}
			}
		}

		for (var i = 0; i < curves.length; i++) {
			var interX = curves[i]['interX'];
			attach(interX);

			var interY = curves[i]['interY'];
			attach(interY);

			var maxima = curves[i]['maxima'];
			attach(maxima);

			var minima = curves[i]['minima'];
			attach(minima);

			if (found) {
				break;
			}
		}

		if (clickedKnot != null && !found) {
			var knot = clickedKnot;
			if (knot.xSymbol == undefined && getDist(current, createPoint(knot.x, canvasHeight/2)) < MOUSE_DETECT_RADIUS) {
				movedSymbol.x = knot.x;
				movedSymbol.y = canvasHeight/2;
				knot.xSymbol = movedSymbol;
				found = true;
			} else if (knot.ySymbol == undefined && getDist(current, createPoint(canvasWidth/2, knot.y)) < MOUSE_DETECT_RADIUS) {
				movedSymbol.x = canvasWidth/2;
				movedSymbol.y = knot.y;
				knot.ySymbol = movedSymbol;
				found = true;
			}
		}

		if (!found) {
			freeSymbols.push(movedSymbol);
		}

		reDraw();
				
	} else if (action == "DRAW_CURVE") {

		if (drawMode == "curve") {
			// neglect if curve drawn is too short
			if (sample(drawnPts).length < 3) {
				return;
			}

			checkPointsUndo.push(checkPoint);
			checkPointsRedo = [];

			if (Math.abs(drawnPts[0].y - canvasHeight/2) < 3) {
				drawnPts[0].y = canvasHeight/2;
			}
			if (Math.abs(drawnPts[0].x - canvasWidth/2) < 3) {
				drawnPts[0].x = canvasWidth/2;
			}
			if (Math.abs(drawnPts[drawnPts.length - 1].y - canvasHeight/2) < 3) {
				drawnPts[drawnPts.length - 1].y = canvasHeight/2;
			}
			if (Math.abs(drawnPts[drawnPts.length - 1].x - canvasWidth/2) < 3) {
				drawnPts[drawnPts.length - 1].x = canvasWidth/2;
			}

			// sampler.sample, bezier.genericBezier

			var pts = genericBezier(sample(drawnPts));
			var curve = {};
			curve.pts = pts;
			curve.interX = findInterceptX(pts);
			curve.interY = findInterceptY(pts);
			curve.maxima = findTurnPts(pts, 'maxima');
			curve.minima = findTurnPts(pts, 'minima');
			curve.colorIdx = drawnColorIdx;
			curves.push(curve);

			reDraw();
		} else {
			checkPointsUndo.push(checkPoint);
			checkPointsRedo = [];

			var n = 100;
			var rx = current.x - lineStart.x;
			var ry = current.y - lineStart.y;
			var sx = rx / n;
			var sy = ry / n;
			var pts = [];
			for (var i = 0; i <= n; i++) {
				var x = lineStart.x + i * sx;
				var y = lineStart.y + i * sy;
				pts.push(createPoint(x, y));
			}

			var curve = {};

			curve.pts = pts;
			curve.interX = findInterceptX(pts);
			curve.interY = findInterceptY(pts);
			curve.maxima = [];
			curve.minima = [];
			curve.colorIdx = drawnColorIdx;
			curves.push(curve);

			reDraw();
		}
		
	}

	return;
}

function mouseClicked() {
	if (isMouseDragged) {
		return;
	}

	if (action  == "MOVE_SYMBOL") {
		if (bindedKnot == undefined) {
			freeSymbols.push(movedSymbol);
		} else {
			bindedKnot[symbolType] = movedSymbol;
		}
		reDraw();
	} else if (action == "MOVE_CURVE") {
		reDraw();
	}

	var current = createPoint(mouseX, mouseY);

	if (current.x < 0 || current.x > canvasWidth || current.y < 0 || current.y > canvasHeight) {
		return;
	}

	for (var i = 0; i < curves.length; i++) {
		var maxima = curves[i].maxima;
		for (var j = 0; j < maxima.length; j++) {
			var knot = maxima[j];
			if (getDist(current, knot) < MOUSE_DETECT_RADIUS) {
				if (knot == clickedKnot) {
					clickedKnot = null;
				} else {
					clickedKnot = knot;
				}
				reDraw();
				return;
			}
		}

		var minima = curves[i].minima;
		for (var j = 0; j < minima.length; j++) {
			var knot = minima[j];
			if (getDist(current, knot) < MOUSE_DETECT_RADIUS) {
				if (knot == clickedKnot) {
					clickedKnot = null;
				} else {
					clickedKnot = knot;
				}
				reDraw();
				return;
			}
		}
	}

	if (clickedKnot != null) {
		clickedKnot = null;
		reDraw();
	}

}

function keyPressed(e) {
	console.debug(e);
	key = e.key;
}

function keyReleased(e) {
	key = undefined;
}

function clone(obj) {
	var json = JSON.stringify(obj);
	return JSON.parse(json);
}

function encodeData() {

	if (canvasWidth > 5000 || canvasWidth <= 0) {
		alert("Invalid canvasWidth.");
		return;
	}

	if (canvasHeight > 5000 || canvasHeight <= 0) {
		alert("Invalid canvasHeight.");
		return;
	}

	var data = {};
	data.canvasWidth = canvasWidth;
	data.canvasHeight = canvasHeight;

	var clonedCurves = clone(curves);
	
	// sort segments according to their left most points.
	function compare(curve1, curve2) {
		function findMinX(pts) {
			if (pts.length == 0) return 0;
			var min = canvasWidth;
			for (var i = 0; i < pts.length; i++) 
				min = Math.min(min, pts[i].x);
			return min;
		}

		var min1 = findMinX(curve1.pts);
		var min2 = findMinX(curve2.pts);
		if (min1 < min2) return -1
		else if (min1 == min2) return 0
		else return 1;
	}
	clonedCurves.sort(compare);


	function normalise(pt) {
		var x = (pt.x - canvasWidth/2) / canvasWidth;
        var y = (canvasHeight/2 - pt.y) / canvasHeight;
        pt.x = Math.trunc(x * 10000) / 10000;
        pt.y = Math.trunc(y * 10000) / 10000;
	}

	function normalise1(knots) {
		for (var j = 0; j < knots.length; j++) {
			var knot = knots[j];
			normalise(knot);
			if (knot.symbol != undefined) {
				normalise(knot.symbol);
			}
		}
	}

	function normalise2(knots) {
		normalise1(knots);
		for (var j = 0; j < knots.length; j++) {
			var knot = knots[j];
			if (knot.xSymbol != undefined) {
				normalise(knot.xSymbol);
			}
			if (knot.ySymbol != undefined) {
				normalise(knot.ySymbol);
			}
		}
	}


	for (var i = 0; i < clonedCurves.length; i++) {
		var pts = clonedCurves[i].pts;
		for (var j = 0; j < pts.length; j++) {
			normalise(pts[j]);
		}

		var interX = clonedCurves[i].interX;
		normalise1(interX);

		var interY = clonedCurves[i].interY;
		normalise1(interY);

		var maxima = clonedCurves[i].maxima;
		normalise2(maxima);

		var minima = clonedCurves[i].minima;
		normalise2(minima);
	}

	data.curves = clonedCurves;

	var clonedFreeSymbols = clone(freeSymbols);
	for (var i = 0; i < clonedFreeSymbols.length; i++) {
		var symbol = clonedFreeSymbols[i];
		normalise(symbol);
	}
	data.freeSymbols = clonedFreeSymbols;

	return data;
}

function decodeData(data) {

	function denormalise(pt) {
			pt.x = pt.x * canvasWidth + canvasWidth/2;
			pt.y = canvasHeight/2 - pt.y * canvasHeight;
		}

	function denormalise1(knots) {
		for (var j = 0; j < knots.length; j++) {
			var knot = knots[j];
			denormalise(knot);
			if (knot.symbol != undefined) {
				denormalise(knot.symbol);
			}
		}
	}

	function denormalise2(knots) {
		denormalise1(knots);
		for (var j = 0; j < knots.length; j++) {
			var knot = knots[j];
			if (knot.xSymbol != undefined) {
				denormalise(knot.xSymbol);
			}
			if (knot.ySymbol != undefined) {
				denormalise(knot.ySymbol);
			}
		}
	}

	
	var curves = data.curves;
	for (var i = 0; i < curves.length; i++) {

		var pts = curves[i].pts;
		for (var j = 0; j < pts.length; j++) {
			denormalise(pts[j]);
		}

		var interX = curves[i].interX;
		denormalise1(interX);

		var interY = curves[i].interY;
		denormalise1(interY);

		var maxima = curves[i].maxima;
		denormalise2(maxima);

		var minima = curves[i].minima;
		denormalise2(minima);
	}

	var freeSymbols = data.freeSymbols;
	for (var j = 0; j < freeSymbols.length; j++) {
		denormalise(freeSymbols[j]);
	}
}

function newPrint(filename) {
	var path = "/Users/YUAN/Desktop/nodejs/public/json/" + filename;
	var data = encodeData();
	var params = "data=" + JSON.stringify(data) + "&filename=" + path;

	var url = '/print';
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url + "?" + params, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			alert(xhr.responseText);
		}
	}
	xhr.send();
}


function drawButton() {
	var upper = 20;
	var bottom = 680;

	var buttonTest = createButton("test");
	buttonTest.position(450, upper);
	buttonTest.mousePressed(function() {
		var params = 'data=' + JSON.stringify(encodeData()),
		url = "http://localhost:5000/test",
		xhr = new XMLHttpRequest();

		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var data = JSON.parse(xhr.responseText);
				console.log(data);
				alert(data['isCorrect'] + ": " + data['errCause']);
			}
		}
		xhr.send(params);
	});

	var buttonTestcase = createButton("show test case");
	buttonTestcase.position(50, bottom);
	buttonTestcase.mousePressed(function () {
		var url = '/json/test.json';
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var data = JSON.parse(xhr.responseText);
				decodeData(data);

				var freeSymbols = data.freeSymbols;
				var curves = data.curves;

				drawCurves(curves);
				drawSymbols(freeSymbols);
			}
		}
		xhr.send();
	});

	var buttonDrawnCase = createButton("show drawn case");
	buttonDrawnCase.position(150, bottom);
	buttonDrawnCase.mousePressed(function () {
		var url = '/json/drawn.json';
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var data = JSON.parse(xhr.responseText);
				decodeData(data);

				var freeSymbols = data.freeSymbols;

				var curves = data.curves;

				drawCurves(curves);
				drawSymbols(freeSymbols);
			}
		}
		xhr.send();
	});


	var buttonShape = createButton("custom");
	buttonShape.position(50, upper);
	buttonShape.mousePressed( function() {
		//
	});


	// redo and undo is essentially the reverse of each other.

	var buttonUndo = createButton("undo");
	buttonUndo.position(500, upper);
	buttonUndo.mousePressed(function() {
		if (checkPointsUndo.length == 0) {
			return;
		}

		var checkPointRedo = {};
		checkPointRedo.freeSymbolsJSON = JSON.stringify(freeSymbols);
		checkPointRedo.curvesJSON = JSON.stringify(curves);
		checkPointsRedo.push(checkPointRedo);

		var checkPointUndo = checkPointsUndo.pop();
		freeSymbols = JSON.parse(checkPointUndo.freeSymbolsJSON);
		curves = JSON.parse(checkPointUndo.curvesJSON);
		clickedKnot = null;
		
		reDraw();
	});

	var buttonRedo = createButton("redo");
	buttonRedo.position(550, upper);
	buttonRedo.mousePressed(function() {
		if (checkPointsRedo.length == 0) {
			return;
		}

		var checkPointUndo = {};
		checkPointUndo.freeSymbolsJSON = JSON.stringify(freeSymbols);
		checkPointUndo.curvesJSON = JSON.stringify(curves);
		checkPointsUndo.push(checkPointUndo);

		var checkPointRedo = checkPointsRedo.pop();
		freeSymbols = JSON.parse(checkPointRedo.freeSymbolsJSON);
		curves = JSON.parse(checkPointRedo.curvesJSON);
		clickedKnot = null;
		
		reDraw();
	});

	var buttonClear = createButton('clear');
	buttonClear.position(600, upper);
	buttonClear.mousePressed(function() {
		curves = [];
		clickedKnot = null;

		checkPointsUndo = [];
		checkPointsRedo = [];

		initiateFreeSymbols();
		reDraw();
	});

	var buttonPrintTest = createButton("print test case");
	buttonPrintTest.position(450, bottom);
	buttonPrintTest.mousePressed(function() {
		var data = encodeData();
		var params = "data=" + JSON.stringify(data);

		var url = '/print_test';
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url + "?" + params, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				alert(xhr.responseText);
			}
		}
		xhr.send();
	});

	var buttonPrintDrawn = createButton("print drawn case");
	buttonPrintDrawn.position(550, bottom);
	buttonPrintDrawn.mousePressed(function() {
		var data = encodeData();
		var params = "data=" + JSON.stringify(data);

		var url = '/print_drawn';
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url + "?" + params, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				alert(xhr.responseText);
			}
		}
		xhr.send();
	});
}

function mySave() {
	var mimeType = 'image/jpeg';
	var downloadMime = 'image/octet-stream';
    var imageData = $('#defaultCanvas0').toDataURL('image/jpeg', 0.1);
    console.log(imageData);

	 saveFrames("out", "png", 1, 1, function(data){
	    println(data);
	  });

}





