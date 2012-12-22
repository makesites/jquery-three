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
	
	setProperties: function() {
		return {
			width: $(this.container).width(),
			height: $(this.container).height(),
			aspect: ( $(this.container).width() / $(this.container).height() )
		};
	}
	
});

})( jQuery );