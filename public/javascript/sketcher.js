// provide sketch interface and collect drawn data points from user.

// drawing coefficients
var gridWidth = 30;
var strkWeight = 2;
var padding = 15;
var h = 600, w = 600;

// point collection
var drawnPtsPartial;
var drawnPoints = [];

// for moving curve
var movedPtsIdx;
var isMoveCurve;
var prevMousePt;

// for testing

var testPoints = [[{"x":170,"y":299},{"x":170.56116484883418,"y":304.4300710934344},{"x":171.3071706680953,"y":309.72254521490476},{"x":172.21341380981218,"y":314.9177719282605},{"x":173.27034190606827,"y":320.0329632039072},{"x":174.4823189516757,"y":325.0704454160543},{"x":175.86038049455271,"y":330.02372990607967},{"x":177.4163609772876,"y":334.881617898285},{"x":179.16011883604762,"y":339.63078765171093},{"x":181.09921384682136,"y":344.257247767155},{"x":183.23977025724588,"y":348.7469673833994},{"x":185.58743883226936,"y":353.08595055134896},{"x":188.14781743135478,"y":357.2599881089948},{"x":190.92612773762238,"y":361.2542792109145},{"x":193.92625886729755,"y":365.0530644090135},{"x":197.14945296441093,"y":368.63936018555245},{"x":200.5929471111316,"y":371.9948400291195},{"x":204.24884135263505,"y":375.09987517424685},{"x":208.10337585201262,"y":377.9337299107144},{"x":212.13670390761826,"y":380.474898960214},{"x":216.3231629745726,"y":382.70157293094735},{"x":220.63198340888096,"y":384.59221744130247},{"x":225.02833675138604,"y":386.1262487384212},{"x":229.47460925291588,"y":387.2847821938665},{"x":233.93178685236893,"y":388.0514206138087},{"x":238.3608493236614,"y":388.4130389706869},{"x":242.72408886880103,"y":388.3605136884147},{"x":246.9862883215637,"y":387.8893405498611},{"x":251.115713859207,"y":387.0000873792944},{"x":255.08489525521588,"y":385.6986364414629},{"x":258.8711825295104,"y":383.996186310326},{"x":262.45708108770333,"y":381.9090020657942},{"x":265.83037803708964,"y":379.4579236727234},{"x":268.98408037537394,"y":376.66766265406227},{"x":271.9161912747263,"y":373.56593427174766},{"x":274.6293538886704,"y":370.18248451801884},{"x":277.13039322300114,"y":366.5480772174926},{"x":279.4297859459397,"y":362.69350621611443},{"x":281.5410859520459,"y":358.64869153875406},{"x":283.48033047005794,"y":354.4419076978322},{"x":285.26544795222924,"y":350.0991785789464},{"x":286.91568529654035,"y":345.6438582008083},{"x":288.45106844800824,"y":341.0964017434893},{"x":289.8919073117229,"y":336.474317898829},{"x":291.25835328713185,"y":331.7922827895772},{"x":292.5700155993272,"y":327.0623879911757},{"x":293.84564087976105,"y":322.2944907423662},{"x":295.1028590107898,"y":317.49663308792066},{"x":296.3579969541718,"y":312.6754980513092},{"x":297.625961002076,"y":307.8368744235826},{"x":298.9201865170223,"y":302.9861067399982},{"x":300.2526526989598,"y":298.1285128548466},{"x":301.6339582063593,"y":293.26975761525654},{"x":303.0734515718293,"y":288.41617694475764},{"x":304.57940832794765,"y":283.5750517308839},{"x":306.1592446548036,"y":278.75483491448824},{"x":307.81975525498166,"y":273.96533784488804},{"x":309.5673611493117,"y":269.2178831390404},{"x":311.4083512818353,"y":264.5254309189262},{"x":313.3491003605342,"y":259.9026834719918},{"x":315.39624440175953,"y":255.36617028566252},{"x":317.55679517579307,"y":250.9343113803055},{"x":319.83817537566995,"y":246.62745236275828},{"x":322.2481580706759,"y":242.46786020624182},{"x":324.7946970763073,"y":238.47966506103091},{"x":327.48563946259094,"y":234.6887310537682},{"x":330.328317660459,"y":231.12243862160827},{"x":333.3290265367881,"y":227.809362888029},{"x":336.4924002682064,"y":224.77883713326236},{"x":339.8207145268304,"y":222.06039746197916},{"x":343.3131508274545,"y":219.6831139045138},{"x":346.9650710286542,"y":217.67482364681865},{"x":350.76735980224595,"y":216.0612928228199},{"x":354.7059000130679,"y":214.86534309748086},{"x":358.76124885226545,"y":214.10598687901276},{"x":362.908579699782,"y":213.79761935776455},{"x":367.1179447151979,"y":213.94931597659408},{"x":371.3548951976393,"y":214.56428020655636},{"x":375.5814707102508,"y":215.63947902624398},{"x":379.75753478834156,"y":217.16549320524848},{"x":383.84239699124413,"y":219.12659764531506},{"x":387.7966217601991,"y":221.50107498246902},{"x":391.5838889424468,"y":224.26175449704914},{"x":395.17274478020107,"y":227.37675869678094},{"x":398.53807169447083,"y":230.81043167400446},{"x":401.66211555791216,"y":234.5244158959368},{"x":404.5349435201833,"y":238.4788366373899},{"x":407.15426362015484,"y":242.6335451352926},{"x":409.52461474205234,"y":246.94936242468683},{"x":411.656022386542,"y":251.38925543613462},{"x":413.56229825611126,"y":255.91936386978762},{"x":415.25922301695493,"y":260.5097758723962},{"x":416.7628746172929,"y":265.1349118498214},{"x":418.08833359234575,"y":269.77329985721923},{"x":419.2488966579383,"y":274.40638591620694},{"x":420.2557368651923,"y":279.0157876676762},{"x":421.11760645180834,"y":283.57804413626735},{"x":421.8395490963526,"y":288.0554235898964},{"x":422.41836193889276,"y":292.3807087929567},{"x":422.8300941734138,"y":296.4329914335169}]];

