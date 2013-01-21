// watch an element for changes
Three.prototype.watch = function( el ) {
	// monitor new elements 
	$( el ).bind('DOMSubtreeModified', this.eventSubtree);
	// monitor attribute changes
	if (el.onpropertychange){
		$( el ).bind( 'propertychange', this.eventAttribute );
	}
	else {
		$( el ).bind( 'DOMAttrModified', this.eventAttribute );
	}
	// monitor css style changes
	
	
};

// - new element
Three.prototype.eventSubtree = function(e) {
	
	if (e.target.innerHTML.length > 0) {
		// Handle new content
		console.log( e.target.innerHTML );
	}
};

// - updated attribute
Three.prototype.eventAttribute = function(e) {
	
	console.log("attribute",  e.target );
	
};

// - updated style(s)

