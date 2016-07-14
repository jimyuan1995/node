// provide interactive elements beyond the canvas, including buttons and selects.

function drawButton() {
	var upper = 20;
	var bottom = 680;

	var buttonTest = createButton("test");
	buttonTest.position(450, upper);
	buttonTest.mousePressed(function() {
		send();
	});

	var buttonTestcase = createButton("show test case");
	buttonTestcase.position(50, bottom);
	buttonTestcase.mousePressed(function () {
		var url = '/json/test.json';
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var data = JSON.parse(xhr.responseText);

				var syms = data['symbols'];
				var ptss = data['ptss'];

				for (var i = 0; i < ptss.length; i++) {
					var pts = ptss[i];
					for (var j = 0; j < pts.length; j++) {
						pts[j].x = pts[j].x * canvasWidth/2 + canvasWidth/2;
						pts[j].y = canvasHeight/2 - pts[j].y * canvasHeight/2;
					}
				}

				for (var i = 0; i < syms.length; i++) {
					syms[i].x = syms[i].x * canvasWidth/2 + canvasWidth/2;
					syms[i].y = canvasHeight/2 - syms[i].y * (canvasHeight/2);
				}

				for (var i = 0; i < ptss.length; i++) {
					ptss[i]['inter_x'] = findInterceptX(ptss[i]);
					ptss[i]['inter_y'] = findInterceptY(ptss[i]);
					ptss[i]['maxima'] = findMaxima(ptss[i]);
					ptss[i]['minima'] = findMinima(ptss[i]);
				}

				drawCurves(ptss, 0);
				drawSymbols(syms, 0);

			}
		}
		xhr.send();

		
	});

	var buttonDrawnCase = createButton("show drawn case");
	buttonDrawnCase.position(150, bottom);
	buttonDrawnCase.mousePressed(function () {

		var url = '/json/drawn.json';
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var data = JSON.parse(xhr.responseText);

				var syms = data['symbols'];
				var ptss = data['ptss'];

				for (var i = 0; i < ptss.length; i++) {
					var pts = ptss[i];
					for (var j = 0; j < pts.length; j++) {
						pts[j].x = pts[j].x * canvasWidth/2 + canvasWidth/2;
						pts[j].y = canvasHeight/2 - pts[j].y * (canvasHeight/2);
					}
				}

				for (var i = 0; i < syms.length; i++) {
					syms[i].x = syms[i].x * canvasWidth/2 + canvasWidth/2;
					syms[i].y = canvasHeight/2 - syms[i].y * (canvasHeight/2);
				}

				for (var i = 0; i < ptss.length; i++) {
					ptss[i]['inter_x'] = findInterceptX(ptss[i]);
					ptss[i]['inter_y'] = findInterceptY(ptss[i]);
					ptss[i]['maxima'] = findMaxima(ptss[i]);
					ptss[i]['minima'] = findMinima(ptss[i]);
				}

				drawCurves(ptss, 0);
				drawSymbols(syms, 0);

			}
		}
		xhr.send();


	});


	var buttonShape = createButton("custom");
	buttonShape.position(50, upper);
	buttonShape.mousePressed( function() {
		//
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

	var buttonPrintTest = createButton("print test case");
	buttonPrintTest.position(450, bottom);
	buttonPrintTest.mousePressed(function() {
		var data = getData();
		var params = "data=" + JSON.stringify(data);

		var url = '/print_test';
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url + "?" + params, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				//
			}
		}
		xhr.send();
	});

	var buttonPrintDrawn = createButton("print drawn case");
	buttonPrintDrawn.position(550, bottom);
	buttonPrintDrawn.mousePressed(function() {
		var data = getData();
		var params = "data=" + JSON.stringify(data);

		var url = '/print_drawn';
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url + "?" + params, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				//
			}
		}
		xhr.send();
	});
}



