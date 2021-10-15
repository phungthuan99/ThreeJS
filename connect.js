import * as THREE from './three/build/three.module.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import { ObjectLoader } from './three/build/three.module.js';
import { DRACOLoader } from './three/examples/jsm/loaders/DRACOLoader.js';

var obj;
const scene = new THREE.Scene();
const loader = new GLTFLoader();
const renderer = new THREE.WebGLRenderer();
const textrure = new THREE.TextureLoader();
const blobs = { './can/can.gltf': 'blob1', './can/01.png0': 'blob2', './can/02.png': 'blob3' }
console.log(blobs);
let object;
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
);
const controls = new OrbitControls(camera, renderer.domElement);
var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 3);
init();
animate();

function init() {

    function loadModel() {

        object.traverse(function(child) {

            if (child.isMesh) child.material.map = texture;

        });

        object.position.y = -95;
        scene.add(object);

    }

    const manager = new THREE.LoadingManager();
    const objectUrls = [];
    manager.setURLModifier((url) => {
        url = URL.createObjectURL(blobs[url]);
        objectUrls.push(url);
        return url;
    });



    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    loader.load('./can/can.gltf', function(glft) {
        scene.add(glft.scene);
        objectUrls.forEach((url) => URL.revokeObjectURL(url));
    });

    scene.background = new THREE.Color(0xcccccc);
    scene.add(light);
    camera.position.set(0, 0, 0.2);
    controls.update();

}

function animate() {
    requestAnimationFrame(animate);
    // obj.rotation.y += 0.03;
    renderer.render(scene, camera);
    controls.update();
}
animate();