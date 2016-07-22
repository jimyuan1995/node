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

var action = undefined;

var freeSymbols;

// canvas coefficients
var canvasHeight = 600,
	canvasWidth = 600,
	gridWidth = 50,
	strkWeight = 1.5,
	padding = 15;
	
var colors = [[93,165,218], [250,164,58], [96,189,104], [241,124,176], [241,88,84], [178,118,178]];
	
// point collection
var drawnPts = [],
	curves = [];

// for moving curve
var prevMousePt,
	movedCurveIdx;

// for moving symbols
var movedSymbol;

var checkPointsUndo = [],
	checkPointsRedo = [];


// run in the beginning by p5 library
function setup() {
	createCanvas(canvasWidth, canvasHeight).position(50,50);

	noLoop();
	cursor(CROSS);
	
	drawBackground();
	refreshFreeSymbols();
	drawSymbols(freeSymbols);
	drawButton();
}

function drawBackground() {

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
		strokeWeight(0.5);
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

	clear();
	background(255);
	drawGrid();
	drawHorizontalAxis();
	drawVerticalAxis();
	drawLabel();
}


// given a set of points, draw the corresponding curve.
function drawCurve(curve, color) {
	if (color == undefined) 
		color = curve.color;

	push();
	stroke(color);
	strokeWeight(strkWeight);

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

}

function drawCurves(curves, color) {
	for (var i = 0; i < curves.length; i++)
		drawCurve(curves[i], color);	
}


// given a set of points, draw the corresponding points (knots).
function drawKnot(knot, color) {
	if (color == undefined) 
		color = [77,77,77];

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
	// if input has multiple points
	for (var i = 0; i < knots.length; i++) {
		// var dup = false;
		// for (var j = 0; j < i; j++) 
		// 	if (getDist(knots[i], knots[j]) < 3) 
		// 		dup = true;
		// if (!dup) drawKnots(knots[i], color);
		drawKnot(knots[i], color);
	}	
}

