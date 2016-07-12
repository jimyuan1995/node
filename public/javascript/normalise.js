// examine the correctness of graph.

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
		var ny = (pts[i].y - canvasHeight/2) / maxY;
		normalisedPts.push(createPoint(nx, ny));
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
		normalisedPts.push(createPoint(nx, ny));
	}

	return normalisedPts;
}

function drawNormalisedShape(pts) {
	pts = normalise_shape(pts);
	for (var j = 0; j < pts.length; j++) {
		pts[j].x = pts[j].x * 200 + 200;
		pts[j].y = pts[j].y * 200 + 200; 
	}
	drawCurve(pts, [255, 255, 0]);
}

function drawNormalisedPosition(pts) {
	pts = normalise_position(pts);
	for (var j = 0; j < pts.length; j++) {
		pts[j].x = pts[j].x * 100 + 300;
		pts[j].y = pts[j].y * 100 + 300; 
	}
	drawCurve(pts, [255, 51, 51]);
	normalise_test(testPtss[0], drawnPtss[0], normalise_position);
}

function normalise_test(testPts, drawnPts, normalise) {
	var normDegree = 3;

	function findError(pts1, pts2) {
		var err = 0;
		for (var i = 0; i < pts1.length; i++) {
			err += Math.pow(getDist(pts1[i], pts2[i]), normDegree);
		}
	 	return Math.pow(err, 1 / normDegree) / pts1.length;
	}

	if ((testPts[1].x - testPts[0].x) * (drawnPts[1].x - drawnPts[0].x) < 0)
		drawnPts.reverse();

	var err = findError(normalise(testPts), normalise(drawnPts));
	
	// testPtss.reverse();
	// var err2 = findError(normalise(testPtss), normalise(drawnPtss));
	// var err = Math.min(err1, err2);
	
	console.log(err);
	
}















