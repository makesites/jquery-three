
// get attributes from tags
Three.prototype.getAttributes = function( html ){
		//
		var data={};
		// filter only the ones with the data- prefix
		$(html).each(function(){

			var attr = this.attributes;

			for( var i in attr ){
				if( attr[i].name && attr[i].name.search("data-") === 0 ){
					var key = attr[i].name.replace("data-", "");
					// #47 convert dashed to camelCase
					key = utils.camelCase( key );
					var val = attr[i].value;
					// check if it's a number...
					data[key] = ( parseInt(val, 10) || val === "0" ) ? parseInt(val, 10) :  val;
				} else if( attr[i].name && attr[i].name.search("class") === 0 ){
					// add classes
					var classes = attr[i].value.split(" ");
					data["class"] = classes;
				} else if( attr[i].name && attr[i].name.search("src") === 0 ){
					// add source file
					data.src = attr[i].value;
				} else if( attr[i].name && attr[i].name.search("style") === 0 ){
					// add source file
					data.style = attr[i].value;
				}
			}

		});

		return data;
	};

// add a class
Three.prototype.addClass = function( name ){
		var object = this.last;
		// add the class to the markup
		var $el = $(this.el).find("[data-id='"+ object.id +"']");
		$el.addClass(name);
		// update 3d object
		var options = this.fn.css.styles.call(this, $el );
		this.fn.css.set.call(this, object, options );

		return this;
	};
