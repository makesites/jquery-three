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
					console.log( object );
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