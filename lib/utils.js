Three.prototype.colorToHex = function (color) {
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
	};

Three.prototype.setProperties = function() {
		return {
			width: $(this.el).width(),
			height: $(this.el).height(),
			aspect: ( $(this.el).width() / $(this.el).height() )
		};
	};


// internal object of utilities
var utils = {
	// Convert Dashed to CamelCase
	// based on: https://gist.github.com/tracend/5530356
	camelCase : function( string ){
		return  string.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
	},

	// unique (but not universal) id generator
	unid: function(){
		return Math.round( Math.random() * (new Date()).getTime() );
	},

	now: function(){
		if( !performance || !performance.now ) return new Date().getTime();
		return Math.floor( performance.now() ); // are the fractions of a millisecond significant?
	},
	// returns a 1x1 invisible texture
	// used when we have no texture data
	pixel: function(){
		var image = document.createElement( 'img' );
		var texture = new THREE.Texture( image );
		// not neeeded?
		image.addEventListener( 'load', function ( event ) {
			texture.needsUpdate = true;
		} );
		image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
		return texture;
	},
	// texture loader (support legacy)
	textureLoader: function( image ){
		var map = this.pixel();

		if( THREE.REVISION < 70 ){
			map = THREE.ImageUtils.loadTexture( image );
		} else {
			(new THREE.TextureLoader()).load(image, function( texture ){
				// update image source on the original map
				map.image = texture.image;
			});
		}
		// return immediantely (update asychronously)
		return map;
	},

	// Convert the color information of an image to height  data
	// source: http://oos.moxiecode.com/js_webgl/terrain/index.html
	getHeightData: function(img) {
		var canvas = document.createElement( 'canvas' );
		canvas.width = 128;
		canvas.height = 128;
		var context = canvas.getContext( '2d' );

		var size = 128 * 128, data = new Float32Array( size );

		context.drawImage(img,0,0);

		for ( var i = 0; i < size; i ++ ) {
			data[i] = 0;
		}

		var imgd = context.getImageData(0, 0, 128, 128);
		var pix = imgd.data;

		var j=0;
		for (var k = 0, n = pix.length; k < n; k += (4)) {
			var all = pix[k]+pix[k+1]+pix[k+2];
			data[j++] = all/30;
		}

		return data;
	}
};


/**
 * jQuery.toSelector - get the selector text of a jQuery object
 * https://gist.github.com/tracend/6402299
 *
 * Created by Makis Tracend ( @tracend )
 * Released under the MIT license
 * http://makesites.org/licenses/MIT
 */
(function( $ ) {

	$.fn.toSelector = function() {

		var node = $(this).get(0);
		var tag = node.tagName.toLowerCase();
		var id = $(this).attr("id");
		var classes = node.className.split(/\s+/);

		var selector = tag;
		if(typeof id !== "undefined"){
			selector += "#"+id;
		}
		if(typeof classes !== "undefined"){
			selector += "."+classes.join(".");
		}

		return selector;
	};

}( jQuery ));
