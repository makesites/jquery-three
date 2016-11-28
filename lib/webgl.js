
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

Three.prototype.webglScene = function( attributes ){

		var defaults = {
			id : false
		};

		var options = $.extend(defaults, attributes);

		var scene = new THREE.Scene();

		// save in the objects bucket
		this.scenes[scene.id] = scene;

		// save attributes
		scene._attributes = options;

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

		// save attributes
		camera._attributes = options;

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
			if( options.map && shader.uniforms) settings.uniforms.texture.texture= utils.textureLoader( options.map );
			material = new THREE.ShaderMaterial( settings );

		} else {
			// create a basic material
			settings = {};
			if( options.map ) settings.map = utils.textureLoader( options.map );
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

		var Constructor = ( options.buffer ) ? THREE.PlaneBufferGeometry : THREE.PlaneGeometry;

		var geometry = new Constructor( options.width, options.height );
		// make this optional?
		geometry.dynamic = true;
		var material = new THREE.MeshBasicMaterial( { color: options.color, wireframe: options.wireframe } );
		var mesh = new THREE.Mesh( geometry, material );

		// set attributes
		if( options.id ) mesh.name = options.id;

		// save attributes
		mesh._attributes = options;

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

		// save attributes
		mesh._attributes = options;

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

		// save attributes
		mesh._attributes = options;

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

		// save attributes
		mesh._attributes = options;

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
			options.map = utils.textureLoader( attributes.map );
		} else {
			//placeholder pixel
			options.map = utils.pixel();
		}
		// save id (name) for later
		var name = options.id;
		// FIX: delete unsupported options
		delete options.id;
		delete options['class'];
		delete options.el;
		var material = new THREE.SpriteMaterial( options );
		material.scaleByViewport = true;
		material.blending = THREE.AdditiveBlending;

		var sprite = new THREE.Sprite( material );
		// save name (id) back to the object
		sprite.name = name;

		// save attributes
		sprite._attributes = options;

		return sprite;

	};

Three.prototype.webglTerrain = function( attributes ){
		// fallbacks
		attributes = attributes || {};
		// prerequisites
		if( !THREE.ShaderTerrain ) return console.log("THREE.ShaderTerrain needs to be loaded when using <terrain>");

		// assuming that terrain is generated from a heightmap - support class="mesh" in the future?
		var terrain;

		var defaults = {
			lights: true,
			fog: true,
			scale: 256
		};

		var options = $.extend(defaults, attributes);
/*
		this.active.scene.add( new THREE.AmbientLight( 0x111111 ) );

		directionalLight = new THREE.DirectionalLight( 0xffffff, 1.15 );
		directionalLight.position.set( 500, 2000, 0 );
		this.active.scene.add( directionalLight );
*/
		var plane = new THREE.PlaneBufferGeometry( 6000, 6000, 256, 256 );

		plane.computeFaceNormals();
		plane.computeVertexNormals();
		//plane.computeTangents( plane );
		//THREE.BufferGeometryUtils.computeTangents( plane );
		utils.computeTangents( plane );

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

		*/

		// allow the terrain to emit ambient light from the scene
		if( THREE.REVISION < 70 ){
			uniformsTerrain.uDiffuseColor.value.setHex( 0xffffff );
			uniformsTerrain.uSpecularColor.value.setHex( 0xffffff );
			uniformsTerrain.uAmbientColor.value.setHex( 0x111111 );
		} else {
			uniformsTerrain.diffuse.value.setHex( 0xffffff );
			uniformsTerrain.specular.value.setHex( 0xffffff );
			//uniformsTerrain.ambient.value.setHex( 0x111111 );
		}
		uniformsTerrain.uRepeatOverlay.value.set( 1, 1 );
		//

		// fog is expensive - disable for now...
		var material = new THREE.ShaderMaterial( {
								uniforms :				uniformsTerrain,
								vertexShader :		terrainShader.vertexShader,
								fragmentShader :		terrainShader.fragmentShader,
								lights :					options.lights,
								fog :						options.fog,
								needsUpdate: true
		});

		terrain = new THREE.Mesh( plane, material );
		// needsUpdate as attribute
		//terrain.geometry.attributes.normal.needsUpdate = true;

		// save type as part of the mesh
		terrain.type = "terrain";

		// save attributes
		terrain._attributes = options;

		//terrain.visible=false;
		this.active.scene.add( terrain );

		return terrain;

	};
