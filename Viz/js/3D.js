var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(4, -15, 50);
camera.lookAt(-0.05, -0.1, -1);


var renderer = new THREE.WebGLRenderer();
renderer.setSize(600, 300); // Set the size based on your card's dimensions
const cardElement = document.getElementById('3dmodel');
cardElement.appendChild(renderer.domElement);


var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

var keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
keyLight.position.set(-100, 0, 100);

var fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
fillLight.position.set(100, 0, 100);

var backLight = new THREE.DirectionalLight(0xffffff, 1.0);
backLight.position.set(100, 0, -100).normalize();

scene.add(keyLight);
scene.add(fillLight);
scene.add(backLight);

var mtlLoader = new THREE.MTLLoader();
mtlLoader.setTexturePath('data/3D/');
mtlLoader.setPath('data/3D/');
mtlLoader.load('StarPlatinum.mtl', function (materials) {

    materials.preload();

    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('data/3D/');
    objLoader.load('StarPlatinum.obj', function (object) {

        scene.add(object);
        object.position.y -= 60;

    });

});

controls.addEventListener('change', function () {
  console.log('Camera Position:', camera.position.x, camera.position.y, camera.position.z);
  console.log('Camera LookAt:', camera.getWorldDirection(new THREE.Vector3()));
});


var animate = function () {
	requestAnimationFrame( animate );
	controls.update();
	renderer.render(scene, camera);
};

animate();

