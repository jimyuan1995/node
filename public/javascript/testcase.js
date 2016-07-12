var data;
var testPtss;

var url = '/javascript/testcase.json';
var xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.onreadystatechange = function() {
	if (xhr.readyState == 4 && xhr.status == 200) {
		data = JSON.parse(xhr.responseText);
		testPtss = data['ptss'];
	}
}
xhr.send();


function showTestCase() {
	var syms = data['symbols'];
	var testPtss = data['ptss'];

	for (var i = 0; i < testPtss.length; i++) {
		testPtss[i]['inter_x'] = findInterceptX(testPtss[i]);
		testPtss[i]['inter_y'] = findInterceptY(testPtss[i]);
		testPtss[i]['maxima'] = findMaxima(testPtss[i]);
		testPtss[i]['minima'] = findMinima(testPtss[i]);
	}

	drawCurves(testPtss, 0);
	drawSymbols(syms, 0);
}
