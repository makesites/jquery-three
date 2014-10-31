/**
 * @name jquery.three
 * jQuery Three() - jQuery extension with 3D methods (using Three.js)
 * Version: 0.9.0 (Fri, 31 Oct 2014 07:20:48 GMT)
 *
 * @author makesites
 * Created by: Makis Tracend (@tracend)
 *
 * Homepage: http://github.com/makesites/jquery-three
 * @license MIT License
 */


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
		alpha: true,

		watch: false,
		//deps : { "THREE" : "http://cdnjs.cloudflare.com/ajax/libs/three.js/r54/three.min.js" }
		deps: {
			"THREE" : "https://raw.github.com/mrdoob/three.js/master/build/three.min.js"
			//"FresnelShader" : ""
		},
		paused: false
	};

	Three = function( element, options, callback ){

		var self = this;
		this.el = this.setEl( element );
		this.options = $.extend(true, {}, defaults, options);
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
		this.renderer = new THREE.WebGLRenderer({ alpha: this.options.alpha });
		this.renderer.setSize( this.properties.width,  this.properties.height);
		// condition this!
		this.renderer.autoClear = false;

		// #23 - remove fallback message
		$(this.el).find(".fallback").remove();
		// check if the container has (existing) markup
		var html = $(this.el).html();
		// clear it off...
		$(this.el).html("<shadow-root></shadow-root>");
		this.parent = $(this.el).find("shadow-root");
		this.target = this.parent;
		this.html( html );

		//document.body.appendChild( this.renderer.domElement );
		$( this.renderer.domElement ).appendTo( this.el );

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
		if( this.options.watch ) this.watch(this.parent);

		this.tick();

	},
	destroy : function( ) {

		return this.each(function(){

			var $this = $(this),
			three = $this.data('three');
			$this.removeData('three');

		});

	},
	// check if the element has a Three() class attached to it
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
		// skip render if paused
		if( !this.options.paused ) this.render();
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
		$(this.el).trigger({
			type: "update",
			target: this
		});
		//

		if( this.active.scene && this.active.camera ){
			// render the skybox as a first pass
			if( this.active.skybox ){
				if( this.active.skybox.camera ) this.active.skybox.camera.rotation.copy( this.active.camera.rotation );
				this.renderer.render( this.active.skybox.scene, this.active.skybox.camera );
			}
			this.renderer.render( this.active.scene, this.active.camera );
		}

		// update internal animation queue
		this.fn.animate.update();
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
		if( this.active.skybox ){
			this.active.skybox.camera.aspect = this.properties.aspect;
			this.active.skybox.camera.updateProjectionMatrix();
		}
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
	},

	setEl: function( el ){
		// add an id if not available
		var id = $(this).attr('id');
		// For some browsers, `attr` is undefined; for others `attr` is false.  Check for both.
		if (typeof id === "undefined" || id === false) {
			$(el).addClass("3d-" + utils.unid() );
		}
		return el;
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
					// #47 convert dashed to camelCase
					key = utils.camelCase( key );
					var val = attr[i].value;
					// check if it's a number...
					data[key] = ( parseInt(val, 10) || val === "0" ) ? parseInt(val, 10) :  val;
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
		var $el = $(this.el).find("[data-id='"+ object.id +"']");
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
			// save attribute reference in the object
			object._style = object._style || {};
			var changed = ( object._style[key] && object._style[key] == css[attr] ) ? false : true; // save old value?
			object._style[key] = css[attr];
			// parse only changed atrributes
			if( !changed ) continue;
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
						setColor( object, color );
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
					this.fn.css.animation.duration = parseInt( css[attr], 10) * 1000; // convert seconds to milliseconds
				break;
				case "animation-timing":
					this.fn.css.animation.easing = css[attr];
				break;
				case "animation-delay":
					this.fn.css.animation.delay = css[attr];
				break;
				case "animation-iteration-count":
					this.fn.css.animation.repeat = css[attr];
				break;
				case "animation-direction":
					this.fn.css.animation.direction = css[attr];
				break;
				case "animation-fill-mode":
					this.fn.css.animation.fill = css[attr];
				break;
				case "animation-name":
					//console.log( key,  css[attr]);
					// assumption: name is the last animation attribute processed
					this.fn.css.animation.name = css[attr];
					this.animate( this.fn.css.animation, object );
					this.fn.css.animation = {};
				break;
				case "animation-timing-function":
					// duplicate of animation-timing?
					// if counting steps, save the number
					var steps = css[attr].match(/steps\((\d)/); // not closed..
					this.fn.css.animation.easing = ( steps ) ? parseInt(steps[1], 10) : css[attr];
				break;
				case "animation-play-state":
					this.fn.css.animation.state = css[attr];
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
					} else if( object instanceof THREE.Sprite ){
						var src = css[attr].replace(/\s|url\(|\)/g, "");
						object.material.map = THREE.ImageUtils.loadTexture( src );
					}
				break;
				case "background-size":
					if( object instanceof THREE.Sprite ){
						//
						this.fn.css.sprite.call(this, object, css[attr]);
					}
				break;
				// "background-position" arrives split in axis
				case "background-position-x":
					if( object instanceof THREE.Sprite ){
						// update sprite
						this.fn.css.sprite.call(this, object);
					}
				break;
				case "background-position-y":
					if( object instanceof THREE.Sprite ){
						// update sprite
						this.fn.css.sprite.call(this, object);
					}
				break;
			}

		}

	},

	// temporary container for parsed (animation) attributes...
	animation: {},

	rotate: function( attr ){

		var rot = {};
		var val;
		//
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

		} else if( attr.search("rotateX") > -1 ){
		// axis based rotation
			val = attr.match(/rotateX\(([\s\S]*?)\)/gi);
			val = val[0].replace(/rotateX\(|deg|\)| /gi, "").
			rot = {
				x: parseFloat( val, 10 ) * (Math.PI/180)
			};
		} else if( attr.search("rotateY") > -1 ){
			val = attr.match(/rotateY\(([\s\S]*?)\)/gi);
			val = val[0].replace(/rotateY\(|deg|\)| /gi, "");
			rot = {
				y: parseFloat( val, 10 ) * (Math.PI/180)
			};
		} else if( attr.search("rotateZ") > -1 ){
			val = attr.match(/rotateZ\(([\s\S]*?)\)/gi);
			val = val[0].replace(/rotateZ\(|deg|\)| /gi, "");
			rot = {
				z: parseFloat( val, 10 ) * (Math.PI/180)
			};
		} else if( attr.search("rotate") > -1 ){
			val = attr.match(/rotate\(([\s\S]*?)\)/gi);
			val = val[0].replace(/rotate\(|deg|\)| /gi, "");
			// if no axis is set assume Z?
			rot = {
				z: parseFloat( val, 10 ) * (Math.PI/180)
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
		// only supporting scale3d for now...
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
			// expect a six-pack of images
			this.addSkybox( img );

		} else {
			// this is one image... not implemented yet
		}

	},

	sprite: function( el, attr ){
		// wait for the image to load
		var loaded = setInterval(function(){
			// assume map is available...
			if( !el.material.map.image || !el.material.map.image.width ) return;
			// fallbacks
			attr = attr || el._style["background-size"] || "0 0";
			var size = attr.split(" ");
			var width = parseFloat(size[0], 10);
			var height = parseFloat(size[1], 10);
			// get position from style
			var x = parseFloat( el._style["background-position-x"] || 0 );
			var y = parseFloat( el._style["background-position-y"] || 0 );

			if( !width || !height ) return;

			// image dimensions
			var imgWidth = el.material.map.image.width;
			var imgHeight = el.material.map.image.height;
			//
			//el.material.uvOffset.set(1 / 5, 0);
			//el.material.uvScale.set(1 / 5, 1);
			el.material.map.offset.set( (imgWidth - width - x) / imgWidth, (imgHeight - height - y) / imgHeight ); // start from top left...
			el.material.map.repeat.set(width / imgWidth, height / imgHeight);
			//el.scale.set( width, height, 1 );
			//console.log("sprite loaded");
			// stop loop
			clearInterval(loaded);
		}, 200);


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

function setColor( object, color ){
	object = object || {};
	// prerequisite
	if( !object.material ) return; // create material instead?
	// in case we have more than one materials
	if( object.material.materials ){
		// check it it's an array first?
		for(var i in object.material.materials ){
			object.material.materials[i].color.setHex(color);
		}
	} else {
		object.material.color.setHex(color);
	}
}




Three.prototype.animate = function( options, el ){
	//this.mesh.rotation.z = Date.now() / 1000;

	// fallbacks
	options = options || {};
	el = el || this.last || false; // last processed object
	// FIX: we are checking the type of the element to attach to Object3D?
	if( el instanceof THREE.Mesh && el.parent instanceof THREE.Object3D ){
		el = el.parent;
	}
	// prerequisites
	if( !el || !options.name ) return;
	// create the necessary object containers
	// should we be checking the type of the element to attach to Object3D?
	el._animations = el._animations || {};
	el._update = el._update || updateAnimations.bind( el );

	// pickup animation keyframes
	options.keyframes = this.fn.animate.getKeyframes.call( this, options.name );
	// exit now...
	if( !options.keyframes ) return;
	// set the new animation
	el._animations[ options.name ] = options;
	// add to animate queue (once...)
	var inQueue = ( typeof this.fn.animate.queue[el.uuid] !== "undefined" );
	if( !inQueue){
		this.fn.animate.queue[el.uuid] = el._update; // using uuid to be able to remove from queue later
	}
};

// Internal

fn.animate = {
	// container for all methods to be updated
	queue: {},

	getKeyframes: function( name ){
		var keyframes = {};
		// first find the rules
		var animation = findKeyframesRule( name );

		if(!animation) return;
		// parse each one of them
		for(var i in animation.cssRules){
			var rule = animation.cssRules[i];
			var frame = {};
			// FIX: only rules parsed
			if( !rule.keyText ) continue;
			// convert percent to 1-100 number
			var key = parseInt( rule.keyText, 10 ), val;
			// find rotation values
			frame.rotation = this.fn.css.rotate( rule.cssText );
			// find translate values
			frame.translation = this.fn.css.translate( rule.cssText );
			// find scale values
			frame.scale = this.fn.css.scale( rule.cssText );
			// other attributes
			if( rule.cssText.search("background-position-x") > -1 ){
				frame["background-position"] = frame["background-position"] || {};
				val = rule.cssText.match(/:[\d|\s|\w]+\;/); // capture everything between : ;
				if( val ) frame["background-position"].x = parseFloat(val[0].substr(1), 10);
			}
			if( rule.cssText.search("background-position-y") > -1 ){
				frame["background-position"] = frame["background-position"] || {};
				val = rule.cssText.match(/:[\d|\s|\w]+\;/); // capture everything between : ;
				if( val ) frame["background-position"].y = parseFloat(val[0].substr(1), 10);
			}
			// add to the keyframes
			keyframes[ key ] = frame;
		}
		return keyframes;
	},

	// loop through the object's animations and update the object's properties
	update: function( el ){
		//console.log(  this.queue );
		// loop through the queue
		for( var i in this.queue ){
			// execute
			this.queue[i]();
		}
	}

};

// Helpers

function updateAnimations(){
	// context is the individual object
	//console.log( this );
	// loop through animations
	for( var i in this._animations){
		var animation = this._animations[i];
		var keyframes = animation.keyframes;
		// get current params
		animation.start = animation.start || utils.now();
		animation.end = animation.end || ( animation.start + animation.duration );
		animation.offset = animation.offset || registerState( this );
		animation.count = animation.count || 0;
		// find the right stage in the animation
		var now = utils.now();
		var percent = ( ( now - animation.start) / animation.duration ) * 100;
		var start = false,
			end = false;
		for( var key in keyframes ){
			if( key <= percent ){
				start = keyframes[ key ];
			}
			if( key > percent && !end ){
				end = keyframes[ key ];
			}
		}
		// fallbacks
		if( !start ) start = keyframes[ 0 ];
		if( !end ) end = keyframes[ 100 ];
		// apply updates
		// NOTE: only linear supported for now...
		// - rotate
		var rot = {
			x: ( typeof start.rotation.x != "undefined" && typeof end.rotation.x != "undefined" ) ? (end.rotation.x - start.rotation.x )*(percent/100) : 0,
			y: ( typeof start.rotation.y != "undefined" && typeof end.rotation.y != "undefined" ) ? (end.rotation.y - start.rotation.y )*(percent/100) : 0,
			z: ( typeof start.rotation.z != "undefined" && typeof end.rotation.z != "undefined" ) ? (end.rotation.z - start.rotation.z )*(percent/100) : 0
		};
		this.rotation.set( animation.offset.rotation.x+rot.x, animation.offset.rotation.y+rot.y, animation.offset.rotation.z+ rot.z);
		// TBA...
		// - translate

		// - scale

		// - sprites
		if( this instanceof THREE.Sprite ){
			// get current sprite index
			var offset = {
				x: this.material.map.offset.x,
				y: this.material.map.offset.y
			};
			// increment
			var steps = animation.easing;
			var step = 100/steps;
			var nextStep = ( (parseInt( percent, 10) % step) === 0 ) ? parseInt( percent, 10) / 100 : 0; // every time we return to zero we have a new step
			if( nextStep ){
				// FIX: start index of steps from zero
				nextStep -= 1/steps;
				// find the right axis
				if( typeof animation.keyframes[0]["background-position"].x !== "undefined"  ){
					// - numbers go in reverse order (steps-1 to 0)
					offset.x = ((steps-1)/steps)-nextStep;
				}
				if( typeof animation.keyframes[0]["background-position"].y !== "undefined" ){
					// - numbers go in reverse order (steps-1 to 0)
					offset.y = ((steps-1)/steps)-nextStep;
				}
				// update sprite
				this.material.map.offset.set( offset.x, offset.y );
			}

		}
		// reset if reached completion
		if( percent >= 100 ){
			delete animation.start;
			delete animation.end;
			delete animation.offset;
			animation.count++;
		}
		//
		if( animation.count == animation.repeat ){
			delete this._animations[i];
		} else {
			// save animation updates
			this._animations[i] = animation;
		}
	}
}

// register element state
function registerState( el ){
	return {
		position: {
			x: el.position.x,
			y: el.position.y,
			z: el.position.z
		},
		rotation: {
			x: el.rotation.x,
			y: el.rotation.y,
			z: el.rotation.z
		},
		scale: {
			x: el.scale.x,
			y: el.scale.y,
			z: el.scale.z
		}
	};
}

/*
 * Access and modify CSS animations @keyFrames with Javascript
 * Based on : http://jsfiddle.net/russelluresti/RHhBz/2/
 * Issue : http://stackoverflow.com/questions/10342494/set-webkit-keyframes-values-using-javascript-variable
 */

 // search the CSSOM for a specific -webkit-keyframe rule
function findKeyframesRule(rule){
	// gather all stylesheets into an array
	var ss = document.styleSheets;

	// loop through the stylesheets
	for (var i = 0; i < ss.length; ++i) {

		// loop through all the rules
		for (var j = 0; j < ss[i].cssRules.length; ++j) {

			// find the -webkit-keyframe rule whose name matches our passed over parameter and return that rule
			if (ss[i].cssRules[j].type == window.CSSRule.WEBKIT_KEYFRAMES_RULE && ss[i].cssRules[j].name == rule)
				return ss[i].cssRules[j];
		}
	}

	// rule not found
	return null;
}

// remove old keyframes and add new ones
function changeAnimationKeyframes(anim){
	// find our -webkit-keyframe rule
	var keyframes = findKeyframesRule(anim);

	// remove the existing 0% and 100% rules
	keyframes.deleteRule("0%");
	keyframes.deleteRule("100%");

	// create new 0% and 100% rules with random numbers
	keyframes.insertRule("0% { -webkit-transform: rotate("+randomFromTo(-360,360)+"deg); }");
	keyframes.insertRule("100% { -webkit-transform: rotate("+randomFromTo(-360,360)+"deg); }");

	// assign the animation to our element (which will cause the animation to run)
	document.getElementById('box').style.webkitAnimationName = anim;
}

Three.prototype.fx = function(){
		//this.mesh.rotation.z = Date.now() / 1000;

	};

// watch an element for changes
Three.prototype.watch = function( el ) {
	var self = this;
	var element = $(this.el).toSelector() +" "+ $( el ).selector;
	// monitor new elements
	$('body').on('DOMSubtreeModified', element, function(e){
		self.eventSubtree(e);
	});
	// monitor attribute changes
	if (el.onpropertychange){
		$('body').on('propertychange', element, function(e){
			self.eventAttribute(e);
		});
	}
	else {
		$('body').on('DOMAttrModified', element, function(e){
			self.eventAttribute(e);
		});
	}
	// monitor css style changes

};

// - new element
Three.prototype.eventSubtree = function(e) {
	e.stopPropagation();

	// variables
	var $root = $( $(this.el).toSelector() +" shadow-root" ).get(0);
	var $target = $(e.target).get(0);

	// don't go above the root
	this.parent = ( $root == $target ) ? $(e.target) : $(e.target).parent();
	this.target = $(e.target);

	if (e.target.innerHTML.length > 0) {
		// Handle new content
		//var html = e.target.innerHTML;
		var html = $(e.target).html();
		//this.newEl = $(e.target).children().last();
		// #46 parsing one tag at a time
		//html = $(html).html("").get(0);
		//this.newEl = $(html).last();
		this.append( html, { silent : true, target: this.target, traverse: false, watch: true });
	}
};

// - updated attribute
Three.prototype.eventAttribute = function(e) {
	e.stopPropagation();

	console.log("attribute",  e.target );

};

// - updated style(s)



// generic method to add an element
Three.prototype.add = function( attributes, options ){
		var self = this;
		// fallbacks
		options = options || {};
		// use the active scene if not specified
		//var parent = scene || this.active.scene;
		// get the type from the tag name
		//var type = html.nodeName.toLowerCase();
		// list of containers (we'll be using)

		// exit if no type is specified
		if( typeof attributes == "undefined" || typeof attributes.type == "undefined" ) return this;

		//	create 3d element
		this.webgl( attributes, function( webgl ){

			// exit now if no webgl object was created (undefined condition should be removed)
			if( !webgl || typeof webgl == "undefined") return this;
			// add a new tag (if necessary)
			//if ( attributes.html ){
			var object;

			// set a reference to the last el (for later)
			self.last = webgl;

			// add to the relevant bucket
			var container = self.groups[ attributes.type ] || false;
			// create object container only for primitives...
			if( container == "objects" && webgl instanceof THREE.Mesh ){
				// create new object
				object = new THREE.Object3D();
				object.add(webgl);
				// #40 copy name from mesh
				object.name = webgl.name;
			} else {
				object = webgl;
			}
			//this[ attributes.type+"s" ][0] = webgl;
			// condition which elements have an active flag?
			self.active[ attributes.type ] = object;
			//
			if( container ){
				// save in the objects bucket
				self[container][object.id] = object;
			}
			// add to scene
			if( attributes.type == "scene"){
				self.active.scene = object;
			} else if( self.active.scene ){
				self.active.scene.add( object );
			}
			// keep a reference of the object id
			attributes["data-id"] = object.id || false;
			// create the tag in the shadow dom
			var $html;
			if( options.silent && attributes.el){
				// target should be already set?
				//$html = $(self.target).find( attributes.type );
				// add data-id to existing containers
				$html = attributes.el;
				$html.attr("data-id" , attributes["data-id"]);
			} else {
				$html = self.createHTML( attributes );
				self.target = $html;
			}
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

				var scene = new THREE.Scene();
				var camera, geometry, material;

				if( img.length == 1){

					camera = new THREE.PerspectiveCamera( 50, $(this.el).width() / $(this.el).height(), 1, 1100 );
					camera.target = new THREE.Vector3( 0, 0, 0 );

					// skysphere
					geometry = new THREE.SphereGeometry( 500, 60, 40 );
					geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );

					material = new THREE.MeshBasicMaterial( {
						map: THREE.ImageUtils.loadTexture( img[0] )
					});

				} else {

					// skybox
					var reflectionCube = THREE.ImageUtils.loadTextureCube( img );
					reflectionCube.format = THREE.RGBFormat;

					// does this camera have set values??
					camera = new THREE.PerspectiveCamera( 50, $(this.el).width() / $(this.el).height(), 1, 100 );

					//var shader = THREE.ShaderUtils.lib.cube;
					var shader = THREE.ShaderLib.cube;
					var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
					uniforms.tCube.value = reflectionCube;

					material = new THREE.ShaderMaterial( {

						fragmentShader: shader.fragmentShader,
						vertexShader: shader.vertexShader,
						uniforms: uniforms,
						depthWrite: false,
						side: THREE.BackSide

					});
					geometry = new THREE.BoxGeometry( 100, 100, 100 );
				}

				var mesh = new THREE.Mesh( geometry, material );

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
Three.prototype.html = function(html, options){
		var self = this;
		// fallbacks
		options = options || {};
		options.target = options.target || this.target;
		if( typeof options.traverse === "undefined") options.traverse = true;

		// loop throught the elements of the dom
		$(html).filter('*').each(function(i, el){
			// is this a jQuery bug?
			var $el = (typeof el == "undefined") ? false : $(el);

			// exit if there is no parent set
			if( !$el ) return;
			// if there's a data id this is an attribute change we don't want to monitor
			if( typeof $el.attr("data-id") !== "undefined" ) return;

			var attr = {};
			// use the active scene if not specified
			//var parent = scene || this.active.scene;
			// get the type from the tag name
			attr.type = el.nodeName.toLowerCase();
			attr.id = $el.attr("id");

			// the set of attributes
			var attributes = self.getAttributes( el );
			//
			attr = $.extend(attr, attributes);

			attr.el = options.target.children(":eq("+i+")");
			// if we can't find the new element quit
			if( options.watch && !attr.el.length ) return;
			self.add( attr, options );

			// loop through the children (only if el not empty)
			if( $el.html() !== "" && options.traverse)
				self.html( $el.html(), options );

		});

		return this;

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

Three.prototype.append = function(html, options){
	options = options || {};
	// pickup active scene
	//var scene = this.active.scene;
	// add the submitted markup (validation?)
	//$(this.el).find("[data-id='"+ scene.id +"']").append( html );
	this.html( html, options );
	// #38 preserve chainability...
	return this;
};
// return an object using its id
Three.prototype.get = function( id ){

	// find the element in the containers
	var el = this.objects[id] || this.cameras[id] || this.scenes[id] || null;

	return el;

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

		var id = $(this.el).find("shadow-root "+ query).attr("data-id");
		// find the element in the containers
		var el = this.objects[id] || this.cameras[id] || this.scenes[id] || null;

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
			case "sprite":
				el = this.webglSprite( options );
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

		var geometry = new THREE.BoxGeometry( options.width, options.height, options.depth);
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
			radiusTop : 1,
			radiusBottom : 1,
			segmentsRadius : 4,
			segmentsHeight : 16,
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

Three.prototype.webglSprite = function( attributes ){

		// sprite

		attributes = attributes || {};

		var defaults = {
			map : false,
			color: 0xffffff,
			fog: false,
			transparent: true,
			opacity: 1
			//alignment: THREE.SpriteAlignment.topLeft
			//useScreenCoordinates: true
			//scene: this.active.scene
		};

		var options = $.extend(defaults, attributes);
		// FIX map
		if ( attributes.map ) {
			options.map = THREE.ImageUtils.loadTexture( attributes.map );
		} else {
			//placeholder pixel
			options.map = utils.pixel();
		}

		var material = new THREE.SpriteMaterial( options );
		material.scaleByViewport = true;
		material.blending = THREE.AdditiveBlending;

		var sprite = new THREE.Sprite( material );

		return sprite;

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