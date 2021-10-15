import * as THREE from './three/build/three.module.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from './three/examples/jsm/loaders/DRACOLoader.js';

var obj;
const scene = new THREE.Scene();
const loader = new GLTFLoader();
const renderer = new THREE.WebGLRenderer();
const textrure = new THREE.TextureLoader();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
);
const controls = new OrbitControls(camera, renderer.domElement);
var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 3);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

loader.load('./can/can.gltf', function(glft) {
    obj = glft.scene;
    scene.add(glft.scene);
});
scene.background = new THREE.Color(0x999999);
scene.add(light);
camera.position.set(0, 0, 0.2);
controls.update();

function animate() {
    requestAnimationFrame(animate);
    // obj.rotation.y += 0.03;
    renderer.render(scene, camera);
    controls.update();
}
animate();