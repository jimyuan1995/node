// Given a set of data points, generate bezier curve.

var NumControlKnots = 100;

function genericBezier(pts) {

	var n = pts.length - 1;
	var comb = [];
	for (var r = 0; r <= n; r++) {
		comb.push(math.combinations(n, r));
	}

	var step = 1 / NumControlKnots;
	var result = [];

	for (var u = 0; u <= 1; u = u + step) {
		var sx = 0, sy = 0;
		for (var r = 0; r <= n; r++) {
			var tmp1 = Math.pow(u, r);
			var tmp2 = Math.pow(1-u, n-r);
			var tmp3 = comb[r] * tmp1 * tmp2;
			sx += tmp3 * pts[r].x;
			sy += tmp3 * pts[r].y;
		}
		result.push(new Point(sx, sy));
	}

	return result;
}