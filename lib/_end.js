
// Prototype
Three.prototype.css = css;
Three.prototype.find = find;
Three.prototype.fn = fn;
//Three.prototype.fn.webgl = fn.webgl;
//Three.prototype.utils = utils;

// #39 Wildcard extension - replace this hardcoding list with a proper wildcard method, once available (Proxy)
//Three.prototype.__noSuchMethod__ = fn.three;
Three.prototype.lookAt = function(){
	return this.fn.three.call(this, "lookAt", arguments);
};

}));