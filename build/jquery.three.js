/**
* jQuery Three() - jQuery extension with 3D methods (using Three.js)
* Created by: Makis Tracend (@tracend)
*
* Copyright © 2012 Makesites.org
* Licensed under the MIT license
*
**/

// RequestAnimationFrame shim - Source: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = ( function( callback ) {
	return window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function ( callback ) {
		window.setTimeout( callback, 1000 / 60 );
	};
})();

(function( $ ) {
	var defaults = {
		fov: 45, 
		aspect: 4/3, 
		near: 1, 
		far: 1000
	};
	
	Three = function( obj, options, callback ){
		
		var self = this;
		this.container = obj;
		this.options = $.extend(defaults, options);
		// main buckets
		this.objects = {};
		this.scenes = {};
		this.cameras = {};
		this.last = "";
		
		// Dependencies (replace with AMD module?)
		$.getScript("https://raw.github.com/mrdoob/three.js/master/build/three.min.js", function () {
		self.init( options );
		// execute callback
		if(typeof callback != "undefined") callback( self );
		
	});

};

Three.prototype = {
	init : function( options ) {
		
		var settings = $.extend( defaults, options );
		
		// scene
		this.scene = new THREE.Scene();
		
		// camera
		this.camera = new THREE.PerspectiveCamera( settings.fov, settings.aspect, settings.near, settings.far );
		this.camera.position.set( 0, - 450, 400 );
		this.camera.rotation.x = 45 * ( Math.PI / 180 );
		this.scene.add( this.camera );
		
		// renderer
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( $(this.container).width(), $(this.container).height() );
		
		//document.body.appendChild( this.renderer.domElement );
		$( this.renderer.domElement ).appendTo( this.container );
		
		this.tick();
		
	},
	destroy : function( ) {
		
		return this.each(function(){
			
			var $this = $(this),
			three = $this.data('three');
			$this.removeData('three');
			
		});
	
	},
	// check if the obj has a Three() class attached to it
	self: function(options, callback){
		
		var list = [];
		
		this.each(function(){
			
			var $this = $(this), 
			three = $this.data('three');
			
			// check if three has initialized for the ocntainer
			if ( ! three ) {
				three = new Three( this, options, callback);
				$(this).data('three', three);
			}
			
			// push the lib down the display list
			list.push( three );
			
		});
		
		// return as a jQuery object 
		return $(list);
		
	}, 
	tick : function() {
		
		var self = this;
		// update vars for objects
		// 
		this.render();
		// loop on the next click
		requestAnimFrame(function(){ self.tick(); });
		
	}, 
	render : function() {
		// apply transformations
		this.renderer.render( this.scene, this.camera );
		
	}, 
	
	show : function( ) {  },
	hide : function( ) { },
	update : function( content ) { },
	/**
	 * Detect features
	 * Inspired by Three's Detect.js
	 * https://github.com/mrdoob/three.js/blob/master/examples/js/Detector.js
	 */
	detect: function(){ 
	
		return {
			canvas: !! window.CanvasRenderingContext2D,
			webgl: ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )(),
			workers: !! window.Worker,
			fileapi: window.File && window.FileReader && window.FileList && window.Blob,
		
			all: function () {
				return ( this.webgl && this.canvas && this.workers && this.fileapi );
			}
		};
	}

};


$.fn.three = function( options, callback ) {
	// fallbacks
	var a = options || ( options = false );
	var b = callback || ( callback = function(i){  return i; } );
	
	return Three.prototype.self.apply( this, arguments, options, callback ); 

/*
if( !options) {

} else {
return this.each(function(){

new Three( options );
}
}   

if ( Three[method] ) {
return Three[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
} else if ( typeof method === 'object' || ! method ) {
return Three.init.apply( this, arguments );
} else {
$.error( 'Method ' +  method + ' does not exist on jQuery.Three' );
}    
*/
};

})( jQuery );

