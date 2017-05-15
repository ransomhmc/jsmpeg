
class BufferedFrame {
		constructor(_y,_cb,_cr,_frameCount) {
			this.y = _y;
			this.cb = _cb;
			this.cr = _cr;
			this.frameCount = _frameCount;
		}
	};

JSMpeg.Renderer.BufferedRendererAdapter = (function(){ "use strict";

var BufferedRenderer = function(options) {
	this.renderer = options.renderer;
	this.buffer = [];
	this.frameCountPushed = 0;
	this.busy = false;
	
	setInterval(function(self) {
		if (self.busy) {
			console.log('busy');
			return;
		}

		self.busy = true;
		//console.log('consumer! length='+self.buffer.length);
		var queueLowerBound = 50;
		var queueUpperBound = 100;
		if (self.buffer.length < queueLowerBound) {
			//console.log('queue length = '+self.buffer.length+", buffer underflow, wait until "+queueLowerBound);
			self.busy = false;
			return;
		}

		var frame = self.buffer.shift();
		//console.log('shift & render: '+frame.frameCount+', length='+self.buffer.length);
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
		self.busy = false;
		
	},10,this);
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

BufferedRenderer.prototype.render = function(y, cb, cr) {
	//
	var frame = new BufferedFrame(y,cb,cr,this.frameCountPushed++);
	this.buffer.push(frame);
	//var frame2 = this.buffer.shift();
	//this.renderer.render(frame2.y,frame2.cb,frame2.cr);
	//this.renderer.render(frame.y,frame.cb,frame.cr);
	//console.log('push: '+frame.frameCount+', length='+this.buffer.length);
};

BufferedRenderer.prototype.YCbCrToRGBA = function(y, cb, cr, rgba) {
	this.renderer.YCbCrToRGBA = renderer.YCbCrToRGBA(y,cb,cr,rgba);
};

return BufferedRenderer;

})();