function setup() {
	createCanvas(w, h);
	noLoop();
	cursor(CROSS);
	drawBackground();
	drawButton();
}

function drawBackground() {
	clear();
	background(255);
	drawGrid();
	drawHorizontalAxis();
	drawVerticalAxis();
	drawLabel();
	//drawScale();
}

function drawHorizontalAxis() {
	push();
	
	strokeWeight(strkWeight);
	strokeJoin(ROUND);
	stroke(0);
	noFill();

	var leftMargin = padding;
	var rightMargin = w - padding;

	beginShape();
	vertex(leftMargin, h/2);
	vertex(rightMargin, h / 2);
	vertex(rightMargin - 10, h / 2 - 5);
	vertex(rightMargin, h / 2);
	vertex(rightMargin - 10, h / 2 + 5);
	endShape();
	
	pop();
}

function drawVerticalAxis() {
	push();
	
	strokeWeight(strkWeight);
	strokeJoin(ROUND);
	stroke(0);
	noFill();

	var upMargin = padding;
	var bottomMargin = h - padding;

	beginShape();
	vertex(w/2, bottomMargin);
	vertex(w/2, upMargin);
	vertex(w/2 - 5, upMargin + 10);
	vertex(w/2, upMargin);
	vertex(w/2 + 5, upMargin + 10);
	endShape();
	
	pop();
}

function drawGrid() {
	push();

	noFill();
	strokeWeight(strkWeight);
	strokeJoin(ROUND);
	stroke(215);

	push();
	translate(0, h / 2);
	var num = h / (gridWidth * 2);
	for (var i = 0; i < num; i++) {
		line(0, -i*gridWidth, width, -i*gridWidth);
		line(0, i*gridWidth, width, i*gridWidth);
	}
	pop();

	push();
	translate(w / 2, 0);
	var num = w / (gridWidth * 2);
	for (var i = 0; i < num; i++) {
		line(-i*gridWidth, 0, -i*gridWidth, h);
		line(i*gridWidth, 0, i*gridWidth, h);
	}
	pop();

	pop();
}

function drawLabel() {
	push();

	textSize(16);
	stroke(0);
	strokeWeight(1);

	text("O", w/2 - 15, h/2 + 15);
	text("x", w - 12, h/2 + 15);
	text("y", w/2 + 5, 12);

	pop();
}

