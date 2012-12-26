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
			case "terrain": 
				el = this.webglTerrain( options );
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
		
		//console.log( this.active );
		//options.scene.add( camera );
		
		return camera;
	}, 
	
	webglMesh: function( attributes ){
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
	}, 
	
	webglMaterial: function( attributes ){
		
		var defaults = {
			id : false, 
			scene: this.active.scene
		}; 
		
		var options = $.extend(defaults, attributes);
		
		var settings = {};
		// cu
		if( options.id && Shaders[ options.id ] ){ 
			var shader = Shaders[ options.id ];
			if( shader.uniforms )  settings.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
			if( shader.vertexShader )  settings.vertexShader = shader.vertexShader;
			if( shader.fragmentShader )  settings.fragmentShader = shader.fragmentShader;
			if( options.texture && shader.uniforms) settings.uniforms['texture'].texture= THREE.ImageUtils.loadTexture( options.texture );
		}
		
		material = new THREE.ShaderMaterial( settings );
		// add to the last object;
		var obj = this.last;
		
		obj.material =  material;
		

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
			wireframe: false, 
			scene: this.active.scene
		};
		
		var options = $.extend(defaults, attributes);
		
		var geometry = new THREE.PlaneGeometry( options.width, options.height );
		// make this optional?
		geometry.dynamic = true;
		var material = new THREE.MeshBasicMaterial( { color: options.color, wireframe: options.wireframe } );
		var mesh = new THREE.Mesh( geometry, material );
		
		// set attributes
		if( options.id ) mesh.name = options.id;
		
		// save in the objects bucket 
		this.objects[mesh.id] = mesh;
		
		options.scene.add( mesh );
		
		return mesh;
		
	}, 
	
	webglSphere: function( attributes ){
		
		var defaults = {
			id : false, 
			radius : 1,
			segments : 16,
			rings : 16, 
			color: 0x000000, 
			wireframe: false, 
			scene: this.active.scene
		}; 
		
		var options = $.extend(defaults, attributes);
		
		var geometry = new THREE.SphereGeometry( options.radius, options.segments, options.rings);
		// make this optional?
		geometry.dynamic = true;
		var material = new THREE.MeshBasicMaterial( { color: options.color, wireframe: options.wireframe } );
		var mesh = new THREE.Mesh( geometry, material );
		
		// set attributes
		if( options.id ) mesh.name = options.id;
		
		// save in the objects bucket 
		this.objects[mesh.id] = mesh;
		
		// add to scene
		options.scene.add( mesh );
		
		return mesh;
	}, 
	
	webglCube: function( attributes ){
		
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
		
		var geometry = new THREE.CubeGeometry( options.width, options.height, options.depth);
		// make this optional?
		geometry.dynamic = true;
		var material = new THREE.MeshBasicMaterial( { color: options.color, wireframe: options.wireframe } );
		var mesh = new THREE.Mesh( geometry, material );
		
		// set attributes
		if( options.id ) mesh.name = options.id;
		
		// save in the objects bucket 
		this.objects[mesh.id] = mesh;
		
		// add to scene
		options.scene.add( mesh );
		
		return mesh;
	}, 
	
	webglCylinder: function( attributes ){
		
		var defaults = {
			id : false, 
			radiusTop : 100, 
			radiusBottom : 100, 
			segmentsRadius : 400, 
			segmentsHeight : 50, 
			openEnded : 50, 
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
		
		// save in the objects bucket 
		this.objects[mesh.id] = mesh;
		
		// add to scene
		options.scene.add( mesh );
		
		return mesh;
	
	}, 
	
	webglTerrain: function( attributes ){
		// assuming that terrain is generated from a heightmap - support class="mesh" in the future? 
		var terrain;
		
		var defaults = {
				
		};
		
		
		this.active.scene.add( new THREE.AmbientLight( 0x111111 ) );

		directionalLight = new THREE.DirectionalLight( 0xffffff, 1.15 );
		directionalLight.position.set( 500, 2000, 0 );
		this.active.scene.add( directionalLight );
		
		
		var plane = new THREE.PlaneGeometry( 6000, 6000, 256, 256 );

		plane.computeFaceNormals();
		plane.computeVertexNormals();
		plane.computeTangents();


		//
		
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

		uniformsTerrain[ "uRepeatOverlay" ].value.set( 6, 6 );
		*/

		uniformsTerrain.uDiffuseColor.value.setHex( 0xffffff );
		uniformsTerrain.uSpecularColor.value.setHex( 0xffffff );
		uniformsTerrain.uAmbientColor.value.setHex( 0x111111 );

		uniformsTerrain.uRepeatOverlay.value.set( 6, 6 );
		//

		// fog is expensive - disable for now...
		var material = new THREE.ShaderMaterial( {
								uniforms :				uniformsTerrain,
								vertexShader :		terrainShader.vertexShader,
								fragmentShader :		terrainShader.fragmentShader,
								lights :					true,
								fog :						false
		});

		terrain = new THREE.Mesh( plane, material );

		// save type as part of the mesh 
		terrain.type = "terrain";
		
		//terrain.visible=false;
		this.active.scene.add( terrain );
		
		return terrain;
		
	}
	
});

})( jQuery );