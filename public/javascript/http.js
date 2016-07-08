// send data to server for testing correctness of the graph
// data is sent in terms of JSON string using GET method via XMLHttpRequest

function send() {
	sbls = [];
	for (var i = 0; i < symbols.length; i++) {
		var obj = {};
		obj.text = symbols[i].text;
		obj.x = symbols[i].x;
		obj.y = symbols[i].y;
		if (symbols[i].bindCurve != undefined) {
			obj.category = symbols[i].category;
			obj.bindCurveIdx = drawnPoints.indexOf(symbols[i].bindCurve);
		}
		sbls.push(obj);
	}
	var data = {};
	data['symbols'] = sbls;
	data['points'] = drawnPoints;
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