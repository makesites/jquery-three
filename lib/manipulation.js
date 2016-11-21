
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

			// keep a reference of the object id
			attributes["data-id"] = object.id || false;

			// FIX: stop now if duplicate id was generated (why?)
			if( attributes.el.data('id') ) return;

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

			// save reference of html tag in object
			object.$el = $html;

			// apply css
			var css = self.fn.css.styles.call(self, $html );
			self.fn.css.set.call(self, webgl, css );

			// save in the objects bucket
			if( container ){
				self[container][object.id] = object;
			}

			// add to scene
			if( attributes.type == "scene"){
				self.active.scene = object;
			} else if( self.active.scene ){
				self.active.scene.add( object );
			}

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

				//var scene = new THREE.Scene();
				var camera, geometry, material;

				if( img.length == 1){

					//camera = new THREE.PerspectiveCamera( 50, $(this.el).width() / $(this.el).height(), 1, 1100 );
					//camera.target = new THREE.Vector3( 0, 0, 0 );

					// skysphere
					geometry = new THREE.SphereGeometry( 1, 60, 40 );
					geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );
					material = new THREE.MeshBasicMaterial({
						map: utils.textureLoader( img[0] )
					});

				} else {
					//
					var reflectionCube;
					// skybox (with legacy support)
					if(THREE.REVISION < 70){
						reflectionCube = THREE.ImageUtils.loadTextureCube( img );
					} else {
						var cubeTextureLoader = new THREE.CubeTextureLoader();
						reflectionCube = cubeTextureLoader.load( img );
					}
					reflectionCube.format = THREE.RGBFormat;

					// does this camera have set values??
					//camera = new THREE.PerspectiveCamera( 50, $(this.el).width() / $(this.el).height(), 1, 100 );

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
					// the dimensions of the skybox will be resized to the limits of the active camera (far)
					geometry = new THREE.BoxGeometry( 1, 1, 1 );
				}

				var mesh = new THREE.Mesh( geometry, material );
				/*
				var object = new THREE.Object3D();
				object.add( mesh );
				// #40 copy name from mesh
				object.name = mesh.name = "skybox";
				*/
				this.active.scene.add( mesh );

				// save as active
				this.active.skybox = mesh;
				//this.active.skybox = {
				//	scene : scene,
				//	camera : camera
				//};
	};

Three.prototype.addTerrain = function( obj ){

		var options = obj ||{};

		options.type = "terrain";

		this.add(options);

		return this;

	};
