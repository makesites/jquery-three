Three.prototype.watch = function(e) {
	console.log(e);
	if (e.target.innerHTML.length > 0) {
		// Handle new content
		console.log( e.target.innerHTML );
	}
};