(function(){
	
	Three.prototype.fn.webgl.obj = function( attributes ){ 
		// model
		var self = this;
		var object = {};
		var texture = ( attributes.map ) ? this.webglTexture( map ) : false;
		
		var loader = new THREE.OBJMTLLoader();
		loader.addEventListener( 'load', function ( event ) {
			
			object = event.content;
			
			self.active.scene.add( object );

		});
		// 
		if( attributes.src ){ 
			loader.load( attributes.src, attributes.mtl );

		}
		return object;
	}
	
})();
