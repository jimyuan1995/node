// send data to server for testing correctness of the graph
// data is sent in terms of JSON string using GET method via XMLHttpRequest

function getData() {

	var data = {};

	if (canvasWidth > 5000 || canvasWidth <= 0) {
		console.log("Invalid canvasWidth.");
		return;
	}

	if (canvasHeight > 5000 || canvasHeight <= 0) {
		console.log("Invalid canvasHeight.");
		return;
	}

	data['canvasWidth'] = canvasWidth;
	data['canvasHeight'] = canvasHeight;


	// sort segments according to their left most points.
	var ptss = [];
	for (var i = 0; i < drawnPtss.length; i++) 
		ptss.push(drawnPtss[i]);

	function compare(pts1, pts2) {
		function findMinX(pts) {
			if (pts.length == 0) return 0;
			var min = canvasWidth;
			for (var i = 0; i < pts.length; i++) 
				min = Math.min(min, pts[i].x);
			return min;
		}
		var min1 = findMinX(pts1);
		var min2 = findMinX(pts2);
		if (min1 < min2) return -1
		else if (min1 == min2) return 0
		else return 1;
	}
	ptss.sort(compare);


	sbls = [];
	for (var i = 0; i < symbols.length; i++) {
		var obj = {};
		obj.text = symbols[i].text;
		obj.x = (symbols[i].x - canvasWidth/2) / (canvasWidth/2);
		obj.y = (canvasHeight/2 - symbols[i].y) / (canvasHeight/2);
		if (symbols[i].bindCurve != undefined) {
			obj.category = symbols[i].category;
			obj.bindCurveIdx = ptss.indexOf(symbols[i].bindCurve);
			
			var knots = symbols[i].bindCurve[symbols[i].category];
			for (var j = 0; j < knots.length; j++) 
				if (knots[j].x == symbols[i].x && knots[j].y == symbols[i].y) {
					obj.catIndex = j;
					break;
				}
		}			
		sbls.push(obj);
	}
	data['symbols'] = sbls;


	var adjusted_ptss = [];
	for (var i = 0; i < ptss.length; i++) {
		var pts = ptss[i],
			adjusted_pts = [];
		for (var j = 0; j < pts.length; j++) 
			adjusted_pts.push(createPoint((pts[j].x - canvasWidth/2) / (canvasWidth/2), (canvasHeight/2 - pts[j].y) / (canvasHeight/2)));
		adjusted_ptss.push(adjusted_pts);
	}
	data['ptss'] = adjusted_ptss;

	return data;
}

function send() {
	var data = getData();
	var params = 'data=' + JSON.stringify(data) + '&canvasWidth=' + canvasWidth + '&canvasHeight=' + canvasHeight;
	var xhr = new XMLHttpRequest();
	var url = "/test";
	xhr.open("GET", url + '?' + params, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			alert(xhr.responseText);
		}
	}
	xhr.send();
}
	
