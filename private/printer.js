var fs = require('fs');

function print(filename, data) {

	fs.writeFile(filename, data, function(err) {
		if (err) {
			console.log(err);
			return;
		}
		console.log("Print to " + filename + " succeeds.");
	})

}

function newPrint(req, res) {
	var filename = req.query.filename;
	var data = req.query.data;
	console.log(filename);

	fs.writeFile(filename, data, function(err) {
		if (err) {
			console.log(err);
			return;
		}
		console.log("Print to " + filename + " succeeds.");
	});
}

exports.newPrint = newPrint;
exports.print = print;