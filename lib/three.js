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
			case "plain":
				el = this.webglPlain( options );
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
		options.scene.add( camera );
		
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
		this.objects[name] = { id: name, mesh: new THREE.Mesh( geometry, material ) };
		
		options.scene.add( this.objects[name].mesh );
		
	}
});

})( jQuery );