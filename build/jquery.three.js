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
		$.getScript("http://cdnjs.cloudflare.com/ajax/libs/three.js/r53/three.min.js", function () {
			self.init( options );
			// execute callback
			if(typeof callback != "undefined") callback( self );
		
		});

};

Three.prototype = {
	init : function( options ) {
		
		var self = this;
		var settings = $.extend( defaults, options );
		// create active object
		this.active = {
			scene: false,
			camera: false, 
			skybox: false
		};
		// set properties
		this.properties = this.setProperties();
		
		// init renderer
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( this.properties.width,  this.properties.height);
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
		
		// resize event listener
		window.addEventListener( 'resize', function(){
			self.resize();
		}, false );
		
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
		$(this.container).trigger({
			type: "update",
			target: this
		});
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
	}, 
	// trigger when the window is resized
	resize: function(){
		
		// update properties
		this.properties = this.setProperties();
		
		// loop through cameras
		for( var i in this.cameras ){
			
			this.cameras[i].aspect = this.properties.aspect;
			this.cameras[i].updateProjectionMatrix();
			// better way of targeting skybox???
			this.active.skybox.aspect = this.properties.aspect;
			this.active.skybox.updateProjectionMatrix();
			
		}
		
		this.renderer.setSize( this.properties.width, this.properties.height );
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
					if(css[attr].search("translate3d") > -1 ){ 
						object.position = this.cssTranslate( css[attr] );
					}
					if(css[attr].search("rotate3d") > -1 ){ 
						object.rotation = this.cssRotate( css[attr] );
					}
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
					if( object.type == "terrain" )
						this.cssTerrain(css[attr]);
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
	
	cssTerrain : function( attr ){
		var object = this.last;
		
		var img = attr.replace(/\s|url\(|\)/g, "").split(',');
		if(img instanceof Array){
			for( var i in img ){
				if( img[i].search("heightmap") > -1  ){
					
					var heightmapTexture = THREE.ImageUtils.loadTexture( img[i] );
					object.material.uniforms.tDisplacement.value = heightmapTexture;
					object.material.uniforms.uDisplacementScale.value = 375;
					// heightmap also the second diffuse map? 
					var diffuseTexture2 = heightmapTexture;
					diffuseTexture2.wrapS = diffuseTexture2.wrapT = THREE.RepeatWrapping;
					
					object.material.uniforms.tDiffuse2.value = diffuseTexture2;
					object.material.uniforms.enableDiffuse2.value = true;
		
				}
				if( img[i].search("diffuse") > -1  ){
					
					var diffuseTexture1 = THREE.ImageUtils.loadTexture( img[i] );
					diffuseTexture1.wrapS = diffuseTexture1.wrapT = THREE.RepeatWrapping;
					
					object.material.uniforms.tDiffuse1.value = diffuseTexture1;
					object.material.uniforms.enableDiffuse1.value = true;
					
				}
				if( img[i].search("specular") > -1 ){
								
					var specularMap = THREE.ImageUtils.loadTexture( img[i] );
					specularMap.wrapS = specularMap.wrapT = THREE.RepeatWrapping;
					
					object.material.uniforms.tSpecular.value = specularMap;
					object.material.uniforms.enableSpecular.value = true;
					
				}
			}
		} else {
			// one image... which texture is it?...
		}
		
		/*
		
		leftovers ( normal and detail textures) 
		
		//detailTexture.wrapS = detailTexture.wrapT = THREE.RepeatWrapping;
		
		//uniformsTerrain[ "tNormal" ].value = heightmapTexture;
		//uniformsTerrain[ "uNormalScale" ].value = 1;
		
		//uniformsTerrain[ "tDetail" ].value = detailTexture;
		
		//uniformsTerrain[ "uShininess" ].value = 30;

		*/
	}, 
	
	cssTranslate: function( attr ){
		
		var pos = {};
		// only supporting translate3d for now...
		if( attr.search("translate3d") > -1 ){
			// replace all the bits we don't need
			var val = attr.match(/translate3d\(([\s\S]*?)\)/gi);
			// match returns array...
			val = val[0].replace(/translate3d\(|px|\)| /gi, "").split(",");
			// add the right keys
			pos = {
				x: parseInt( val[0], 10 ) || 0,
				y: parseInt( val[1], 10 ) || 0,
				z: parseInt( val[2], 10 ) || 0
			};
			
		}
		
		return pos;
		
	}, 
	
	cssRotate: function( attr ){
		
		var rot = {};
		// only supporting rotate3d for now...
		if( attr.search("rotate3d") > -1 ){
			// replace all the bits we don't need
			var val = attr.match(/rotate3d\(([\s\S]*?)\)/gi);
			// match returns array...
			val = val[0].replace(/rotate3d\(|deg|\)| /gi, "").split(",");
			// first three numbers toggle axis application - fourth is the degrees
			rot = {
				x: ( parseInt( val[0], 10 ) ) ? parseInt( val[3], 10 ) : 0,
				y: ( parseInt( val[1], 10 ) ) ? parseInt( val[3], 10 ) : 0,
				z: ( parseInt( val[2], 10 ) ) ? parseInt( val[3], 10 ) : 0
			};
			
		}
		
		return rot;
		
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
		// exit now if no webgl object was created
		if(typeof webgl == "undefined") return this;
		// add a new tag (if necessary)
		//if ( options.html ){ 
		// add the webgl id as a data-id
		options["data-id"] = webgl.id || false;
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
				
	},
	addTerrain: function( obj ){
		
		var options = obj ||{};
		
		options.type = "terrain";
		
		this.add(options);
		
		return this;
		
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
			case "terrain": 
				el = this.webglTerrain( options );
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
				aspect: this.properties.aspect, 
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
		var mesh;
		var defaults = {
			id : false, 
			scene: this.active.scene
		}; 
		
		var options = $.extend(defaults, attributes);
		
		//var material = new THREE.MeshBasicMaterial( { color: options.color } );
		//var mash = new THREE.Mesh( geometry, material );
		// wireframe toggle? new THREE.MeshBasicMaterial( {color: Math.random() * 0xffffff, wireframe: true });
		
		return mesh;
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
		
		var geometry = new THREE.PlaneGeometry( options.width, options.height );
		// make this optional?
		geometry.dynamic = true;
		var material = new THREE.MeshBasicMaterial( { color: options.color } );
		var mesh = new THREE.Mesh( geometry, material );
		
		// set attributes
		if( options.id ) mesh.name = id;
		
		// save in the objects bucket 
		this.objects[mesh.id] = mesh;
		
		options.scene.add( mesh );
		
		return mesh;
		
	}, 
	
	webglSphere: function( attributes ){
		
		var defaults = {
			id : false, 
			radius : 1,
			segments : 16,
			rings : 16, 
			color: 0x000000, 
			scene: this.active.scene
		}; 
		
		var options = $.extend(defaults, attributes);
		
		var geometry = new SphereGeometry( options.radius, options.segments, options.rings);
		// make this optional?
		geometry.dynamic = true;
		var material = new THREE.MeshBasicMaterial( { color: options.color } );
		var mesh = new THREE.Mesh( geometry, material );
		
		// set attributes
		if( options.id ) mesh.name = id;
		
		// save in the objects bucket 
		this.objects[mesh.id] = mesh;
		
		// add to scene
		options.scene.add( mesh );
		
		return mesh;
	}, 
	
	webglCube: function( attributes ){
		
		var defaults = {
			id : false, 
			width : 1, 
			height : 1, 
			depth : 1, 
			color: 0x000000, 
			scene: this.active.scene
		}; 
		
		var options = $.extend(defaults, attributes);
		
		var geometry = new CubeGeometry( options.width, options.height, options.depth);
		// make this optional?
		geometry.dynamic = true;
		var material = new THREE.MeshBasicMaterial( { color: options.color } );
		var mesh = new THREE.Mesh( geometry, material );
		
		// set attributes
		if( options.id ) mesh.name = id;
		
		// save in the objects bucket 
		this.objects[mesh.id] = mesh;
		
		// add to scene
		options.scene.add( mesh );
		
		return mesh;
	}, 
	
	webglCylinder: function( attributes ){
		
		var defaults = {
			id : false, 
			radiusTop : 100, 
			radiusBottom : 100, 
			segmentsRadius : 400, 
			segmentsHeight : 50, 
			openEnded : 50, 
			color: 0x000000, 
			scene: this.active.scene
		}; 
		
		var options = $.extend(defaults, attributes);
		
		var geometry = new CylinderGeometry( options.radiusTop, options.radiusBottom, options.segmentsRadius, options.segmentsHeight, options.openEnded, false);
		// make this optional?
		//geometry.overdraw = true;
        geometry.dynamic = true;
		var material = new THREE.MeshBasicMaterial( { color: options.color } );
		var mesh = new THREE.Mesh( geometry, material );
		
		// set attributes
		if( options.id ) mesh.name = id;
		
		// save in the objects bucket 
		this.objects[mesh.id] = mesh;
		
		// add to scene
		options.scene.add( mesh );
		
		return mesh;
	
	}, 
	
	webglTerrain: function( attributes ){
		// assuming that terrain is generated from a heightmap - support class="mesh" in the future? 
		var terrain;
		
		var defaults = {
				
		};
		
		
		this.active.scene.add( new THREE.AmbientLight( 0x111111 ) );

		directionalLight = new THREE.DirectionalLight( 0xffffff, 1.15 );
		directionalLight.position.set( 500, 2000, 0 );
		this.active.scene.add( directionalLight );
		
		
		var plane = new THREE.PlaneGeometry( 6000, 6000, 256, 256 );

		plane.computeFaceNormals();
		plane.computeVertexNormals();
		plane.computeTangents();


		//
		
		var terrainShader = THREE.ShaderTerrain.terrain;

		uniformsTerrain = THREE.UniformsUtils.clone( terrainShader.uniforms );
		/*
		var heightmapTexture = THREE.ImageUtils.loadTexture( "assets/img/terrain/heightmap.png" );
		var diffuseTexture1 = THREE.ImageUtils.loadTexture( "assets/img/terrain/diffuse.jpg" );
		var diffuseTexture2 = THREE.ImageUtils.loadTexture( "assets/img/terrain/heightmap.png" );
		var specularMap = THREE.ImageUtils.loadTexture( "assets/img/terrain/specular.png");
	
		diffuseTexture1.wrapS = diffuseTexture1.wrapT = THREE.RepeatWrapping;
		diffuseTexture2.wrapS = diffuseTexture2.wrapT = THREE.RepeatWrapping;
		//detailTexture.wrapS = detailTexture.wrapT = THREE.RepeatWrapping;
		specularMap.wrapS = specularMap.wrapT = THREE.RepeatWrapping;
		
		//uniformsTerrain[ "tNormal" ].value = heightmapTexture;
		//uniformsTerrain[ "uNormalScale" ].value = 1;
		
		uniformsTerrain[ "tDisplacement" ].value = heightmapTexture;
		uniformsTerrain[ "uDisplacementScale" ].value = 375;

		uniformsTerrain[ "tDiffuse1" ].value = diffuseTexture1;
		uniformsTerrain[ "tDiffuse2" ].value = diffuseTexture2;
		uniformsTerrain[ "tSpecular" ].value = specularMap;
		//uniformsTerrain[ "tDetail" ].value = diffuseTexture1;

		uniformsTerrain[ "enableDiffuse1" ].value = true;
		uniformsTerrain[ "enableDiffuse2" ].value = true;
		uniformsTerrain[ "enableSpecular" ].value = true;

		uniformsTerrain[ "uDiffuseColor" ].value.setHex( 0xffffff );
		uniformsTerrain[ "uSpecularColor" ].value.setHex( 0xffffff );
		uniformsTerrain[ "uAmbientColor" ].value.setHex( 0x111111 );

		//uniformsTerrain[ "uShininess" ].value = 30;

		uniformsTerrain[ "uRepeatOverlay" ].value.set( 6, 6 );
		*/

		uniformsTerrain.uDiffuseColor.value.setHex( 0xffffff );
		uniformsTerrain.uSpecularColor.value.setHex( 0xffffff );
		uniformsTerrain.uAmbientColor.value.setHex( 0x111111 );

		uniformsTerrain.uRepeatOverlay.value.set( 6, 6 );
		//

		// fog is expensive - disable for now...
		var material = new THREE.ShaderMaterial( {
								uniforms :				uniformsTerrain,
								vertexShader :		terrainShader.vertexShader,
								fragmentShader :		terrainShader.fragmentShader,
								lights :					true,
								fog :						false
		});

		terrain = new THREE.Mesh( plane, material );

		// save type as part of the mesh 
		terrain.type = "terrain";
		
		//terrain.visible=false;
		this.active.scene.add( terrain );
		
		return terrain;
		
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