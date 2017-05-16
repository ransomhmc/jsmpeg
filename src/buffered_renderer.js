
var getQueryString = function ( field, url ) {
    var href = url ? url : window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
};

class BufferedFrame {
		constructor(_y,_cb,_cr,_frameCount) {
			this.y = new Uint8ClampedArray(_y.length);
			this.cb = new Uint8ClampedArray(_cb.length);
			this.cr = new Uint8ClampedArray(_cr.length);
			this.frameCount = _frameCount;

			this.y.set(_y);
			this.cb.set(_cb);
			this.cr.set(_cr);
		}
	};

var BufferFunc = function(self) {
	var queueLowerBound = self.bufferParams['queueLowerBound'];
	var queueUpperBound = self.bufferParams['queueUpperBound'];
	var frameInterval = self.bufferParams['frameInterval'];

	if (self.buffer.length < queueLowerBound) {
		console.log('frame interval='+frameInterval+'ms,queue length = '+self.buffer.length+", buffer underflow, wait until "+queueLowerBound);
		return;
	}

	var frame = self.buffer.shift();
	//console.log('shift & render: '+frame.frameCount+', length='+self.buffer.length);

	var now = new Date().getTime();
	//console.log('will render: '+now);
	self.renderer.render(frame.y,frame.cb,frame.cr);

	var dropCount = self.buffer.length - queueUpperBound;
	if (dropCount > 0) {
		//console.log('queue length = '+self.buffer.length+", buffer overflow, drop "+dropCount);
	}
	
	while (dropCount > 0) {
		frame = self.buffer.shift();
		//console.log('shift & drop: '+frame.frameCount);
		dropCount--;
	}

};

JSMpeg.Renderer.BufferedRendererAdapter = (function(){ "use strict";

var BufferedRenderer = function(options) {
	this.renderer = options.renderer;
	this.buffer = [];
	this.frameCountPushed = 0;
	this.busy = false;
	this.previousPushtime = 0;
	this.incomingDiffArray = [];

	this.bufferParams = {
		'frameInterval' : 200,
		'queueLowerBound' : 50,
		'queueUpperBound' : 100
	}

	if (getQueryString('lowerBound')) this.bufferParams['queueLowerBound'] = getQueryString('lowerBound');
	if (getQueryString('upperBound')) this.bufferParams['queueUpperBound'] = getQueryString('upperBound');
	if (getQueryString('interval')) this.bufferParams['frameInterval'] = getQueryString('interval');
//return;
	setInterval(BufferFunc,this.bufferParams['frameInterval'],this);
};

BufferedRenderer.prototype.destroy = function() {
	this.renderer.destroy();
};

BufferedRenderer.prototype.resize = function(width, height) {
	this.renderer.resize(width,height);
};

BufferedRenderer.prototype.renderProgress = function(progress) {
	this.renderer.renderProgress(progress);
};

BufferedRenderer.prototype.prebuf = function() {
	var now = Date.now();
	console.log('prebuf:array length='+this.incomingDiffArray.length);
	if (this.previousPushtime > 0) {
		this.incomingDiffArray.push(now - this.previousPushtime);
		console.log('incomingDiff['+this.incomingDiffArray.length+']:'+this.incomingDiffArray[this.incomingDiffArray.length-1]);
		var i;
		var diffTotal = 0;
		
		for (i=0;i<this.incomingDiffArray.length;i++) {
			console.log('['+i+']='+this.incomingDiffArray[i]);
			diffTotal += this.incomingDiffArray[i];
		}
		console.log('average frame interval:'+diffTotal+'/'+this.incomingDiffArray.length+'='+diffTotal/this.incomingDiffArray.length);
	}
};

BufferedRenderer.prototype.render = function(y, cb, cr) {
	//
	
	var frame = new BufferedFrame(y,cb,cr,this.frameCountPushed++);
	this.buffer.push(frame);
	
	if (this.buffer.length < this.bufferParams['queueLowerBound']) {
		this.prebuf();
	}
	else {
		this.incomingDiffArray = [];
	}
	this.previousPushtime = Date.now();
};

BufferedRenderer.prototype.YCbCrToRGBA = function(y, cb, cr, rgba) {
	this.renderer.YCbCrToRGBA = renderer.YCbCrToRGBA(y,cb,cr,rgba);
};

return BufferedRenderer;

})();


