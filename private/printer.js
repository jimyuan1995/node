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

exports.print = print;