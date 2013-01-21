window.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(e){window.setTimeout(e,1e3/60)}}(),function(e){"use strict";var t=t||!1,r=r||!1;t&&"function"==typeof t&&t.amd?t(["jquery"],e):e(r)}(function(){var e,t={self:function(){return this}},r={watch:!1,deps:{THREE:"https://raw.github.com/mrdoob/three.js/master/build/three.min.js"}};Three=function(e,t,a){var i=this;this.container=e,this.options=$.extend(!0,r,t),this.objects={},this.scenes={},this.cameras={},this.materials={},this.last=!1,this.parent=!1,this.dependencies(function(){i.init(),a instanceof Function&&a(i)})},Three.prototype={init:function(){var e=this;this.active={scene:!1,camera:!1,skybox:!1},this.properties=this.setProperties(),this.renderer=new THREE.WebGLRenderer,this.renderer.setSize(this.properties.width,this.properties.height),this.renderer.autoClear=!1,$(this.container).find(".fallback").remove();var t=$(this.container).html();$(this.container).html("<shadow-root></shadow-root>"),this.parent=$(this.container).find("shadow-root"),this.html(t),$(this.renderer.domElement).appendTo(this.container),window.addEventListener("resize",function(){e.resize()},!1),this.options.watch&&this.watch(this.container),this.tick()},destroy:function(){return this.each(function(){var e=$(this);e.data("three"),e.removeData("three")})},self:function(e,t){var r=[];return this.each(function(){var a=$(this),i=a.data("three");i||(i=new Three(this,e,t),$(this).data("three",i)),r.push(i)}),1==r.length?r[0]:$(r)},tick:function(){var e=this;this.render(),requestAnimFrame(function(){e.tick()})},render:function(){$(this.container).trigger({type:"update",target:this}),this.active.scene&&this.active.camera&&(this.active.skybox&&(this.active.skybox.camera.rotation.copy(this.active.camera.rotation),this.renderer.render(this.active.skybox.scene,this.active.skybox.camera)),this.renderer.render(this.active.scene,this.active.camera))},show:function(){},hide:function(){},update:function(){},detect:function(){return{canvas:!!window.CanvasRenderingContext2D,webgl:function(){try{return!!window.WebGLRenderingContext&&!!document.createElement("canvas").getContext("experimental-webgl")}catch(e){return!1}}(),workers:!!window.Worker,fileapi:window.File&&window.FileReader&&window.FileList&&window.Blob,all:function(){return this.webgl&&this.canvas&&this.workers&&this.fileapi}}},resize:function(){this.properties=this.setProperties();for(var e in this.cameras)this.cameras[e].aspect=this.properties.aspect,this.cameras[e].updateProjectionMatrix(),this.active.skybox.aspect=this.properties.aspect,this.active.skybox.updateProjectionMatrix();this.renderer.setSize(this.properties.width,this.properties.height)},dependencies:function(e){var t=$.map(this.options.deps,function(e,t){return window[t]||window.THREE&&window.THREE[t]?void 0:e});t.length?this.loadScripts(t,e):e()},loadScripts:function(e,t){var r=this;$.when($.getScript(e.shift())).done(function(){e.length>0?r.loadScripts(e,t):t()})}},$.fn.three=function(e,t){return e||(e=!1),t||(t=function(e){return e}),Three.prototype.self.apply(this,arguments,e,t)},Three.prototype.getAttributes=function(e){var t={};return $(e).each(function(){var e=this.attributes;for(var r in e)if(e[r].name&&0===e[r].name.search("data-")){var a=e[r].name.replace("data-",""),i=e[r].value;t[a]=parseInt(i,10)?parseInt(i,10):i}else if(e[r].name&&0===e[r].name.search("class")){var n=e[r].value.split(" ");t["class"]=n}else e[r].name&&0===e[r].name.search("src")?t.src=e[r].value:e[r].name&&0===e[r].name.search("style")&&(t.style=e[r].value)}),t},Three.prototype.addClass=function(e){var t=this.last,r=$(this.container).find("[data-id='"+t.id+"']");r.addClass(e);var a=this.css(r);return this.fn.css.set.call(t,a),this},e=function(e){var t=document.styleSheets,r={};for(var i in t){var n=t[i].rules||t[i].cssRules;for(var s in n)n[s].selectorText&&n[s].selectorText.search(":hover")>-1||e.is(n[s].selectorText)&&(r=$.extend(r,a(n[s].style),a(e.attr("style"))))}return r},t.css={set:function(e,t){if(e)for(var r in t){var a=r.replace("-webkit-","").replace("-moz-","");switch(a){case"width":e.scale.x=parseInt(t[r],10);break;case"height":e.scale.y=parseInt(t[r],10);break;case"top":e.position.y=parseInt(t[r],10);break;case"left":e.position.x=parseInt(t[r],10);break;case"color":var i=this.colorToHex(t[r]);e.material.color.setHex(i);break;case"transform":var n;t[r].search("translate3d")>-1&&(n=this.fn.css.translate.call(this,t[r]),e instanceof THREE.Mesh&&"terrain"!=e.type?e.parent.position.set(n.x,n.y,n.z):e.position.set(n.x,n.y,n.z)),t[r].search("rotate3d")>-1&&(n=this.fn.css.rotate.call(this,t[r]),e instanceof THREE.Mesh&&"terrain"!=e.type?e.parent.rotation.set(n.x,n.y,n.z):e.rotation.set(n.x,n.y,n.z)),t[r].search("scale3d")>-1&&(n=this.fn.css.scale.call(this,t[r]),e instanceof THREE.Mesh&&"terrain"!=e.type?e.parent.scale.set(n.x,n.y,n.z):e.scale.set(n.x,n.y,n.z));break;case"animation-duration":console.log(a,t[r]);break;case"animation-timing":console.log(a,t[r]);break;case"animation-delay":console.log(a,t[r]);break;case"animation-iteration-count":console.log(a,t[r]);break;case"animation-direction":console.log(a,t[r]);break;case"animation-fill-mode":console.log(a,t[r]);break;case"animation-name":console.log(a,t[r]);break;case"display":break;case"background-image":e instanceof THREE.Scene&&this.fn.css.skybox.call(this,t[r]),"terrain"==e.type?this.fn.css.terrain.call(this,t[r]):e instanceof THREE.Mesh&&this.fn.css.texture.call(this,e,t[r])}}},rotate:function(e){var t={};if(e.search("rotate3d")>-1){var r=e.match(/rotate3d\(([\s\S]*?)\)/gi);r=r[0].replace(/rotate3d\(|deg|\)| /gi,"").split(","),t={x:parseInt(r[0],10)?parseInt(r[3],10)*Math.PI/180:0,y:parseInt(r[1],10)?parseInt(r[3],10)*Math.PI/180:0,z:parseInt(r[2],10)?parseInt(r[3],10)*Math.PI/180:0}}return t},translate:function(e){var t={};if(e.search("translate3d")>-1){var r=e.match(/translate3d\(([\s\S]*?)\)/gi);r=r[0].replace(/translate3d\(|px|\)| /gi,"").split(","),t={x:parseInt(r[0],10)||0,y:parseInt(r[1],10)||0,z:parseInt(r[2],10)||0}}return t},scale:function(e){var t={};if(e.search("scale3d")>-1){var r=e.match(/scale3d\(([\s\S]*?)\)/gi);r=r[0].replace(/scale3d\(|\)| /gi,"").split(","),t={x:parseInt(r[0],10)||0,y:parseInt(r[1],10)||0,z:parseInt(r[2],10)||0}}return t},texture:function(e,t){var r=t.replace(/\s|url\(|\)/g,""),a=this.webglMaterial({map:r});e.material=a},terrain:function(e){var t=this.last,r=e.replace(/\s|url\(|\)/g,"").split(",");if(r instanceof Array)for(var a in r){if(r[a].search("heightmap")>-1){var i=THREE.ImageUtils.loadTexture(r[a]);t.material.uniforms.tDisplacement.value=i,t.material.uniforms.uDisplacementScale.value=375;var n=i;n.wrapS=n.wrapT=THREE.RepeatWrapping,t.material.uniforms.tDiffuse2.value=n,t.material.uniforms.enableDiffuse2.value=!0}if(r[a].search("diffuse")>-1){var s=THREE.ImageUtils.loadTexture(r[a]);s.wrapS=s.wrapT=THREE.RepeatWrapping,t.material.uniforms.tDiffuse1.value=s,t.material.uniforms.enableDiffuse1.value=!0}if(r[a].search("specular")>-1){var o=THREE.ImageUtils.loadTexture(r[a]);o.wrapS=o.wrapT=THREE.RepeatWrapping,t.material.uniforms.tSpecular.value=o,t.material.uniforms.enableSpecular.value=!0}}},skybox:function(e){var t=e.replace(/\s|url\(|\)/g,"").split(",");t instanceof Array&&this.addSkybox(t)}};var a=function(e){var t={};if(!e)return t;if(e instanceof CSSStyleDeclaration)for(var r in e)e[r].toLowerCase&&(t[e[r].toLowerCase()]=e[e[r]]);else if("string"==typeof e){e=e.split("; ");for(var a in e){var i=e[a].split(": ");t[i[0].toLowerCase()]=i[1]}}return t};Three.prototype.animate=function(){},Three.prototype.watch=function(e){$(e).bind("DOMSubtreeModified",this.eventSubtree),e.onpropertychange?$(e).bind("propertychange",this.eventAttribute):$(e).bind("DOMAttrModified",this.eventAttribute)},Three.prototype.eventSubtree=function(e){e.target.innerHTML.length>0&&console.log(e.target.innerHTML)},Three.prototype.eventAttribute=function(e){console.log("attribute",e.target)},Three.prototype.add=function(e){var t,r={camera:"cameras",scene:"scenes",mesh:"objects",plane:"objects",cube:"objects",sphere:"objects",cylinder:"objects",material:"materials"};if(e===void 0||e.type===void 0)return this;var a=this.webgl(e);if(!a||a===void 0)return this;this.last=a;var i=r[e.type]||!1;"objects"==i?(t=new THREE.Object3D,t.add(a)):t=a,this.active[e.type]=t,i&&(this[i][t.id]=t),"scene"==e.type?this.active.scene=t:this.active.scene.add(t),e["data-id"]=t.id||!1;var n=this.createHTML(e),s=this.css(n);return this.fn.css.set.call(this,a,s),this},Three.prototype.addScene=function(e){var t=e||{};return t.type="scene",this.add(t),this},Three.prototype.addCamera=function(e){var t=e||{};return t.type="camera",this.add(t),this},Three.prototype.addMesh=function(e){var t=e||{};return t.type="mesh",this.add(t),this},Three.prototype.addPlane=function(e){var t=e||{};return t.type="plane",this.add(t),this},Three.prototype.addSphere=function(e){var t=e||{};return t.type="sphere",this.add(t),this},Three.prototype.addCube=function(e){var t=e||{};return t.type="cube",this.add(t),this},Three.prototype.addCylinder=function(e){var t=e||{};return t.type="cylinder",this.add(t),this},Three.prototype.addAsset=function(e){var t=e||{};return t.type="asset",this.add(t),this},Three.prototype.addSkybox=function(e){var t=new THREE.PerspectiveCamera(50,$(this.container).width()/$(this.container).height(),1,100),r=new THREE.Scene,a=THREE.ImageUtils.loadTextureCube(e);a.format=THREE.RGBFormat;var i=THREE.ShaderLib.cube;i.uniforms.tCube.value=a;var n=new THREE.ShaderMaterial({fragmentShader:i.fragmentShader,vertexShader:i.vertexShader,uniforms:i.uniforms,depthWrite:!1,side:THREE.BackSide});mesh=new THREE.Mesh(new THREE.CubeGeometry(100,100,100),n),r.add(mesh),this.active.skybox={scene:r,camera:t}},Three.prototype.addTerrain=function(e){var t=e||{};return t.type="terrain",this.add(t),this},Three.prototype.html=function(e){var t=this;$(e).filter("*").each(function(e,r){var a=r===void 0?!1:$(r);if(a){var i={};i.type=r.nodeName.toLowerCase(),i.id=a.attr("id");var n=t.getAttributes(r);i=$.extend(i,n),t.add(i),t.html(a.html())}})},Three.prototype.createHTML=function(e){var t=$("<"+e.type+">");if(e.id&&t.attr("id",e.id),e["data-id"]&&t.attr("data-id",e["data-id"]),e["class"]&&e["class"].length){var r=e["class"].join(" ");t.attr("class",r)}return e.style&&t.attr("style",e.style),t.appendTo(this.parent),("scene"==e.type||"asset"==e.type||"player"==e.type)&&(this.parent=t),t},Three.prototype.append=function(e){this.html(e)},Three.prototype.find=function(e){var t=$(this.container).find("shadow-root "+e).attr("data-id"),r=this.objects[t]||this.cameras[t]||this.scenes[t];return r},Three.prototype.webgl=function(e){var t;switch(e.type){case"scene":t=this.webglScene(e);break;case"camera":t=this.webglCamera(e);break;case"mesh":t=this.webglMesh(e);break;case"material":t=this.webglMaterial(e);break;case"light":t=this.webglLight(e);break;case"plane":t=this.webglPlane(e);break;case"sphere":t=this.webglSphere(e);break;case"cube":t=this.webglCube(e);break;case"cylinder":t=this.webglCylinder(e);break;case"terrain":t=this.webglTerrain(e);break;default:t=this.fn.webgl[e.type]!==void 0?this.fn.webgl[e.type].apply(this,[e]):!1}return t},t.webgl={},Three.prototype.webglScene=function(e){var t={id:!1};$.extend(t,e);var r=new THREE.Scene;return this.scenes[r.id]=r,r},Three.prototype.webglCamera=function(e){var t,r={fov:50,aspect:this.properties.aspect,near:1,far:1e3,scene:this.active.scene},a=$.extend(r,e);return a.orthographic||(t=new THREE.PerspectiveCamera(a.fov,a.aspect,a.near,a.far)),t},Three.prototype.webglMesh=function(e){var t,r={id:!1,wireframe:!1,scene:this.active.scene};return $.extend(r,e),t},Three.prototype.webglMaterial=function(e){var t,r,a={id:!1,color:0,wireframe:!1,map:!1,scene:this.active.scene},i=$.extend(a,e),n=window.Shaders||{};if(i.id&&n[i.id]){r={};var s=Shaders[i.id];s.uniforms&&(r.uniforms=THREE.UniformsUtils.clone(s.uniforms)),s.vertexShader&&(r.vertexShader=s.vertexShader),s.fragmentShader&&(r.fragmentShader=s.fragmentShader),i.map&&s.uniforms&&(r.uniforms.texture.texture=THREE.ImageUtils.loadTexture(i.map)),t=new THREE.ShaderMaterial(r)}else r={},i.map&&(r.map=THREE.ImageUtils.loadTexture(i.map)),i.color&&!i.map&&(r.color=i.color),i.wireframe&&(r.wireframe=i.wireframe),t=new THREE.MeshBasicMaterial(r);return t},Three.prototype.webglTexture=function(e){var t=new THREE.Texture,r=new THREE.ImageLoader;return r.addEventListener("load",function(e){t.image=e.content,t.needsUpdate=!0}),r.load(e),t},Three.prototype.webglLight=function(){},Three.prototype.webglPlane=function(e){var t={width:1,height:1,color:0,wireframe:!1,scene:this.active.scene},r=$.extend(t,e),a=new THREE.PlaneGeometry(r.width,r.height);a.dynamic=!0;var i=new THREE.MeshBasicMaterial({color:r.color,wireframe:r.wireframe}),n=new THREE.Mesh(a,i);return r.id&&(n.name=r.id),n},Three.prototype.webglSphere=function(e){var t={id:!1,radius:1,segments:16,rings:16,color:0,wireframe:!1,map:!1,scene:this.active.scene},r=$.extend(t,e),a=new THREE.SphereGeometry(r.radius,r.segments,r.rings);a.dynamic=!0;var i=this.webglMaterial(r),n=new THREE.Mesh(a,i);return n.matrixAutoUpdate=!1,r.id&&(n.name=r.id),n},Three.prototype.webglCube=function(e){var t={id:!1,width:1,height:1,depth:1,color:0,wireframe:!1,scene:this.active.scene},r=$.extend(t,e),a=new THREE.CubeGeometry(r.width,r.height,r.depth);a.dynamic=!0;var i=new THREE.MeshBasicMaterial({color:r.color,wireframe:r.wireframe}),n=new THREE.Mesh(a,i);return r.id&&(n.name=r.id),n},Three.prototype.webglCylinder=function(e){var t={id:!1,radiusTop:100,radiusBottom:100,segmentsRadius:400,segmentsHeight:50,openEnded:!1,color:0,wireframe:!1,scene:this.active.scene},r=$.extend(t,e),a=new THREE.CylinderGeometry(r.radiusTop,r.radiusBottom,r.segmentsRadius,r.segmentsHeight,r.openEnded,!1);a.dynamic=!0;var i=new THREE.MeshBasicMaterial({color:r.color,wireframe:r.wireframe}),n=new THREE.Mesh(a,i);return r.id&&(n.name=r.id),n},Three.prototype.webglTerrain=function(){var e;this.active.scene.add(new THREE.AmbientLight(1118481)),directionalLight=new THREE.DirectionalLight(16777215,1.15),directionalLight.position.set(500,2e3,0),this.active.scene.add(directionalLight);var t=new THREE.PlaneGeometry(6e3,6e3,256,256);t.computeFaceNormals(),t.computeVertexNormals(),t.computeTangents();var r=THREE.ShaderTerrain.terrain;uniformsTerrain=THREE.UniformsUtils.clone(r.uniforms),uniformsTerrain.uDiffuseColor.value.setHex(16777215),uniformsTerrain.uSpecularColor.value.setHex(16777215),uniformsTerrain.uAmbientColor.value.setHex(1118481),uniformsTerrain.uRepeatOverlay.value.set(6,6);var a=new THREE.ShaderMaterial({uniforms:uniformsTerrain,vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,lights:!0,fog:!1});return e=new THREE.Mesh(t,a),e.type="terrain",this.active.scene.add(e),e},Three.prototype.colorToHex=function(e){if("#"===e.substr(0,1))return e.replace("#","0x");var t=/(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(e),r=parseInt(t[2],10).toString(16),a=parseInt(t[3],10).toString(16),i=parseInt(t[4],10).toString(16);return 1==r.length&&(r="0"+r),1==a.length&&(a="0"+a),1==i.length&&(i="0"+i),"0x"+r+a+i},Three.prototype.setProperties=function(){return{width:$(this.container).width(),height:$(this.container).height(),aspect:$(this.container).width()/$(this.container).height()}},Three.prototype.css=e,Three.prototype.fn=t});