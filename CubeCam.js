CubeCam = function ( near, far, cubeResolution ) {

	THREE.Object3D.call( this );
  this.resolution = cubeResolution;
	this.type = 'CubeCam';

  //make a reusable canvas
  canvas = document.createElement("canvas");
  canvas.width = cubeResolution * 4;
  canvas.height = cubeResolution * 3;
  
	var fov = 90, aspect = 1;

	var cameraPX = new THREE.PerspectiveCamera( fov, aspect, near, far );
	cameraPX.up.set( 0, 1, 0 );
	cameraPX.lookAt( new THREE.Vector3( 1, 0, 0 ) );
	this.add( cameraPX );

	var cameraNX = new THREE.PerspectiveCamera( fov, aspect, near, far );
	cameraNX.up.set( 0, 1, 0 );
	cameraNX.lookAt( new THREE.Vector3( - 1, 0, 0 ) );
	this.add( cameraNX );

	var cameraPY = new THREE.PerspectiveCamera( fov, aspect, near, far );
	cameraPY.up.set( 0, 0, 1 );
	cameraPY.lookAt( new THREE.Vector3( 0, 1, 0 ) );
	this.add( cameraPY );

	var cameraNY = new THREE.PerspectiveCamera( fov, aspect, near, far );
	cameraNY.up.set( 0, 0, - 1 );
	cameraNY.lookAt( new THREE.Vector3( 0, - 1, 0 ) );
	this.add( cameraNY );

	var cameraPZ = new THREE.PerspectiveCamera( fov, aspect, near, far );
	cameraPZ.up.set( 0, 1, 0 );
	cameraPZ.lookAt( new THREE.Vector3( 0, 0, 1 ) );
	this.add( cameraPZ );

	var cameraNZ = new THREE.PerspectiveCamera( fov, aspect, near, far );
	cameraNZ.up.set( 0, 1, 0 );
	cameraNZ.lookAt( new THREE.Vector3( 0, 0, - 1 ) );
	this.add( cameraNZ );

	this.renderTarget = new THREE.WebGLRenderTargetCube( cubeResolution, cubeResolution, 
    {
      format: THREE.RGBFormat,
      magFilter: THREE.LinearFilter,
      minFilter: THREE.LinearFilter,
      antialias: true
      //preserveDrawingBuffer: true
    });
    
  var bitmap = [];
  for (var i = 0; i < 6; i++){
    bitmap[i] = new Uint8Array(cubeResolution * cubeResolution * 4);
  }

	this.updateCubeMap = function ( renderer, scene ) {

		var renderTarget = this.renderTarget;
		var generateMipmaps = renderTarget.generateMipmaps;

    var gl = renderer.getContext();
		renderTarget.generateMipmaps = false;

		renderTarget.activeCubeFace = 0;
		renderer.render( scene, cameraPX, renderTarget );
    
		renderTarget.activeCubeFace = 1;
		renderer.render( scene, cameraNX, renderTarget );

		renderTarget.activeCubeFace = 2;
		renderer.render( scene, cameraPY, renderTarget );

		renderTarget.activeCubeFace = 3;
		renderer.render( scene, cameraNY, renderTarget );

		renderTarget.activeCubeFace = 4;
		renderer.render( scene, cameraPZ, renderTarget );
    
		renderTarget.activeCubeFace = 5;
		renderer.render( scene, cameraNZ, renderTarget );
    
    var buffers = renderTarget.__webglFramebuffer;
    var resetBuffer = renderer._currentFramebuffer;
    
    //read pixels from each cube face
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffers[0]);
    gl.readPixels(0, 0, cubeResolution, cubeResolution, gl.RGBA, gl.UNSIGNED_BYTE, bitmap[0]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffers[1]);
    gl.readPixels(0, 0, cubeResolution, cubeResolution, gl.RGBA, gl.UNSIGNED_BYTE, bitmap[1]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffers[2]);
    gl.readPixels(0, 0, cubeResolution, cubeResolution, gl.RGBA, gl.UNSIGNED_BYTE, bitmap[2]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffers[3]);
    gl.readPixels(0, 0, cubeResolution, cubeResolution, gl.RGBA, gl.UNSIGNED_BYTE, bitmap[3]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffers[4]);
    gl.readPixels(0, 0, cubeResolution, cubeResolution, gl.RGBA, gl.UNSIGNED_BYTE, bitmap[4]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffers[5]);
    gl.readPixels(0, 0, cubeResolution, cubeResolution, gl.RGBA, gl.UNSIGNED_BYTE, bitmap[5]);
    
    //put buffer and mipmaps back
    gl.bindFramebuffer(gl.FRAMEBUFFER, resetBuffer);
    renderTarget.generateMipmaps = generateMipmaps;
    
    var ctx = canvas.getContext("2d");
    //get the pixels
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imgData.data;
    
    //Helper draw function to place each view
    var drawAt = function(src, srcW, srcH, dst,dstW, x,y,w,h){
      var sx = x;
      var sy = y; //flip
      var ex = x + w;
      var ey = y + h;
      for (x = 0; x < srcW; x++){
        for (y = 0; y < srcH; y++){
          dst[((dstW * (y+sy)) + x + sx)*4] = src[(srcW*(h-y-1) + x)*4];
          dst[((dstW * (y+sy)) + x + sx)*4 + 1] = src[(srcW*(h-y-1) + x)*4 + 1];
          dst[((dstW * (y+sy)) + x + sx)*4 + 2] = src[(srcW*(h-y-1) + x)*4 + 2];
          dst[((dstW * (y+sy)) + x + sx)*4 + 3] = src[(srcW*(h-y-1) + x)*4 + 3];
        }
      }
    }
    
    //draw all the views
    //PX - Right
    drawAt(bitmap[0], cubeResolution, cubeResolution, data, imgData.width, cubeResolution * 2, cubeResolution * 1, cubeResolution, cubeResolution);
    //NX - Left
    drawAt(bitmap[1], cubeResolution, cubeResolution, data, imgData.width, cubeResolution * 0, cubeResolution * 1, cubeResolution, cubeResolution);
    //PY - Top
    drawAt(bitmap[2], cubeResolution, cubeResolution, data, imgData.width, cubeResolution * 1, cubeResolution * 0, cubeResolution, cubeResolution);
    //NY - Bottom
    drawAt(bitmap[3], cubeResolution, cubeResolution, data, imgData.width, cubeResolution * 1, cubeResolution * 2, cubeResolution, cubeResolution);
    //PZ - Back
    drawAt(bitmap[4], cubeResolution, cubeResolution, data, imgData.width, cubeResolution * 3, cubeResolution * 1, cubeResolution, cubeResolution);
    //NZ - Front
    drawAt(bitmap[5], cubeResolution, cubeResolution, data, imgData.width, cubeResolution * 1, cubeResolution * 1, cubeResolution, cubeResolution);
    
    // Put the data back in the canvas
    ctx.putImageData(imgData, 0, 0);
    //download canvas as a png
    //take apart data URL
    var parts = canvas.toDataURL().match(/data:([^;]*)(;base64)?,([0-9A-Za-z+/]+)/);

    //assume base64 encoding
    var binStr = atob(parts[3]);

    //convert to binary in ArrayBuffer
    var buf = new ArrayBuffer(binStr.length);
    var view = new Uint8Array(buf);
    for(var i = 0; i < view.length; i++)
      view[i] = binStr.charCodeAt(i);

    var blob = new Blob([view], {'type': parts[1]});

    //And then if you want to do something with that blob...
    var url = URL.createObjectURL(blob);
    
    //var url = canvas.toDataURL("image/png");
    var a = document.createElement("a");
    a.href = url;
    a.download = "CubeMapSave.png";
    a.click();
	};

};

CubeCam.prototype = Object.create( THREE.Object3D.prototype );
CubeCam.prototype.constructor = THREE.CubeCamera;