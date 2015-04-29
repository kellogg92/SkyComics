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
  
  var domElement;
  var mouseButton;
  
  //The previous projected position for drawing
  prevPos = null;
  
  // The current background object
  background = null;
  
  options = {
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
    },
    currentColor: "#0000DD",
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
    var circle = new THREE.Line( Guides.Circle.geometry, Guides.Circle.material );
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
    scene.add(circle);
  }

  InitScene();
  InitGuides();
  InitSettings();
  
  
  function InitScene(){
    cubeCam = new CubeCam(0.1, 20000, 1024);
    scene.add(cubeCam);
    skybox = MakeSkybox();
    scene.add(skybox);
    
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
    var material = new THREE.LineBasicMaterial( { color : options.currentColor } );
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
    posFolder.add(options.guide.rect.position, "x", -100, 100, 0.1);
    posFolder.add(options.guide.rect.position, "y", -100, 100, 0.1);
    posFolder.add(options.guide.rect.position, "z", -100, 100, 0.1);
    
    var sizeFolder = rectFolder.addFolder("Size");
    sizeFolder.add(options.guide.rect.size, "x", 0, 100, 0.1);
    sizeFolder.add(options.guide.rect.size, "y", 0, 100, 0.1);
    sizeFolder.add(options.guide.rect.size, "z", 0, 100, 0.1);
    
    rectFolder.add(options.guide.rect, "add").name("Add Rectangle Guide");
    
    var circFolder = guideFolder.addFolder("Circ Guide");
    circFolder.add(options.guide.circ, "longitudinal");
    circFolder.add(options.guide.circ, "degrees", -90, 90, 0.1);
    
    circFolder.add(options.guide.circ, "add").name("Add Circle Guide")
    
    var guideListFolder = guideFolder.addFolder("Guide List");
    
    
    var junk = {
      ImportCubemap: function(){
         $('#openFile').click();
      },
      ExportCubemap: function(){
        doRenderCubeMap = true;
      }
    }
    gui.addColor(options, "currentColor")
      .name("Draw Color")
      .onChange(function(value){
        Guides.Rect.material = new THREE.LineBasicMaterial( { color : options.currentColor });
        Guides.Circle.material = new THREE.LineBasicMaterial( { color : options.currentColor });
      });
    gui.add(junk, "ImportCubemap").name("Import a cubemap");
    $(document).ready(function(){
      var fileInput = document.getElementById('openFile');
      fileInput.addEventListener('change', function(evt){
        var file = evt.target.files[0] || null;
        if (file === null) return;
        var fileUrl = URL.createObjectURL(file);
        var mat = new THREE.MeshBasicMaterial(
          {map:THREE.ImageUtils.loadTexture(fileUrl),
           side: THREE.BackSide});
        mat.map.minFilter = THREE.NearestFilter;
        skybox.material = mat;
      });
    });
    
    gui.add(junk, "ExportCubemap").name("Save a cubemap");
    
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
  
  function MakeSkybox(){
    var material = new THREE.MeshBasicMaterial(
      { color: 0xFFFFFF,
        side: THREE.BackSide});
    var geo = new THREE.BoxGeometry(5000,5000,5000);
    var delta = -0.1 / cubeCam.resolution;
    var l,r,t,b;
    l = 0-delta;
    t = 1.0/3.0-delta;
    b = 2.0/3.0+delta;
    r = 1.0/4.0+delta;
    
    var left = [
      new THREE.Vector2(l, b),
      new THREE.Vector2(r, b),
      new THREE.Vector2(r, t),
      new THREE.Vector2(l, t)];
      
    l+=1.0/4.0;
    r+=1.0/4.0;
    var front = [
      new THREE.Vector2(l, b),
      new THREE.Vector2(r, b),
      new THREE.Vector2(r, t),
      new THREE.Vector2(l, t)];
      
    l+=1.0/4.0;
    r+=1.0/4.0;
    var right = [
      new THREE.Vector2(l, b),
      new THREE.Vector2(r, b),
      new THREE.Vector2(r, t),
      new THREE.Vector2(l, t)];
    
    l+=1.0/4.0;
    r+=1.0/4.0;
    var back = [
      new THREE.Vector2(l, b),
      new THREE.Vector2(r, b),
      new THREE.Vector2(r, t),
      new THREE.Vector2(l, t)];
    
    l = 1.0/4.0-delta;
    t = 0-delta;
    b = 1.0/3.0+delta;
    r = 2.0/4.0+delta;
    var bottom = [
      new THREE.Vector2(l, t),
      new THREE.Vector2(l, b),
      new THREE.Vector2(r, b),
      new THREE.Vector2(r, t)];
      
    t = 2.0/3.0-delta;
    b = 1+delta;
    var top = [
      new THREE.Vector2(r, b),
      new THREE.Vector2(r, t),
      new THREE.Vector2(l, t),
      new THREE.Vector2(l, b)];
    
    geo.faceVertexUvs[0] = []
    var pushSide = function(side){
      geo.faceVertexUvs[0].push(
        [side[1], side[2], side[0]],
        [side[2], side[3], side[0]]);
    };
    
    pushSide(back);
    pushSide(front);
    pushSide(top);
    pushSide(bottom);
    pushSide(left);
    pushSide(right);
    geo.verticesNeedUpdate = true;
    geo.uvsNeedUpdate = true;
    
    mesh = new THREE.Mesh(geo, material);
    mesh.rotation.y = -Math.PI * 0.5;
    
    return mesh;
  }
  
  function addSphere(screenX, screenY, screenRad){
  //TODO: use screenRad  
    //var sphere = new THREE.Mesh(brushGeo, new THREE.MeshBasicMaterial({color:options.currentColor}));
    //scene.add( sphere );
    var vec = new THREE.Vector3( (screenX / window.innerWidth ) * 2 - 1,
                                - (screenY / window.innerHeight ) * 2 + 1,
                                0.5);
    vec.unproject(camera);
    vec.normalize().multiplyScalar(100);
    //sphere.position.set(vec.x,vec.y,vec.z);
    if (prevPos == null){
      prevPos = vec;
    } else{
      var geom = new THREE.Geometry();
      geom.vertices.push(prevPos, vec);
      scene.add(new THREE.Line(
        geom,
        new THREE.LineBasicMaterial({color:options.currentColor})));
      prevPos = vec;
    }    
  }

  function onMouseDown(event){
    if (event.button == mouseButton){
      drawing = true;
      geom = new THREE.Geometry();
      geom.dynamic = true;
      currentStroke = new THREE.Line(
        geom,
        new THREE.LineBasicMaterial({
          color:options.currentColor}),
        THREE.LineStrip);
      scene.add(currentStroke);
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
      prevPos = null;
    }
  }
  
  /*function onKeyDown(event){
    if (event.keyCode == keyCode){
      doRenderCubeMap = true;
    }
  }*/
  
  var mouseDownCallback = function(e){
    scope.onMouseDown(e);
  }
  
  var mouseMoveCallback = function(e){
    scope.onMouseMove(e);
  }
  
  var mouseUpCallback = function(e){
    scope.onMouseUp(e);
  }
  
  /*var keyDownCallback = function(e){
    scope.onKeyDown(e);
  }*/
  
  function bind(mouseButton_,  domElement_){
    mouseButton = mouseButton_;
    //keyCode = key_.charCodeAt(0);
    domElement = domElement_;
    domElement.addEventListener('mousedown', mouseDownCallback, false);
    domElement.addEventListener('mousemove', mouseMoveCallback, false);
    domElement.addEventListener('mouseup', mouseUpCallback, false);
    //document.addEventListener('keydown', keyDownCallback, false);
  }
  
  function unBind(){
    domElement.removeEventListener('mousedown', mouseDownCallback);
    domElement.removeEventListener('mousemove', mouseMoveCallback);
    domElement.removeEventListener('mouseup', mouseUpCallback);
    //document.removeEventListener('keydown', keyDownCallback);
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
  //this.onKeyDown = onKeyDown;
}