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
		
		for( var attr in css ){
			
			// supported attributes
			switch(attr){
				// - width
				case "width":
				object.mesh.scale.x = parseInt(css[attr], 10);
				break;
				// - height
				case "height":
				object.mesh.scale.y = parseInt(css[attr], 10);
				break;
				case "left":
				object.mesh.position.x = parseInt(css[attr], 10);
				break;
				case "top":
				object.mesh.position.y = parseInt(css[attr], 10);
				break;
				// - color
				case "color":
				var color =  this.colorToHex(css[attr]);
				var material = new THREE.MeshBasicMaterial( { color: color } );
				object.mesh.material = material;
				break;
				
			}
			
		}
		
	},
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