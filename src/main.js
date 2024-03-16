import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { createTextMesh } from './textMaker.js';
import { pass } from "three/examples/jsm/nodes/Nodes.js";
import { transpile } from "typescript";

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

const light = new THREE.PointLight( 0xff0000, 1, 100 );
light.position.set( 0, 15, -11 );
light.castShadow = true;
scene.add( light );
// light.intensity = 1;
// light.shadow.camera.near = 0.1;
// light.shadow.camera.far = 200;
// light.shadow.camera.right = 10;
// light.shadow.camera.left = -10;
// light.shadow.camera.top = 10;
// light.shadow.camera.bottom = -10;
// light.shadow.mapSize.width = 512;
// light.shadow.mapSize.height = 512;
// light.shadow.radius = 4;
// light.shadow.bias = -0.0005;




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


var cameraDirection = 'Forward';
var cameraPosition = {z: 0, x: 0};
var lookingDown = false;

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

// const myText = createTextMesh('TEST',20, 0xFFFFFF, scene)
// console.log(myText)

let inputCode = []



function newNumber(number) {
    if (inputCode.length < 5) { 
        let newPos = new THREE.Vector3
        newPos.x = -1.6+inputCode.length*0.5
        newPos.y = 9.4
        newPos.z = -11.5 
        inputCode.push(createTextMesh(String(number),10,0x808080, newPos, scene))
    }
}

function deleteNumber() {

} 

//buttons made with code from

//https://codesandbox.io/p/sandbox/basic-threejs-example-with-re-use-dsrvn?file=%2Fsrc%2Findex.js%3A69%2C1-122%2C3

// state
let width = 0
let height = 0
let intersects = []
let hovered = {}
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

class Cube extends THREE.Mesh {
    constructor(number, color) {
      super()
      this.geometry = new THREE.BoxGeometry()
      this.material = new THREE.MeshLambertMaterial({ color: color, opacity:0, transparent:true })
      this.cubeSize = 0
      
      this.number = number
    }
  
    render() {
    }
  
    onPointerOver(e) {
        this.material.opacity=0.5
        console.log('over')
    }
  
    onPointerOut(e) {
        this.material.opacity = 0
        console.log('not over anymore')
    }
  
    onClick(e) {
        console.log(this.number)
        newNumber(this.number)
    }
  }

const blocker = new THREE.Mesh
blocker.geometry = new THREE.BoxGeometry()
blocker.material = new THREE.MeshLambertMaterial({ color: 0x00FF00 })
blocker.position.x = -0.5
blocker.position.y = 9.6
blocker.position.z = -11.7
blocker.scale.x = 2.5
blocker.scale.y = 0.77
blocker.scale.z = 0.2
scene.add(blocker)

for ( let i = 0; i < 3; i ++ ) {
    for ( let j = 0; j < 3; j ++ ) {
        const object = new Cube(7-(3*j)+i, 0xff0000);

        object.position.x = i*0.75-1.05;
        object.position.y = 6.1+j*0.82;
        object.position.z = -11.7;

        object.scale.x = 0.56;
        object.scale.y = 0.56;
        object.scale.z = 0.6;

        scene.add( object );
    }
}

// responsive
function resize() {
    width = window.innerWidth
    height = window.innerHeight
    camera.aspect = width / height
    const target = new THREE.Vector3(0, 0, 0)
    const distance = camera.position.distanceTo(target)
    const fov = (camera.fov * Math.PI) / 180
    const viewportHeight = 2 * Math.tan(fov / 2) * distance
    const viewportWidth = viewportHeight * (width / height)
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    scene.traverse((obj) => {
      if (obj.onResize) obj.onResize(viewportWidth, viewportHeight, camera.aspect)
    })
  }
window.addEventListener('resize', resize)
resize()

// events
window.addEventListener('pointermove', (e) => {
mouse.set((e.clientX / width) * 2 - 1, -(e.clientY / height) * 2 + 1)
raycaster.setFromCamera(mouse, camera)
intersects = raycaster.intersectObjects(scene.children, true)

// If a previously hovered item is not among the hits we must call onPointerOut
Object.keys(hovered).forEach((key) => {
    const hit = intersects.find((hit) => hit.object.uuid === key)
    if (hit === undefined) {
    const hoveredItem = hovered[key]
    if (hoveredItem.object.onPointerOver) hoveredItem.object.onPointerOut(hoveredItem)
    delete hovered[key]
    }
})

intersects.forEach((hit) => {
    // If a hit has not been flagged as hovered we must call onPointerOver
    if (!hovered[hit.object.uuid]) {
    hovered[hit.object.uuid] = hit
    if (hit.object.onPointerOver) hit.object.onPointerOver(hit)
    }
    // Call onPointerMove
    if (hit.object.onPointerMove) hit.object.onPointerMove(hit)
})
})

window.addEventListener('click', (e) => {
intersects.forEach((hit) => {
    // Call onClick
    if (hit.object.onClick) hit.object.onClick(hit)
})
})


// render the scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    for (let i = 0; i < inputCode.length; i++) {
        console.log(inputCode[i])
    }

}
animate();