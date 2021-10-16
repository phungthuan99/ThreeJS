import * as THREE from './three/build/three.module.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import { ObjectLoader } from './three/build/three.module.js';
import { DRACOLoader } from './three/examples/jsm/loaders/DRACOLoader.js';

function main() {
    let gltf;
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ canvas });

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.x = 1;
    camera.position.set(1, 0, 1);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(1, 1, 1);
    controls.update();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f4f4f4');


    {
        // const planeSize = 0;

        // const loader = new THREE.TextureLoader(manager);
        // const texture = loader.load('./can/1.jpg');
        // // texture.wrapS = THREE.RepeatWrapping;
        // // texture.wrapT = THREE.RepeatWrapping;
        // texture.magFilter = THREE.NearestFilter;
        // const repeats = planeSize / 2;
        // texture.repeat.set(1, 1, 1);

        // const planeGeo = new THREE.PlaneGeometry(1, 1, 1);
        // const planeMat = new THREE.MeshPhongMaterial({
        //     map: texture,
        //     side: THREE.DoubleSide,
        // });
        // const mesh = new THREE.Mesh(planeGeo, planeMat);
        // mesh.rotation.x = Math.PI * -.50;
        // scene.add(mesh);
    }

    {
        const skyColor = 0xffffff; // light blue
        const groundColor = 0xcccccc; // brownish orange
        const intensity = 1;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    }

    {
        const color = 0xDDDDDD;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity, 1);
        light.position.set(0, 1, 1);
        scene.add(light);
        scene.add(light.target);
    }

    function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
        const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
        const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
        const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
        // compute a unit vector that points in the direction the camera is now
        // in the xz plane from the center of the box
        const direction = (new THREE.Vector3())
            .subVectors(camera.position, boxCenter)
            .multiply(new THREE.Vector3(1, 1, 1))
            .normalize();

        // move the camera to a position distance units way from the center
        // in whatever direction the camera was from the center already
        camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

        // pick some near and far values for the frustum that
        // will contain the box.
        camera.near = boxSize / 100;
        camera.far = boxSize * 100;

        camera.updateProjectionMatrix();

        // point the camera to look at the center of the box
        camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
    }

    {

        function loadModel() {

            gltf.scene.traverse(function(child) {

                if (child.isMesh) child.material.map = texture;

            });

            gltf.scene.position.y = -95;
            scene.add(gltf);
            renderer.render(scene, camera);

        }

        const manager = new THREE.LoadingManager(loadModel);

        manager.onProgress = function(item, loaded, total) {

            console.log('4->', item);

        };

        // texture
        // const cvtexture = new THREE.CanvasTexture(canvas);
        const textureLoader = new THREE.TextureLoader(manager);
        const texture = textureLoader.load('./can/1.jpg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);

        // model

        function onProgress(xhr) {

            if (xhr.lengthComputable) {

                const percentComplete = xhr.loaded / xhr.total * 100;
                console.log('model ' + Math.round(percentComplete, 2) + '% downloaded');

            }

        }

        function onError() {}
        const loader = new GLTFLoader(manager);
        loader.load('./can/can.gltf', function(gltfload) {

            gltf = gltfload;

        }, onProgress, onError);

        const gltfLoader = new GLTFLoader(manager);
        gltfLoader.load('./can/can.gltf', (gltf) => {
            const root = gltf.scene;
            scene.add(root);

            // compute the box that contains all the stuff
            // from root and below
            const box = new THREE.Box3().setFromObject(root);

            const boxSize = box.getSize(new THREE.Vector3()).length();
            const boxCenter = box.getCenter(new THREE.Vector3());

            // set the camera to frame the box
            frameArea(boxSize * 2, boxSize, boxCenter, camera);

            // update the Trackball controls to handle the new size
            controls.maxDistance = boxSize * 20;
            controls.target.copy(boxCenter);
            controls.update();
        });
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

}

main();