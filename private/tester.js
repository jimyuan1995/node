// examine the correctness of graph.

var func = require('./func');
var fs = require('fs');

var canvasHeight;
var canvasWidth;
var error_tolerance_position = 0.015;
var error_tolerance_shape = 0.01;
var normDegree = 3;

function findError(pts1, pts2) {
	var err = 0;
	for (var i = 0; i < pts1.length; i++) {
		err += Math.pow(func.getDist(pts1[i], pts2[i]), normDegree);
	}
 	return Math.pow(err, 1 / normDegree) / pts1.length;
}

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


function normalise_test(testPoints, drawnPoints, normalise, error_tolerance) {
	var err1 = findError(normalise(testPoints), normalise(drawnPoints));
	
	testPoints.reverse();
	var err2 = findError(normalise(testPoints), normalise(drawnPoints));
	
	var err = Math.min(err1, err2);
	console.log(err);
	if (err > error_tolerance) return false
		else return true;
}

function testSpecialPts(testPoints, drawnPoints) {
	function inner(pts1, pts2) {
		if (pts1.length != pts2.length) return false;
		if (pts1.length == 0) return true;

		for (var i = 0; i < pts1.length; i++)
			if ((pts1[i].x - canvasWidth/2) * (pts2[i].x - canvasWidth/2) < 0 || (pts1[i].y - canvasHeight/2) * (pts2[i].y - canvasHeight/2) < 0) 
				return false;

		return true;
	}

	//if (!inner(func.findInterceptX(testPoints), func.findInterceptX(drawnPoints))) return false;
	//if (!inner(func.findInterceptY(testPoints), func.findInterceptY(drawnPoints))) return false;
	// if (!inner(func.findTurningPts(testPoints), func.findTurningPts(drawnPoints))) return false;
	return true;
}

function testSymbols(testSyms, drawnSyms) {
	var isSame = true;
	for (var i = 0; i < testSyms.length; i++) {
		if (testSyms[i].text != drawnSyms[i].text) isSame = false
		else if (testSyms[i].bindCurveIdx != drawnSyms[i].bindCurveIdx) isSame = false
		else if (testSyms[i].category != drawnSyms[i].category) isSame = false;
		if (!isSame) break;
	}
	if (isSame) return true
		else return false;
}

function compare(pts1, pts2) {
	function findMinX(pts) {
		if (pts.length == 0) return 0;
		var min = canvasWidth;
		for (var i = 0; i < pts.length; i++) 
			min = Math.min(min, pts[i].x);
		return min;
	}
	if (findMinX(pts1) < findMinX(pts2)) {
		return -1;
	} else if (findMinX(pts1) === findMinX(pts2)) {
		return 0;
	} else {
		return 1;
	}
}


function test(req, res) {
	console.log('------------')
	console.log("Request handler 'test' was called.");

	// extract canvasHeight and canvasWidth from http request
	canvasWidth = JSON.parse(req.query.canvasWidth);
	canvasHeight = JSON.parse(req.query.canvasHeight);
	
	// share with func module
	func.canvasWidth = canvasWidth;
	func.canvasHeight = canvasHeight;

	// extract data
	var data = JSON.parse(req.query.data);
	var drawnSyms = data['symbols'];
	var drawnPoints = data['points'];

	// extract testPoints and symbols from file on server
	var data = fs.readFileSync(__dirname + "/" + "testPoints.json");
	data = JSON.parse(data);
	testSyms = data['symbols'];
	testPoints = data['points'];

	// test
	var isCorrect = true;

	if (testPoints.length != drawnPoints.length) {
		isCorrect = false;
		console.log("fail 'number of segments' test");
	} else {
		console.log("pass 'number of segments' test");
	}

	if (isCorrect) {
		if (!testSymbols(testSyms, drawnSyms)) {
			isCorrect = false;
			console.log("fail 'symbol' test");
		} else {
			console.log("pass 'symbol' test");
		}
	}
		
	if (isCorrect) {
		testPoints = testPoints.sort(compare);
		drawnPoints = drawnPoints.sort(compare);

		for (var i = 0; i < testPoints.length; i++) {

			// test position
			if (!normalise_test(testPoints[i], drawnPoints[i], normalise_position, error_tolerance_position)) {
				isCorrect = false;
				console.log('segment ' + (i+1) + " fail 'position' test");
			} else {
				console.log('segment ' + (i+1) + " pass 'position' test");
			}

			// test shape
			if (!normalise_test(testPoints[i], drawnPoints[i], normalise_shape, error_tolerance_shape)) {
				isCorrect = false;
				console.log('segment ' + (i+1) + " fail 'shape' test");
			} else {
				console.log('segment ' + (i+1) + " pass 'shape' test");
			}

			// test special points
			if (!testSpecialPts(testPoints[i], drawnPoints[i])) {
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










