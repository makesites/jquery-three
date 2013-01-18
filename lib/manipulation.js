
Three.prototype = $.extend(Three.prototype, {
	// generic method to add an element
	add : function( options ){
		// use the active scene if not specified
		//var parent = scene || this.active.scene;
		// get the type from the tag name
		//var type = html.nodeName.toLowerCase();
		// list of containers (we'll be using)
		var groups = {
			"camera" : "cameras", "scene" : "scenes", "mesh" : "objects", "plane" : "objects", "cube" : "objects", "sphere" : "objects", "cylinder" : "objects", "material" : "materials"
		};
		var object;
		
		// exit if no type is specified
		if( typeof options == "undefined" || typeof options.type == "undefined" ) return this;
		
		//	create 3d element
		var webgl = this.webgl( options );
		// exit now if no webgl object was created
		if(typeof webgl == "undefined") return this;
		// add a new tag (if necessary)
		//if ( options.html ){ 
		
		// set a reference to the last el (for later)
		this.last = webgl;
		
		// add to the relevant bucket
		var container = groups[ options.type ] || false;
		// create object container only for primitives...
		if( container == "objects" ){
			// create new object
			object = new THREE.Object3D();
			object.add(webgl);
		} else {
			object = webgl;
		}
		//this[ options.type+"s" ][0] = webgl;
		// condition which elements have an active flag?
		this.active[ options.type ] = object;
		//
		if( container ){
			// save in the objects bucket 
			this[container][object.id] = object;
		}
		// add to scene
		if( options.type == "scene"){ 
			this.active.scene = object;
		} else {
			this.active.scene.add( object );
		}
		// keep a reference of the object id
		options["data-id"] = object.id || false;
		// create the tag in the shadow dom
		var $html = this.createHTML( options );
		
		// apply css 
		var css = this.css( $html );
		this.cssSet( css );
		
		return this;
		
	},
	addScene : function( obj ){
		
		var options = obj ||{};
		
		options.type = "scene";
		
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
	
	// add a plane
	addPlane : function( obj ){
		
		var options = obj ||{};
		
		options.type = "plane";
		
		this.add(options);
		
		return this;
		
	}, 
	
	// add a sphere
	addSphere : function( obj ){
		
		var options = obj ||{};
		
		options.type = "sphere";
		
		this.add(options);
		
		return this;
		
	}, 
	
	// add a cube
	addCube : function( obj ){
		
		var options = obj ||{};
		
		options.type = "cube";
		
		this.add(options);
		
		return this;
		
	}, 
	
	// add a cylinder
	addCylinder : function( obj ){
		
		var options = obj ||{};
		
		options.type = "cylinder";
		
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
