
// generic method to create an element
Three.prototype.html = function(html){
		var self = this;
		
		// loop throught the elements of the dom
		$(html).filter('*').each(function(i, el){
			// is this a jQuery bug? 
			var $el = (typeof el == "undefined") ? false : $(el);
			
			// exit if there is no parent set
			if( !$el ) return;
			
			
			var options = {}; 
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
			self.html( $el.html() );
		
		});
		
	};
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
Three.prototype.createHTML = function( options ){
		// create markup
		var $tag = $('<'+ options.type +'>');
		// add id
		if( options.id )
			$tag.attr("id", options.id );
		// add attributes
		if( options["data-id"] )
			$tag.attr("data-id", options["data-id"] );
		
		// append to the dom
		$tag.appendTo(this.parent);
		
		// set as the new parent (for nesting)...
		this.parent = $tag; 
		
		return $tag;
	};
