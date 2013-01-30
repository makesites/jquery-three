
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
		for(var i in sheets) {
			var rules = sheets[i].rules || sheets[i].cssRules;
			for(var r in rules) {
				// #21 - excluding :hover styles from parsing
				if( rules[r].selectorText && rules[r].selectorText.search(":hover") > -1) continue;
				try{ 
					if(a.is(rules[r].selectorText)) {
						o = $.extend(o, css2json(rules[r].style), css2json(a.attr('style')));
					}
				} catch( e ) {
					console.log( e );
				}
			}
		}
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
					object.material.color.setHex(color);
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
					}
					if( object.type == "terrain" ){ 
						this.fn.css.terrain.call(this, css[attr]);
					} else if ( object instanceof THREE.Mesh ) { 
						this.fn.css.texture.call(this, object, css[attr]);
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