function drawScale() {
	var len = 3;

	push();
	strokeWeight(1);
	stroke(0);
	textSize(12);

	push();
	translate(0, h / 2);
	var num = h / (gridWidth * 2);
	for (var i = 1; i < num; i++) {
		line(w/2 -len, -i*gridWidth, w/2 + len, -i*gridWidth);
		line(w/2 - len, i*gridWidth, w/2 + len, i*gridWidth);
		text(i, w/2 + 5, -i * gridWidth + 5);
		text(-i, w/2 + 5, i * gridWidth + 5);
	}
	pop();

	push();
	translate(w / 2, 0);
	var num = w / (gridWidth * 2);
	for (var i = 1; i < num; i++) {
		line(-i*gridWidth, h/2 - len, -i*gridWidth, h / 2 + len);
		line(i*gridWidth, h/2 - len, i*gridWidth, h /2 + len);
		text(-i, -i * gridWidth - 5, h / 2 + 15);
		text(i, i * gridWidth - 5, h / 2 + 15);
	}
	pop();

	pop();
}

function drawButton() {
	var buttonClear = createButton('clear');
	buttonClear.position(width - 100, padding);
	buttonClear.mousePressed(function() {
		drawBackground();
		drawnPoints = [];
	});

	var buttonTest = createButton("test");
	buttonTest.position(width - 100, padding+20);
	buttonTest.mousePressed(function() {
		send(drawnPoints);
	});

	var buttonTestcase = createButton("show test case");
	buttonTestcase.position(width - 100, padding+40);
	buttonTestcase.mousePressed(function() {
		drawCurve(testPoints, [0]);
	});
}

function drawCurve(pts, color) {
	if (pts.length == 0) return;

	if (pts[0] instanceof Array) {
		for (var i = 0; i < pts.length; i++)
			drawCurve(pts[i], color);
	}

	push();
	stroke(color);
	strokeWeight(strkWeight);
	for (var i = 1; i < pts.length; i++) {
		line(pts[i-1].x, pts[i-1].y, pts[i].x, pts[i].y);
	}
	pop();

	drawKnots(findInterceptX(pts));
	drawKnots(findInterceptY(pts));
	drawKnots(findTurningPts(pts));
}

function drawKnots(pts, color) {
	var radius = 8;

	push();
	fill(255);
	stroke(100);
	strokeWeight(1);

	for (var i = 0; i < pts.length; i++) {
		ellipse(pts[i].x, pts[i].y, radius, radius);
	}
	pop();
}


function mouseDragged() {
	if (!isMoveCurve) {
		var current = new Point(mouseX, mouseY);
	
		push();
		stroke(0, 155, 255);
		strokeWeight(strkWeight);
		if (drawnPtsPartial.length > 0) {
			var prev = drawnPtsPartial[drawnPtsPartial.length - 1];
			line(prev.x, prev.y, current.x, current.y);
		}
		pop();

		drawnPtsPartial.push(current);	
	} else {
		var current = new Point(mouseX, mouseY);
		var dx = current.x - prevMousePt.x;
		var dy = current.y - prevMousePt.y;
		drawnPoints[movedPtsIdx] = transform(drawnPoints[movedPtsIdx], 1, 1, dx, dy);
		prevMousePt = current;

		drawBackground();
		for (var i = 0; i < drawnPoints.length; i++) {
			if (i == movedPtsIdx) {
				drawCurve(drawnPoints[i], [135]);
			} else {
				drawCurve(drawnPoints[i], [0, 155, 255]);
			}
		}
	}

}

function mousePressed() {
	var p = new Point(mouseX, mouseY);
	for (var i = 0; i < drawnPoints.length; i++) {
		var pts = drawnPoints[i];
		for (var j = 0; j < pts.length; j++) {
			if (getDist(pts[j], p) < 10) {
				movedPtsIdx = i;
				isMoveCurve = true;
				prevMousePt = p;
				drawCurve(drawnPoints[i], [135]);
				return false;
			}
		}
	}

	isMoveCurve = false;
	drawnPtsPartial = [];
}

function mouseReleased() {
	if (!isMoveCurve) {
		if (drawnPtsPartial.length == 0) return;
		var drawBez = genericBezier(sample(drawnPtsPartial));
		if (drawBez.length > 0) drawnPoints.push(drawBez);

		drawBackground();
		drawCurve(drawnPoints, [0, 155, 255]);
	} else {
		drawCurve(drawnPoints[movedPtsIdx], [0, 155, 255]);
		isMoveCurve = false;
	}
}


	










