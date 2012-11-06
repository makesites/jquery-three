/**
* jQuery Three() - jQuery extension with 3D methods (using Three.js)
* Created by: Makis Tracend (@tracend)
*
* Dual licensed under the MIT and GPL licenses
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
		
		
	}
	var Three = function( obj, options ){
		
		var self = this;
		this.container = obj;
		this.options = $.extend(defaults, options);
		
		// Dependencies (replace with AMD module?)
		$.getScript("http://www.html5canvastutorials.com/libraries/Three.js", function () {
			self.init();
		});
	}

Three.prototype = {
     init : function( options ) {
		 
			// scene
			this.scene = new THREE.Scene();
			
			// camera
			this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
			this.camera.position.set( 0, - 450, 400 );
			this.camera.rotation.x = 45 * ( Math.PI / 180 );
			this.scene.add( this.camera );
			
			// plane
			this.geometry = new THREE.PlaneGeometry( 300, 300 );
			this.material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
			this.mesh = new THREE.Mesh( this.geometry, this.material );
			
			this.scene.add( this.mesh );
			
			// renderer
			this.renderer = new THREE.WebGLRenderer();
			this.renderer.setSize( window.innerWidth, window.innerHeight );
			
			document.body.appendChild( this.renderer.domElement );
			
			this.animate();
     		
     },
     destroy : function( ) {

       return this.each(function(){

         var $this = $(this),
             three = $this.data('three');
			 // Namespacing FTW
			 $this.removeData('three');

       })

     },
	 // check if the obj has a Three() class attached to it
	 self: function(){
		 
       return this.each(function(){

         var $this = $(this), 
		 three = $this.data('three');
		 
		 // check if three has initialized for the ocntainer
		 if ( ! three ) {
         
		 	three = new Three( this, arguments );
           $(this).data('three', three);
			
         }
		  
		  // either way, return the Three class
			return three;
		 
	   });
	   
	 }, 
	animate : function() {
		
		var self = this;
		// update vars for objects
		this.mesh.rotation.z = Date.now() / 1000;
		// 
		this.render();
		// loop on the next click
		requestAnimFrame(function(){ self.animate() });
		
	}, 
	render : function() {
		// apply transformations
		this.renderer.render( this.scene, this.camera );
		
	}, 
     show : function( ) {  },
     hide : function( ) { },
     update : function( content ) { }
  };

  
  $.fn.three = function( options ) {
    // fallback
	options || ( options = false );
	
	return Three.prototype.self.apply( this, arguments );
	
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
