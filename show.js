import * as THREE from './three/build/three.module.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';



let camera, scene, renderer;
let group, cubes;

init();
animate();

function addImageBitmap() {
    new THREE.ImageBitmapLoader()
        .load('./can/bandothegioi.jpg', function(imageBitmap) {
                const texture = new THREE.CanvasTexture(imageBitmap);
                const material = new THREE.MeshBasicMaterial({ map: texture });
                console.log('texture', texture);
                /* ImageBitmap should be disposed when done with it
                    Can't be done until it's actually uploaded to WebGLTexture */

                // imageBitmap.close();

                addCube(material);

            },
            function(p) {

                console.log(p);

            },
            function(e) {

                console.log(e);

            });

}
addImageBitmap();

function addImage() {
    const loaderImage = new THREE.ImageBitmapLoader();
    loaderImage.load('./can/1.jpg', function(image) {

        const texture = new THREE.CanvasTexture(image);
        const material = new THREE.MeshBasicMaterial({ color: 0xff8888, map: texture });
        addCube(material);

    });

}

const geometry = new THREE.BoxGeometry(1, 1, 1);
console.log('geometry', geometry)

function addCube(material) {

    const cube = new THREE.Mesh(geometry, material);
    // cube.position.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    // cube.rotation.set(Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI);
    cubes.add(cube);

}

function init() {

    const container = document.createElement('div');
    document.body.appendChild(container);
    var canvas = document.querySelector('div');
    // CAMERA

    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(0, 1, 1);
    camera.position.z = 3;

    const controls = new OrbitControls(camera, canvas);
    // controls.target.set(0, 0, 1);
    controls.update();
    // camera.lookAt(1, 0, 1);
    scene = new THREE.Scene();
    group = new THREE.Group();
    scene.add(group);
    cubes = new THREE.Group();
    group.add(cubes);

    // RENDERER

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // TESTS

    setTimeout(addImage, 0);

    // EVENTS

    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    // group.rotation.y = performance.now() / 3000;

    renderer.render(scene, camera);

    requestAnimationFrame(animate);

}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function render() {

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);