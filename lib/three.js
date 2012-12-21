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
			case "plane": 
				el = this.webglPlane( options );
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
		this.objects[name] = new THREE.Mesh( geometry, material );
		this.objects[name].name = name; 
		
		options.scene.add( this.objects[name] );
		
		return this.objects[name];
		
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
		
		var terrainShader = THREE.ShaderTerrain[ "terrain" ];

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

		uniformsTerrain[ "uDiffuseColor" ].value.setHex( 0xffffff );
		uniformsTerrain[ "uSpecularColor" ].value.setHex( 0xffffff );
		uniformsTerrain[ "uAmbientColor" ].value.setHex( 0x111111 );

		uniformsTerrain[ "uRepeatOverlay" ].value.set( 6, 6 );
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
		
		terrain.position.set( 0, -225, 0 );
		terrain.rotation.x = -Math.PI / 2;
		//terrain.visible=false;
		this.active.scene.add( terrain );
		
		return terrain;
		
	}
	
});

})( jQuery );