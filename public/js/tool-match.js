var getRange = function (r) {
	var out = [];

	if(r == 0){
		out.push([0, 0]);
		return out;
	}

	var i;

	for(i=-(r-1); i<r; i++){
		out.push([r, i]);
		out.push([-r, i]);
	}
	for(i=-r; i<=r; i++){
		out.push([i, r]);
		out.push([i, -r]);
	}


	return out;
}

var getPSNR = function (MSE) {
	var A = 20*Math.log10(255);
	return A - 10*Math.log10(MSE);
//	return 10*Math.log10(65025.0/MSE);
//	return 10*Math.log10(255*255/MSE);
}

// return MSE
var checkPlotRGB = function (plot_A, plot_B, plot_res) {
	var pA = plot_A.getPx();
	var pB = plot_B.getPx();
	var pR = plot_res.getPx();

	var Aw = plot_A.W;
	var Ah = plot_A.H;

	var Bw = plot_B.W;
	var Bh = plot_B.H;

	var Rw = plot_res.W;
	var Rh = plot_res.H;

	if((Aw != Bw)||(Ah != Bh)||(Rw != Aw)||(Rh != Ah)) return -1;

	var len = Aw*Ah;
	var size = pA.length;
//console.log('[checkPlotRGB]', size, len);
	var sum = 0;
	var i;
	var t1, t2, t3;
	for(i=0; i<size; i+=4){
		t1 = pA[i] - pB[i];
		t2 = pA[i+1] - pB[i+1];
		t3 = pA[i+2] - pB[i+2];

		sum += t1*t1 + t2*t2 + t3*t3;

		pR[i  ] = t1 + 127;
		pR[i+1] = t2 + 127;
		pR[i+2] = t3 + 127;
		pR[i+3] = 0xFF;
	}
	plot_res.updatePx();
	sum = sum / 3.0;
	return sum/len;
}

var pastePlot = function (MVs, ref, plot_out, block) {
	var refCx = ref.cx;
	var outCx = plot_out.cx;
	var W = ref.W;
	var H = ref.H;

	outCx.clearRect(0, 0, W, H);

	var len = MVs.length;

	var i,j;
	var x,y;
	var idx = 0;
	for(j=0; j<H; j+=block){
		for(i=0; i<W; i+=block){
			if(idx >= len) return;
			x = MVs[idx][0];
			y = MVs[idx][1];
			if(x+block > W) x = W-block-1;
			if(y+block > H) y = H-block-1;
			if(x < 0) x = 0;
			if(y < 0) y = 0;
			var imgd = refCx.getImageData(x, y, block, block);
			outCx.putImageData(imgd, i, j);
			idx++;
		}
	}
//	plot_out.updatePx();
}

var showMVs = function (MVs, plot_out, block) {
	var outCx = plot_out.cx;
	var W = plot_out.W;
	var H = plot_out.H;

	outCx.clearRect(0, 0, W, H);

	var len = MVs.length;

	var i,j;
	var x,y;
	var idx = 0;
	for(j=0; j<H; j+=block){
		for(i=0; i<W; i+=block){
			if(idx >= len) return;

			x = MVs[idx][0];
			y = MVs[idx][1];

			outCx.beginPath();
			outCx.moveTo(i,j);
			outCx.lineTo(x,y);
			outCx.stroke();

			idx++;
		}
	}
//	plot_out.updatePx();
}


