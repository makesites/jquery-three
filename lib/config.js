(function(){
		
	config = {
		"callback": function(){ init();}, 
		"paths": {
			"jquery": [
				"http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min",
				"/assets/js/lib/5jquery.min"
			],
			"json2": [
				"http://cdnjs.cloudflare.com/ajax/libs/json2/20110223/json2.min",
				"/assets/js/lib/json2.min"
			],
			"underscore": [
				"http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.3/underscore-min",
				"/assets/js/lib/underscore-min"
			],
			"handlebars": [
				"http://cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.0.0.beta6/handlebars.min",
				"/assets/js/lib/handlebars.min"
			],
			"backbone": [
				"http://cdnjs.cloudflare.com/ajax/libs/backbone.js/0.9.2/backbone-min",
				"/assets/js/lib/backbone-min"
			],
			"backbone.app": [
				"/assets/js/libs/backbone.app-min"
			],
			"jquery.three": [
				"/assets/js/libs/jquery.three-min"
			],
			"dat.gui": [
				"http://cdn.kdi.co/js/dat.gui/0.5/dat.gui.min"
			],
			"dat.color": [
				"http://cdn.kdi.co/js/dat.gui/0.5/dat.color.min"
			]
		},
		"shim": {
			"backbone": {
				"deps": [
					"underscore",
					"jquery"
				],
				"exports": "Backbone"
			},
			"underscore": {
				"exports": "_"
			}, 
			"backbone.app": {
				"deps": [
					"backbone",
					"underscore",
					"jquery",
					"handlebars"
				]
			},
			"jquery.three": {
				"deps": [
					"jquery"
				]
			},
		},
		"deps": [
			"jquery",
			"json2",
			"underscore",
			"backbone",
			"handlebars",
			"showdown",
			"backbone.app",
			"jquery.three"
		]
	}

})()