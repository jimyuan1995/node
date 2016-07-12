// offer support for front-end and back-end. 
// group auxiliary functions used in both sides.

var canvasWidth;
var canvasHeight;

function createPoint(x, y) {
	var obj = {};
	obj.x = x;
	obj.y = y;
	return obj;
}

// get distance between two points, pt1 and pt2.
function getDist(pt1, pt2) {
	return Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2));
}

function funcPts(func, begin, end) {
	var num = 200;
	var limit = 1;
	var step = (end - begin) / num;
	var pts = [];
	for (var x = begin; x < end; x += step) {
		pts.push(createPoint(x, func(x)));
	}
	return pts;
}

function findInterceptX(pts) {
	if (pts.length == 0) return [];

	var intercepts = [];

	if (pts[0].y == canvasHeight/2) intercepts.push(pts[0]);
	for (var i = 1; i < pts.length; i++) {
		// if pts[i] is the intercpet
		if (pts[i].y == canvasHeight/2) {
			intercepts.push(pts[i]);
			continue;
		}

		if ((pts[i-1].y - canvasHeight/2) * (pts[i].y - canvasHeight/2) < 0) {
			// use linear spline to estimate x of intercept
			var dx = pts[i].x - pts[i-1].x;
			var dy = pts[i].y - pts[i-1].y;
			var grad = dy/dx;
			var esti = pts[i-1].x + (1 / grad) * (canvasHeight/2 - pts[i-1].y);
			intercepts.push(new Point(esti, canvasHeight/2));
		}
	}

	return intercepts;
}

function findInterceptY(pts) {
	if (pts.length == 0) return [];

	var intercepts = [];

	if (pts[0].x == canvasWidth/2) intercepts.push(pts[0]);
	for (var i = 1; i < pts.length; i++) {
		// if pts[i] is the intercpet
		if (pts[i].x == canvasWidth/2) {
			intercepts.push(pts[i]);
			continue;
		}

		if ((pts[i-1].x - canvasWidth/2) * (pts[i].x - canvasWidth/2) < 0) {
			// use linear spline to estimate y of intercept.
			var dx = pts[i].x - pts[i-1].x;
			var dy = pts[i].y - pts[i-1].y;
			var grad = dy/dx;
			var esti = pts[i-1].y + grad * (canvasWidth/2 - pts[i-1].x);
			intercepts.push(new Point(canvasWidth/2, esti));
		}
	}

	return intercepts;
}

function findTurningPts(pts) {
	if (pts.length == 0) return [];

	var turningPts = [];

	var grad = [];
	for (var i = 0; i < pts.length - 1; i++) {
		var dx = pts[i+1].x - pts[i].x;
		var dy = pts[i+1].y - pts[i].y;
		grad.push(dy/dx);
	}

	for (var i = 1; i < grad.length; i++) {
		// turning point should be: 1.grad on both sides exist; 2.grad on two sides have different signs; 3.the difference in grad on both sides
		// should be sufficiently large.
		if (grad[i-1] != NaN && grad[i] != NaN && grad[i-1] * grad[i] < 0 && (pts[i].x - pts[i-1].x) * (pts[i+1].x - pts[i].x) > 0) 
			if (Math.abs(grad[i-1] - grad[i]) > 0.01) 
				turningPts.push(pts[i]);
	}

	return turningPts;
}

function findMaxima(pts) {
	if (pts.length == 0) return [];

	var maxima = [];

	var grad = [];
	for (var i = 0; i < pts.length - 1; i++) {
		var dx = pts[i+1].x - pts[i].x;
		var dy = pts[i+1].y - pts[i].y;
		grad.push(dy/dx);
	}

	for (var i = 1; i < grad.length; i++) {
		if (grad[i-1] != NaN && grad[i] != NaN && grad[i-1] < 0 && grad[i] > 0 && (pts[i].x - pts[i-1].x) * (pts[i+1].x - pts[i].x) > 0) {
			// if (Math.abs(grad[i-1] - grad[i]) > 0.015) 
			var l = i-1;
			while (l >= 0 && getDist(pts[l], pts[i]) < 15) l--;
			if (l < 0) continue;
			var dy = pts[i].y - pts[l].y;
			var dx = pts[i].x - pts[l].x;
			var grad1 = dy/dx;

			var r = i+1;
			while (r < pts.length && getDist(pts[r], pts[i]) < 15) r++;
			if (r >= pts.length) continue;
			var dy = pts[r].y - pts[i].y;
			var dx = pts[r].x - pts[i].x;
			var grad2 = dy/dx;

			if (Math.abs(grad1) > 0.03 && Math.abs(grad2) > 0.03) {
				maxima.push(pts[i]);
			}		
		}
	}

	return maxima;
}

function findMinima(pts) {
	if (pts.length == 0) return [];

	var minima = [];

	var grad = [];
	for (var i = 0; i < pts.length - 1; i++) {
		var dx = pts[i+1].x - pts[i].x;
		var dy = pts[i+1].y - pts[i].y;
		grad.push(dy/dx);
	}

	for (var i = 1; i < grad.length; i++) {
		if (grad[i-1] != NaN && grad[i] != NaN && grad[i-1] > 0 && grad[i] < 0 && (pts[i].x - pts[i-1].x) * (pts[i+1].x - pts[i].x) > 0) {
			// if (Math.abs(grad[i-1] - grad[i]) > 0.015) 
			var l = i-1;
			while (l >= 0 && getDist(pts[l], pts[i]) < 15) l--;
			if (l < 0) continue;
			var dy = pts[i].y - pts[l].y;
			var dx = pts[i].x - pts[l].x;
			var grad1 = dy/dx;

			var r = i+1;
			while (r < pts.length && getDist(pts[r], pts[i]) < 15) r++;
			if (r >= pts.length) continue;
			var dy = pts[r].y - pts[i].y;
			var dx = pts[r].x - pts[i].x;
			var grad2 = dy/dx;

			if (Math.abs(grad1) > 0.03 && Math.abs(grad2) > 0.03) {
				minima.push(pts[i]);
			}
		}
	}

	return minima;
}


exports.canvasHeight = canvasHeight;
exports.canvasWidth = canvasWidth;
exports.createPoint = createPoint;
exports.getDist = getDist;
exports.findInterceptX = findInterceptX;
exports.findInterceptY = findInterceptY;
exports.findTurningPts = findTurningPts;
exports.findMaxima = findMaxima;
exports.findMinima = findMinima;
