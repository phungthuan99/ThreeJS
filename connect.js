import * as THREE from './assets/JS/three.module.js';
import { GLTFLoader } from './assets/JS/GLTFLoader.js';
import { OrbitControls } from './assets/JS/OrbitControls.js';

let texture_material, image_img;

function main() {
    const canvas = document.querySelector('#c');
    const _click = document.querySelector('#click');
    _click.addEventListener('click', changeImage, false);

    function changeImage(e) {
        const chk = new PointerEvent(changeImage);
        console.log('ba', chk);
        const url = './can/circle.png';
        return url;
    }
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
        75,
        window.innerWidth / window.innerHeight,
        1,
        1000
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
        scene.add(light);
    }

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
        const loading = new GLTFLoader();
        image_img = './can/circle.png';
        loading.load('./can/can.gltf', (gltf) => {
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load(image_img);
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
                            color: 0x999999,
                            map: material_c.map,
                            transparent: true
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
        }, onProgress, onError);
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