(function( $ ) {

Three.prototype = $.extend(Three.prototype, {
	// add a class
	addClass : function( name ){
		var object = this.last;
		// add the class to the markup 
		$(this.container).find("#"+ object.id ).addClass(name);
		
		var css = this.css($(this.container).find("#"+ object.id ) );
		this.cssSet( css );
		
		return this;
	}
	
});

})( jQuery );
(function( $ ) {

Three.prototype = $.extend(Three.prototype, {
	// CSS Methods
	css : function (a){
		var sheets = document.styleSheets, o = {};
		for(var i in sheets) {
			var rules = sheets[i].rules || sheets[i].cssRules;
			for(var r in rules) {
				if(a.is(rules[r].selectorText)) {
					o = $.extend(o, this.css2json(rules[r].style), this.css2json(a.attr('style')));
				}
			}
		}
		return o;
	}, 
	cssSet : function( css ){
		var object = this.last;
		
		for( var attr in css ){
			
			// supported attributes
			switch(attr){
				// - width
				case "width":
				object.mesh.scale.x = parseInt(css[attr], 10);
				break;
				// - height
				case "height":
				object.mesh.scale.y = parseInt(css[attr], 10);
				break;
				case "left":
				object.mesh.position.x = parseInt(css[attr], 10);
				break;
				case "top":
				object.mesh.position.y = parseInt(css[attr], 10);
				break;
				// - color
				case "color":
				var color =  this.colorToHex(css[attr]);
				var material = new THREE.MeshBasicMaterial( { color: color } );
				object.mesh.material = material;
				break;
				
			}
			
		}
		
	},
	css2json : function (css){
		var s = {};
		if(!css) return s;
		if(css instanceof CSSStyleDeclaration) {
			for(var i in css) {
				if((css[i]).toLowerCase) {
					s[(css[i]).toLowerCase()] = (css[css[i]]);
				}
			}
		} else if(typeof css == "string") {
			css = css.split("; ");          
			for (var j in css) {
				var l = css[j].split(": ");
				s[l[0].toLowerCase()] = (l[1]);
			}
		}
		return s;
	}

});

})( jQuery );
(function( $ ) {
	
Three.prototype = $.extend(Three.prototype, {
	
	animate: function(){
		//this.mesh.rotation.z = Date.now() / 1000;
		
	}
	
});

})( jQuery );
(function( $ ) {
	
Three.prototype = $.extend(Three.prototype, {
	
	
});

})( jQuery );
(function( $ ) {
	
Three.prototype = $.extend(Three.prototype, {
	// generic method to add an element
	add : function(){
		//switch
	},
	// add a plane
	addPlane : function( name ){
		
		// plane - by default a 1x1 square
		var geometry = new THREE.PlaneGeometry( 1, 1 );
		geometry.dynamic = true;
		var material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
		this.objects[name] = { id: name, mesh: new THREE.Mesh( geometry, material ) };
		
		this.scene.add( this.objects[name].mesh );
		
		// append to the dom
		$('<plane>').attr("id", name).appendTo(this.container);
		
		// set a reference to the last list
		this.last = this.objects[name];
		
		// set css attributes
		var css = this.css($(this.container).find("#"+ name ) );
		this.cssSet( css );
		
		return this;
		
	}
	
});

})( jQuery );
(function( $ ) {
	
Three.prototype  = $.extend(Three.prototype, {
	
	
});

})( jQuery );
(function( $ ) {
	
Three.prototype = $.extend(Three.prototype, {
	
	
});

})( jQuery );
(function( $ ) {

Three.prototype = $.extend(Three.prototype, {

	colorToHex : function (color) {
		if (color.substr(0, 1) === '#') {
			return color.replace("#", "0x");
		}
		var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
		
		var red = parseInt(digits[2], 10).toString(16);
		var green = parseInt(digits[3], 10).toString(16);
		var blue = parseInt(digits[4], 10).toString(16);
		
		// add leading zeros if necessary
		
		if(red.length == 1) red = "0"+red;
		if(green.length == 1) green = "0"+green;
		if(blue.length == 1) blue = "0"+blue;
		
		return '0x' + red + green + blue;
	}

});

})( jQuery );