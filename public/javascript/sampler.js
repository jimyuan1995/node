// Given a set of data points, sample a subset of points such that there is about constant space interval between two adjacent points.
var sampleSpaceInterval = 10;

function sample(pts) {
	var sampled = []; 
	sampled.push(pts[0]);
	var i = 0;
	var j = 0;
	while (i < pts.length) {
		while (j < pts.length && getDist(pts[i], pts[j]) < sampleSpaceInterval) j++;
		if (j < pts.length) sampled.push(pts[j]);
		i = j;
	}
	sampled.push(pts[pts.length - 1]);
	return sampled;
}