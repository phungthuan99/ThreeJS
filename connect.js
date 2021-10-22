import * as THREE from './three/build/three.module.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import { ObjectLoader } from './three/build/three.module.js';
import { DRACOLoader } from './three/examples/jsm/loaders/DRACOLoader.js';

let gltf, cubes, material, texture_material;

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ canvas });
    canvas.addEventListener('mousedown', (e) => {
        // console.log(e.clientX, e.clientY);
        canvas.style.cursor = 'grabbing';
    });
    canvas.addEventListener('mouseup', (e) => {
        canvas.style.cursor = 'grab';
    });
    canvas.addEventListener('mouseover', (e) => {
        canvas.style.cursor = 'grab';
    });
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.set(1, 0, 1);
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(1, 1, 1);
    controls.update();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F6F6F6');
    const manager = new THREE.LoadingManager();
    // console.log('manager', manager);
    {
        const skyColor = 0xffffff;
        const groundColor = 0xffffff;
        const intensity = 1;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    } {
        const ambientlight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientlight);
    } {
        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1);
        scene.add(light);
    }

    function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
        const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
        const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
        const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
        // compute a unit vector that points in the direction the camera is now
        // in the xz plane from the center of the box
        const direction = (new THREE.Vector3())
            .subVectors(camera.position, boxCenter)
            .multiply(new THREE.Vector3(0, 0, 1))
            .normalize();
        camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
        camera.near = boxSize / 100;
        camera.far = boxSize * 100;
        camera.updateProjectionMatrix();

        camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
    }

    {
        function onProgress(xhr) {
            if (xhr.lengthComputable) {

                const percentComplete = xhr.loaded / xhr.total * 100;
                // console.log('model ' + Math.round(percentComplete, 2) + '% downloaded');
            }
        }

        function onError(e) {
            // console.log('Error', e)
        };
        const loading = new GLTFLoader();
        loading.load('./can/can.gltf', (gltf) => {
            const textureLoader = new THREE.TextureLoader(manager);
            const texture = textureLoader.load('./can/bcc.jpg');
            // console.log(texture);
            const root = gltf.scene;
            scene.add(root);
            root.traverse((obj) => {
                if (obj.isMesh) {
                    let textureImg = obj,
                        material_c = textureImg.material;
                    material_c.map = texture;
                    console.log('debug', material_c);
                    let material_n = new THREE.MeshPhongMaterial({
                        color: 0x999999,
                        map: material_c.map,
                        transparent: true
                    });
                    texture_material = material_n;
                    texture_material.needsUpdate = true;
                    textureImg.material = material_n;
                }
            });
            root.updateMatrixWorld();
            const box = new THREE.Box3().setFromObject(root);
            const boxSize = box.getSize(new THREE.Vector3()).length();
            const boxCenter = box.getCenter(new THREE.Vector3());
            frameArea(boxSize * 2, boxSize, boxCenter, camera);
            controls.maxDistance = boxSize * 20;
            controls.target.copy(boxCenter);
            controls.update();
        }, onProgress, onError);
    }
    const loading = new GLTFLoader();
    const model = new THREE.Object3D();
    const url = './can/can.gltf';
    loading.load(url, (gltf) => {
            gltf.scene = model;
            // console.log(model)
            model.name = 'model';
            scene.add(model);
            model.position.set(1, 1, 1);
        },
        function(e) {
            // console.log('onProcess', e)
        },
        function(e) {
            // console.log('onError', e)
        });

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