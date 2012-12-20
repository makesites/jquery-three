/**
* jQuery Three() - jQuery extension with 3D methods (using Three.js)
* Created by: Makis Tracend (@tracend)
*
* Copyright © 2012 Makesites.org
* Licensed under the MIT license
*
**/

// RequestAnimationFrame shim - Source: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = ( function( callback ) {
	return window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function ( callback ) {
		window.setTimeout( callback, 1000 / 60 );
	};
})();

(function( $ ) {
	var defaults = {
	};
	
	Three = function( obj, options, callback ){
		
		var self = this;
		this.container = obj;
		this.options = $.extend(defaults, options);
		// main buckets
		this.objects = {};
		this.scenes = {};
		this.cameras = {};
		// pointers for objects
		this.last = false;
		this.parent = false;
		
		// Dependencies (replace with AMD module?)
		$.getScript("https://raw.github.com/mrdoob/three.js/master/build/three.min.js", function () {
			self.init( options );
			// execute callback
			if(typeof callback != "undefined") callback( self );
		
		});

};

Three.prototype = {
	init : function( options ) {
		
		var self = this;
		var settings = $.extend( defaults, options );
		
		this.active = {
			scene: false,
			camera: false, 
			skybox: false
		};
		
		// init renderer
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( $(this.container).width(), $(this.container).height() );
		// condition this!
		this.renderer.autoClear = false;
		
		// check if the container has (existing) markup
		var html = $(this.container).html();
		// clear it off...
		$(this.container).html("<shadow-root></shadow-root>");
		this.parent = $(this.container).find("shadow-root");
		this.html( html );
		
		//document.body.appendChild( this.renderer.domElement );
		$( this.renderer.domElement ).appendTo( this.container );
		
		// set first as active (refactor later)
		//this.active.scene = this.scenes[0];
		//this.active.camera = this.cameras[0];
		// don't set as active if it's 'hidden'
		//if( css.display == "none" ) return;
		
		this.tick();
		
	},
	destroy : function( ) {
		
		return this.each(function(){
			
			var $this = $(this),
			three = $this.data('three');
			$this.removeData('three');
			
		});
	
	},
	// check if the obj has a Three() class attached to it
	self: function(options, callback){
		
		var list = [];
		
		this.each(function(){
			
			var $this = $(this), 
			three = $this.data('three');
			
			// check if three has initialized for the ocntainer
			if ( ! three ) {
				three = new Three( this, options, callback);
				$(this).data('three', three);
			}
			
			// push the lib down the display list
			list.push( three );
			
		});
		
		// return as a jQuery object 
		return $(list);
		
	}, 
	// one cycle in an infinite loop
	tick : function() {
		
		var self = this;
		// update vars for objects
		// 
		this.render();
		// loop on the next click
		requestAnimFrame(function(){ self.tick(); });
		
	}, 
	render : function() {
		// apply transformations
		
		//
		if( this.active.scene && this.active.camera ){
			// render the skybox as a first pass
			if( this.active.skybox ){
				this.active.skybox.camera.rotation.copy( this.active.camera.rotation );
				this.renderer.render( this.active.skybox.scene, this.active.skybox.camera );
					
			}
			this.renderer.render( this.active.scene, this.active.camera );
		}
		
	}, 
	
	show : function( ) {  },
	hide : function( ) { },
	update : function( content ) { },
	/**
	 * Detect features
	 * Inspired by Three's Detect.js
	 * https://github.com/mrdoob/three.js/blob/master/examples/js/Detector.js
	 */
	detect: function(){ 
	
		return {
			canvas: !! window.CanvasRenderingContext2D,
			webgl: ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )(),
			workers: !! window.Worker,
			fileapi: window.File && window.FileReader && window.FileList && window.Blob,
		
			all: function () {
				return ( this.webgl && this.canvas && this.workers && this.fileapi );
			}
		};
	}

};


$.fn.three = function( options, callback ) {
	// fallbacks
	var a = options || ( options = false );
	var b = callback || ( callback = function(i){  return i; } );
	
	return Three.prototype.self.apply( this, arguments, options, callback ); 

/*
if( !options) {

} else {
return this.each(function(){

new Three( options );
}
}   

if ( Three[method] ) {
return Three[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
} else if ( typeof method === 'object' || ! method ) {
return Three.init.apply( this, arguments );
} else {
$.error( 'Method ' +  method + ' does not exist on jQuery.Three' );
}    
*/
};

})( jQuery );

