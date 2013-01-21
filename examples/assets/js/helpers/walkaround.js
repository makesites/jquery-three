(function(){

// variables
var controls, clock;
var loaded = false;

WalkAround = {
	init : function($3d){
		
		clock = new THREE.Clock();
		
		controls = new THREE.FirstPersonControls( $3d.active.camera );

		controls.movementSpeed = 10;
		controls.lookSpeed = 0.125;
		controls.lookVertical = false;

		loaded = true;
		
	}, 
	
	update : function(e){
		// the 3d environment is passed as target 
		var $3d = e.target;
		if( loaded ){ 
			var delta = clock.getDelta();
			controls.update( delta );
		}
	}
	
}

})();
