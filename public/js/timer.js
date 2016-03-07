var Timer = function() {
	this.startTime = null;
	this.mark = {};
};
Timer.prototype.reset = function(mark) {
	if(mark){
		delete this.mark[mark];
	}else{
		this.mark = {};
	}
};
Timer.prototype.start = function() {
	this.startTime = new Date();
};
Timer.prototype.end = function(mark) {
	this.mark[mark] = (new Date()) - this.startTime;
};

Timer.prototype.show = function(mark) {
	if(mark){
		return this.mark[mark];
	}else{
		return this.mark;
	}
};

