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
		var $html = this.createHTML( options );
		// apply css 
		var css = this.css( $html );
		this.cssSet( css );
		// add to the relevant bucket
		//this[ options.type+"s" ][0] = webgl;
		this.active[ options.type ] = webgl;
		//console.log( webgl );
		
		// set a reference to the last el (for later)
		this.last = webgl;
		
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