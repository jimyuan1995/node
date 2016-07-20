// special file for symbols.
var symbols,
	padding = 15;

function createSymbol(text, x, y, default_x, default_y, category, bindCurve) {
	var obj = {};
	obj.text = text;
	obj.x = x;
	obj.y = y;
	if (default_x == undefined) obj.default_x = x 
		else obj.default_x = default_x;
	if (default_y == undefined) obj.default_y = y 
		else obj.default_y = default_y;
	obj.category = category;
	obj.bindCurve = bindCurve;
	return obj;
}

function clone(sym) {
	var obj = {};
	obj.text = sym.text;
	obj.x = sym.x;
	obj.y = sym.y;
	obj.default_x = sym.default_x;
	obj.default_y = sym.default_y;
	obj.category = sym.category;
	obj.bindCurve = sym.bindCurve;
	return obj;
}

function restore_symbols() {
	symbols = [];
	var s = "<svg width='100' height='100'> <circle cx='50' cy='50' r='40' stroke='green' stroke-width='4' fill='yellow' /> </svg>"
	symbols.push(createSymbol('A', padding, padding ));
	symbols.push(createSymbol('B', padding + 30, padding));
}

restore_symbols();
