// send data to server for testing correctness of the graph

function send() {
	var data = JSON.stringify(drawnPoints);
	var params = 'data=' + data + '&canvasWidth=' + canvasWidth + '&canvasHeight=' + canvasHeight;

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