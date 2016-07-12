// provide interactive elements beyond the canvas, including buttons and selects.
var upper = 20;

function drawButton() {

	var buttonTest = createButton("test");
	buttonTest.position(50, upper);
	buttonTest.mousePressed(function() {
		send();
	});

	var buttonTestcase = createButton("show test case");
	buttonTestcase.position(100, upper);
	buttonTestcase.mousePressed(showTestCase);


	var buttonPrint = createButton("print");
	buttonPrint.position(200, upper);
	buttonPrint.mousePressed(function() {
		var data = getData();
		console.log(JSON.stringify(data));
	});

	var buttonShape = createButton("normalise");
	buttonShape.position(250, upper);
	buttonShape.mousePressed(function() {
		drawNormalisedShape(drawnPtss[0]);
		drawNormalisedPosition(drawnPtss[0]);
	});





	// redo and undo is essentially the reverse of each other.

	var buttonUndo = createButton("undo");
	buttonUndo.position(500, upper);
	buttonUndo.mousePressed(function() {
		if (logUndo.length == 0) return;

		var rec = logUndo.pop(),
			recc = {};

		if (rec['type'] == 'moveSym') {
			// produce record for redo
			recc.type = 'moveSym';
			recc.movedSymIdx = rec.movedSymIdx;
			recc.sym = clone(symbols[rec.movedSymIdx]);
			logRedo.push(recc);

			
			var sym = symbols[rec.movedSymIdx];
			// remove sym from previously binded curve
			if (sym.bindCurve != undefined) {
				var idx = sym.bindCurve.bindSym.indexOf(sym);
				sym.bindCurve.bindSym.splice(idx, 1);
			}

			symbols[rec.movedSymIdx] = rec.sym;
			var sym = symbols[rec.movedSymIdx];
			// bind sym to the current curve
			if (sym.bindCurve != undefined) {
				sym.bindCurve.bindSym.push(sym);
			}

		} else if (rec['type'] == 'moveCurve') {
			var pts = drawnPtss[rec.movedCurveIdx];

			// produce record for redo
			recc.type = 'moveCurve';
			recc.movedCurveIdx = rec.movedCurveIdx;
			recc.dx = -rec.dx;
			recc.dy = -rec.dy;
			recc.bindSym = [];
			for (var i = 0; i < pts.bindSym.length; i++) {
				var sym = clone(pts.bindSym[i]);
				sym.idx = symbols.indexOf(pts.bindSym[i]);
				recc.bindSym.push(sym);
			}
			logRedo.push(recc);
			
			// reversly translate the curve
			transCurve(pts, -rec.dx, -rec.dy);
			// restore binded symbols
			pts.bindSym = [];
			for (var i = 0; i < rec.bindSym.length; i++) {
				var sym = rec.bindSym[i];
				symbols[sym.idx] = clone(sym);
				pts.bindSym.push(symbols[sym.idx]);
			}
		} else if (rec['type'] == 'drawCurve') {
			// produce record for redo
			recc['type'] = 'drawCurve';
			recc['pts'] = drawnPtss.pop();
			logRedo.push(recc);
		}

		drawBackground();
		drawCurves(drawnPtss, [0, 155, 255]);
		drawSymbols(symbols, 0);

	});

	var buttonRedo = createButton("redo");
	buttonRedo.position(550, upper);
	buttonRedo.mousePressed(function() {
		if (logRedo.length == 0) return;

		var rec = {},
			recc = logRedo.pop();

		if (recc.type == 'moveSym') {

			// produce record for undo
			rec.type = 'moveSym';
			rec.movedSymIdx = recc.movedSymIdx;
			rec.sym = clone(symbols[recc.movedSymIdx]);
			logUndo.push(rec);

			var sym = symbols[recc.movedSymIdx];
			// remove sym from previously binded curve
			if (sym.bindCurve != undefined) {
				var idx = sym.bindCurve.bindSym.indexOf(sym);
				sym.bindCurve.bindSym.splice(idx, 1);
			}
			symbols[recc.movedSymIdx] = clone(recc.sym);
			var sym = symbols[recc.movedSymIdx];
			// bind sym to the current curve
			if (sym.bindCurve != undefined) {
				sym.bindCurve.bindSym.push(sym);
			}

		} else if (recc.type == 'moveCurve') {
			var pts = drawnPtss[recc.movedCurveIdx];

			// produce record for undo
			rec.type = 'moveCurve';
			rec.movedCurveIdx = recc.movedCurveIdx;
			rec.dx = -recc.dx;
			rec.dy = -recc.dy;
			rec.bindSym = [];
			for (var i = 0; i < pts.bindSym.length; i++) {
				var sym = clone(pts.bindSym[i]);
				sym.idx = symbols.indexOf(pts.bindSym[i]);
				rec.bindSym.push(sym);
			}
			logUndo.push(rec);
			
			// reversely translate the curve
			transCurve(pts, -recc.dx, -recc.dy);
			
			// restore binded symbols
			// tmp is the new bindSym
			var tmp = [];
			for (var i = 0; i < recc.bindSym.length; i++) {
				var sym = recc.bindSym[i];
				symbols[sym.idx] = clone(sym);
				tmp.push(symbols[sym.idx]);
			}
			// handle cases: symbols drop off when curve moves
			for (var i = 0; i < pts.bindSym.length; i++) {
				if (!tmp.includes(pts.bindSym[i])) {
					pts.bindSym[i].x = pts.bindSym[i].default_x;
					pts.bindSym[i].y = pts.bindSym[i].default_y;
					pts.bindSym[i].category = undefined;
					pts.bindSym[i].bindCurve = undefined;
				}
			}
			pts.bindSym = tmp;

		} else if (recc.type == 'drawCurve') {
			// produce record for undo
			rec.type = 'drawCurve';
			logUndo.push(rec);
			drawnPtss.push(recc.pts);
		}

		drawBackground();
		drawCurves(drawnPtss, [0, 155, 255]);
		drawSymbols(symbols, 0);

	});

	var buttonClear = createButton('clear');
	buttonClear.position(600, upper);
	buttonClear.mousePressed(function() {
		drawnPtss = [];
		assymtotes = [];
		logUndo = [];
		logRedo = [];
		restore_symbols();

		drawBackground();
		drawSymbols(symbols, 0);
	});
}



