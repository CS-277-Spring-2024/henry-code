import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { createTextMesh } from './textMaker.js';
import Stats from 'three/addons/libs/stats.module.js';

const textureLoader = new THREE.TextureLoader(); 
const metalTexture = textureLoader.load
  ('/assets/textures/metal/metal_plate_ao_2k.jpg') // make sure this file exists!
metalTexture.wrapS = THREE.RepeatWrapping; // horizontal wrapping
metalTexture.wrapT = THREE.RepeatWrapping; // vertical wrapping
metalTexture.repeat.set( 1, 1); // how many times to repeat
metalTexture.side = THREE.DoubleSide;

const exrLoader = new EXRLoader()

const bumpMap = new THREE.TextureLoader().load(
  '/assets/textures/metal/metal_plate_disp_2k.png',
  (metalTexture) => {
    metalTexture.wrapS = THREE.RepeatWrapping; // horizontal wrapping
    metalTexture.wrapT = THREE.RepeatWrapping; // vertical wrapping
    metalTexture.repeat.set( 1, 1 ); // how many times to repeat
  }
)


const metalMaterial = new THREE.MeshPhongMaterial({ color:0x808080 })
metalMaterial.map = metalTexture
metalMaterial.bumpMap = bumpMap
metalMaterial.side = THREE.DoubleSide;
// basic scene setup
const scene = new THREE.Scene();
scene.backgroundColor = 0xffffff;

// setup camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
);
camera.position.x = 0;
camera.position.z = 0;
camera.position.y = 12;


// setup the renderer and attach to canvas
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
document.body.appendChild(renderer.domElement);

// add lights
scene.add(new THREE.AmbientLight(0xAAAAAA));

const light = new THREE.SpotLight(0xaaaaaa);
light.position.set(0, 23, 0);
light.castShadow = true;
light.intensity = 1;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 200;
light.shadow.camera.right = 10;
light.shadow.camera.left = -10;
light.shadow.camera.top = 10;
light.shadow.camera.bottom = -10;
light.shadow.mapSize.width = 512;
light.shadow.mapSize.height = 512;
light.shadow.radius = 4;
light.shadow.bias = -0.0005;

scene.add(light);

const group = new THREE.Group();

// create a very large ground plane
const groundGeometry = new THREE.PlaneGeometry(25, 25);
const groundMaterial = new THREE.MeshLambertMaterial({
  color: 0xffffff,
});
const groundMesh = new THREE.Mesh(groundGeometry, metalMaterial);
groundMesh.receiveShadow = true;
groundMesh.position.set(0, -2, 0);
groundMesh.rotation.set(Math.PI / -2, 0, 0);
scene.add(groundMesh);

const roofMesh = new THREE.Mesh(groundGeometry, metalMaterial);
roofMesh.receiveShadow = true;
roofMesh.position.set(0, 23, 0);
roofMesh.rotation.set(Math.PI / 2, 0, 0);
scene.add(roofMesh);

const wallMesh1 = new THREE.Mesh(groundGeometry, metalMaterial);
wallMesh1.receiveShadow = true;
wallMesh1.position.set(12.5, 10.5, 0);
wallMesh1.rotation.set(0, Math.PI / -2, 0);
scene.add(wallMesh1);

const wallMesh2 = new THREE.Mesh(groundGeometry, metalMaterial);
wallMesh2.receiveShadow = true;
wallMesh2.position.set(-12.5, 10.5, 0);
wallMesh2.rotation.set(0, Math.PI / 2, 0);
scene.add(wallMesh2);

const wallMesh3 = new THREE.Mesh(groundGeometry, metalMaterial);
wallMesh3.receiveShadow = true;
wallMesh3.position.set(0, 10.5, 12.5);
wallMesh3.rotation.set(0, Math.PI, Math.PI / -2);
scene.add(wallMesh3);

const wallMesh4 = new THREE.Mesh(groundGeometry, metalMaterial);
wallMesh4.receiveShadow = true;
wallMesh4.position.set(0, 10.5, -12.5);
wallMesh4.rotation.set(0,0, Math.PI / 2);
scene.add(wallMesh4);

scene.add(group);

var cameraDirection = 'Forward';
var cameraPosition = {z: 0, x: 0};
var lookingDown = false;

let raycaster;
let stats;

let INTERSECTED;

const pointer = new THREE.Vector2();

function onWKeyPressed() {
    if (lookingDown != true) {
        if ((cameraPosition.z == -1 && cameraDirection == 'Forward') ||  (cameraPosition.x == 1 && cameraDirection == 'Right') || (cameraPosition.x == -1 && cameraDirection == 'Left')) {
            // Create a quaternion to represent a 45-degree rotation around the camera's right vector
            const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / -4);

            // Apply the rotation to the camera's quaternion
            camera.quaternion.multiply(quaternion);

            // Update the camera's rotation
            camera.rotation.setFromQuaternion(camera.quaternion);
            lookingDown = true
        } 
        else if (cameraDirection == 'Forward'){
            cameraPosition.z-=1
        } else if (cameraDirection == 'Left'){
            cameraPosition.x-=1
        } else if (cameraDirection == 'Back'){
            cameraPosition.z+=1
        } else if (cameraDirection == 'Right'){
            cameraPosition.x+=1
        }
    }
    camera.position.z = cameraPosition.z * 8
    camera.position.x = cameraPosition.x * 8 //move this somewhere else idk
}

