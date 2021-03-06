
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
		// FIX: delete unsupported options (why not define the options supported?)
		delete options.id;
		delete options['class'];
		delete options.el;
		delete options.style;

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

		var defaults = {
			lights: true,
			fog: true,
			scale: 256,
			width: 6000,
			height: 6000,
			resolution: 256,
			shader: true,
			repeat: 1 // diffuse map repeat
		};

		var options = $.extend(defaults, attributes);

		// logic contained
		// assuming that terrain is generated from a heightmap - support class="mesh" in the future?
		var terrain = (new Terrain( options )).terrain;

		//terrain.visible=false;
		this.active.scene.add( terrain );

		return terrain;

	};
