// watch an element for changes
Three.prototype.watch = function( el ) {
	var self = this;
	var element = $(this.el).toSelector() +" "+ $( el ).selector;
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
	e.stopPropagation();

	// variables
	var $root = $( $(this.el).toSelector() +" shadow-root" ).get(0);
	var $target = $(e.target).get(0);

	// don't go above the root
	this.parent = ( $root == $target ) ? $(e.target) : $(e.target).parent();
	this.target = $(e.target);

	if (e.target.innerHTML.length > 0) {
		// Handle new content
		//var html = e.target.innerHTML;
		var html = $(e.target).html();
		//this.newEl = $(e.target).children().last();
		// #46 parsing one tag at a time
		//html = $(html).html("").get(0);
		//this.newEl = $(html).last();
		this.append( html, { silent : true, target: this.target, traverse: false, watch: true });
	}
};

// - updated attribute
Three.prototype.eventAttribute = function(e) {
	e.stopPropagation();

	console.log("attribute",  e.target );

};

// - updated style(s)

