function Symbol(text, x, y) {
	this.text = text;
	this.x = x;
	this.y = y;
	this.default_x = x;
	this.default_y = y;
}

var symbols,
	padding = 15;
function def_symbols() {
	symbols = [];
	symbols.push(new Symbol('A', padding, padding));
	symbols.push(new Symbol('B', padding + 30, padding));
}

def_symbols();

