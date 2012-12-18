(function( $ ) {
	
Three.prototype = $.extend(Three.prototype, {
	// generic method to add an element
	add : function(html, scene){
		// use the active scene if not specified
		var as = scene || this.active.scene;
		// get the type from the tag name
		var type = html.nodeName.toLowerCase();
			
		//switch
	},
	// add a plane
	addPlane : function( name ){
		
		// plane - by default a 1x1 square
		var geometry = new THREE.PlaneGeometry( 1, 1 );
		geometry.dynamic = true;
		var material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
		this.objects[name] = { id: name, mesh: new THREE.Mesh( geometry, material ) };
		
		this.scene.add( this.objects[name].mesh );
		
		// append to the dom
		$('<plane>').attr("id", name).appendTo(this.container);
		
		// set a reference to the last list
		this.last = this.objects[name];
		
		// set css attributes
		var css = this.css($(this.container).find("#"+ name ) );
		this.cssSet( css );
		
		return this;
		
	}, 
	// add camera(s)
	addCamera : function( name ){
		
	}, 
	// add meshes
	addMesh : function( name ){
		
	}, 
	// add asset
	addAsset : function( name ){
		
	} 
	
});

})( jQuery );