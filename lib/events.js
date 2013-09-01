// watch an element for changes
Three.prototype.watch = function( el ) {
	var element = $(this.container).toSelector() +" "+ $( el ).selector;
	// monitor new elements
	$('body').on('DOMSubtreeModified', element, this.eventSubtree);
	// monitor attribute changes
	if (el.onpropertychange){
		$('body').on('propertychange', element, this.eventAttribute);
	}
	else {
		$('body').on('DOMAttrModified', element, this.eventAttribute);
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

