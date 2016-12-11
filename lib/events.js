// watch an element for changes
Three.prototype.watch = function( el ) {
	var self = this;
	var selector = $( el ).selector || "shadow-root"; // fallback to main root
	var element = $(this.el).toSelector() +" "+ selector;

	var node = document.getElementById("main").querySelector("shadow-root"), //$(this.el)[0], //$(element)[0],
		bubbles = false;

	// shim
	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

	var whatToObserve = { childList: true, attributes: true, subtree: true, attributeOldValue: true, attributeFilter: ['class', 'style']};
	//var whatToObserve = { childList: true, attributes: false, subtree: true };
	var attrObserver = new MutationObserver(function(mutationRecords) {
		$.each(mutationRecords, function(index, mutationRecord) {
			var e = mutationRecord;
			if (mutationRecord.type === 'childList') {
				if (mutationRecord.addedNodes.length > 0) {
				//DOM node added, do something
				//console.log("execute", mutationRecord );
				//console.log('DOMSubtreeModified', e.target.innerHTML.length, e.target );
				self.eventSubtree(e);
				} else if (mutationRecord.removedNodes.length > 0) {
				//DOM node removed, do something
				}
			}
			else if (mutationRecord.type === 'attributes') {
				if (mutationRecord.attributeName === 'class') {
				//class changed, do something
				self.eventAttribute(e);
				}
			}
		});
	});

	attrObserver.observe(node, whatToObserve);

	// monitor new elements
	/*
	$('body').on('DOMSubtreeModified', element, function(e){
		console.log(e);
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
	*/

	var observeStyles = new MutationObserver(function (mutations) {
		mutations.forEach(stylesModified);
	});
	observeStyles.observe(node, { childList: false, attributes: true, subtree: true, attributeFilter: ['class', 'style'] });


	// monitor css style changes
	function stylesModified(mutation) {
		var el = mutation.target,
		name = mutation.attributeName,
		newValue = mutation.target.getAttribute(name),
		oldValue = mutation.oldValue;
		// skip all id, data-id updates (not editable from the user)
		//if( name == 'id' || name == 'data-id' ) return;
		// styling updates
		if( name == 'style' ){
			var object = self.objects[ el.getAttribute('data-id') ] || self.active.terrain;
			var webgl = object.children[0] || object;
			var css = css2json(newValue); // validate?
			// HACK: why is terrain using this.last?
			self.last = webgl;
			self.fn.css.set.call(self, webgl, css );
		}
		//console.log(name, newValue, oldValue);
	}

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
	if(e.target.innerHTML.length === 0) return;
	// Handle new content
	//var html = e.target.innerHTML;
	var html = $(e.target).html();
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
