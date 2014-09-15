
Three.prototype.animate = function( options, el ){
		//this.mesh.rotation.z = Date.now() / 1000;

	// fallbacks
	options = options || {};
	el = el || this.last || false; // last processed object
	// FIX: we are checking the type of the element to attach to Object3D?
	if( el instanceof THREE.Mesh && el.parent instanceof THREE.Object3D ){
		el = el.parent;
	}
	// prerequisites
	if( !el || !options.name ) return;
	// create the necessary object containers
	// should we be checking the type of the element to attach to Object3D?
	el._animations = el._animations || {};
	el._update = el._update || updateAnimations.bind( el );

	// pickup animation keyframes
	options.keyframes = this.fn.animate.getKeyframes.call( this, options.name );
	// set the new animation
	el._animations[ options.name ] = options;
	// add to animate queue (once...)
	var inQueue = ( typeof this.fn.animate.queue[el.uuid] !== "undefined" );
	if( !inQueue){
		this.fn.animate.queue[el.uuid] = el._update; // using uuid to be able to remove from queue later
	}
};

// Internal

fn.animate = {
	// container for all methods to be updated
	queue: {},

	getKeyframes: function( name ){
		var keyframes = {};
		// first find the rules
		var animation = findKeyframesRule( name );

		// parse each one of them
		for(var i in animation.cssRules){
			var rule = animation.cssRules[i];
			var frame = {};
			// FIX: only rules parsed
			if( !rule.keyText ) continue;
			// convert percent to 1-100 number
			var key = parseInt( rule.keyText, 10 );
			// find rotation values
			frame.rotation = this.fn.css.rotate( rule.cssText );
			// find translate values
			frame.translation = this.fn.css.translate( rule.cssText );
			// find scale values
			frame.scale = this.fn.css.scale( rule.cssText );
			// add to the keyframes
			keyframes[ key ] = frame;
		}
		return keyframes;
	},

	// loop through the object's animations and update the object's properties
	update: function( el ){
		//console.log(  this.queue );
		// loop through the queue
		for( var i in this.queue ){
			// execute
			this.queue[i]();
		}
	}

};

// Helpers

function updateAnimations(){
	// context is the individual object
	//console.log( this );
	// loop through animations
	for( var i in this._animations){
		var animation = this._animations[i];
		var keyframes = animation.keyframes;
		// get current params
		animation.start = animation.start || utils.now();
		animation.end = animation.end || ( animation.start + animation.duration );
		animation.offset = animation.offset || registerState( this );
		animation.count = animation.count || 0;
		// find the right stage in the animation
		var now = utils.now();
		var percent = ( ( now - animation.start) / animation.duration ) * 100;
		var start = false,
			end = false;
		for( var key in keyframes ){
			if( key <= percent ){
				start = keyframes[ key ];
			}
			if( key > percent && !end ){
				end = keyframes[ key ];
			}
		}
		// fallbacks
		if( !start ) start = keyframes[ 0 ];
		if( !end ) end = keyframes[ 100 ];
		// apply updates
		// NOTE: only linear supported for now...
		// - rotate
		var rot = {
			x: ( typeof start.rotation.x != "undefined" && typeof end.rotation.x != "undefined" ) ? (end.rotation.x - start.rotation.x )*(percent/100) : 0,
			y: ( typeof start.rotation.y != "undefined" && typeof end.rotation.y != "undefined" ) ? (end.rotation.y - start.rotation.y )*(percent/100) : 0,
			z: ( typeof start.rotation.z != "undefined" && typeof end.rotation.z != "undefined" ) ? (end.rotation.z - start.rotation.z )*(percent/100) : 0
		};
		this.rotation.set( animation.offset.rotation.x+rot.x, animation.offset.rotation.y+rot.y, animation.offset.rotation.z+ rot.z);
		// TBA...
		// - translate

		// - scale

		// reset if reached completion
		if( percent >= 100 ){
			delete animation.start;
			delete animation.end;
			delete animation.offset;
			animation.count++;
		}
		//
		if( animation.count == animation.repeat ){
			delete this._animations[i];
		} else {
			// save animation updates
			this._animations[i] = animation;
		}
	}
}

// register element state
function registerState( el ){
	return {
		position: {
			x: el.position.x,
			y: el.position.y,
			z: el.position.z
		},
		rotation: {
			x: el.rotation.x,
			y: el.rotation.y,
			z: el.rotation.z
		},
		scale: {
			x: el.scale.x,
			y: el.scale.y,
			z: el.scale.z
		}
	};
}

/*
 * Access and modify CSS animations @keyFrames with Javascript
 * Based on : http://jsfiddle.net/russelluresti/RHhBz/2/
 * Issue : http://stackoverflow.com/questions/10342494/set-webkit-keyframes-values-using-javascript-variable
 */

 // search the CSSOM for a specific -webkit-keyframe rule
function findKeyframesRule(rule){
	// gather all stylesheets into an array
	var ss = document.styleSheets;

	// loop through the stylesheets
	for (var i = 0; i < ss.length; ++i) {

		// loop through all the rules
		for (var j = 0; j < ss[i].cssRules.length; ++j) {

			// find the -webkit-keyframe rule whose name matches our passed over parameter and return that rule
			if (ss[i].cssRules[j].type == window.CSSRule.WEBKIT_KEYFRAMES_RULE && ss[i].cssRules[j].name == rule)
				return ss[i].cssRules[j];
		}
	}

	// rule not found
	return null;
}

// remove old keyframes and add new ones
function changeAnimationKeyframes(anim){
	// find our -webkit-keyframe rule
	var keyframes = findKeyframesRule(anim);

	// remove the existing 0% and 100% rules
	keyframes.deleteRule("0%");
	keyframes.deleteRule("100%");

	// create new 0% and 100% rules with random numbers
	keyframes.insertRule("0% { -webkit-transform: rotate("+randomFromTo(-360,360)+"deg); }");
	keyframes.insertRule("100% { -webkit-transform: rotate("+randomFromTo(-360,360)+"deg); }");

	// assign the animation to our element (which will cause the animation to run)
	document.getElementById('box').style.webkitAnimationName = anim;
}