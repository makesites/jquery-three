window.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(e){window.setTimeout(e,1e3/60)}}(),function(e,t){"use strict";var r=r||!1,a=e.$||e.jQuery||e.ender;r&&"function"==typeof r&&r.amd?r(["jquery"],t):t(a)}(this,function(e){function t(e,t){if(e=e||{},e.material)if(e.material.materials)for(var r in e.material.materials)e.material.materials[r].color.setHex(t);else e.material.color.setHex(t)}var r,a={self:function(){return this}},i={alpha:!0,watch:!1,deps:{THREE:"https://raw.github.com/mrdoob/three.js/master/build/three.min.js"},paused:!1};Three=function(t,r,a){var n=this;this.el=this.setEl(t),this.options=e.extend(!0,{},i,r),this.objects={},this.scenes={},this.cameras={},this.materials={},this.groups={camera:"cameras",scene:"scenes",mesh:"objects",plane:"objects",cube:"objects",sphere:"objects",cylinder:"objects",material:"materials"},this.frame={current:0,rate:0,date:new Date},this.last=!1,this.parent=!1,this.dependencies(function(){n.init(),a instanceof Function&&a(n)})},Three.prototype={init:function(){var t=this;this.active={scene:!1,camera:!1,skybox:!1},this.properties=this.setProperties(),this.renderer=new THREE.WebGLRenderer({alpha:this.options.alpha}),this.renderer.setSize(this.properties.width,this.properties.height),this.renderer.autoClear=!1,e(this.el).find(".fallback").remove();var r=e(this.el).html();e(this.el).html("<shadow-root></shadow-root>"),this.parent=e(this.el).find("shadow-root"),this.target=this.parent,this.html(r),e(this.renderer.domElement).appendTo(this.el),window.addEventListener("resize",function(){t.resize()},!1),this.options.watch&&this.watch(this.parent),this.tick()},destroy:function(){return this.each(function(){var t=e(this);t.data("three"),t.removeData("three")})},self:function(t,r){var a=[];return this.each(function(){var i=e(this),n=i.data("three");n||(n=new Three(this,t,r),e(this).data("three",n)),a.push(n)}),1==a.length?a[0]:e(a)},tick:function(){var e=this;this.options.paused||this.render();var t=new Date;this.frame.date.getSeconds()===t.getSeconds()?this.frame.current++:(this.frame.rate=this.frame.current,this.frame.current=1,this.frame.date=t),requestAnimFrame(function(){e.tick()})},render:function(){e(this.el).trigger({type:"update",target:this}),this.active.scene&&this.active.camera&&(this.active.skybox&&(this.active.skybox.camera&&this.active.skybox.camera.rotation.copy(this.active.camera.rotation),this.renderer.render(this.active.skybox.scene,this.active.skybox.camera)),this.renderer.render(this.active.scene,this.active.camera))},show:function(){},hide:function(){},update:function(){},detect:function(){return{canvas:!!window.CanvasRenderingContext2D,webgl:function(){try{return!!window.WebGLRenderingContext&&!!document.createElement("canvas").getContext("experimental-webgl")}catch(e){return!1}}(),workers:!!window.Worker,fileapi:window.File&&window.FileReader&&window.FileList&&window.Blob,all:function(){return this.webgl&&this.canvas&&this.workers&&this.fileapi}}},resize:function(){this.properties=this.setProperties();for(var e in this.cameras)this.cameras[e].aspect=this.properties.aspect,this.cameras[e].updateProjectionMatrix();this.active.skybox&&(this.active.skybox.camera.aspect=this.properties.aspect,this.active.skybox.camera.updateProjectionMatrix()),this.renderer.setSize(this.properties.width,this.properties.height)},dependencies:function(t){var r=e.map(this.options.deps,function(e,t){return window[t]||window.THREE&&window.THREE[t]?void 0:e});r.length?this.loadScripts(r,t):t()},loadScripts:function(t,r){var a=this;e.when(e.getScript(t.shift())).done(function(){t.length>0?a.loadScripts(t,r):r()})},setEl:function(t){var r=e(this).attr("id");return("undefined"==typeof r||r===!1)&&e(t).addClass("3d-"+s.unid()),t}},e.fn.three=function(e,t){return e||(e=!1),t||(t=function(e){return e}),Three.prototype.self.apply(this,arguments,e,t)},Three.prototype.getAttributes=function(t){var r={};return e(t).each(function(){var e=this.attributes;for(var t in e)if(e[t].name&&0===e[t].name.search("data-")){var a=e[t].name.replace("data-","");a=s.camelCase(a);var i=e[t].value;r[a]=parseInt(i,10)||"0"===i?parseInt(i,10):i}else if(e[t].name&&0===e[t].name.search("class")){var n=e[t].value.split(" ");r["class"]=n}else e[t].name&&0===e[t].name.search("src")?r.src=e[t].value:e[t].name&&0===e[t].name.search("style")&&(r.style=e[t].value)}),r},Three.prototype.addClass=function(t){var r=this.last,a=e(this.el).find("[data-id='"+r.id+"']");a.addClass(t);var i=this.fn.css.styles.call(this,a);return this.fn.css.set.call(this,r,i),this},r=function(e){return this.fn.css.set.call(this,this.last,e),this},a.css={styles:function(t){var r=document.styleSheets,a={};for(var i in r){var s=r[i].rules||r[i].cssRules;for(var o in s)if(!(s[o].selectorText&&s[o].selectorText.search(":hover")>-1))try{t.is(s[o].selectorText)&&(a=e.extend(a,n(s[o].style)))}catch(c){console.log(c)}}return a=e.extend(a,n(t.attr("style")))},set:function(e,r){if(e&&e.id)for(var a in r){var i=a.replace("-webkit-","").replace("-moz-","");switch(i){case"width":e.scale.x=parseInt(r[a],10);break;case"height":e.scale.y=parseInt(r[a],10);break;case"top":e.position.y=parseInt(r[a],10);break;case"left":e.position.x=parseInt(r[a],10);break;case"color":var n=this.colorToHex(r[a]);e instanceof THREE.Scene?this.webglLight({color:n}):t(e,n);break;case"transform":var s;r[a].search("translate3d")>-1&&(s=this.fn.css.translate.call(this,r[a]),e instanceof THREE.Mesh&&"terrain"!=e.type?e.parent.position.set(s.x,s.y,s.z):e.position.set(s.x,s.y,s.z)),r[a].search("rotate3d")>-1&&(s=this.fn.css.rotate.call(this,r[a]),e instanceof THREE.Mesh&&"terrain"!=e.type?e.parent.rotation.set(s.x,s.y,s.z):e.rotation.set(s.x,s.y,s.z)),r[a].search("scale3d")>-1&&(s=this.fn.css.scale.call(this,r[a]),e instanceof THREE.Mesh&&"terrain"!=e.type?e.parent.scale.set(s.x,s.y,s.z):e.scale.set(s.x,s.y,s.z));break;case"animation-duration":console.log(i,r[a]);break;case"animation-timing":console.log(i,r[a]);break;case"animation-delay":console.log(i,r[a]);break;case"animation-iteration-count":console.log(i,r[a]);break;case"animation-direction":console.log(i,r[a]);break;case"animation-fill-mode":console.log(i,r[a]);break;case"animation-name":console.log(i,r[a]);break;case"display":break;case"background-image":if(e instanceof THREE.Scene)this.fn.css.skybox.call(this,r[a]);else if("terrain"==e.type)this.fn.css.terrain.call(this,r[a]);else if(e instanceof THREE.Mesh)this.fn.css.texture.call(this,e,r[a]);else if(e instanceof THREE.Object3D&&e.children.length)try{var o=e.children[0];this.fn.css.texture.call(this,o,r[a])}catch(c){console.log(c)}}}},rotate:function(e){var t,r={};return e.search("rotate3d")>-1&&(t=e.match(/rotate3d\(([\s\S]*?)\)/gi),t=t[0].replace(/rotate3d\(|deg|\)| /gi,"").split(","),r={x:parseFloat(t[0],10)*parseFloat(t[3],10)*(Math.PI/180),y:parseFloat(t[1],10)*parseFloat(t[3],10)*(Math.PI/180),z:parseFloat(t[2],10)*parseFloat(t[3],10)*(Math.PI/180)}),r},translate:function(e){var t={};if(e.search("translate3d")>-1){var r=e.match(/translate3d\(([\s\S]*?)\)/gi);r=r[0].replace(/translate3d\(|px|\)| /gi,"").split(","),t={x:parseFloat(r[0],10)||0,y:parseFloat(r[1],10)||0,z:parseFloat(r[2],10)||0}}return t},scale:function(e){var t={};if(e.search("scale3d")>-1){var r=e.match(/scale3d\(([\s\S]*?)\)/gi);r=r[0].replace(/scale3d\(|\)| /gi,"").split(","),t={x:parseFloat(r[0],10)||0,y:parseFloat(r[1],10)||0,z:parseFloat(r[2],10)||0}}return t},texture:function(e,t){var r=t.replace(/\s|url\(|\)/g,""),a=this.webglMaterial({map:r});e.material=a},terrain:function(e){var t=this.last,r=e.replace(/\s|url\(|\)/g,"").split(",");if(r instanceof Array)for(var a in r){if(r[a].search("heightmap")>-1){var i=THREE.ImageUtils.loadTexture(r[a]);t.material.uniforms.tDisplacement.value=i,t.material.uniforms.uDisplacementScale.value=375;var n=i;n.wrapS=n.wrapT=THREE.RepeatWrapping,t.material.uniforms.tDiffuse2.value=n,t.material.uniforms.enableDiffuse2.value=!0}if(r[a].search("diffuse")>-1){var s=THREE.ImageUtils.loadTexture(r[a]);s.wrapS=s.wrapT=THREE.RepeatWrapping,t.material.uniforms.tDiffuse1.value=s,t.material.uniforms.enableDiffuse1.value=!0}if(r[a].search("specular")>-1){var o=THREE.ImageUtils.loadTexture(r[a]);o.wrapS=o.wrapT=THREE.RepeatWrapping,t.material.uniforms.tSpecular.value=o,t.material.uniforms.enableSpecular.value=!0}}},skybox:function(e){var t=e.replace(/\s|url\(|\)/g,"").split(",");t instanceof Array&&this.addSkybox(t)}};var n=function(e){var t={};if(!e)return t;if(e instanceof CSSStyleDeclaration)for(var r in e)e[r].toLowerCase&&(t[e[r].toLowerCase()]=e[e[r]]);else if("string"==typeof e){e=e.split("; ");for(var a in e){var i=e[a].split(": ");t[i[0].toLowerCase()]=i[1]}}return t};Three.prototype.animate=function(){},Three.prototype.watch=function(t){var r=this,a=e(this.el).toSelector()+" "+e(t).selector;e("body").on("DOMSubtreeModified",a,function(e){r.eventSubtree(e)}),t.onpropertychange?e("body").on("propertychange",a,function(e){r.eventAttribute(e)}):e("body").on("DOMAttrModified",a,function(e){r.eventAttribute(e)})},Three.prototype.eventSubtree=function(t){t.stopPropagation();var r=e(e(this.el).toSelector()+" shadow-root").get(0),a=e(t.target).get(0);if(this.parent=r==a?e(t.target):e(t.target).parent(),this.target=e(t.target),t.target.innerHTML.length>0){var i=e(t.target).html();this.append(i,{silent:!0,target:this.target,traverse:!1,watch:!0})}},Three.prototype.eventAttribute=function(e){e.stopPropagation(),console.log("attribute",e.target)},Three.prototype.add=function(e,t){var r=this;return t=t||{},"undefined"==typeof e||"undefined"==typeof e.type?this:(this.webgl(e,function(a){if(!a||"undefined"==typeof a)return this;var i;r.last=a;var n=r.groups[e.type]||!1;"objects"==n&&a instanceof THREE.Mesh?(i=new THREE.Object3D,i.add(a),i.name=a.name):i=a,r.active[e.type]=i,n&&(r[n][i.id]=i),"scene"==e.type?r.active.scene=i:r.active.scene&&r.active.scene.add(i),e["data-id"]=i.id||!1;var s;t.silent&&e.el?(s=e.el,s.attr("data-id",e["data-id"])):(s=r.createHTML(e),r.target=s);var o=r.fn.css.styles.call(r,s);r.fn.css.set.call(r,a,o)}),this)},Three.prototype.addScene=function(e){var t=e||{};return t.type="scene",this.add(t),this},Three.prototype.addCamera=function(e){var t=e||{};return t.type="camera",this.add(t),this},Three.prototype.addMesh=function(e){var t=e||{};return t.type="mesh",this.add(t),this},Three.prototype.addPlane=function(e){var t=e||{};return t.type="plane",this.add(t),this},Three.prototype.addSphere=function(e){var t=e||{};return t.type="sphere",this.add(t),this},Three.prototype.addCube=function(e){var t=e||{};return t.type="cube",this.add(t),this},Three.prototype.addCylinder=function(e){var t=e||{};return t.type="cylinder",this.add(t),this},Three.prototype.addAsset=function(e){var t=e||{};return t.type="asset",this.add(t),this},Three.prototype.addSkybox=function(t){var r,a,i,n=new THREE.Scene;if(1==t.length)r=new THREE.PerspectiveCamera(50,e(this.el).width()/e(this.el).height(),1,1100),r.target=new THREE.Vector3(0,0,0),a=new THREE.SphereGeometry(500,60,40),a.applyMatrix((new THREE.Matrix4).makeScale(-1,1,1)),i=new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture(t[0])});else{var s=THREE.ImageUtils.loadTextureCube(t);s.format=THREE.RGBFormat,r=new THREE.PerspectiveCamera(50,e(this.el).width()/e(this.el).height(),1,100);var o=THREE.ShaderLib.cube,c=THREE.UniformsUtils.clone(o.uniforms);c.tCube.value=s,i=new THREE.ShaderMaterial({fragmentShader:o.fragmentShader,vertexShader:o.vertexShader,uniforms:c,depthWrite:!1,side:THREE.BackSide}),a=new THREE.BoxGeometry(100,100,100)}var h=new THREE.Mesh(a,i);n.add(h),this.active.skybox={scene:n,camera:r}},Three.prototype.addTerrain=function(e){var t=e||{};return t.type="terrain",this.add(t),this},Three.prototype.html=function(t,r){var a=this;return r=r||{},r.target=r.target||this.target,"undefined"==typeof r.traverse&&(r.traverse=!0),e(t).filter("*").each(function(t,i){var n="undefined"==typeof i?!1:e(i);if(n&&"undefined"==typeof n.attr("data-id")){var s={};s.type=i.nodeName.toLowerCase(),s.id=n.attr("id");var o=a.getAttributes(i);s=e.extend(s,o),s.el=r.target.children(":eq("+t+")"),(!r.watch||s.el.length)&&(a.add(s,r),""!==n.html()&&r.traverse&&a.html(n.html(),r))}}),this},Three.prototype.createHTML=function(t){var r=e("<"+t.type+">");if(t.id&&r.attr("id",t.id),t["data-id"]&&r.attr("data-id",t["data-id"]),t["class"]&&t["class"].length){var a=t["class"].join(" ");r.attr("class",a)}return t.style&&r.attr("style",t.style),r.appendTo(this.parent),("scene"==t.type||"asset"==t.type||"player"==t.type)&&(this.parent=r),r},Three.prototype.append=function(e,t){return t=t||{},this.html(e,t),this},Three.prototype.get=function(e){var t=this.objects[e]||this.cameras[e]||this.scenes[e]||null;return t},find=function(e){var t=this.fn.find.el.call(this,e);return this.last=t,this},a.find={el:function(t){var r=e(this.el).find("shadow-root "+t).attr("data-id"),a=this.objects[r]||this.cameras[r]||this.scenes[r]||null;return a}},a.three=function(e,t){var r=this.last;try{r[e](t)}catch(a){console.log("Method not supported:",a)}return this},Three.prototype.webgl=function(e,t){var r;switch(e.type){case"scene":r=this.webglScene(e);break;case"camera":r=this.webglCamera(e);break;case"mesh":r=this.webglMesh(e);break;case"material":r=this.webglMaterial(e);break;case"light":r=this.webglLight(e);break;case"plane":r=this.webglPlane(e);break;case"sphere":r=this.webglSphere(e);break;case"cube":r=this.webglCube(e);break;case"cylinder":r=this.webglCylinder(e);break;case"terrain":r=this.webglTerrain(e);break;default:"undefined"!=typeof this.fn.webgl[e.type]&&this.fn.webgl[e.type].apply(this,[e,t])}return t(r)},a.webgl={},Three.prototype.webglScene=function(t){var r={id:!1};e.extend(r,t);var a=new THREE.Scene;return this.scenes[a.id]=a,a},Three.prototype.webglCamera=function(t){var r,a={fov:50,aspect:this.properties.aspect,near:1,far:1e3,scene:this.active.scene},i=e.extend(a,t);return i.orthographic||(r=new THREE.PerspectiveCamera(i.fov,i.aspect,i.near,i.far)),r},Three.prototype.webglMesh=function(t){var r,a={id:!1,wireframe:!1,scene:this.active.scene};return e.extend(a,t),r},Three.prototype.webglMaterial=function(t){var r,a,i={id:!1,color:0,wireframe:!1,map:!1,scene:this.active.scene},n=e.extend(i,t),s=window.Shaders||{};if(n.id&&s[n.id]){a={};var o=Shaders[n.id];o.uniforms&&(a.uniforms=THREE.UniformsUtils.clone(o.uniforms)),o.vertexShader&&(a.vertexShader=o.vertexShader),o.fragmentShader&&(a.fragmentShader=o.fragmentShader),n.map&&o.uniforms&&(a.uniforms.texture.texture=THREE.ImageUtils.loadTexture(n.map)),r=new THREE.ShaderMaterial(a)}else a={},n.map&&(a.map=THREE.ImageUtils.loadTexture(n.map)),n.color&&!n.map&&(a.color=n.color),n.wireframe&&(a.wireframe=n.wireframe),r=new THREE.MeshBasicMaterial(a);return r},Three.prototype.webglTexture=function(e){var t=new THREE.Texture,r=new THREE.ImageLoader;return r.addEventListener("load",function(e){t.image=e.content,t.needsUpdate=!0}),r.load(e),t},Three.prototype.webglLight=function(e){this.active.scene.add(new THREE.AmbientLight(parseInt(e.color,16)))},Three.prototype.webglPlane=function(t){var r={width:1,height:1,color:0,wireframe:!1,scene:this.active.scene},a=e.extend(r,t),i=new THREE.PlaneGeometry(a.width,a.height);i.dynamic=!0;var n=new THREE.MeshBasicMaterial({color:a.color,wireframe:a.wireframe}),s=new THREE.Mesh(i,n);return a.id&&(s.name=a.id),s},Three.prototype.webglSphere=function(t){var r={id:!1,radius:1,segments:16,rings:16,color:0,wireframe:!1,map:!1,scene:this.active.scene},a=e.extend(r,t),i=new THREE.SphereGeometry(a.radius,a.segments,a.rings);i.dynamic=!0;var n=this.webglMaterial(a),s=new THREE.Mesh(i,n);return s.matrixAutoUpdate=!1,a.id&&(s.name=a.id),s},Three.prototype.webglCube=function(t){var r={id:!1,width:1,height:1,depth:1,color:0,wireframe:!1,scene:this.active.scene},a=e.extend(r,t),i=new THREE.BoxGeometry(a.width,a.height,a.depth);i.dynamic=!0;var n=new THREE.MeshBasicMaterial({color:a.color,wireframe:a.wireframe}),s=new THREE.Mesh(i,n);return a.id&&(s.name=a.id),s},Three.prototype.webglCylinder=function(t){var r={id:!1,radiusTop:1,radiusBottom:1,segmentsRadius:4,segmentsHeight:16,openEnded:!1,color:0,wireframe:!1,scene:this.active.scene},a=e.extend(r,t),i=new THREE.CylinderGeometry(a.radiusTop,a.radiusBottom,a.segmentsRadius,a.segmentsHeight,a.openEnded,!1);i.dynamic=!0;var n=new THREE.MeshBasicMaterial({color:a.color,wireframe:a.wireframe}),s=new THREE.Mesh(i,n);return a.id&&(s.name=a.id),s},Three.prototype.webglTerrain=function(){var e;this.active.scene.add(new THREE.AmbientLight(1118481)),directionalLight=new THREE.DirectionalLight(16777215,1.15),directionalLight.position.set(500,2e3,0),this.active.scene.add(directionalLight);var t=new THREE.PlaneGeometry(6e3,6e3,256,256);t.computeFaceNormals(),t.computeVertexNormals(),t.computeTangents();var r=THREE.ShaderTerrain.terrain;uniformsTerrain=THREE.UniformsUtils.clone(r.uniforms),uniformsTerrain.uDiffuseColor.value.setHex(16777215),uniformsTerrain.uSpecularColor.value.setHex(16777215),uniformsTerrain.uAmbientColor.value.setHex(1118481),uniformsTerrain.uRepeatOverlay.value.set(6,6);var a=new THREE.ShaderMaterial({uniforms:uniformsTerrain,vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,lights:!0,fog:!1});return e=new THREE.Mesh(t,a),e.type="terrain",this.active.scene.add(e),e},Three.prototype.colorToHex=function(e){if("#"===e.substr(0,1))return e.replace("#","0x");var t=/(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(e),r=parseInt(t[2],10).toString(16),a=parseInt(t[3],10).toString(16),i=parseInt(t[4],10).toString(16);return 1==r.length&&(r="0"+r),1==a.length&&(a="0"+a),1==i.length&&(i="0"+i),"0x"+r+a+i},Three.prototype.setProperties=function(){return{width:e(this.el).width(),height:e(this.el).height(),aspect:e(this.el).width()/e(this.el).height()}};var s={camelCase:function(e){return e.replace(/-([a-z])/g,function(e){return e[1].toUpperCase()})},unid:function(){return Math.round(Math.random()*(new Date).getTime())}};!function(e){e.fn.toSelector=function(){var t=e(this).get(0),r=t.tagName.toLowerCase(),a=e(this).attr("id"),i=t.className.split(/\s+/),n=r;return"undefined"!=typeof a&&(n+="#"+a),"undefined"!=typeof i&&(n+="."+i.join(".")),n}}(jQuery),Three.prototype.css=r,Three.prototype.find=find,Three.prototype.fn=a,Three.prototype.lookAt=function(){return this.fn.three.call(this,"lookAt",arguments)}});