/**
* jQuery Three() - jQuery extension with 3D methods (using Three.js)
* Created by: Makis Tracend (@tracend)
*
* Copyright © 2013 Makesites.org
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

(function (root, factory) {
 
	"use strict";
	
	var define = define || false;
	var jquery = root.$ || root.jQuery || root.ender;
	
    if (define && typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory( jquery );
    }
	
}(this, function ( $ ) {

// Local variables
var css, _css;

// Create a fn container for internal methods
var fn = {
		self : function(){ return this; }
	};


	var defaults = {
		watch : false, 
		//deps : { "THREE" : "http://cdnjs.cloudflare.com/ajax/libs/three.js/r54/three.min.js" }
		deps : { 
			"THREE" : "https://raw.github.com/mrdoob/three.js/master/build/three.min.js"
			//"FresnelShader" : ""
		}
	};
	
	Three = function( obj, options, callback ){
		
		var self = this;
		this.container = obj;
		this.options = $.extend(true, defaults, options);
		// main buckets
		this.objects = {};
		this.scenes = {};
		this.cameras = {};
		this.materials = {};
		// defining types (extandable)
		this.groups = {
			"camera" : "cameras", "scene" : "scenes", "mesh" : "objects", "plane" : "objects", "cube" : "objects", "sphere" : "objects", "cylinder" : "objects", "material" : "materials"
		};
		// #43 - calculating 'actual' framerate
		this.frame = {
			current: 0,
			rate: 0,
			date: new Date()
		};
		// pointers for objects
		this.last = false;
		this.parent = false;
			
		// Dependencies (replace with AMD module?)
		this.dependencies( function () {
			self.init();
			// execute callback
			if( callback instanceof Function ) callback( self );
		
		});

};

Three.prototype = {
	init : function() {
		
		var self = this;
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
		
		// #23 - remove fallback message
		$(this.container).find(".fallback").remove();
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
		
		// #31 - live watching DOM updates
		if( this.options.watch ) this.watch(this.container);
		
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
		// collapse the array if only one item
		return (list.length == 1) ?  list[0] : $(list);
		
	}, 
	// one cycle in an infinite loop
	tick : function() {
		
		var self = this;
		// update vars for objects
		// 
		this.render();
		// #43 - calculate framerate
		var now = new Date();
		if( this.frame.date.getSeconds() === now.getSeconds() ){ 
			this.frame.current++;
		} else {
			// new frame, new count
			this.frame.rate = this.frame.current;
			this.frame.current = 1; //start fron 1 to include running frame ;)
			this.frame.date = now;
		}
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
		}
		// better way of targeting skybox???
		this.active.skybox.camera.aspect = this.properties.aspect;
		this.active.skybox.camera.updateProjectionMatrix();
		
		this.renderer.setSize( this.properties.width, this.properties.height );
	}, 
	
	dependencies : function( callback ){
		
		var scripts = $.map( this.options.deps , function (item, index) {
				// checking if the namespace is available
				if( window[index] || ( window.THREE && window.THREE[index] ) ) return;
                return item;
            });
		
		// replace this with a proper dependency loader... 
		if( scripts.length ){
			this.loadScripts(scripts, callback);
		} else {
			callback();
		}

	}, 
	loadScripts : function(scripts, callback){
		var self = this;
		 
		$.when( $.getScript( scripts.shift() ) ).done(function(){
			if( scripts.length > 0 ){
				self.loadScripts(scripts, callback);
			} else {
				// once the scripts are all loaded
				callback();
			}
		});
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


// get attributes from tags
Three.prototype.getAttributes = function( html ){
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
				} else if( attr[i].name && attr[i].name.search("src") === 0 ){
					// add source file
					data.src = attr[i].value;
				} else if( attr[i].name && attr[i].name.search("style") === 0 ){
					// add source file
					data.style = attr[i].value;
				}
			}
		
		});
		
		return data;
	};
	
// add a class
Three.prototype.addClass = function( name ){
		var object = this.last;
		// add the class to the markup 
		var $el = $(this.container).find("[data-id='"+ object.id +"']");
		$el.addClass(name);
		// update 3d object
		var options = this.fn.css.styles.call(this, $el );
		this.fn.css.set.call(this, object, options );
		
		return this;
	};


// CSS

// Public Methods
css = function ( styles ){
		// support more than one formats? 
		// for now expecting a straighforward object...
		this.fn.css.set.call(this, this.last , styles);
		// preserve chainability
		return this;
	};


// Internal functions
fn.css = {
	styles: function (a){
		var sheets = document.styleSheets, o = {};
		// loop through stylesheets
		for(var i in sheets) {
			var rules = sheets[i].rules || sheets[i].cssRules;
			for(var r in rules) {
				// #21 - excluding :hover styles from parsing
				if( rules[r].selectorText && rules[r].selectorText.search(":hover") > -1) continue;
				try{ 
					if(a.is(rules[r].selectorText)) {
						o = $.extend(o, css2json(rules[r].style));
					}
				} catch( e ) {
					console.log( e );
				}
			}
		}
		// add inline styles
		o = $.extend(o, css2json(a.attr('style')));
		//
		return o;
	}, 
	set: function( object, css ){
		// if the object is not valid quit...
		if( !object || !object.id ) return;
		
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
					if( object instanceof THREE.Scene){
						//this.fn.css.skybox.call(this, css[attr]);
						this.webglLight({color : color});
					} else { 
						object.material.color.setHex(color);
					}
				break;
				// - transforms
				case "transform":
					var pos;
					if(css[attr].search("translate3d") > -1 ){ 
						pos = this.fn.css.translate.call( this, css[attr] );
						// condition the position for "bare" meshes
						if( object instanceof THREE.Mesh && object.type != "terrain"){
							object.parent.position.set( pos.x, pos.y, pos.z );
						} else {
							object.position.set( pos.x, pos.y, pos.z );
						}
					}
					if(css[attr].search("rotate3d") > -1 ){ 
						pos = this.fn.css.rotate.call( this,  css[attr] );
						// condition the rotation for "bare" meshes
						if( object instanceof THREE.Mesh && object.type != "terrain"){
							object.parent.rotation.set( pos.x, pos.y, pos.z );
						} else {
							object.rotation.set( pos.x, pos.y, pos.z );
						}
					}
					if(css[attr].search("scale3d") > -1 ){ 
						pos = this.fn.css.scale.call( this, css[attr] );
						// condition the position for "bare" meshes
						if( object instanceof THREE.Mesh && object.type != "terrain"){
							object.parent.scale.set( pos.x, pos.y, pos.z );
						} else {
							object.scale.set( pos.x, pos.y, pos.z );
						}
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
					if( object instanceof THREE.Scene){
						this.fn.css.skybox.call(this, css[attr]);
					} else if( object.type == "terrain" ){ 
						this.fn.css.terrain.call(this, css[attr]);
					} else if ( object instanceof THREE.Mesh ) { 
						this.fn.css.texture.call(this, object, css[attr]);
					} else if ( object instanceof THREE.Object3D && object.children.length) { 
						// potentially the above condition can be removed if the ids are assigned properly in the markup...
						try { 
							// find the child...
							var mesh =  object.children[0];
							this.fn.css.texture.call(this, mesh, css[attr]);
						} catch( e ){
							console.log(e);
						}
					}
				break;
			}
			
		}
		
	},
	
	rotate: function( attr ){
		
		var rot = {};
		var val;
		// only supporting rotate3d for now...
		if( attr.search("rotate3d") > -1 ){
			// replace all the bits we don't need
			val = attr.match(/rotate3d\(([\s\S]*?)\)/gi);
			// match returns array...
			val = val[0].replace(/rotate3d\(|deg|\)| /gi, "").split(",");
			// first three numbers toggle axis application - fourth is the degrees
			rot = {
				x: parseFloat( val[0], 10 ) * parseFloat( val[3], 10 ) * (Math.PI/180),
				y: parseFloat( val[1], 10 ) * parseFloat( val[3], 10 ) * (Math.PI/180),
				z: parseFloat( val[2], 10 ) * parseFloat( val[3], 10 ) * (Math.PI/180)
			};
			
		}
		
		return rot;
		
	}, 
	
	translate: function( attr ){
		
		var pos = {};
		// only supporting translate3d for now...
		if( attr.search("translate3d") > -1 ){
			// replace all the bits we don't need
			var val = attr.match(/translate3d\(([\s\S]*?)\)/gi);
			// match returns array...
			val = val[0].replace(/translate3d\(|px|\)| /gi, "").split(",");
			// add the right keys
			pos = {
				x: parseFloat( val[0], 10 ) || 0,
				y: parseFloat( val[1], 10 ) || 0,
				z: parseFloat( val[2], 10 ) || 0
			};
			
		}
		
		return pos;
		
	}, 
	
	scale: function( attr ){
		
		var size = {};
		// only supporting rotate3d for now...
		if( attr.search("scale3d") > -1 ){
			// replace all the bits we don't need
			var val = attr.match(/scale3d\(([\s\S]*?)\)/gi);
			// match returns array...
			val = val[0].replace(/scale3d\(|\)| /gi, "").split(",");
			// first three numbers toggle axis application - fourth is the degrees
			size = {
				x: parseFloat( val[0], 10 ) || 0,
				y: parseFloat( val[1], 10 ) || 0,
				z: parseFloat( val[2], 10 ) || 0
			};
			
		}
		
		return size;
		
	}, 
	
	texture: function( el, attr ){
		var map = attr.replace(/\s|url\(|\)/g, "");
		var material = this.webglMaterial({ map :  map });
		el.material = material;
	}, 
	
	terrain: function( attr ){
		var object = this.last;
		
		var img = attr.replace(/\s|url\(|\)/g, "").split(',');
		if(img instanceof Array){
			for( var i in img ){
				
				if( img[i].search("heightmap") > -1  ){
					
					var heightmapTexture = THREE.ImageUtils.loadTexture( img[i] );
					//var heightmapTexture = this.webglTexture( img[i] );
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
					//var diffuseTexture1 = this.webglTexture( img[i] );
					diffuseTexture1.wrapS = diffuseTexture1.wrapT = THREE.RepeatWrapping;
					
					object.material.uniforms.tDiffuse1.value = diffuseTexture1;
					object.material.uniforms.enableDiffuse1.value = true;
					
				}
				if( img[i].search("specular") > -1 ){
					
					var specularMap = THREE.ImageUtils.loadTexture( img[i] );
					//var specularMap = this.webglTexture( img[i] );
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
	
	
	skybox: function( attr ){
		
		// remove any whitespace, the url(..) and
		// attempt to break it into an array
		var img = attr.replace(/\s|url\(|\)/g, "").split(',');
		if(img instanceof Array){
			// expext a six-pack of images
			this.addSkybox( img );
			
		} else {
			// this is one image... not implemented yet
		}
		
	}
	
};

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


// Converts a Translate3D property to a Three.js Position object

// Converts a Rotate3D property to a Three.js Rotate


// Helpers
var css2json = function (css){
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
};



Three.prototype.animate = function(){
		//this.mesh.rotation.z = Date.now() / 1000;
		
	};

// watch an element for changes
Three.prototype.watch = function( el ) {
	// monitor new elements
	$( el ).live('DOMSubtreeModified', this.eventSubtree);
	// monitor attribute changes
	if (el.onpropertychange){
		$( el ).live( 'propertychange', this.eventAttribute );
	}
	else {
		$( el ).live( 'DOMAttrModified', this.eventAttribute );
	}
	// monitor css style changes


};

// - new element
Three.prototype.eventSubtree = function(e) {

	if (e.target.innerHTML.length > 0) {
		// Handle new content
		console.log( e.target.innerHTML );
	}
};

// - updated attribute
Three.prototype.eventAttribute = function(e) {

	console.log("attribute",  e.target );

};

// - updated style(s)



// generic method to add an element
Three.prototype.add = function( options ){
		var self = this;
		// use the active scene if not specified
		//var parent = scene || this.active.scene;
		// get the type from the tag name
		//var type = html.nodeName.toLowerCase();
		// list of containers (we'll be using)
		
		// exit if no type is specified
		if( typeof options == "undefined" || typeof options.type == "undefined" ) return this;
		
		//	create 3d element
		this.webgl( options, function( webgl ){
			
			// exit now if no webgl object was created (undefined condition should be removed)
			if( !webgl || typeof webgl == "undefined") return this;
			// add a new tag (if necessary)
			//if ( options.html ){ 
			var object;
			
			// set a reference to the last el (for later)
			self.last = webgl;
			
			// add to the relevant bucket
			var container = self.groups[ options.type ] || false;
			// create object container only for primitives...
			if( container == "objects" ){
				// create new object
				object = new THREE.Object3D();
				object.add(webgl);
				// #40 copy name from mesh
				object.name = webgl.name;
			} else {
				object = webgl;
			}
			//this[ options.type+"s" ][0] = webgl;
			// condition which elements have an active flag?
			self.active[ options.type ] = object;
			//
			if( container ){
				// save in the objects bucket 
				self[container][object.id] = object;
			}
			// add to scene
			if( options.type == "scene"){ 
				self.active.scene = object;
			} else {
				self.active.scene.add( object );
			}
			// keep a reference of the object id
			options["data-id"] = object.id || false;
			// create the tag in the shadow dom
			var $html = self.createHTML( options );
			
			// apply css 
			var css = self.fn.css.styles.call(self, $html );
			self.fn.css.set.call(self, webgl, css );
			
		});
		
		return this;
	};
	
Three.prototype.addScene = function( obj ){
		
		var options = obj ||{};
		
		options.type = "scene";
		
		this.add(options);
		
		return this;
		
	};
	
// add camera(s)
Three.prototype.addCamera = function( obj ){
		
		var options = obj ||{};
		
		options.type = "camera";
		
		this.add(options);
		
		return this;
		
	};
	
// add meshes
Three.prototype.addMesh = function( obj ){
		
		var options = obj ||{};
		
		options.type = "mesh";
		
		this.add(options);
		
		return this;
		
	};
	
// add a plane
Three.prototype.addPlane = function( obj ){
		
		var options = obj ||{};
		
		options.type = "plane";
		
		this.add(options);
		
		return this;
		
	};
	
// add a sphere
Three.prototype.addSphere = function( obj ){
		
		var options = obj ||{};
		
		options.type = "sphere";
		
		this.add(options);
		
		return this;
		
	};
	
// add a cube
Three.prototype.addCube = function( obj ){
		
		var options = obj ||{};
		
		options.type = "cube";
		
		this.add(options);
		
		return this;
		
	};
	
// add a cylinder
Three.prototype.addCylinder = function( obj ){
		
		var options = obj ||{};
		
		options.type = "cylinder";
		
		this.add(options);
		
		return this;
		
	};
	
// add asset
Three.prototype.addAsset = function( obj ){
		
		var options = obj ||{};
		
		options.type = "asset";
		
		this.add(options);
		
		return this;
		
	};  
	
Three.prototype.addSkybox = function( img ){
			
				// does this camera have set values??
				var camera = new THREE.PerspectiveCamera( 50, $(this.container).width() / $(this.container).height(), 1, 100 );

				var scene = new THREE.Scene();

				var reflectionCube = THREE.ImageUtils.loadTextureCube( img );
				reflectionCube.format = THREE.RGBFormat;

				//var shader = THREE.ShaderUtils.lib.cube;
				var shader = THREE.ShaderLib.cube;
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
				
	};
	
Three.prototype.addTerrain = function( obj ){
		
		var options = obj ||{};
		
		options.type = "terrain";
		
		this.add(options);
		
		return this;
		
	};


// generic method to create an element
Three.prototype.html = function(html){
		var self = this;
		
		// loop throught the elements of the dom
		$(html).filter('*').each(function(i, el){
			// is this a jQuery bug? 
			var $el = (typeof el == "undefined") ? false : $(el);
			
			// exit if there is no parent set
			if( !$el ) return;
			
			
			var options = {}; 
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
		
	};
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
Three.prototype.createHTML = function( options ){
		// create markup
		var $tag = $('<'+ options.type +'>');
		// add id
		if( options.id ){
			$tag.attr("id", options.id );
		}
		// add attributes
		if( options["data-id"] ){
			$tag.attr("data-id", options["data-id"] );
		}
		// add classes
		if(options["class"] && options["class"].length) { 
			var classes = options["class"].join(" ");
			$tag.attr("class", classes );
		}
		// add inline styles
		if( options.style ){ 
			$tag.attr("style", options.style );
		}
		// append to the dom
		$tag.appendTo(this.parent);
		
		// set as the new parent under certain conditions (for nesting)...
		if(options.type == "scene" || options.type == "asset" || options.type == "player"){
			this.parent = $tag; 
		}
		
		// add listening events (if enabled)
		//if(this.options.watch) this.watch($tag);
		
		return $tag;
	};

Three.prototype.append = function(html){
	
	// pickup active scene
	//var scene = this.active.scene;
	// add the submitted markup (validation?)
	//$(this.container).find("[data-id='"+ scene.id +"']").append( html );
	this.html( html );
	// #38 preserve chainability...
	return this;
};

find = function( query ){ 
		
		// find the element in the containers
		var el = this.fn.find.el.call(this, query);
		// save element
		this.last = el;
		// preserve chainability
		return this;
		
	};
	

// Internal

fn.find = {
	el : function( query ){ 
	
		var id = $(this.container).find("shadow-root "+ query).attr("data-id");
		// find the element in the containers
		var el = this.objects[id] || this.cameras[id] || this.scenes[id];
		
		return el;
	}
};
	
	
// #39 Wildcard extension to the Three.js namespace
fn.three = function(fn, query ){ 
	var object = this.last;
	try{
		object[fn]( query );
	} catch( e ){
		console.log("Method not supported:", e );
	}
	return this;
};


// generic method to create an element
Three.prototype.webgl = function( options, callback ){
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
			case "material":
				el = this.webglMaterial( options );
			break;
			case "light":
				el = this.webglLight( options );
			break;
			case "plane": 
				el = this.webglPlane( options );
			break;
			case "sphere": 
				el = this.webglSphere( options );
			break;
			case "cube": 
				el = this.webglCube( options );
			break;
			case "cylinder": 
				el = this.webglCylinder( options );
			break;
			case "terrain": 
				el = this.webglTerrain( options );
			break;
			default: 
				// a generic lookup in the internal methods...
				if(typeof this.fn.webgl[options.type] != "undefined" ) this.fn.webgl[options.type].apply(this, [options, callback] );
			break;
		}
		
		return callback(el); 
		
	};
	
// move all internal methods here...
fn.webgl = {
	
};

Three.prototype.webglScene = function( options ){
		
		var defaults = {
			id : false
		};
		
		var settings = $.extend(defaults, options);
		
		var scene = new THREE.Scene();
		
		// save in the objects bucket 
		this.scenes[scene.id] = scene;
		
		return scene;
		
	};
	
Three.prototype.webglCamera = function( attributes ){
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
		
		return camera;
	};
	
Three.prototype.webglMesh = function( attributes ){
		var mesh;
		var defaults = {
			id : false, 
			wireframe: false, 
			scene: this.active.scene
		}; 
		
		var options = $.extend(defaults, attributes);
		
		//var material = new THREE.MeshBasicMaterial( { color: options.color } );
		//var mash = new THREE.Mesh( geometry, material );
		// wireframe toggle? new THREE.MeshBasicMaterial( {color: Math.random() * 0xffffff, wireframe: true });
		
		return mesh;
	};
	
Three.prototype.webglMaterial = function( attributes ){
		
		var material, settings;
		
		var defaults = {
			id : false, 
			color: 0x000000, 
			wireframe: false, 
			map: false, 
			scene: this.active.scene
		}; 
		
		var options = $.extend(defaults, attributes);
		// grab the shaders from the global space
		var shaders = window.Shaders || {};
		
		// check if there is a shader with the id name
		if( options.id && shaders[ options.id ] ){ 
			settings = {};
		
			var shader = Shaders[ options.id ];
			if( shader.uniforms )  settings.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
			if( shader.vertexShader )  settings.vertexShader = shader.vertexShader;
			if( shader.fragmentShader )  settings.fragmentShader = shader.fragmentShader;
			if( options.map && shader.uniforms) settings.uniforms.texture.texture= THREE.ImageUtils.loadTexture( options.map );
			material = new THREE.ShaderMaterial( settings );
		
		} else {
			// create a basic material
			settings = {};
			if( options.map ) settings.map = THREE.ImageUtils.loadTexture( options.map );
			if( options.color && !options.map ) settings.color = options.color;
			if( options.wireframe ) settings.wireframe = options.wireframe;
			material = new THREE.MeshBasicMaterial( settings );
		
		}
		
		return material; 

	};
	

Three.prototype.webglTexture = function( src ){
	
		// texture
	
		var texture = new THREE.Texture();
	
		var loader = new THREE.ImageLoader();
		loader.addEventListener( 'load', function ( event ) {
	
			texture.image = event.content;
			texture.needsUpdate = true;
	
		} );
		loader.load( src );

		return texture;
		
	};

Three.prototype.webglLight = function( attributes ){
		
		this.active.scene.add( new THREE.AmbientLight( parseInt( attributes.color, 16 ) ) );
		
		//var light 
		//return light;
	};
	
Three.prototype.webglPlane = function( attributes ){
		// plane - by default a 1x1 square
		var defaults = {
			width: 1,
			height: 1,
			color: 0x000000, 
			wireframe: false, 
			scene: this.active.scene
		};
		
		var options = $.extend(defaults, attributes);
		
		var geometry = new THREE.PlaneGeometry( options.width, options.height );
		// make this optional?
		geometry.dynamic = true;
		var material = new THREE.MeshBasicMaterial( { color: options.color, wireframe: options.wireframe } );
		var mesh = new THREE.Mesh( geometry, material );
		
		// set attributes
		if( options.id ) mesh.name = options.id;
		
		return mesh;
		
	};
	
Three.prototype.webglSphere = function( attributes ){
		
		var defaults = {
			id : false, 
			radius : 1,
			segments : 16,
			rings : 16, 
			color: 0x000000, 
			wireframe: false, 
			map: false, 
			scene: this.active.scene
		}; 
		
		var options = $.extend(defaults, attributes);
		
		var geometry = new THREE.SphereGeometry( options.radius, options.segments, options.rings);
		// make this optional?
		//geometry.overdraw = true;
		geometry.dynamic = true;
		var material = this.webglMaterial( options );
		var mesh = new THREE.Mesh( geometry, material );
		mesh.matrixAutoUpdate = false;
		// set attributes
		if( options.id ) mesh.name = options.id;
		
		return mesh;
	};
	
Three.prototype.webglCube = function( attributes ){
		
		var defaults = {
			id : false, 
			width : 1, 
			height : 1, 
			depth : 1, 
			color: 0x000000, 
			wireframe: false, 
			scene: this.active.scene
		}; 
		
		var options = $.extend(defaults, attributes);
		
		var geometry = new THREE.CubeGeometry( options.width, options.height, options.depth);
		// make this optional?
		geometry.dynamic = true;
		var material = new THREE.MeshBasicMaterial( { color: options.color, wireframe: options.wireframe } );
		var mesh = new THREE.Mesh( geometry, material );
		
		// set attributes
		if( options.id ) mesh.name = options.id;
		
		return mesh;
	};
	
Three.prototype.webglCylinder = function( attributes ){
		
		var defaults = {
			id : false, 
			radiusTop : 100, 
			radiusBottom : 100, 
			segmentsRadius : 400, 
			segmentsHeight : 50, 
			openEnded : false, 
			color: 0x000000, 
			wireframe: false, 
			scene: this.active.scene
		}; 
		
		var options = $.extend(defaults, attributes);
		
		var geometry = new THREE.CylinderGeometry( options.radiusTop, options.radiusBottom, options.segmentsRadius, options.segmentsHeight, options.openEnded, false);
		// make this optional?
		//geometry.overdraw = true;
        geometry.dynamic = true;
		var material = new THREE.MeshBasicMaterial( { color: options.color, wireframe: options.wireframe } );
		var mesh = new THREE.Mesh( geometry, material );
		
		// set attributes
		if( options.id ) mesh.name = options.id;
		
		return mesh;
	
	}; 
	
Three.prototype.webglTerrain = function( attributes ){
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
		
	};

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
			width: $(this.container).width(),
			height: $(this.container).height(),
			aspect: ( $(this.container).width() / $(this.container).height() )
		};
	};
	

// Prototype
Three.prototype.css = css;
Three.prototype.find = find;
Three.prototype.fn = fn;
//Three.prototype.fn.webgl = fn.webgl;
//Three.prototype.utils = utils;

// #39 Wildcard extension - replace this hardcoding list with a proper wildcard method, once available (Proxy)
//Three.prototype.__noSuchMethod__ = fn.three;
Three.prototype.lookAt = function(){
	return this.fn.three.call(this, "lookAt", arguments);
};

}));