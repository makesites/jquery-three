(function( $ ) {

Three.prototype = $.extend(Three.prototype, {
	// get attributes from tags
	getAttributes: function( html ){
		// create a dom node from the markup
		var div = document.createElement('div');
		div.innerHTML = html;
		var el = div.firstChild ;
		// get attributes
		var attr = el.attributes;
		var data={};
		// filter only the ones with the data- prefix
		for( var i in attr ){
			if( attr[i].name && attr[i].name.search("data-") === 0 ){
				var key = attr[i].name.replace("data-", "");
				var val = attr[i].value;
				// check if it's a number...
				data[key] = ( parseInt(val, 10) ) ? parseInt(val, 10) :  val;
			}
		}
		
		return data;
	}, 
	
	// add a class
	addClass : function( name ){
		var object = this.last;
		// add the class to the markup 
		var $el = $(this.container).find("[data-id='"+ object.id +"']");
		$el.addClass(name);
		
		var css = this.css( $el );
		this.cssSet( css );
		
		return this;
	}
	
});

})( jQuery );