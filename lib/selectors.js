
find = function( query ){

		// find the element in the containers
		var el = this.fn.find.el.call(this, query);
		// save element
		this.last = el;
		// preserve chainability
		return this;

	};


// Internal

fn.find = {
	el : function( query ){

		var id = $(this.el).find("shadow-root "+ query).attr("data-id");
		// find the element in the containers
		var el = this.objects[id] || this.cameras[id] || this.scenes[id];

		return el;
	}
};


// #39 Wildcard extension to the Three.js namespace
fn.three = function(fn, query ){
	var object = this.last;
	try{
		object[fn]( query );
	} catch( e ){
		console.log("Method not supported:", e );
	}
	return this;
};
