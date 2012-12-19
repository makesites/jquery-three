(function( $ ) {
	
Three.prototype  = $.extend(Three.prototype, {
	// generic method to create an element
	html : function(html){
		var self = this;
		var options = {
			
		};
		// save markup parent for nesting...
		this.parent = html;
		
		// loop throught the elements of the dom
		$(html).filter('*').each(function(i, el){
			// is this a jQuery bug? 
			console.log( el.nodeName.toLowerCase() );
			var $el = $(el);
			// use the active scene if not specified
			//var parent = scene || this.active.scene;
			// get the type from the tag name
			options.type = el.nodeName.toLowerCase();
			options.id = $el.attr("id");
		
			// the set of attributes
			var attributes = self.getAttributes( el );
			//
			options = $.extend(options, attributes);
			
			self.add( options );
			
			// loop throught the children
			//self.html( el );
		
		});
		
	},
	/*
	htmlScene : function( html ){
		
		var self = this;
		var $scene = $(html);
		//make this optional? 
		var id = $scene.attr("id");
		// create a new scene
		this.scenes[id] = this.addScene( options );
		// get css attributes
		var css = this.css( $scene );
		this.cssScene( css );
		
		// render all supported objects 
		
		
	}, 
	htmlCamera : function( html ){
		
		this.cameras[id] = this.addCamera( options );
		
	}, 
	*/
	createHTML : function( options ){
		// create markup
		var $tag = $('<'+ options.type +'>');
		// add id
		if( options.id )
			$tag.attr("id", options.id );
		// add attributes
			
		// append to the dom
		$tag.appendTo(this.parent);
		
		return $tag;
	}
	
});

})( jQuery );