function send(drawnPoints) {
	var data = JSON.stringify(drawnPoints);
	var params = 'data=' + data + '&width=' + width + '&height=' + height;

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