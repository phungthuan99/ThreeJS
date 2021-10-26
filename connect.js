import * as THREE from './assets/JS/three.module.js';
import { GLTFLoader } from './assets/JS/GLTFLoader.js';
import { OrbitControls } from './assets/JS/OrbitControls.js';
import { OBJLoader } from './assets/JS/OBJLoader.js'

let texture_material;

function main() {
    const canvas = document.querySelector('#c');

    const renderer = new THREE.WebGLRenderer({ canvas });

    canvas.addEventListener('mousedown', (e) => {
        canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('mouseup', (e) => {
        canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('mouseover', (e) => {
        canvas.style.cursor = 'grab';
    });

    const camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        2000
    );

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(1, 1, 1);
    controls.update();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F6F6F6');

    {
        const skyColor = 0xffffff;
        const groundColor = 0xffffff;
        const intensity = 1;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    } {
        const ambientlight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientlight);
    } {
        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(10, 100, 100);
        scene.add(light.target);
    } {
        const pointLight = new THREE.PointLight(0xffffff, 1);
        camera.add(pointLight);
        scene.add(camera);
    }

    function loadingObjectModel(url_obj, image) {
        let object;
        const manager = new THREE.LoadingManager(loadModel);
        manager.onProgress = function(item, loaded, total) {};

        function onError() {}

        function onProgress(xhr) {
            if (xhr.lengthComputable) {
                const percentComplete = xhr.loaded / xhr.total * 100;
                console.log('model ' + Math.round(percentComplete, 2) + '% downloaded');
            }
        }
        const textureLoader = new THREE.TextureLoader(manager);
        const texture = textureLoader.load(image);

        function loadModel() {

            object.traverse(function(child) {

                if (child.isMesh) {
                    console.log(child)
                    child.material.map = texture;
                }

            });

            object.position.y = -95;
            scene.add(object);

        }
        const loader = new OBJLoader(manager);
        loader.load(url_obj, function(obj) {
            object = obj;
        }, onProgress, onError);

    }

    function loadingGLTFModel(object, image) {
        const loading = new GLTFLoader();
        loading.load(object, (gltf) => {
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load(image);
            texture.image = image;
            texture.flipY = false;
            const root = gltf.scene;
            scene.add(root);
            root.rotation.set(0, 1.5, 0);
            root.traverse((obj) => {
                if (obj.isMesh) {
                    if (obj.name == 'label') {
                        let textureImg = obj,
                            material_c = textureImg.material;
                        material_c.map = texture;
                        let material_n = new THREE.MeshPhongMaterial({
                            color: 0xfcfcfc,
                            map: texture,
                            transparent: 0xffffff
                        });
                        texture_material = material_n;
                        texture_material.needsUpdate = true;
                        textureImg.material = material_n;
                    }
                    if (obj.name == 'MeshPhongMasterial') {
                        texture.flipY = false;
                        let textureImg = obj,
                            material_c = textureImg.material;
                        material_c.map = texture;
                        let material_n = new THREE.MeshPhongMaterial({
                            color: 0xffffff,
                            map: texture,
                            transparent: 0x000000
                        });
                        texture_material = material_n;
                        texture_material.needsUpdate = true;
                        textureImg.material = material_n;
                    }
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
        });
    }

    function loading3DModel(url_obj) {
        const file_name = url_obj.split(/(\\|\/)/g).pop();
        const tmp_name = file_name.substring(file_name.lastIndexOf('.'));
        const image_img = window.frames[0].canvas.toDataURL('image/png', 1);
        if (tmp_name == '.obj') {
            loadingObjectModel(url_obj, image_img);
        }

        if (tmp_name == '.gltf') {
            loadingGLTFModel(url_obj, image_img);
        }

    }

    document.querySelector('#click').addEventListener('click', function() {
        loading3DModel('./can/shirt-2.obj');
    });

    function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
        const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
        const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
        const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
        const direction = (new THREE.Vector3())
            .subVectors(camera.position, boxCenter)
            .multiply(new THREE.Vector3(0, 0, 1))
            .normalize();

        camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
        camera.near = boxSize / 100;
        camera.far = boxSize * 100;
        camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
        camera.updateProjectionMatrix();
    }

    {
        function onProgress(xhr) {
            if (xhr.lengthComputable) {
                const percentComplete = xhr.loaded / xhr.total * 100;
            }
        }

        function onError(e) {

        };
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