// draw symbols, e.g. "A", "B".
function drawSymbol(symbol, color) {
	if (color == undefined) color = [77,77,77];
	
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


function refreshFreeSymbols() {
	var start = 15, 
		separation = 30;

	for (var i = 0; i < freeSymbols.length; i++) {
		var symbol = freeSymbols[i];
		symbol.x = start + i * separation;
		symbol.y = start;
	}
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
		maxima[i].x += dx;
		maxima[i].y += dy;
		if (maxima[i].symbol != undefined) {
			maxima[i].symbol.x += dx;
			maxima[i].symbol.y += dy;
		}
	}

	var minima = curve.minima;
	for (var i = 0; i < minima.length; i++) {
		minima[i].x += dx;
		minima[i].y += dy;
		if (minima[i].symbol != undefined) {
			minima[i].symbol.x += dx;
			minima[i].symbol.y += dy;
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

	refreshFreeSymbols();
	return;
}


function mousePressed() {
	var current = createPoint(mouseX, mouseY);
	if (current.x < 0 || current.x > canvasWidth || current.y < 0 || current.y > canvasHeight) return;
	
	action = undefined;

	var checkPoint = {};
	checkPoint.freeSymbolsJSON = JSON.stringify(freeSymbols);
	checkPoint.curvesJSON = JSON.stringify(curves);
	checkPointsUndo.push(checkPoint);
	checkPointsRedo = [];

	for (var i = 0; i < freeSymbols.length; i++) {
		if (getDist(current, freeSymbols[i]) < 10) {
			movedSymbol = freeSymbols[i];
			freeSymbols.splice(i, 1);
			action = "MOVE_SYMBOL"
			return;
		}
	}

	for (var i = 0; i < curves.length; i++) {
		var interX = curves[i]['interX'];
		for (var j = 0; j < interX.length; j++) {
			if (interX[j].symbol != undefined && getDist(current, interX[j]) < 10) {
				movedSymbol = interX[j].symbol;
				interX[j].symbol = undefined;
				action = "MOVE_SYMBOL"
				return;
			}
		}

		var interY = curves[i]['interY'];
		for (var j = 0; j < interY.length; j++) {
			if (interY[j].symbol != undefined && getDist(current, interY[j]) < 10) {
				movedSymbol = interY[j].symbol;
				interY[j].symbol = undefined;
				action = "MOVE_SYMBOL"
				return;
			}
		}

		var maxima = curves[i]['maxima'];
		for (var j = 0; j < maxima.length; j++) {
			if (maxima[j].symbol != undefined && getDist(current, maxima[j]) < 10) {
				movedSymbol = maxima[j].symbol;
				maxima[j].symbol = undefined;
				action = "MOVE_SYMBOL"
				return;
			}
		}

		var minima = curves[i]['minima'];
		for (var j = 0; j < minima.length; j++) {
			if (minima[j].symbol != undefined && getDist(current, minima[j]) < 10) {
				movedSymbol = minima[j].symbol;
				minima[j].symbol = undefined;
				action = "MOVE_SYMBOL"
				return;
			}
		}
	}


	for (var i = 0; i < curves.length; i++) {
		var pts = curves[i].pts;
		for (var j = 0; j < pts.length; j++) {
			if (getDist(pts[j], current) < 10) {
				movedCurveIdx = i;
				action = "MOVE_CURVE"
				prevMousePt = current;
				drawCurve(curves[i], [135]);
				return;
			}
		}
	}

	if (curves.length < colors.length) {
		action = "DRAW_CURVE";
	} else {
		alert("Too much lines being drawn.");
	}
	
}

function mouseDragged() {
	var current = createPoint(mouseX, mouseY);

	if (action == "MOVE_CURVE") {
		var dx = current.x - prevMousePt.x;
		var dy = current.y - prevMousePt.y;
		transCurve(curves[movedCurveIdx], dx, dy);
		prevMousePt = current;

		drawBackground();
		for (var i = 0; i < curves.length; i++) {
			if (i == movedCurveIdx) {
				drawCurve(curves[i], 135);
			} else {
				drawCurve(curves[i]);
			}
		}
		drawSymbols(freeSymbols);


	} else if (action == "MOVE_SYMBOL") {
		movedSymbol.x = current.x;
		movedSymbol.y = current.y;

		drawBackground();
		drawCurves(curves);
		drawSymbols(freeSymbols);
		drawSymbol(movedSymbol, 151);

		for (var i = 0; i < curves.length; i++) {
			var interX = curves[i]['interX'];
			for (var j = 0; j < interX.length; j++) {
				if (interX[j].symbol == undefined && getDist(current, interX[j]) < 10) {
					drawKnot(interX[j], 151);
					return;
				}
			}

			var interY = curves[i]['interY'];
			for (var j = 0; j < interY.length; j++) {
				if (interY[j].symbol == undefined && getDist(current, interY[j]) < 10) {
					drawKnot(interY[j], 151);
					return;
				}
			}

			var maxima = curves[i]['maxima'];
			for (var j = 0; j < maxima.length; j++) {
				if (maxima[j].symbol == undefined && getDist(current, maxima[j]) < 10) {
					drawKnot(maxima[j], 151);
					return;
				}
			}

			var minima = curves[i]['minima'];
			for (var j = 0; j < minima.length; j++) {
				if (minima[j].symbol == undefined && getDist(current, minima[j]) < 10) {
					drawKnot(minima[j], 151);
					return;
				}
			}
		}

	} else if (action == "DRAW_CURVE") {
		push();
		stroke(colors[curves.length]);
		strokeWeight(strkWeight);
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

	if (action == "MOVE_CURVE") {
		drawCurve(curves[movedCurveIdx]);
	} else if (action == "MOVE_SYMBOL") {		
		var found = false;
		var knot = undefined;

		for (var i = 0; i < curves.length; i++) {
			var interX = curves[i]['interX'];
			for (var j = 0; j < interX.length; j++) {
				if (interX[j].symbol == undefined && getDist(current, interX[j]) < 10) {
					knot = interX[j];
					found = true;
					break;
				}
			}
			if (found) break;

			var interY = curves[i]['interY'];
			for (var j = 0; j < interY.length; j++) {
				if (interY[j].symbol == undefined && getDist(current, interY[j]) < 10) {
					knot = interY[j];
					found = true;
					break;
				}
			}
			if (found) break;

			var maxima = curves[i]['maxima'];
			for (var j = 0; j < maxima.length; j++) {
				if (maxima[j].symbol == undefined && getDist(current, maxima[j]) < 10) {
					knot = maxima[j];
					found = true;
					break;
				}
			}
			if (found) break;


			var minima = curves[i]['minima'];
			for (var j = 0; j < minima.length; j++) {
				if (minima[j].symbol == undefined && getDist(current, minima[j]) < 10) {
					knot = minima[j];
					found = true;
					break;
				}
			}
			if (found) break;
		}

		if (found) {
			movedSymbol.x = knot.x;
			movedSymbol.y = knot.y;
			knot.symbol = movedSymbol;
		} else {
			freeSymbols.push(movedSymbol);
		}

		drawBackground();
		drawCurves(curves);
		refreshFreeSymbols();
		drawSymbols(freeSymbols);
				
	} else if (action == "DRAW_CURVE") {
		// neglect if curve drawn is too short
		if (sample(drawnPts).length < 3) return;

		if (Math.abs(drawnPts[0].y - canvasHeight/2) < 5) 
			drawnPts[0].y = canvasHeight/2;
		if (Math.abs(drawnPts[0].x - canvasWidth/2) < 5) 
			drawnPts[0].x = canvasWidth/2;
		if (Math.abs(drawnPts[drawnPts.length - 1].y - canvasHeight/2) < 5) 
			drawnPts[drawnPts.length - 1].y = canvasHeight/2;
		if (Math.abs(drawnPts[drawnPts.length - 1].x - canvasWidth/2) < 5) 
			drawnPts[drawnPts.length - 1].x = canvasWidth/2;

	
		var pts = genericBezier(sample(drawnPts));
		var curve = {};
		curve.pts = pts;
		curve.interX = findInterceptX(pts);
		curve.interY = findInterceptY(pts);
		curve.maxima = findMaxima(pts);
		curve.minima = findMinima(pts);
		curve.color = colors[curves.length];
		curves.push(curve);


		drawnPts = [];
		drawBackground();
		drawCurves(curves);
		refreshFreeSymbols();
		drawSymbols(freeSymbols);
	}

	action = undefined;
	return;
}




	










