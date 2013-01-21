
	var defaults = {
		watch : false, 
		//deps : { "THREE" : "http://cdnjs.cloudflare.com/ajax/libs/three.js/r54/three.min.js" }
		deps : { 
			"THREE" : "https://raw.github.com/mrdoob/three.js/master/build/three.min.js"
			//"FresnelShader" : ""
		}
		
	};
	
	Three = function( obj, options, callback ){
		
		var self = this;
		this.container = obj;
		this.options = $.extend(true, defaults, options);
		// main buckets
		this.objects = {};
		this.scenes = {};
		this.cameras = {};
		this.materials = {};
		// pointers for objects
		this.last = false;
		this.parent = false;
		
		// Dependencies (replace with AMD module?)
		this.dependencies( function () {
			self.init();
			// execute callback
			if( callback instanceof Function ) callback( self );
		
		});

};

Three.prototype = {
	init : function() {
		
		var self = this;
		// create active object
		this.active = {
			scene: false,
			camera: false, 
			skybox: false
		};
		// set properties
		this.properties = this.setProperties();
		
		// init renderer
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( this.properties.width,  this.properties.height);
		// condition this!
		this.renderer.autoClear = false;
		
		// #23 - remove fallback message
		$(this.container).find(".fallback").remove();
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
		
		// resize event listener
		window.addEventListener( 'resize', function(){
			self.resize();
		}, false );
		
		// #31 - live watching DOM updates
		if( this.options.watch ) this.watch(this.container);
		
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
		// collapse the array if only one item
		return (list.length == 1) ?  list[0] : $(list);
		
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
		$(this.container).trigger({
			type: "update",
			target: this
		});
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
	}, 
	// trigger when the window is resized
	resize: function(){
		
		// update properties
		this.properties = this.setProperties();
		
		// loop through cameras
		for( var i in this.cameras ){
			
			this.cameras[i].aspect = this.properties.aspect;
			this.cameras[i].updateProjectionMatrix();
			// better way of targeting skybox???
			this.active.skybox.aspect = this.properties.aspect;
			this.active.skybox.updateProjectionMatrix();
			
		}
		
		this.renderer.setSize( this.properties.width, this.properties.height );
	}, 
	
	dependencies : function( callback ){
		
		var scripts = $.map( this.options.deps , function (item, index) {
				// checking if the namespace is available
				if( window[index] || ( window.THREE && window.THREE[index] ) ) return;
                return item;
            });
		
		// replace this with a proper dependency loader... 
		if( scripts.length ){
			this.loadScripts(scripts, callback);
		} else {
			callback();
		}

	}, 
	loadScripts : function(scripts, callback){
		var self = this;
		 
		$.when( $.getScript( scripts.shift() ) ).done(function(){
			if( scripts.length > 0 ){
				self.loadScripts(scripts, callback);
			} else {
				// once the scripts are all loaded
				callback();
			}
		});
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
