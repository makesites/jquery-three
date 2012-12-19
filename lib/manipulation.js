(function( $ ) {
	
Three.prototype = $.extend(Three.prototype, {
	// generic method to add an element
	add : function(html, scene){
		// use the active scene if not specified
		var parent = scene || this.active.scene;
		// get the type from the tag name
		var type = html.nodeName.toLowerCase();
		//	
		switch( type ){
			case "camera":
				this.addCamera(html, parent);
			break;
			case "mesh":
				this.addMesh(html, parent);
			break;
		}
	},
	addScene : function( options ){
		
		var defaults = {
			id : false
		};
		
		var settings = $.extend(defaults, options);
		
		// create markup
		var $scene = $('<scene>');
		// 
		if( settings.id )
			$scene.attr("id", settings.id );
			
		// create element
		this.createScene( $scene );
		
	}, 
	
	// add a plane
	addPlane : function( options ){
		// plane - by default a 1x1 square
		var defaults = {
			width: 1,
			height: 1,
			color: 0x000000, 
			scene: this.active.scene
		};
		
		var settings = $.extend(defaults, options);
		
		var name = settings.id || random(10000);
		var geometry = new THREE.PlaneGeometry( settings.width, settings.height );
		geometry.dynamic = true;
		var material = new THREE.MeshBasicMaterial( { color: settings.color } );
		this.objects[name] = { id: name, mesh: new THREE.Mesh( geometry, material ) };
		
		settings.scene.add( this.objects[name].mesh );
		
		// add new tag
		var $plane = $('<plane>');
		if( settings.id )
			$plane.attr("id", settings.id);
		// append to the dom
		$plane.appendTo(this.container);
		
		// set a reference to the last list
		this.last = this.objects[name];
		
		// set css attributes
		var css = this.css( $plane );
		this.cssSet( css );
		
		return this;
		
	}, 
	// add camera(s)
	addCamera : function( html, scene ){
		
		var defaults = {
				fov: 50, 
				aspect: $(this.container).width() / $(this.container).height(), 
				near: 1, 
				far: 1000
		};
		// the set of attributes
		var attributes = this.getAttributes( html );
		var settings = $.extend(defaults, attributes);
		
		var camera = new THREE.PerspectiveCamera( settings.fov, settings.aspect, settings.near, settings.far );
		
		this.last = camera;
		
		var css = this.css( $(html) );
		
		this.cssSet( css );
		
		//console.log( $(html).attr("data-*") );
		
		this.active.camera = camera;
		
	}, 
	// add meshes
	addMesh : function( name ){
		
	}, 
	// add asset
	addAsset : function( name ){
		
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