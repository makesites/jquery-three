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
	};
	
	Three = function( obj, options, callback ){
		
		var self = this;
		this.container = obj;
		this.options = $.extend(defaults, options);
		// main buckets
		this.objects = {};
		this.scenes = {};
		this.cameras = {};
		// pointers for objects
		this.last = false;
		this.parent = false;
		
		// Dependencies (replace with AMD module?)
		$.getScript("https://raw.github.com/mrdoob/three.js/master/build/three.min.js", function () {
			self.init( options );
			// execute callback
			if(typeof callback != "undefined") callback( self );
		
		});

};

Three.prototype = {
	init : function( options ) {
		
		var self = this;
		var settings = $.extend( defaults, options );
		
		this.active = {
			scene: false,
			camera: false, 
			skybox: false
		};
		
		// init renderer
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( $(this.container).width(), $(this.container).height() );
		// condition this!
		this.renderer.autoClear = false;
		
		// check if the container has (existing) markup
		var html = $(this.container).html();
		// clear it off...
		$(this.container).html("<shadow-root></shadow-root>");
		this.parent = $(this.container).find("shadow-root");
		this.html( html );
		
		//document.body.appendChild( this.renderer.domElement );
		$( this.renderer.domElement ).appendTo( this.container );
		
		// set first as active (refactor later)
		//this.active.scene = this.scenes[0];
		//this.active.camera = this.cameras[0];
		// don't set as active if it's 'hidden'
		//if( css.display == "none" ) return;
		
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
	// one cycle in an infinite loop
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
		
		//
		if( this.active.scene && this.active.camera ){
			// render the skybox as a first pass
			if( this.active.skybox ){
				this.active.skybox.camera.rotation.copy( this.active.camera.rotation );
				this.renderer.render( this.active.skybox.scene, this.active.skybox.camera );
					
			}
			this.renderer.render( this.active.scene, this.active.camera );
		}
		
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
