(function( $ ) {

Three.prototype = $.extend(Three.prototype, {
	// add a class
	addClass : function( name ){
		var object = this.last;
		// add the class to the markup 
		$(this.container).find("#"+ object.id ).addClass(name);
		
		var css = this.css($(this.container).find("#"+ object.id ) );
		this.cssSet( css );
		
		return this;
	}
	
});

})( jQuery );