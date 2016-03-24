(function(){

	// Requires the BinaryLoader extension
	Three.prototype.fn.webgl.water = function( attributes, callback ){
		// define the group (once)
		if( !this.groups['water'] ) this.groups['water'] = "objects";
		// var self = this;
		// plane - by default a 1x1 square
		var defaults = {
			width: 1,
			height: 1,
			//color: 0x000000,
			wireframe: false,
			scene: this.active.scene
		};
		// extend options
		var options = $.extend(defaults, attributes);
		// load normals
		var waterNormals;
		if( THREE.REVISION < 70 ){
			waterNormals = new THREE.ImageUtils.loadTexture('assets/img/waternormals.jpg');
		} else {
			var textureLoader = new THREE.TextureLoader(); // requires THREE > v7x
			waterNormals = textureLoader.load('assets/img/waternormals.jpg');
		}
		waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
		// add a light to see the water reflection
		/*var directionalLight = new THREE.DirectionalLight(0xffff55, 1); // light color as option...
		directionalLight.position.set(-600, 300, 600); // position as option...
		/*var directionalLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
		directionalLight.color.setHSL( 0.6, 1, 0.6 );
		directionalLight.groundColor.setHSL( 0.095, 1, 0.75 );
		directionalLight.position.set( 0, 500, 0 );*/
		//this.active.scene.add(directionalLight);
		// generate geometry
		var Constructor = ( THREE.REVISION < 70 ) ? THREE.PlaneGeometry : THREE.PlaneBufferGeometry;
		var geometry = new Constructor( options.width, options.height, 10, 10); // polygon density as option...
		// make this optional?
		//geometry.dynamic = true;
		// Create the water effect
		var water = new THREE.Water(this.renderer, this.active.camera, this.active.scene, {
			textureWidth: 256,
			textureHeight: 256,
			waterNormals: waterNormals,
			alpha: 	1.0,
			//sunDirection: directionalLight.position.normalize(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			betaVersion: 0,
			side: THREE.DoubleSide
		});

		var mesh = new THREE.Mesh( geometry, water.material );
		// preserve reference to water object
		mesh.add(water);

		//new THREE.PlaneBufferGeometry(2000, 2000, 10, 10),

		// set attributes
		mesh.name = "water"; // use tagName instead?
		if( options.id )  mesh.name += options.id;

		// add object to scene (will be done later when an Object3D is created)
		//this.active.scene.add( mesh );

		// events
		$(this.el).on('update', function(e){
			var $3d = e.target;
			// loop to find the water object(s)
			for( var i in $3d.objects ){
				var obj = $3d.objects[i];
				// use .find() instead?
				if(obj.name.search('water') === 0){
					var water = obj.children[0].children[0]; // not expecting any other objects here?
					water.material.uniforms.time.value += 1.0 / 60.0;
					water.render();
					$3d.renderer.render($3d.active.scene, $3d.active.camera);
				}
			}
		});

		// return using callback
		callback( mesh );

	}

})();
