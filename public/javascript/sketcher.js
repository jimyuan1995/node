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



// canvas coefficients
var canvasHeight = 600,
	canvasWidth = 600,
	GRID_WIDTH = 50,
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
	isMouseDragged;

var freeSymbols;

// point collection
var drawnPts = [],
	curves = [];

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



// run in the beginning by p5 library
function setup() {
	createCanvas(canvasWidth, canvasHeight).position(50,50);

	noLoop();
	cursor(CROSS);

	reDraw();
	drawButton();
}

function drawBackground() {

	function drawHorizontalAxis() {
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
		color = curve.color;
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
	drawKnots(curve['maxima']);
	drawKnots(curve['minima']);
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

function reDraw() {
	drawBackground();
	drawCurves(curves);
	refreshFreeSymbols();
	drawSymbols(freeSymbols);
	drawKnot3(clickedKnot);
}

// given a curve, translate the curve
function transCurve(curve, dx, dy) {
	var pts = curve.pts;
	for (var i = 0; i < pts.length; i++) {
		pts[i].x += dx;
		pts[i].y += dy;
	}

	var maxima = curve.maxima;
	for (var i = 0; i < maxima.length; i++) {
		var knot = maxima[i];
		
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

	var minima = curve.minima;
	for (var i = 0; i < minima.length; i++) {
		var knot = minima[i];
		
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

	var interX = curve.interX,
		newInterX = findInterceptX(pts);
	for (var i = 0; i < interX.length; i++) {
		if (interX[i].symbol != undefined) {
			var symbol = interX[i].symbol;

			var found = false,
				min = 50,
				knot;
			for (var j = 0; j < newInterX.length; j++) {
				if (getDist(interX[i], newInterX[j]) < min) {
					min = getDist(interX[i], newInterX[j]);
					knot = newInterX[j];
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
	curve.interX = newInterX;

	var interY = curve.interY,
		newInterY = findInterceptY(pts);
	for (var i = 0; i < interY.length; i++) {
		if (interY[i].symbol != undefined) {
			var symbol = interY[i].symbol;

			var found = false,
				min = 50,
				knot;
			for (var j = 0; j < newInterY.length; j++) {
				if (getDist(interY[i], newInterY[j]) < min) {
					min = getDist(interY[i], newInterY[j]);
					knot = newInterY[j];
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
	curve.interY = newInterY;

	return;
}



function mousePressed() {
	var current = createPoint(mouseX, mouseY);
	mousePressedPt = current;
	isMouseDragged = false;
	action = undefined;
	movedSymbol = undefined;
	bindedKnot = undefined;
	symbolType = undefined;
	drawnPts = [];

	if (current.x < 0 || current.x > canvasWidth || current.y < 0 || current.y > canvasHeight) return;
	
	checkPoint = {};
	checkPoint.freeSymbolsJSON = JSON.stringify(freeSymbols);
	checkPoint.curvesJSON = JSON.stringify(curves);

	for (var i = 0; i < freeSymbols.length; i++) {
		if (getDist(current, freeSymbols[i]) < MOUSE_DETECT_RADIUS) {
			movedSymbol = freeSymbols[i];
			freeSymbols.splice(i, 1);
			action = "MOVE_SYMBOL";
			return;
		}
	}

	for (var i = 0; i < curves.length; i++) {
		var interX = curves[i]['interX'];
		for (var j = 0; j < interX.length; j++) {
			if (interX[j].symbol != undefined && getDist(current, interX[j]) < MOUSE_DETECT_RADIUS) {
				movedSymbol = interX[j].symbol;
				interX[j].symbol = undefined;
				bindedKnot = knot;
				symbolType = 'symbol';
				action = "MOVE_SYMBOL";
				return;
			}
		}

		var interY = curves[i]['interY'];
		for (var j = 0; j < interY.length; j++) {
			if (interY[j].symbol != undefined && getDist(current, interY[j]) < MOUSE_DETECT_RADIUS) {
				movedSymbol = interY[j].symbol;
				interY[j].symbol = undefined;
				bindedKnot = knot;
				symbolType = 'symbol';
				action = "MOVE_SYMBOL";
				return;
			}
		}

		var maxima = curves[i]['maxima'];
		for (var j = 0; j < maxima.length; j++) {
			var knot = maxima[j];

			if (knot.symbol != undefined && getDist(current, knot.symbol) < MOUSE_DETECT_RADIUS) {
				movedSymbol = knot.symbol;
				knot.symbol = undefined;
				bindedKnot = knot;
				symbolType = 'symbol';
				action = "MOVE_SYMBOL";
				return;
			}

			if (knot.xSymbol != undefined && getDist(current, knot.xSymbol) < MOUSE_DETECT_RADIUS) {
				movedSymbol = knot.xSymbol;
				knot.xSymbol = undefined;
				bindedKnot = knot;
				symbolType = 'xSymbol';
				action = "MOVE_SYMBOL";
				return;
			}

			if (knot.ySymbol != undefined && getDist(current, knot.ySymbol) < MOUSE_DETECT_RADIUS) {
				movedSymbol = knot.ySymbol;
				knot.ySymbol = undefined;
				bindedKnot = knot;
				symbolType = 'ySymbol';
				action = "MOVE_SYMBOL";
				return;
			}

		}

		var minima = curves[i]['minima'];
		for (var j = 0; j < minima.length; j++) {
			var knot = minima[j];

			if (knot.symbol != undefined && getDist(current, knot) < MOUSE_DETECT_RADIUS) {
				movedSymbol = knot.symbol;
				knot.symbol = undefined;
				bindedKnot = knot;
				symbolType = 'symbol';
				action = "MOVE_SYMBOL";
				return;
			}

			if (knot.xSymbol != undefined && getDist(current, knot.xSymbol) < MOUSE_DETECT_RADIUS) {
				movedSymbol = knot.xSymbol;
				knot.xSymbol = undefined;
				bindedKnot = knot;
				symbolType = 'xSymbol';
				action = "MOVE_SYMBOL";
				return;
			}

			if (knot.ySymbol != undefined && getDist(current, knot.ySymbol) < MOUSE_DETECT_RADIUS) {
				movedSymbol = knot.ySymbol;
				knot.ySymbol = undefined;
				bindedKnot = knot;
				symbolType = 'ySymbol';
				action = "MOVE_SYMBOL";
				return;
			}

		}

	}


	for (var i = 0; i < curves.length; i++) {
		var pts = curves[i].pts;
		for (var j = 0; j < pts.length; j++) {
			if (getDist(pts[j], current) < MOUSE_DETECT_RADIUS) {
				movedCurveIdx = i;
				action = "MOVE_CURVE";
				prevMousePt = current;
				drawCurve(curves[i], MOVE_LINE_COLOR);
				return;
			}
		}
	}

	if (curves.length < CURVE_COLORS.length) {
		action = "DRAW_CURVE";
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

	} else if (action == "MOVE_SYMBOL") {
		movedSymbol.x = current.x;
		movedSymbol.y = current.y;

		reDraw();
		drawSymbol(movedSymbol, MOVE_SYMBOL_COLOR);

		for (var i = 0; i < curves.length; i++) {
			var interX = curves[i]['interX'];
			for (var j = 0; j < interX.length; j++) {
				if (interX[j].symbol == undefined && getDist(current, interX[j]) < MOUSE_DETECT_RADIUS) {
					drawKnot(interX[j], KNOT_DETECT_COLOR);
					return;
				}
			}

			var interY = curves[i]['interY'];
			for (var j = 0; j < interY.length; j++) {
				if (interY[j].symbol == undefined && getDist(current, interY[j]) < MOUSE_DETECT_RADIUS) {
					drawKnot(interY[j], KNOT_DETECT_COLOR);
					return;
				}
			}

			var maxima = curves[i]['maxima'];
			for (var j = 0; j < maxima.length; j++) {
				var knot = maxima[j];
				if (knot.symbol == undefined && getDist(current, knot) < MOUSE_DETECT_RADIUS) {
					drawKnot(knot, KNOT_DETECT_COLOR);
					return;
				}
			}

			var minima = curves[i]['minima'];
			for (var j = 0; j < minima.length; j++) {
				var knot = minima[j];
				if (knot.symbol == undefined && getDist(current, knot) < MOUSE_DETECT_RADIUS) {
					drawKnot(knot, KNOT_DETECT_COLOR);
					return;
				}
			}
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
		push();
		stroke(CURVE_COLORS[curves.length]);
		strokeWeight(CURVE_STRKWEIGHT);
		if (drawnPts.length > 0) {
			var prev = drawnPts[drawnPts.length - 1];
			line(prev.x, prev.y, current.x, current.y);
		}
		pop();

		drawnPts.push(current);	
	}
}

function mouseReleased() {
	var current = createPoint(mouseX, mouseY);

	// if it is just a click
	if (!isMouseDragged) return;

	if (action == "MOVE_CURVE") {
		checkPointsUndo.push(checkPoint);
		checkPointsRedo = [];
		reDraw();
	} else if (action == "MOVE_SYMBOL") {	
		checkPointsUndo.push(checkPoint);
		checkPointsRedo = [];

		var found = false;

		for (var i = 0; i < curves.length; i++) {
			var interX = curves[i]['interX'];
			for (var j = 0; j < interX.length; j++) {
				if (interX[j].symbol == undefined && getDist(current, interX[j]) < MOUSE_DETECT_RADIUS) {
					knot = interX[j];
					movedSymbol.x = knot.x;
					movedSymbol.y = knot.y;
					knot.symbol = movedSymbol;
					found = true;
					break;
				}
			}
			if (found) break;

			var interY = curves[i]['interY'];
			for (var j = 0; j < interY.length; j++) {
				if (interY[j].symbol == undefined && getDist(current, interY[j]) < MOUSE_DETECT_RADIUS) {
					knot = interY[j];
					movedSymbol.x = knot.x;
					movedSymbol.y = knot.y;
					knot.symbol = movedSymbol;
					found = true;
					break;
				}
			}
			if (found) break;

			var maxima = curves[i]['maxima'];
			for (var j = 0; j < maxima.length; j++) {
				var knot = maxima[j];
				
				if (knot.symbol == undefined && getDist(current, knot) < MOUSE_DETECT_RADIUS) {
					movedSymbol.x = knot.x;
					movedSymbol.y = knot.y;
					knot.symbol = movedSymbol;
					found = true;
					break;
				}
			}
			if (found) break;


			var minima = curves[i]['minima'];
			for (var j = 0; j < minima.length; j++) {
				var knot = minima[j];
				
				if (knot.symbol == undefined && getDist(current, knot) < MOUSE_DETECT_RADIUS) {
					movedSymbol.x = knot.x;
					movedSymbol.y = knot.y;
					knot.symbol = movedSymbol;
					found = true;
					break;
				}
			}
			if (found) break;
		}

		if (clickedKnot != null) {
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
		// neglect if curve drawn is too short
		if (sample(drawnPts).length < 3) {
			return;
		}

		checkPointsUndo.push(checkPoint);
		checkPointsRedo = [];

		if (Math.abs(drawnPts[0].y - canvasHeight/2) < 0.01 * canvasWidth) {
			drawnPts[0].y = canvasHeight/2;
		}
		if (Math.abs(drawnPts[0].x - canvasWidth/2) < 0.01 * canvasWidth) {
			drawnPts[0].x = canvasWidth/2;
		}
		if (Math.abs(drawnPts[drawnPts.length - 1].y - canvasHeight/2) < 0.01 * canvasWidth) {
			drawnPts[drawnPts.length - 1].y = canvasHeight/2;
		}
		if (Math.abs(drawnPts[drawnPts.length - 1].x - canvasWidth/2) < 0.01 * canvasWidth) {
			drawnPts[drawnPts.length - 1].x = canvasWidth/2;
		}

	
		var pts = genericBezier(sample(drawnPts));
		var curve = {};
		curve.pts = pts;
		curve.interX = findInterceptX(pts);
		curve.interY = findInterceptY(pts);
		curve.maxima = findMaxima(pts);
		curve.minima = findMinima(pts);
		curve.color = CURVE_COLORS[curves.length];
		curves.push(curve);


		drawnPts = [];
		reDraw();
	}

	return;
}

function mouseClicked() {
	var current = createPoint(mouseX, mouseY);
	if (isMouseDragged) return;

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

	if (current.x < 0 || current.x > canvasWidth || current.y < 0 || current.y > canvasHeight) return;

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










