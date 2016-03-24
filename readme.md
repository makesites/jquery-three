# jQuery Three

A plugin / extension of the jQuery API for 3d objects (using Three.js)

jQuery Three was developed to bridge the gap between WebGL and the DOM by using existing conventions web designers are already familiar with.

Effectively it provides a higher level api that abstracts Three.js methods to known common conventions from regular web development.


## Dependencies

* jQuery v2.x
* THREE.js rev.75


## Examples

* [Skybox](http://makesites.org/jquery-three/examples/skybox.html)
* [Skysphere](http://makesites.org/jquery-three/examples/skysphere.html)
* [First Person controls](http://makesites.org/jquery-three/examples/fps.html)
* [Earth Texture](http://makesites.org/jquery-three/examples/earth.html)
* [Append with Handlebars,js](http://makesites.org/jquery-three/examples/handlebars.html)
* [Binary Loader](http://makesites.org/jquery-three/examples/binary.html)
* [Sprite animation](http://makesites.org/jquery-three/examples/sprite.html)
* [VR shader](http://makesites.org/jquery-three/examples/vr.html)
* [Water shader](http://makesites.org/jquery-three/examples/water.html)


## Install

Get the latest (stable) version using bower:
```
bower install jquery.three
```

## Usage

Enable 3D actions on any container using:

```
$("container").three( options, callback );
```

Read the [wiki](https://github.com/makesites/jquery-three/wiki) docs for more details on the [methods](https://github.com/makesites/jquery-three/wiki/Methods) and [tag support](https://github.com/makesites/jquery-three/wiki/Tags).


## Options

There are the setup options used when initiating the ```.three()``` method:

* **alpha**: (boolean, default: true) Renders the WebGL canvas transparent so you can stack other elements behind it.
* **deps**: (object, default: {}) Listing dependency scripts loaded as extensions of THREE.js
* **paused**: (boolean, default: false) Start with a paused loop - or set as a flag to pause anytime.
* **watch**: (boolean, default: false) If set it monitors the DOM for updates and syncs the changes with THREE.js


## Credits

Created by [Makis Tracend](http://github.com/tracend) [ [full list of contributors](https://github.com/makesites/jquery-three/graphs/contributors) ]

Distributed through [Makesites.org](http://makesites.org)

Released under the [MIT License](http://makesites.org/licenses/MIT)
