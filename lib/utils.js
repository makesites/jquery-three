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

	// Based on undercore _.delay
	delay: function (fn, timeout) {
		timeout = timeout || 0;
		var args = Array.prototype.slice.call(arguments, 2);
		return setTimeout(function () { return fn.apply(null, args); }, timeout);
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
			// FIX: support base64 images
			if( image.search(";base64,") > -1 ) image = image.replace(/data:image\/(png|jpg|jpeg);base64,/, "");
			map = THREE.ImageUtils.loadTexture( image );
		} else {
			(new THREE.TextureLoader()).load(image, function( texture ){
				// update image source on the original map
				map.image = texture.image;
				map.needsUpdate = true;
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
	},

	getFile: function (url) {
		// if already downloaded return the same content
		if( files[url] ) return files[url];
		files[url] = $.ajax({
			type		: "GET",
			url			: url,
			dataType	: "string",
			async		: false,
			success		: function(data) {
				files[url] = data;
			}
		}).responseText;
		return files[url];
	},

	//THREE.BufferGeometryUtils
	// @author mrdoob / http://mrdoob.com/
	computeTangents: function ( geometry ) {

		var index = geometry.index;
		var attributes = geometry.attributes;

		// based on http://www.terathon.com/code/tangent.html
		// (per vertex tangents)

		if ( index === null ||
			 attributes.position === undefined ||
			 attributes.normal === undefined ||
			 attributes.uv === undefined ) {

			console.warn( 'THREE.BufferGeometry: Missing required attributes (index, position, normal or uv) in BufferGeometry.computeTangents()' );
			return;

		}

		var indices = index.array;
		var positions = attributes.position.array;
		var normals = attributes.normal.array;
		var uvs = attributes.uv.array;

		var nVertices = positions.length / 3;

		if ( attributes.tangent === undefined ) {

			geometry.addAttribute( 'tangent', new THREE.BufferAttribute( new Float32Array( 4 * nVertices ), 4 ) );

		}

		var tangents = attributes.tangent.array;

		var tan1 = [], tan2 = [];

		for ( var k = 0; k < nVertices; k ++ ) {

			tan1[ k ] = new THREE.Vector3();
			tan2[ k ] = new THREE.Vector3();

		}

		var vA = new THREE.Vector3(),
			vB = new THREE.Vector3(),
			vC = new THREE.Vector3(),

			uvA = new THREE.Vector2(),
			uvB = new THREE.Vector2(),
			uvC = new THREE.Vector2(),

			sdir = new THREE.Vector3(),
			tdir = new THREE.Vector3();

		function handleTriangle( a, b, c ) {

			vA.fromArray( positions, a * 3 );
			vB.fromArray( positions, b * 3 );
			vC.fromArray( positions, c * 3 );

			uvA.fromArray( uvs, a * 2 );
			uvB.fromArray( uvs, b * 2 );
			uvC.fromArray( uvs, c * 2 );

			var x1 = vB.x - vA.x;
			var x2 = vC.x - vA.x;

			var y1 = vB.y - vA.y;
			var y2 = vC.y - vA.y;

			var z1 = vB.z - vA.z;
			var z2 = vC.z - vA.z;

			var s1 = uvB.x - uvA.x;
			var s2 = uvC.x - uvA.x;

			var t1 = uvB.y - uvA.y;
			var t2 = uvC.y - uvA.y;

			var r = 1.0 / ( s1 * t2 - s2 * t1 );

			sdir.set(
				( t2 * x1 - t1 * x2 ) * r,
				( t2 * y1 - t1 * y2 ) * r,
				( t2 * z1 - t1 * z2 ) * r
			);

			tdir.set(
				( s1 * x2 - s2 * x1 ) * r,
				( s1 * y2 - s2 * y1 ) * r,
				( s1 * z2 - s2 * z1 ) * r
			);

			tan1[ a ].add( sdir );
			tan1[ b ].add( sdir );
			tan1[ c ].add( sdir );

			tan2[ a ].add( tdir );
			tan2[ b ].add( tdir );
			tan2[ c ].add( tdir );

		}

		var groups = geometry.groups;
		var group, start, count;

		if ( groups.length === 0 ) {

			groups = [ {
				start: 0,
				count: indices.length
			} ];

		}

		for ( var j = 0; j < groups.length; ++ j ) {

			group = groups[ j ];

			start = group.start;
			count = group.count;

			for ( var g = start, gl = start + count; g < gl; g += 3 ) {

				handleTriangle(
					indices[ g + 0 ],
					indices[ g + 1 ],
					indices[ g + 2 ]
				);

			}

		}

		var tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
		var n = new THREE.Vector3(), n2 = new THREE.Vector3();
		var w, t, test;

		function handleVertex( v ) {

			n.fromArray( normals, v * 3 );
			n2.copy( n );

			t = tan1[ v ];

			// Gram-Schmidt orthogonalize

			tmp.copy( t );
			tmp.sub( n.multiplyScalar( n.dot( t ) ) ).normalize();

			// Calculate handedness

			tmp2.crossVectors( n2, t );
			test = tmp2.dot( tan2[ v ] );
			w = ( test < 0.0 ) ? - 1.0 : 1.0;

			tangents[ v * 4 ] = tmp.x;
			tangents[ v * 4 + 1 ] = tmp.y;
			tangents[ v * 4 + 2 ] = tmp.z;
			tangents[ v * 4 + 3 ] = w;

		}

		for ( var l = 0; l < groups.length; ++ l ) {

			group = groups[ l ];

			start = group.start;
			count = group.count;

			for ( var i = start, il = start + count; i < il; i += 3 ) {

				handleVertex( indices[ i + 0 ] );
				handleVertex( indices[ i + 1 ] );
				handleVertex( indices[ i + 2 ] );

			}

		}

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
