
// generic method to create an element
Three.prototype.html = function(html, options){
		var self = this;
		// fallbacks
		options = options || {};
		options.target = options.target || this.target;
		if( typeof options.traverse === "undefined") options.traverse = true;

		// loop throught the elements of the dom
		$(html).filter('*').each(function(i, el){
			// is this a jQuery bug?
			var $el = (typeof el == "undefined") ? false : $(el);

			// exit if there is no parent set
			if( !$el ) return;
			// if there's a data id this is an attribute change we don't want to monitor
			if( typeof $el.attr("data-id") !== "undefined" ) return;

			var attr = {};
			// use the active scene if not specified
			//var parent = scene || this.active.scene;
			// get the type from the tag name
			attr.type = el.nodeName.toLowerCase();
			attr.id = $el.attr("id");

			// the set of attributes
			var attributes = self.getAttributes( el );
			//
			attr = $.extend(attr, attributes);

			self.newEl = options.target.children(":eq("+i+")");
			// if we can't find the new element quit
			if( options.watch && !self.newEl.length ) return;
			self.add( attr, options );

			// loop through the children (only if el not empty)
			if( $el.html() !== "" && options.traverse)
				self.html( $el.html(), options );

		});

		return this;

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
		if( options.id ){
			$tag.attr("id", options.id );
		}
		// add attributes
		if( options["data-id"] ){
			$tag.attr("data-id", options["data-id"] );
		}
		// add classes
		if(options["class"] && options["class"].length) {
			var classes = options["class"].join(" ");
			$tag.attr("class", classes );
		}
		// add inline styles
		if( options.style ){
			$tag.attr("style", options.style );
		}
		// append to the dom
		$tag.appendTo(this.parent);

		// set as the new parent under certain conditions (for nesting)...
		if(options.type == "scene" || options.type == "asset" || options.type == "player"){
			this.parent = $tag;
		}

		// add listening events (if enabled)
		//if(this.options.watch) this.watch($tag);

		return $tag;
	};

Three.prototype.append = function(html, options){
	options = options || {};
	// pickup active scene
	//var scene = this.active.scene;
	// add the submitted markup (validation?)
	//$(this.el).find("[data-id='"+ scene.id +"']").append( html );
	this.html( html, options );
	// #38 preserve chainability...
	return this;
};