import * as THREE from './three/build/three.module.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import { ObjectLoader } from './three/build/three.module.js';
import { DRACOLoader } from './three/examples/jsm/loaders/DRACOLoader.js';

let gltf, cubes;

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ canvas });
    canvas.addEventListener('mousedown', () => {
        canvas.style.cursor = 'grabbing';
    });
    canvas.addEventListener('mouseup', () => {
        canvas.style.cursor = 'grab';
    });
    canvas.addEventListener('mouseover', () => {
        canvas.style.cursor = 'grab';
    })
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
            .multiply(new THREE.Vector3(1, 1, 1))
            .normalize();

        camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

        camera.near = boxSize / 100;
        camera.far = boxSize * 100;
        camera.updateProjectionMatrix();

        camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
    }

    {
        function addImageBitmap() {
            const pictureImage = new THREE.ImageBitmapLoader();
            pictureImage.setOptions({ imageOrientation: 'flipY' })
                .load('./can/bandothegioi.jpg', function(imageBitmap) {
                    const texture = new THREE.CanvasTexture(imageBitmap);
                    const material = new THREE.MeshPhongMaterial({
                        map: texture,
                        color: 0x00ffff,
                        emissive: 0xffffff
                    });
                    addCube(material);
                }, function(p) {
                    console.log('Process: ', p);
                }, function(e) {
                    console.log('Errors: ', e);
                });

        }

        const geometry = new THREE.BoxGeometry(1, 1, 1);

        function addCube(material) {
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
        }



        const manager = new THREE.LoadingManager(addImageBitmap);

        manager.onProgress = function(item, loaded, total) {

            // console.log('stt: ', loaded, item, total);

        };

        function onProgress(xhr) {

            if (xhr.lengthComputable) {

                const percentComplete = xhr.loaded / xhr.total * 100;
                // console.log('model ' + Math.round(percentComplete, 2) + '% downloaded');

            }

        }

        function onError(e) {
            console.log(e)
        }

        new GLTFLoader(manager)
            .load('./can/can.gltf', (image) => {
                const texture = new THREE.CanvasTexture(image);
                // console.log('image', image);
                const root = image.scene;
                // console.log('extured', texture);
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
            }, onProgress, onError);
    }
    const loading = new GLTFLoader();
    const model = new THREE.Object3D();
    const url = './can/can.gltf';
    loading.load(url, (gltf) => {
            gltf.scene = model;
            model.name = 'model';
            scene.add(model);
            model.position.set(1, 1, 1);
            console.log('DumpObject 👉🏿 ', dumpObject(model).join('\n'));
        },
        function(e) {
            console.log(e)
        },
        function(e) {
            console.log(e)
        });


    function dumpObject(obj, lines = [], isLast = true, prefix = '') {
        const localPrefix = isLast ? '└─' : '├─';
        lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
        const newPrefix = prefix + (isLast ? '  ' : '│ ');
        const lastNdx = obj.children.length - 1;
        obj.children.forEach((child, ndx) => {
            const isLast = ndx === lastNdx;
            dumpObject(child, lines, isLast, newPrefix);
        });
        return lines;
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