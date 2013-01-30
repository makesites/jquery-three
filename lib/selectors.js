
find = function( query ){ 
		
		// find the element in the containers
		var el = this.fn.find.el.call(this, query);
		// save element
		this.last = el;
		// preserve chainability
		return this;
		
	};
	
fn.find = {
	el : function( query ){ 
	
		var id = $(this.container).find("shadow-root "+ query).attr("data-id");
		// find the element in the containers
		var el = this.objects[id] || this.cameras[id] || this.scenes[id];
		
		return el;
	}
};
	