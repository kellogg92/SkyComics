Editor = function(scene_){
  var scene = scene_;
  var scope = this;
  var cubeCam, stats;
  var doRenderCubeMap = false;
  var drawing = false;
  
  var ControlStyle = Object.freeze({Touch:1, Desktop:2});
  var options = {};
  var Guides = {};
  
  var brushGeo = new THREE.SphereGeometry(1, 5, 5);
  var brushMat = new THREE.MeshBasicMaterial({color:0xaaddff});
  
  var domElement;
  var mouseButton;
  
  options = 
  {
    controlStyle: ControlStyle.Desktop,
    guide:
    {
      rect:
      {
        position: {x:0.0, y:0.0, z:0.0},
        size: {x:1.0, y:1.0, z:1.0}
      },
      circ:
      {
        longitudinal: false,
        degrees: 0.0
      },
      list: [],
    }
  }
  
  options.guide.rect.add = function(){
    var rect = new THREE.Line(Guides.Rect.geometry, Guides.Rect.material, Guides.Rect.mode);
    var size = options.guide.rect.size;
    rect.scale.set(size.x, size.y, size.z);
    var pos = options.guide.rect.position;
    rect.position.set(pos.x, pos.y, pos.z);
    scene.add(rect);
  }
  
  options.guide.circ.add = function(){
    var circle = new THREE.Line( Guides.Circle.Geometry, Guides.Circle.Material );
    if (!options.guide.circ.longitudinal){
      circle.rotation.x = degToRad(90);
      circle.scale.x = Math.cos(degToRad(options.guide.circ.degrees));
      circle.scale.y = Math.cos(degToRad(options.guide.circ.degrees));
      circle.position.y = Math.sin(degToRad(options.guide.circ.degrees));
    } else {
      circle.rotation.y = degToRad(options.guide.circ.degrees);
    }
    scene.add(circle);
  }

  InitScene();
  InitGuides();
  InitSettings();
  
  function InitScene(){
    cubeCam = new CubeCam(0.1, 20000, 2048);
    scene.add(cubeCam);
    
    // Add Stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild( stats.domElement );
  }
  
  function InitGuides(){
    // Initialize circle guide
    var curve = new THREE.EllipseCurve(0,0,1,1,0,2 * Math.PI, false);
    var points = curve.getPoints(50);
    var path = new THREE.Path(points);
    var geometry = path.createPointsGeometry(50);
    var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    Guides.Circle = new THREE.Line(geometry, material);
    scene.add(Guides.Circle);
    
    // Initialize rect guide
    geometry = new THREE.Geometry();
    
    geometry.vertices.push(new THREE.Vector3(-1,-1,-1),new THREE.Vector3(1,-1,-1));
    geometry.vertices.push(new THREE.Vector3(-1,-1,-1),new THREE.Vector3(-1,1,-1));
    geometry.vertices.push(new THREE.Vector3(1,-1,-1),new THREE.Vector3(1,1,-1));
    geometry.vertices.push(new THREE.Vector3(-1,1,-1),new THREE.Vector3(1,1,-1));
    
    geometry.vertices.push(new THREE.Vector3(-1,-1,1),new THREE.Vector3(1,-1,1));
    geometry.vertices.push(new THREE.Vector3(-1,-1,1),new THREE.Vector3(-1,1,1));
    geometry.vertices.push(new THREE.Vector3(1,-1,1),new THREE.Vector3(1,1,1));
    geometry.vertices.push(new THREE.Vector3(-1,1,1),new THREE.Vector3(1,1,1));
    
    geometry.vertices.push(new THREE.Vector3(-1,-1,-1),new THREE.Vector3(-1,-1,1));
    geometry.vertices.push(new THREE.Vector3(-1,1,-1),new THREE.Vector3(-1,1,1));
    geometry.vertices.push(new THREE.Vector3(1,1,-1),new THREE.Vector3(1,1,1));
    geometry.vertices.push(new THREE.Vector3(1,-1,-1),new THREE.Vector3(1,-1,1));
    
    var cube = new THREE.Line(geometry, material, THREE.LinePieces);
    Guides.Rect = cube;
    scene.add(Guides.Rect);
  }
  
  function InitSettings(){
    var gui = new dat.GUI({ width: 300 });
    var controlStyle = gui.add(options, "controlStyle" , ControlStyle);
    controlStyle.onFinishChange( function(value){
      //TODO: Change the control style
    });
    
    var guideFolder = gui.addFolder("Guide");
    
    var rectFolder = guideFolder.addFolder("Rect Guide");
    var posFolder = rectFolder.addFolder("Position");
    posFolder.add(options.guide.rect.position, "x", -100, 100);
    posFolder.add(options.guide.rect.position, "y", -100, 100);
    posFolder.add(options.guide.rect.position, "z", -100, 100);
    
    var sizeFolder = rectFolder.addFolder("Size");
    sizeFolder.add(options.guide.rect.size, "x", 0, 100);
    sizeFolder.add(options.guide.rect.size, "y", 0, 100);
    sizeFolder.add(options.guide.rect.size, "z", 0, 100);
    
    rectFolder.add(options.guide.rect, "add").name("Add Rectangle Guide");
    
    var circFolder = guideFolder.addFolder("Circ Guide");
    circFolder.add(options.guide.circ, "longitudinal");
    circFolder.add(options.guide.circ, "degrees", -90, 90, 0.1);
    
    circFolder.add(options.guide.circ, "add").name("Add Circle Guide")
    
    var guideListFolder = guideFolder.addFolder("Guide List");
    var junk = {
      ImportCubemap: function(){
         $('#openFile').click();
      }
    }
    gui.add(junk, "ImportCubemap").name("Import a cubemap");
    this.gui = {};
    this.gui.gui = gui;
    this.gui.rectFolder = rectFolder;
    this.gui.circFolder = circFolder;
  }
  
  function Update(){
    if (doRenderCubeMap){
      cubeCam.updateCubeMap(renderer, scene);
      doRenderCubeMap = false;
    }
    
    stats.update();
  }
  
  function Render(){
    if (!gui.circFolder.closed){
      var circle = Guides.Circle;
      if (!options.guide.circ.longitudinal){
        circle.rotation.x = degToRad(90);
        circle.rotation.y = 0;
        circle.scale.x = Math.cos(degToRad(options.guide.circ.degrees));
        circle.scale.y = Math.cos(degToRad(options.guide.circ.degrees));
        circle.position.y = Math.sin(degToRad(options.guide.circ.degrees));
      } else {
        circle.rotation.x = 0;
        circle.rotation.y = degToRad(options.guide.circ.degrees);
        circle.scale.x = 1;
        circle.scale.y = 1;
        circle.position.y = 0;
      }
      Guides.Circle.visible = true;
    } else {
      Guides.Circle.visible = false;
    }
    
    if (!gui.rectFolder.closed){
      Guides.Rect.position.x = options.guide.rect.position.x;
      Guides.Rect.position.y = options.guide.rect.position.y;
      Guides.Rect.position.z = options.guide.rect.position.z;
      
      Guides.Rect.scale.x = options.guide.rect.size.x;
      Guides.Rect.scale.y = options.guide.rect.size.y;
      Guides.Rect.scale.z = options.guide.rect.size.z;
      Guides.Rect.visible = true;
    } else {
      Guides.Rect.visible = false;
    }
  }
  
  function addSphere(screenX, screenY, screenRad){
  //TODO: use screenRad  
    var sphere = new THREE.Mesh(brushGeo, brushMat);
    scene.add( sphere );
    var vec = new THREE.Vector3( (screenX / window.innerWidth ) * 2 - 1,
                                - (screenY / window.innerHeight ) * 2 + 1,
                                0.5);
    vec.unproject(camera);
    vec.normalize().multiplyScalar(100);
    sphere.position.set(vec.x,vec.y,vec.z);
  }

  function onMouseDown(event){
    if (event.button == mouseButton){
      drawing = true;
      addSphere(event.clientX, event.clientY, 1);
    }
  }

  function onMouseMove(event){
    if (drawing){
      addSphere(event.clientX, event.clientY, 1);
    }
  }

  function onMouseUp(event){
    if (event.button == mouseButton){
      drawing = false;
    }
  }
  
  function onKeyDown(event){
    if (event.keyCode == keyCode){
      doRenderCubeMap = true;
    }
  }
  
  var mouseDownCallback = function(e){
    scope.onMouseDown(e);
  }
  
  var mouseMoveCallback = function(e){
    scope.onMouseMove(e);
  }
  
  var mouseUpCallback = function(e){
    scope.onMouseUp(e);
  }
  
  var keyDownCallback = function(e){
    scope.onKeyDown(e);
  }
  
  function bind(mouseButton_, key_, domElement_){
    mouseButton = mouseButton_;
    keyCode = key_.charCodeAt(0);
    domElement = domElement_;
    domElement.addEventListener('mousedown', mouseDownCallback, false);
    domElement.addEventListener('mousemove', mouseMoveCallback, false);
    domElement.addEventListener('mouseup', mouseUpCallback, false);
    document.addEventListener('keydown', keyDownCallback, false);
  }
  
  function unBind(){
    domElement.removeEventListener('mousedown', mouseDownCallback);
    domElement.removeEventListener('mousemove', mouseMoveCallback);
    domElement.removeEventListener('mouseup', mouseUpCallback);
    document.removeEventListener('keydown', keyDownCallback);
    domElement = null;
    mouseButton = null;
  }
  
  this.Update = Update;
  this.Render = Render;
  this.bind = bind;
  this.unBind = unBind;
  this.onMouseUp = onMouseUp;
  this.onMouseMove = onMouseMove;
  this.onMouseDown = onMouseDown;
  this.onKeyDown = onKeyDown;
}