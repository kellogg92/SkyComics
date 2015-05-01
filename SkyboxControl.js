
SkyboxControl = function(camera, domElement){
  this.camera = camera;
  this.camera.rotation.order = 'YXZ';
  this.domElement = domElement;
  this.down = false;
  this.enabled = true;
  
  var scope = this;
  var PI = 3.141592654;
  
  this.mouseButton = 2;//right click
  
  // Function Definitions
  this.onMouseMove = function(event){
    if (!(this===scope)){
      scope.onMouseMove(event);
      return;
    }
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
    
    var maxRotX = degToRad(80);
    var minRotX = degToRad(-80);
    this.camera.rotation.x = Math.max(Math.min(this.camera.rotation.x, maxRotX), minRotX);
    
    this.prevMouseX = mouseX;
    this.prevMouseY = mouseY;
  }
  
  this.onMouseDown = function (event){
    if (!(this===scope)){
      scope.onMouseDown(event);
      return;
    }
    // Only capture bound mouse button
    if (event.button == this.mouseButton){
      this.prevMouseX = event.clientX;
      this.prevMouseY = event.clientY;
      this.down = true;
    }
  };
  
  this.onMouseUp = function(event){
    if (!(this===scope)){
      scope.onMouseUp(event);
      return;
    }
    if (event.button == this.mouseButton){
      this.down = false;
    }
  }
  
  // Function registration
  this.bind = function(_mouseButton){
    this.domElement.addEventListener( 'mousedown', scope.onMouseDown, false );
    this.domElement.addEventListener( 'mouseup', scope.onMouseUp, false );
    this.domElement.addEventListener( 'mousemove', function(ev){scope.onMouseMove(ev);}, false );
    this.mouseButton = _mouseButton;
  }
  
  this.rebind = function(_mouseButton){
    mouseButton = _mouseButton;
  }
  
  // Function registration
  this.unbind = function(){
   /* this.domElement.removeEventListener( 'mousedown', function(e){scope.onMouseDown(e)}, false );
    this.domElement.removeEventListener( 'mouseup', function(e){scope.onMouseUp(e)}, false );
    this.domElement.removeEventListener( 'mousemove', function(e){scope.onMouseMove(e)}, false );*/
  }
};