function onAKeyPressed() {
    if (cameraPosition.x == 0 && cameraPosition.z == 0) {
        // Create a quaternion to represent a 90-degree rotation around the up vector
        const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);

        // Apply the rotation to the camera's quaternion
        camera.quaternion.multiply(quaternion);

        // Update the camera's rotation
        camera.rotation.setFromQuaternion(camera.quaternion);

        if (cameraDirection == 'Forward'){
            cameraDirection = 'Left'
        } else if (cameraDirection == 'Left'){
            cameraDirection = 'Back'
        } else if (cameraDirection == 'Back'){
            cameraDirection = 'Right'
        } else if (cameraDirection == 'Right'){
            cameraDirection = 'Forward'
        }
    }
}

function onSKeyPressed() {
    if (lookingDown == true) {
        // Create a quaternion to represent a 45-degree rotation around the camera's right vector
        const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 4);

        // Apply the rotation to the camera's quaternion
        camera.quaternion.multiply(quaternion);
        
        // Update the camera's rotation
        camera.rotation.setFromQuaternion(camera.quaternion);
        lookingDown = false
    } 
    else if (cameraDirection == 'Forward' && cameraPosition.z != 1){
        cameraPosition.z+=1
    } else if (cameraDirection == 'Left' && cameraPosition.x != 1){
        cameraPosition.x+=1
    } else if (cameraDirection == 'Back' && cameraPosition.z != -1){
        cameraPosition.z-=1
    } else if (cameraDirection == 'Right' && cameraPosition.x != -1){
        cameraPosition.x-=1
    }
    camera.position.z = cameraPosition.z * 8
    camera.position.x = cameraPosition.x * 8
}

function onDKeyPressed() {
    if (cameraPosition.x == 0 && cameraPosition.z == 0) {
        const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);

        // Apply the rotation to the camera's quaternion
        camera.quaternion.multiply(quaternion);

        // Update the camera's rotation
        camera.rotation.setFromQuaternion(camera.quaternion);

        if (cameraDirection == 'Forward'){
            cameraDirection = 'Right'
        } else if (cameraDirection == 'Left'){
            cameraDirection = 'Forward'
        } else if (cameraDirection == 'Back'){
            cameraDirection = 'Left'
        } else if (cameraDirection == 'Right'){
            cameraDirection = 'Back'
        }
    }
}

// Event listeners for key presses
window.addEventListener('keydown', function(event) {
    switch(event.key) {
        case 'w':
        case 'W':
            onWKeyPressed();
            break;
        case 'a':
        case 'A':
            onAKeyPressed();
            break;
        case 's':
        case 'S':
            onSKeyPressed();
            break;
        case 'd':
        case 'D':
            onDKeyPressed();
            break;
    }
});


window.addEventListener('mousemove', function(event) {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
});

// Initialize MTLLoader
const mtlLoader = new MTLLoader();

// Table from womp
const tableobjLoader = new OBJLoader();
mtlLoader.load('/assets/models/table/table.mtl', function(materials) {
    materials.preload();

    // Initialize OBJLoader
    tableobjLoader.setMaterials(materials); // Set the loaded materials to OBJLoader
    tableobjLoader.load('/assets/models/table/table.obj', function(object) {
        object.scale.set(0.05, 0.05, 0.05); // Scale to half size in all dimensions
        scene.add(object);
        object.position.set(10, 2, 0); // Adjust position if needed
    });
});

// c4 from womp
const c4objLoader = new OBJLoader();
mtlLoader.load('/assets/models/c4/c4.mtl', function(materials) {
    materials.preload();

    // Initialize OBJLoader
    c4objLoader.setMaterials(materials); // Set the loaded materials to OBJLoader
    c4objLoader.load('/assets/models/c4/c4.obj', function(object) {
        object.scale.set(0.01, 0.01, 0.01); // Scale to half size in all dimensions
        scene.add(object);
        object.position.set(0, 8, -12.5); // Adjust position if needed
        object.rotation.set(Math.PI / 2, -Math.PI / 2, 0);
    });
});

const myText = createTextMesh('TEST',20, 0xFFFFFF, scene)
console.log(myText)

const geometry = new THREE.BoxGeometry();
const box_mesh = new THREE.MeshLambertMaterial( { color: 0xFFFFFF} )

for ( let i = 0; i < 3; i ++ ) {
    for ( let j = 0; j < 3; j ++ ) {
        const object = new THREE.Mesh( geometry, box_mesh);

        object.position.x = i*0.8-1.1;
        object.position.y = 6.2+j*0.8;
        object.position.z = -11.7;

        object.scale.x = 0.5;
        object.scale.y = 0.5;
        object.scale.z = 0.6;

        scene.add( object );
    }
}

raycaster = new THREE.Raycaster();

stats = new Stats();



// render the scene
function animate() {
    requestAnimationFrame(animate);

	render();
	stats.update();
}


function render() {


	camera.updateMatrixWorld();

	// find intersections

	raycaster.setFromCamera( pointer, camera );

	const intersects = raycaster.intersectObjects( scene.children, false );
    
	if ( intersects.length > 0 ) {

		if ( INTERSECTED != intersects[ 0 ].object ) {

			if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

			INTERSECTED = intersects[ 0 ].object;
			INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
			INTERSECTED.material.emissive.setHex( 0xff0000 );

		}

	} else {

		if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

		INTERSECTED = null;

	}

	renderer.render( scene, camera );

}


animate();