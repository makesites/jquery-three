(function(){
	
	// Requires the BinaryLoader extension
	Three.prototype.fn.webgl.obj = function( options, callback ){ 
		// define the group (once)
		if( !this.groups['obj'] ) this.groups['obj'] = "objects";
		
		// model
		var self = this;
		
		loader = new THREE.BinaryLoader( true );
		
		loader.load( options.src, function ( geometry, materials ) {
			
			var object = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );
			
			object.geometry = geometry;
			object.material =  new THREE.MeshFaceMaterial(materials);
			//object.material.side = THREE.DoubleSide;
			// save id as name 
			if( options.id ) object.name = options.id;
			
			self.active.scene.add( object );
			
			callback( object );
			
		});
		
	}
	
})();
