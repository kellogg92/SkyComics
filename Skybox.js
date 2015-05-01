Skybox = {};
Skybox.MakeSkybox = function(){
  var faceResolution = 1024;
  var material = new THREE.MeshBasicMaterial(
    { color: 0xFFFFFF,
      side: THREE.BackSide});
  var geo = new THREE.BoxGeometry(5000,5000,5000);
  var delta = -0.1 / faceResolution;
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