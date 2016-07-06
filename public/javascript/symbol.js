// special file for symbols.

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
	obj.bindCurve = sym.bindCurve;
	obj.category = sym.category;
	return obj;
}


var symbols,
	padding = 15;

function def_symbols() {
	symbols = [];
	symbols.push(createSymbol('A', padding, padding ));
	symbols.push(createSymbol('B', padding + 30, padding));
}

def_symbols();
