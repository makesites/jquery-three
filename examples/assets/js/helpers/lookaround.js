(function(){

// variables
var mouseX = 0;
var mouseY = 0;

LookArround = function(e){

		// the 3d environment is passed as target
		var $3d = e.target;

		// start when the active camera is set
		if( !$3d.active.camera ) return;
		$3d.active.camera.lookAt( $3d.active.scene.position );

		$3d.active.camera.position.x += ( mouseX - $3d.active.camera.position.x ) * 0.05;
		$3d.active.camera.position.y += ( - mouseY - $3d.active.camera.position.y ) * 0.05;

}

// add mouse tracking
document.addEventListener('mousemove', onDocumentMouseMove, false);

function onDocumentMouseMove(event) {

	mouseX = ( event.clientX - (window.innerWidth / 2) ) * 4;
	mouseY = ( event.clientY - (window.innerHeight / 2) ) * 4;

}

})();