(function( $ ) {

Three.prototype = $.extend(Three.prototype, {
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
(function( $ ) {

Three.prototype = $.extend(Three.prototype, {
	// CSS Methods
	css : function (a){
		var sheets = document.styleSheets, o = {};
		for(var i in sheets) {
			var rules = sheets[i].rules || sheets[i].cssRules;
			for(var r in rules) {
				if(a.is(rules[r].selectorText)) {
					o = $.extend(o, this.css2json(rules[r].style), this.css2json(a.attr('style')));
				}
			}
		}
		return o;
	}, 
	
	cssSet : function( css ){
		var object = this.last;
		
		if( !object ) return;
		
		for( var attr in css ){
			// remove prefixes
			var key = attr.replace('-webkit-','').replace('-moz-','');
			// supported attributes
			switch(key){
				// - width
				case "width":
					object.scale.x = parseInt(css[attr], 10);
				break;
				// - height
				case "height":
					object.scale.y = parseInt(css[attr], 10);
				break;
				case "top":
					object.position.y = parseInt(css[attr], 10);
				break;
				/*
				case "right":
					object.position.x = parseInt(css[attr], 10);
				break;
				case "bottom":
					object.position.y = parseInt(css[attr], 10);
				break;
				*/
				case "left":
					object.position.x = parseInt(css[attr], 10);
				break;
				// - color
				case "color":
					var color =  this.colorToHex(css[attr]);
					object.material.color.setHex(color);
				break;
				// - transforms
				case "transform":
					object.position = this.cssTransform( css[attr] );
				break;
				// - animation
				case "animation-duration":
					console.log( key,  css[attr]);
				break;
				case "animation-timing":
					console.log( key,  css[attr]);
				break;
				case "animation-delay":
					console.log( key,  css[attr]);
				break;
				case "animation-iteration-count":
					console.log( key,  css[attr]);
				break;
				case "animation-direction":
					console.log( key,  css[attr]);
				break;
				case "animation-fill-mode":
					console.log( key,  css[attr]);
				break;
				case "animation-name":
					console.log( key,  css[attr]);
				break;
				case "display":
					// set it as the active one...
				break;
				case "background-image":
					// background of a scene is a skydome...
					if( object instanceof THREE.Scene)
						this.cssSkybox(css[attr]);
				break;
			}
			
		}
		
	},
	/*
	cssScene : function( css ){
		//
		for( var attr in css ){
			// supported attributes
			switch(attr){
				
			}
		}
	}, 
	*/
	cssSkybox : function( attr ){
		// remove any whitespace, the url(..) and
		// attempt to break it into an array
		var img = attr.replace(/\s|url\(|\)/g, "").split(',');
		if(img instanceof Array){
			// expext a six-pack of images
			this.addSkybox( img );
			
		} else {
			// this is one image... not implemented yet
		}
		
		
	}, 
	
	cssTransform: function( attr ){
		
		var pos = {};
		// only supporting translate3d for now...
		if( attr.search("translate3d") === 0 ){
			// replace all the bits we don't need
			var val = attr.replace(/translate3d\(|px|\)| /gi, "").split(",");
			// add the right keys
			pos = {
				x: parseInt( val[0], 10 ) || 0,
				y: parseInt( val[1], 10 ) || 0,
				z: parseInt( val[2], 10 ) || 0
			};
			
		}
		
		return pos;
		
	}, 
	
	// Helpers
	css2json : function (css){
		var s = {};
		if(!css) return s;
		if(css instanceof CSSStyleDeclaration) {
			for(var i in css) {
				if((css[i]).toLowerCase) {
					s[(css[i]).toLowerCase()] = (css[css[i]]);
				}
			}
		} else if(typeof css == "string") {
			css = css.split("; ");          
			for (var j in css) {
				var l = css[j].split(": ");
				s[l[0].toLowerCase()] = (l[1]);
			}
		}
		return s;
	}

});

})( jQuery );
(function( $ ) {
	
Three.prototype = $.extend(Three.prototype, {
	
	animate: function(){
		//this.mesh.rotation.z = Date.now() / 1000;
		
	}
	
});

})( jQuery );
(function( $ ) {
	
Three.prototype = $.extend(Three.prototype, {
	
	
});

})( jQuery );
(function( $ ) {
	
Three.prototype = $.extend(Three.prototype, {
	// generic method to add an element
	add : function( options ){
		// use the active scene if not specified
		//var parent = scene || this.active.scene;
		// get the type from the tag name
		//var type = html.nodeName.toLowerCase();
		
		// exit if no type is specified
		if( typeof options == "undefined" || typeof options.type == "undefined" ) return this;
		
		//	create 3d element
		var webgl = this.webgl( options );
		// add a new tag (if necessary)
		//if ( options.html ){ 
		// add the webgl id as a data-id
		options["data-id"] = webgl.id;
		var $html = this.createHTML( options );
		
		// set a reference to the last el (for later)
		this.last = webgl;
		
		// apply css 
		var css = this.css( $html );
		this.cssSet( css );
		// add to the relevant bucket
		//this[ options.type+"s" ][0] = webgl;
		this.active[ options.type ] = webgl;
		//
		
		return this;
		
	},
	addScene : function( obj ){
		
		var options = obj ||{};
		
		options.type = "scene";
		
		this.add(options);
		
		return this;
		
	}, 
	
	// add a plane
	addPlane : function( obj ){
		
		var options = obj ||{};
		
		options.type = "plane";
		
		this.add(options);
		
		return this;
		
	}, 
	// add camera(s)
	addCamera : function( obj ){
		
		var options = obj ||{};
		
		options.type = "camera";
		
		this.add(options);
		
		return this;
		
	}, 
	// add meshes
	addMesh : function( obj ){
		
		var options = obj ||{};
		
		options.type = "mesh";
		
		this.add(options);
		
		return this;
		
	}, 
	// add asset
	addAsset : function( obj ){
		
		var options = obj ||{};
		
		options.type = "asset";
		
		this.add(options);
		
		return this;
		
	},  
	
	addSkybox: function( img ){
			
				// does this camera have set values??
				var camera = new THREE.PerspectiveCamera( 50, $(this.container).width() / $(this.container).height(), 1, 100 );

				var scene = new THREE.Scene();

				var reflectionCube = THREE.ImageUtils.loadTextureCube( img );
				reflectionCube.format = THREE.RGBFormat;

				var shader = THREE.ShaderUtils.lib.cube;
				shader.uniforms.tCube.value = reflectionCube;

				var material = new THREE.ShaderMaterial( {

					fragmentShader: shader.fragmentShader,
					vertexShader: shader.vertexShader,
					uniforms: shader.uniforms,
					depthWrite: false,
					side: THREE.BackSide

				});

				mesh = new THREE.Mesh( new THREE.CubeGeometry( 100, 100, 100 ), material );
				
				scene.add( mesh );
				
				// save as active
				this.active.skybox = {
					scene : scene, 
					camera : camera
				};
				
	}
});

})( jQuery );
(function( $ ) {
	
Three.prototype  = $.extend(Three.prototype, {
	// generic method to create an element
	html : function(html){
		var self = this;
		var options = {
			
		}; 
		
		// loop throught the elements of the dom
		$(html).filter('*').each(function(i, el){
			// is this a jQuery bug? 
			var $el = (typeof el == "undefined") ? false : $(el);
			
			// exit if there is no parent set
			if( !$el ) return;
		
			// use the active scene if not specified
			//var parent = scene || this.active.scene;
			// get the type from the tag name
			options.type = el.nodeName.toLowerCase();
			options.id = $el.attr("id");
		
			// the set of attributes
			var attributes = self.getAttributes( el );
			//
			options = $.extend(options, attributes);
			
			self.add( options );
			
			// loop throught the children
			self.html( $el.html() );
		
		});
		
	},
	/*
	htmlScene : function( html ){
		
		var self = this;
		var $scene = $(html);
		//make this optional? 
		var id = $scene.attr("id");
		// create a new scene
		this.scenes[id] = this.addScene( options );
		// get css attributes
		var css = this.css( $scene );
		this.cssScene( css );
		
		// render all supported objects 
		
		
	}, 
	htmlCamera : function( html ){
		
		this.cameras[id] = this.addCamera( options );
		
	}, 
	*/
	createHTML : function( options ){
		// create markup
		var $tag = $('<'+ options.type +'>');
		// add id
		if( options.id )
			$tag.attr("id", options.id );
		// add attributes
		if( options["data-id"] )
			$tag.attr("data-id", options["data-id"] );
		
		// append to the dom
		$tag.appendTo(this.parent);
		
		// set as the new parent (for nesting)...
		this.parent = $tag; 
		
		return $tag;
	}
	
});

})( jQuery );
(function( $ ) {
	
Three.prototype = $.extend(Three.prototype, {
	
	
});

})( jQuery );
(function( $ ) {
	
Three.prototype = $.extend(Three.prototype, {
	// generic method to create an element
	webgl : function( options ){
		// get the type from the tag name
		//var type = html.nodeName.toLowerCase();
		var el;
		//	
		switch( options.type ){
			case "scene":
				el = this.webglScene( options );
			break;
			case "camera":
				el = this.webglCamera( options );
			break;
			case "mesh":
				el = this.webglMesh( options );
			break;
			case "light":
				el = this.webglLight( options );
			break;
			case "plane": 
				el = this.webglPlane( options );
			break;
		}
		
		return el; 
		
	},
	webglScene: function( options ){
		
		var defaults = {
			id : false
		};
		
		var settings = $.extend(defaults, options);
		
		var scene = new THREE.Scene();
		
		return scene;
		
	}, 
	webglCamera: function( attributes ){
		// 
		var camera;
		
		var defaults = {
				fov: 50, 
				aspect: $(this.container).width() / $(this.container).height(), 
				near: 1, 
				far: 1000, 
				scene: this.active.scene
		};
		// use the active scene if not specified
		//var parent = scene || this.active.scene;
		var options = $.extend(defaults, attributes);
		
		if( options.orthographic){
			// add orthographic camera
		} else { 
			camera = new THREE.PerspectiveCamera( options.fov, options.aspect, options.near, options.far );
		}
		
		//console.log( this.active );
		//options.scene.add( camera );
		
		return camera;
	}, 
	webglMesh: function( attributes ){
		//var mesh 
		//return mesh;
	}, 
	webglLight: function( attributes ){
		//var light 
		//return light;
	}, 
	webglPlane: function( attributes ){
		// plane - by default a 1x1 square
		var defaults = {
			width: 1,
			height: 1,
			color: 0x000000, 
			scene: this.active.scene
		};
		
		var options = $.extend(defaults, attributes);
		
		var name = options.id || random(10000);
		var geometry = new THREE.PlaneGeometry( options.width, options.height );
		// make this optional?
		geometry.dynamic = true;
		var material = new THREE.MeshBasicMaterial( { color: options.color } );
		this.objects[name] = new THREE.Mesh( geometry, material );
		this.objects[name].name = name; 
		
		options.scene.add( this.objects[name] );
		
		return this.objects[name];
		
	}
});

})( jQuery );
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
	}
	
});

})( jQuery );