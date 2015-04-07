
SkyboxControl = function(camera, domElement){
  this.camera = camera;
  this.camera.rotation.order = 'YXZ';
  this.domElement = domElement;
  this.down = false;
  this.enabled = true;
  
  var scope = this;
  var PI = 3.141592654;
  
  // Function Definitions
  this.onMouseMove = function(event){
    if (!this.enabled) return;
    if (!this.down) return;
    var mouseX = event.clientX;
    var mouseY = event.clientY;
    
    var near = (window.innerHeight/2) / Math.tan((PI / 180) * (this.camera.fov / 2));
    
    var toRotX = Math.atan((mouseX - window.innerWidth/2) / near);
    var fromRotX = Math.atan((this.prevMouseX - window.innerWidth/2) / near);
    var rotX = toRotX - fromRotX;
    
    var toRotY = Math.atan((mouseY - window.innerHeight/2) / near);
    var fromRotY = Math.atan((this.prevMouseY - window.innerHeight/2) / near);
    var rotY = toRotY - fromRotY;
    
    this.camera.rotation.y+= rotX;
    this.camera.rotation.x+= rotY;
    
    this.prevMouseX = mouseX;
    this.prevMouseY = mouseY;
  }
  
  this.onMouseDown = function (event){
    this.prevMouseX = event.clientX;
    this.prevMouseY = event.clientY;
    this.down = true;
  };
  
  this.onMouseUp = function(event){
    this.down = false;
  }
  
  function onMouseWheel(event){
  }
  
  function onKeyDown(event){}
  
  function onKeyUp(event){}
  
  // Function registration
  //this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', function(e){scope.onMouseDown(e)}, false );
  this.domElement.addEventListener( 'mouseup', function(e){scope.onMouseUp(e)}, false );
	this.domElement.addEventListener( 'mousewheel', function(e){scope.onMouseWheel(e)}, false );
  this.domElement.addEventListener( 'mousemove', function(e){scope.onMouseMove(e)}, false );
  window.addEventListener( 'keydown', onKeyDown, false );
	window.addEventListener( 'keyup', onKeyUp, false );
};