function Symbol(text, x, y) {
	this.text = text;
	this.x = x;
	this.y = y;
}

var symbols;
function def_symbols() {
	symbols = [];
	symbols.push(new Symbol('A', 50, 50));
	symbols.push(new Symbol('B', 80, 50));
}

def_symbols();

