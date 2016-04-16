/**
 * @name {{name}}
 * {{description}}
 * Version: {{version}} ({{build_date}})
 *
 * @author {{author}}
 * Created by: Makis Tracend (@tracend)
 *
 * Homepage: {{homepage}}
 * @license {{#license licenses}}{{/license}}
 */


// RequestAnimationFrame shim - Source: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = ( function( callback ) {
	return window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function ( callback ) {
		window.setTimeout( callback, 1000 / 60 );
	};
})();

(function (root, factory) {

	//"use strict";

	//var define = define || false;
	var jquery = root.$ || root.jQuery || root.ender;

	if (typeof define === 'function' && define.amd){
		// AMD. Register as an anonymous module.
		define(['jquery'], factory);
	} else {
		// Browser globals
		factory( jquery );
	}

}(this, function ( $ ) {

// Local variables
var css, _css;
var files = {};

// Create a fn container for internal methods
var fn = {
		self : function(){ return this; }
	};
