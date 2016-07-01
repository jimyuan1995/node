var num = 200;
var limit = 1;
var width = 600;
var height = 600;

function funcPts(func, begin, end) {
	var step = (end - begin) / num;
	var pts = [];
	for (var x = begin; x < end; x += step) {
		pts.push(new Point(x, func(x)));
	}
	return pts;
}

function transform(pts, scaleX, scaleY, biasX, biasY) {
	for (var i = 0; i < pts.length; i++) {
		pts[i].x = pts[i].x * scaleX + biasX;
		pts[i].y = pts[i].y * scaleY + biasY;
	}
	return pts;
}


function findInterceptX(pts) {
	if (pts.length == 0) return [];

	var intercepts = [];

	if (pts[0].y == height/2) intercepts.push(pts[0]);
	for (var i = 1; i < pts.length; i++) {
		if (pts[i].y == height/2) {
			intercepts.push(pts[i]);
			continue;
		}

		if ((pts[i-1].y - height/2) * (pts[i].y - height/2) < 0) {
			var dx = pts[i].x - pts[i-1].x;
			var dy = pts[i].y - pts[i-1].y;
			var grad = dy/dx;
			var esti = pts[i-1].x + (1 / grad) * (height/2 - pts[i-1].y);
			intercepts.push(new Point(esti, height/2));
		}
	}

	return intercepts;
}

function findInterceptY(pts) {
	if (pts.length == 0) return [];

	var intercepts = [];

	if (pts[0].x == width/2) intercepts.push(pts[0]);
	for (var i = 1; i < pts.length; i++) {
		if (pts[i].x == width/2) {
			intercepts.push(pts[i]);
			continue;
		}

		if ((pts[i-1].x - width/2) * (pts[i].x - width/2) < 0) {
			var dx = pts[i].x - pts[i-1].x;
			var dy = pts[i].y - pts[i-1].y;
			var grad = dy/dx;
			var esti = pts[i-1].y + grad * (width/2 - pts[i-1].x);
			intercepts.push(new Point(width/2, esti));
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
		if (grad[i-1] != NaN && grad[i] != NaN && grad[i-1] * grad[i] < 0 && (pts[i].x - pts[i-1].x) * (pts[i+1].x - pts[i].x) > 0) {
			if (Math.abs(grad[i-1] - grad[i]) > 0.01) turningPts.push(pts[i]);
		}
	}

	return turningPts;
}

exports.findInterceptX = findInterceptX;
exports.findInterceptY = findInterceptY;
exports.findTurningPts = findTurningPts;

