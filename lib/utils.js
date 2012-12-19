(function( $ ) {

Three.prototype = $.extend(Three.prototype, {

	colorToHex : function (color) {
		if (color.substr(0, 1) === '#') {
			return color.replace("#", "0x");
		}
		var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
		
		var red = parseInt(digits[2], 10).toString(16);
		var green = parseInt(digits[3], 10).toString(16);
		var blue = parseInt(digits[4], 10).toString(16);
		
		// add leading zeros if necessary
		
		if(red.length == 1) red = "0"+red;
		if(green.length == 1) green = "0"+green;
		if(blue.length == 1) blue = "0"+blue;
		
		return '0x' + red + green + blue;
	}, 
	
	getAttributes: function( id ){
		var attr=document.getElementById( id ).attributes;
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
	}
	
});

})( jQuery );