
Three.prototype.find = function( query ){ 
		
		var id = $(this.container).find("shadow-root "+ query).attr("data-id");
		// find the element in the containers
		var el = this.objects[id] || this.cameras[id] || this.scenes[id];
		
		return el;
	};
	