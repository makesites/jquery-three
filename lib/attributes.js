(function( $ ) {

Three.prototype = $.extend(Three.prototype, {
	// get attributes from tags
	getAttributes: function( html ){
		// 
		var data={};
		// filter only the ones with the data- prefix
		$(html).each(function(){
			
			var attr = this.attributes;
				
			for( var i in attr ){
				if( attr[i].name && attr[i].name.search("data-") === 0 ){
					var key = attr[i].name.replace("data-", "");
					var val = attr[i].value;
					// check if it's a number...
					data[key] = ( parseInt(val, 10) ) ? parseInt(val, 10) :  val;
				} else if( attr[i].name && attr[i].name.search("class") === 0 ){
					// add classes
					var classes = attr[i].value.split(" ");
					data["class"] = classes;
				}
			}
		
		});
		
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