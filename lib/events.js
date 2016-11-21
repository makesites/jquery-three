// watch an element for changes
Three.prototype.watch = function( el ) {
	var self = this;
	var selector = $( el ).selector || "shadow-root"; // fallback to main root
	var element = $(this.el).toSelector() +" "+ selector;
	// monitor new elements
	$('body').on('DOMSubtreeModified', element, function(e){
		self.eventSubtree(e);
	});
	// monitor attribute changes
	if (el.onpropertychange){
		$('body').on('propertychange', element, function(e){
			self.eventAttribute(e);
		});
	}
	else {
		$('body').on('DOMAttrModified', element, function(e){
			self.eventAttribute(e);
		});
	}
	// monitor css style changes

};

// - new element
Three.prototype.eventSubtree = function(e) {
	e.stopPropagation(); // mutation event doesn't propagate?

	// variables
	var $root = $( $(this.el).toSelector() +" shadow-root" ).get(0);
	var $target = $(e.target).get(0);

	// don't go above the root
	this.parent = ( $root == $target ) ? $(e.target) : $(e.target).parent();
	this.target = $(e.target);

	// exclude shadow-root
	//if( $root == $target ) return;
	// exclude empty targets
	if(e.target.innerHTML.length == 0) return;
	// Handle new content
	//var html = e.target.innerHTML;
	//var html = $(e.target).html();
	//var wrapper = $(html).eq(0)[0];
	// FIX: exclude empty div tags (dead-ends)
	//if( wrapper.tagName == "DIV" &&
	//if( wrapper.toString().substr(0, 5).toLowerCase() == "<div>" ) return;
	//	html = wrapper.childNodes[0].toString().trim();
	//this.newEl = $(e.target).children().last();
	// #46 parsing one tag at a time
	//html = $(html).html("").get(0);
	//this.newEl = $(html).last();
	this.append( html, { silent : true, target: this.target, traverse: false, watch: true });

};

// - updated attribute
Three.prototype.eventAttribute = function(e) {
	e.stopPropagation();

	console.log("attribute",  e.target );

};

// - updated style(s)
