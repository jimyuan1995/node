// examine the correctness of graph.

var func = require('./func');
var fs = require('fs');

var canvasHeight;
var canvasWidth;
var error_tolerance_position = 0.02;
var error_tolerance_shape = 0.01;
var normDegree = 3;

function normalise_position(pts) {
	var maxY = 0, 
		maxX = 0;
	for (var i = 1; i < pts.length; i++) {
		maxY = Math.max(Math.abs(canvasHeight/2 - pts[i].y), maxY);
		maxX = Math.max(Math.abs(pts[i].x - canvasWidth/2), maxX);
	}
	
	var normalisedPts = [];
	for (var i = 0; i < pts.length; i++) {
		var nx = (pts[i].x - canvasWidth/2) / maxX;
		var ny = (canvasHeight/2 - pts[i].y) / maxY;
		normalisedPts.push(func.createPoint(nx, ny));
	}

	return normalisedPts;
}

function normalise_shape(pts) {
	var maxY = pts[0].y, 
		minY = pts[0].y, 
		maxX = pts[0].x, 
		minX = pts[0].x;

	for (var i = 1; i < pts.length; i++) {
		maxY = Math.max(pts[i].y, maxY);
		minY = Math.min(pts[i].y, minY);
		maxX = Math.max(pts[i].x, maxX);
		minX = Math.min(pts[i].x, minX);
	}

	var normalisedPts = [];
	var rangeX = maxX - minX;
	var rangeY = maxY - minY;

	for (var i = 0; i < pts.length; i++) {
		var nx = (pts[i].x - minX) / rangeX;
		var ny = (pts[i].y - minY) / rangeY;
		normalisedPts.push(func.createPoint(nx, ny));
	}

	return normalisedPts;
}



function normalise_test(testPts, drawnPts, normalise, error_tolerance) {
	
	function findError(pts1, pts2) {
		var err = 0;
		for (var i = 0; i < pts1.length; i++) {
			err += Math.pow(func.getDist(pts1[i], pts2[i]), normDegree);
		}
	 	return Math.pow(err, 1 / normDegree) / pts1.length;
	}

	// if ((testPts[1].x - testPts[0].x) * (drawnPts[1].x - drawnPts[0].x) < 0)
	// 	drawnPts.reverse();

	var err1 = findError(normalise(testPts), normalise(drawnPts));
	testPts.reverse();
	var err2 = findError(normalise(testPts), normalise(drawnPts));
	var err = Math.min(err1, err2);
	
	console.log(err);
	if (err > error_tolerance) return false
		else return true;
}

function testSpecialPts(testPts, drawnPts) {
	function inSameQuadrant(pts1, pts2) {
		if (pts1.length != pts2.length) return false;
		
		if (pts1.length == 0) return true;

		for (var i = 0; i < pts1.length; i++)
			if ((pts1[i].x - canvasWidth/2) * (pts2[i].x - canvasWidth/2) < 0 || (pts1[i].y - canvasHeight/2) * (pts2[i].y - canvasHeight/2) < 0) 
				return false;

		return true;
	}

	//if (!inner(func.findInterceptX(testPts), func.findInterceptX(drawnPts))) return false;
	//if (!inner(func.findInterceptY(testPts), func.findInterceptY(drawnPts))) return false;
	// if (!inner(func.findTurningPts(testPts), func.findTurningPts(drawnPts))) return false;
	if (!inSameQuadrant(func.findMaxima(testPts), func.findMaxima(drawnPts))) return false;
	if (!inSameQuadrant(func.findMinima(testPts), func.findMinima(drawnPts))) return false;
	return true;
}

function testSymbols(testSyms, drawnSyms) {
	var isSame = true;
	for (var i = 0; i < testSyms.length; i++) {
		if (testSyms[i].text != drawnSyms[i].text) isSame = false
		else if (testSyms[i].bindCurveIdx != drawnSyms[i].bindCurveIdx) isSame = false
		else if (testSyms[i].category != drawnSyms[i].category) isSame = false
		else if (testSyms[i].catIndex != drawnSyms[i].catIndex) isSame = false;
		if (!isSame) break;
	}
	if (isSame) return true
		else return false;
}


function test(req, res) {
	console.log('------------');
	console.log("Request handler 'test' was called.");

	// extract canvasHeight and canvasWidth from http request
	canvasWidth = JSON.parse(req.query.canvasWidth);
	canvasHeight = JSON.parse(req.query.canvasHeight);
	// share with func module
	func.canvasWidth = canvasWidth;
	func.canvasHeight = canvasHeight;

	// extract data
	// console.log(req.query.data);
	// var data = JSON.parse(req.query.data);
	// var drawnSyms = data['symbols'];
	// var drawnPtss = data['ptss'];



	// extract testPtss and symbols from file on server
	var data = fs.readFileSync('/Users/YUAN/Desktop/nodejs/public/json/test.json');
	data = JSON.parse(data);

	testSyms = data['symbols'];
	testPtss = data['ptss'];


	var data = fs.readFileSync('/Users/YUAN/Desktop/nodejs/public/json/drawn.json');
	data = JSON.parse(data);

	drawnSyms = data['symbols'];
	drawnPtss = data['ptss'];

	// test
	var isCorrect = true;

	if (!testSymbols(testSyms, drawnSyms)) {
		isCorrect = false;
		console.log("fail 'symbol' test");
	} else {
		console.log("pass 'symbol' test");
	}


	if (testPtss.length != drawnPtss.length) {
		isCorrect = false;
		console.log("fail 'number of segments' test");
	} else {
		console.log("pass 'number of segments' test");

		for (var i = 0; i < testPtss.length; i++) {

			// test position
			if (!normalise_test(testPtss[i], drawnPtss[i], normalise_position, error_tolerance_position)) {
				isCorrect = false;
				console.log('segment ' + (i+1) + " fail 'position' test");
			} else {
				console.log('segment ' + (i+1) + " pass 'position' test");
			}

			// test shape
			if (!normalise_test(testPtss[i], drawnPtss[i], normalise_shape, error_tolerance_shape)) {
				isCorrect = false;
				console.log('segment ' + (i+1) + " fail 'shape' test");
			} else {
				console.log('segment ' + (i+1) + " pass 'shape' test");
			}

			// test special points
			if (!testSpecialPts(testPtss[i], drawnPtss[i])) {
				isCorrect = false;
				console.log('segment ' + (i+1) + " fail 'points' test");
			} else {
				console.log('segment ' + (i+1) + " pass 'points' test");
			}

			// if (!isCorrect) break;
		}
	}

			
	res.set('Content-Type', 'text/html');
	if (isCorrect) {
		console.log('pass');
		res.send('pass');
	} else {
		console.log('fail');
		res.send('fail');
	}
}


exports.test = test;










