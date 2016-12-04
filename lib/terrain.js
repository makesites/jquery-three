
// internal constructor for Terrain
var Terrain = function( options ){
	// prerequisites?

	// reference to the options
	this.options = options;

	// binding resolution across axis
	var resX = options.resolution,
		resY = options.resolution;

	// in both cases the geometry is Buffer
	var plane = new THREE.PlaneBufferGeometry( options.width, options.height, resX, resY );

	// update normals after images are loaded?
	plane.computeFaceNormals();
	plane.computeVertexNormals();
	//plane.computeTangents( plane );
	//THREE.BufferGeometryUtils.computeTangents( plane );
	utils.computeTangents( plane );

	// look if we're rendering using a shader
	var material = ( options.shader ) ? this.shaderMaterial() : this.basicMaterial();

	// exit now id we didn't generate a material?

	// generate mesh
	var terrain = new THREE.Mesh( plane, material );
	// needsUpdate as attribute
	//terrain.geometry.attributes.normal.needsUpdate = true;

	// save type as part of the mesh
	terrain.type = "terrain";

	// save attributes
	terrain._attributes = options;

	// helper methods
	if( options.shader ){
		terrain.updateTexture = this.shaderTexture.bind(terrain);
	} else {
		terrain.computeElevation = this.computeElevation.bind(terrain);
		terrain.updateTexture = this.basicTexture.bind(terrain);
	}

	// save reference
	this.terrain = terrain;

	return this;
};


Terrain.prototype.shaderMaterial = function(){
	// prerequisites
	if( !THREE.ShaderTerrain )
		return console.log("THREE.ShaderTerrain not loaded. Use data-shader='false' to generate a poly terrain");

	var options = this.options;
	var terrainShader = THREE.ShaderTerrain.terrain;

	var uniformsTerrain = THREE.UniformsUtils.clone( terrainShader.uniforms );

	/* these are all moved to the css styling...
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

	// this should also be accessible by a background-size value (with percentage conversion)
	uniformsTerrain.uRepeatOverlay.value.set( options.repeat, options.repeat );
	//

	var material = new THREE.ShaderMaterial( {
		uniforms :			uniformsTerrain,
		vertexShader :		terrainShader.vertexShader,
		fragmentShader :	terrainShader.fragmentShader,
		lights :			options.lights,
		fog :				options.fog,
		needsUpdate:	  true
	});

	return material;

};

Terrain.prototype.basicMaterial = function(){

	var material = new THREE.MeshBasicMaterial( { map: utils.pixel(), overdraw: 0.5 } );
	//
	return material;
};

// Helpers

// Terrain helper to compute elevation from heightmap
Terrain.prototype.computeElevation = function( texture ){
	// prerequisite
	if( this._attributes.shader ) return;
	var terrain = this; // method binded to terrain object

	// canvas for image processing
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext("2d");
	var img = texture.image;
	// canvas takes the polygon dimensions | vertices = faces +1 for every side
	var width = terrain.geometry.parameters.widthSegments + 1;
	var height = terrain.geometry.parameters.heightSegments + 1;
	var terrainScale = terrain._attributes.scale; //terrain.material.uniforms.uDisplacementScale.value;
	var terrainBias = - terrain._attributes.scale/2; //terrain.material.uniforms.uDisplacementBias.value;
	var size = terrain.geometry.parameters.width; // option?
	//var scale = size / width;
	// - main data
	var vertices = terrain.geometry.attributes.position;
	var d = [];

	canvas.width = width;
	canvas.height = height;

	ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
	// scale image to polygons
	//ctx.scale(width/img.width, height/img.height); // already resized from drawImage
	// loop through image data
	var data = ctx.getImageData(0,0, width, height).data;

	for( var i in data ){
		if ( i % 4 ) continue; // pick only every forth - item size 4: RGBA
		// OLD method: calculating the whole vector
		//var z = ( Math.floor(i/width) ) - (size/2);
		//var x = (i - ( Math.floor(i/width)*width)) - (size/2);
		//var y = (data[i]/255 * terrainScale) + terrainBias; // normalize height to a fraction
		//vertices.push( new THREE.Vector3(x, y, z) );
		//vertices.push( (data[i]/255 * terrainScale) + terrainBias );

		// updating the z axis of the vertices directly
		var z = ( (data[i]/255 * terrainScale) + terrainBias ); // terrain has z axis up...
		// instead combine all colors?
		//var decimal = (data[i]+data[i+1]+data[i+2])/(3*255);
		d.push( z );
		vertices.setZ( i/4, z );
	}

	// update the vertices in the terrain object
	terrain.geometry.attributes.position.needsUpdate = true;
};

Terrain.prototype.shaderTexture = function(type, img){

	var texture = utils.textureLoader( img ); //this.webglTexture( img );

	if( type == 'heightmap' ){
		var terrainScale = this._attributes.scale; // modified through an option

		this.material.uniforms.tDisplacement.value = texture;
		this.material.uniforms.uDisplacementScale.value = terrainScale;
		this.material.uniforms.uDisplacementBias.value = - terrainScale/2;
		// heightmap also the second diffuse map?
		//var diffuseTexture2 = texture;
		//diffuseTexture2.wrapS = diffuseTexture2.wrapT = THREE.RepeatWrapping;
		//this.material.uniforms.tDiffuse2.value = diffuseTexture2;
		//this.material.uniforms.enableDiffuse2.value = true;
	}
	if( type == 'diffuse' ){

		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

		this.material.uniforms.tDiffuse1.value = texture;
		this.material.uniforms.enableDiffuse1.value = true;

	}
	if( type == 'specular' ){
		//var texture = this.webglTexture( img );
		//texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

		this.material.uniforms.tSpecular.value = texture;
		this.material.uniforms.enableSpecular.value = true;

	}
	// always update vertices...
	// why don't these work with ShaderTerrain?
	//this.geometry.attributes.position.needsUpdate = true;
	//this.geometry.verticesNeedUpdate = true;

	/*
	leftovers ( normal and detail textures)

	//detailTexture.wrapS = detailTexture.wrapT = THREE.RepeatWrapping;
	//uniformsTerrain[ "tNormal" ].value = heightmapTexture;
	//uniformsTerrain[ "uNormalScale" ].value = 1;
	//uniformsTerrain[ "tDetail" ].value = detailTexture;
	//uniformsTerrain[ "uShininess" ].value = 30;
	*/

	return texture;
};


Terrain.prototype.basicTexture = function(type, img){
    var texture;

	if( type == 'heightmap' ){
		texture = utils.textureLoader( img, 'heightmap-loaded' );
		// texture isn't loaded in material, just used in computeElevation
		// monitoring event
		var self = this;
		// remove pre-existing event...
		var cb = function(e){
			self.computeElevation( texture );
			// trigger element event
			self.$el.trigger('heightmap-updated');
		};
		document.removeEventListener('heightmap-loaded', cb);
		document.addEventListener('heightmap-loaded', cb, false);
	}
	if( type == 'diffuse' ){
		texture = utils.textureLoader( img );
		var repeat = this._attributes.repeat;
		// dirty re-write
		texture.wrapT = THREE.RepeatWrapping;
		texture.wrapS = THREE.RepeatWrapping;
		texture.repeat.set( repeat, repeat );
		//texture.offset.set( 1, 1 );
		texture.needsUpdate = true;

		this.material.map = texture;
	}
	if( type == 'specular' ){
		// not supported?
	}

	return texture;
};
