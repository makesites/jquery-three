(function( $ ) {
	
Three.prototype  = $.extend(Three.prototype, {
	
	createScene : function( html ){
		var $scene = $(html);
		var self = this;
		//make this optional? 
		var id = $scene.attr("id");
		// create a new scene
		this.scenes[id] = new THREE.Scene();
		// loop throught the (first level) children of the scene
		$scene.children().each(function(i, el){
			//
			self.add( this, self.scenes[id]); 
		});
		// render all supported objects 
		
		// get css attributes
		var css = this.css( $scene );
		
		this.cssScene( css );
		
		// don't set as active if it's 'hidden'
		if( css.display == "none" ) return;
		
		this.active.scene = this.scenes[id];
		
	}
	
});

})( jQuery );