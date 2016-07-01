var Point = function(a, b) {
	if (typeof a === 'object') {
		this.x = a.x;
		this.y = a.y;
	} else {
		this.x = a;
		this.y = b;
	}
}

function getDist(pts1, pts2) {
	return Math.sqrt(Math.pow(pts1.x - pts2.x, 2) + Math.pow(pts1.y - pts2.y, 2));
}
