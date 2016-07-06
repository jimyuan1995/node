function send() {
	var data = JSON.stringify(drawnPoints);
	var params = 'data=' + data + '&width=' + w + '&height=' + h;

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