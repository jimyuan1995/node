var num = 200;
var limit = 1;

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


function getDist(pts1, pts2) {
	return Math.sqrt(Math.pow(pts1.x - pts2.x, 2) + Math.pow(pts1.y - pts2.y, 2));
}


function findInterceptX(pts) {
	if (pts.length == 0) return [];

	var intercepts = [];

	if (pts[0].y == 300) intercepts.push(pts[0]);
	for (var i = 1; i < pts.length; i++) {
		if (pts[i].y == 300) {
			intercepts.push(pts[i]);
			continue;
		}

		if ((pts[i-1].y - 300) * (pts[i].y - 300) < 0) {
			var dx = pts[i].x - pts[i-1].x;
			var dy = pts[i].y - pts[i-1].y;
			var grad = dy/dx;
			var esti = pts[i-1].x + (1 / grad) * (300 - pts[i-1].y);
			intercepts.push(new Point(esti, 300));
		}
	}

	return intercepts;
}

function findInterceptY(pts) {
	if (pts.length == 0) return [];

	var intercepts = [];

	if (pts[0].x == 300) intercepts.push(pts[0]);
	for (var i = 1; i < pts.length; i++) {
		if (pts[i].x == 300) {
			intercepts.push(pts[i]);
			continue;
		}

		if ((pts[i-1].x - 300) * (pts[i].x - 300) < 0) {
			var dx = pts[i].x - pts[i-1].x;
			var dy = pts[i].y - pts[i-1].y;
			var grad = dy/dx;
			var esti = pts[i-1].y + grad * (300 - pts[i-1].x);
			intercepts.push(new Point(300, esti));
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
			if (abs(grad[i-1] - grad[i]) > 0.01) turningPts.push(pts[i]);
		}
	}

	return turningPts;
}



