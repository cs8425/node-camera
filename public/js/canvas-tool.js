var plot = function (ele) {
	this.jqele = $(ele);
	this.ele = this.jqele[0];
	this.W = this.ele.width;
	this.H = this.ele.height;
	this.cx = this.ele.getContext('2d');
	this.imgData = this.cx.getImageData(0, 0, this.W, this.H);
	this.pix = this.imgData.data;
	this.cx.imageSmoothingEnabled = false;
};

plot.prototype = {
	getMousePos: function (evt) {
		var rect = this.ele.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	},
	getPx: function () {
		this.imgData = this.cx.getImageData(0, 0, this.W, this.H);
		this.pix = this.imgData.data;
		return this.pix;
	},
	updatePx: function () {
		this.cx.putImageData(this.imgData, 0, 0);
		this.pix = this.imgData.data;
	},
	setImg: function (img) {
		this.cx.putImageData(img, 0, 0);
	},
	getPxByte: function(x,y){
		return this.pix[4*(x + W*y)];
	},
	copyFrom: function(_plot){
		this.W = _plot.ele.width;
		this.H = _plot.ele.height;
		this.imgData = _plot.cx.getImageData(0, 0, this.W, this.H);
		this.pix = this.imgData.data;
		this.cx.imageSmoothingEnabled = false;
		this.updatePx();
	},
	updateSize: function () {
		this.W = this.ele.width;
		this.H = this.ele.height;
	},
};



