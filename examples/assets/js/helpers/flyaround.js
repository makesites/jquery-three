(function(){

// variables
var controls, clock;
var loaded = false;

FlyAround = {
	init : function($3d){
		
		container = document.getElementById( "main" );
		clock = new THREE.Clock();
		//var object = new THREE.Object3D();
		//object.add( $3d.active.camera );
		//object.position = {
		//	x: 0, y: 0, z: 0	
		//}
		controls = new THREE.FlyControls( $3d.active.camera );
		//$3d.active.scene.add( controls.getObject() );
		
		controls.movementSpeed = 500;
		controls.domElement = container;
		controls.rollSpeed = Math.PI / 12;
		controls.autoForward = false;
		controls.dragToLook = false;
		// rendered options
		$3d.renderer.sortObjects = false;
		$3d.renderer.autoClear = false;
	
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
