import * as THREE from './three/build/three.module.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import { ObjectLoader } from './three/build/three.module.js';
import { DRACOLoader } from './three/examples/jsm/loaders/DRACOLoader.js';

function main() {
    let gltf;
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

    {
        // =======>Map<======= \\

        // const planeSize = 0;

        // const loader = new THREE.TextureLoader(manager);
        // const texture = loader.load('./can/1.jpg');
        // texture.wrapS = THREE.RepeatWrapping;
        // texture.wrapT = THREE.RepeatWrapping;
        // texture.magFilter = THREE.NearestFilter;
        // texture.image = './can/bandothegioi.jpg';
        // texture.name = 'can';
        // const repeats = planeSize / 2;
        // texture.repeat.set(1, 1, 1);
        // // console.log('texture', texture);
        // const planeGeo = new THREE.PlaneGeometry(1, 1, 1);
        // const color = new THREE.Color(1, 1, 1);
        // const planeMat = new THREE.MeshPhongMaterial({
        //     color: color,
        //     map: texture,
        //     side: THREE.DoubleSide,
        //     emissive: 0XFF0000
        // });
        // console.log('planMap', planeMat);
        // const mesh = new THREE.Mesh(planeGeo, planeMat);
        // mesh.rotation.x = Math.PI * -.50;
        // scene.add(mesh);
    }

    {
        const skyColor = 0xffffff;
        const groundColor = 0xcccccc;
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
            const gltfLoad = new GLTFLoader();
            gltfLoad.load('./can/can.gltf', function(gltf) {
                gltf.scene.traverse(function(child) {
                    if (child.isMesh) {
                        child.material.envMap;
                    }
                });
                scene.add(gltf.scene);
                console.log('object');
                gltf.scene.position.y = -95;
                scene.add(gltf.scene);
                renderer.render(scene, camera);
                console.log(gltfLoad)
            });

        }

        function addImageBitmap() {
            new THREE.ImageBitmapLoader()
                .setOptions({ imageOrientation: 'none' })
                .load('./can/bandothegioi.jpg', function(imageBitmap) {

                    const texture = new THREE.CanvasTexture(imageBitmap);
                    const material = new THREE.MeshPhongMaterial({
                        map: texture,
                        transparent: true,
                        aoMap: 1,
                        alphaMap: 'white',
                        emissive: 150,
                        lightMap: 1

                    });
                    console.log(material);
                    /* ImageBitmap should be disposed when done with it
                       Can't be done until it's actually uploaded to WebGLTexture */

                    // imageBitmap.close();

                    addCube(material);

                }, function(p) {

                    console.log(p);

                }, function(e) {

                    console.log(e);

                });

        }


        const manager = new THREE.LoadingManager(addImageBitmap);

        manager.onProgress = function(item, loaded, total) {

            // console.log('stt: ', loaded, item, total);

        };

        // texture
        // const cvtexture = new THREE.CanvasTexture(canvas);
        const texture = new THREE.TextureLoader().load(
            './can/can.gltf'
        );
        const material = new THREE.MeshBasicMaterial({ map: texture })

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.image = './can/1.jpg';
        texture.name = 'lon-bia';
        texture.repeat.set(4, 4);
        // model

        function onProgress(xhr) {

            if (xhr.lengthComputable) {

                const percentComplete = xhr.loaded / xhr.total * 100;
                // console.log('model ' + Math.round(percentComplete, 2) + '% downloaded');

            }

        }

        function onError() {

        }

        const gltfLoader = new GLTFLoader(manager);
        gltfLoader.load('./can/can.gltf', (image) => {
            const texture = new THREE.CanvasTexture(image);
            const root = image.scene;
            // console.log(texture);
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


// ==============================================

// let camera, scene, renderer;
// let group, cubes;

// init();
// animate();

// function addImageBitmap() {

//     new THREE.ImageBitmapLoader()
//         .setOptions({ imageOrientation: 'none' })
//         .load('./can/1.png?', function(imageBitmap) {

//             const texture = new THREE.CanvasTexture(imageBitmap);
//             const material = new THREE.MeshBasicMaterial({ map: texture });

//             /* ImageBitmap should be disposed when done with it
//                Can't be done until it's actually uploaded to WebGLTexture */

//             // imageBitmap.close();

//             addCube(material);

//         }, function(p) {
//             console.log(p);

//         }, function(e) {

//             console.log(e);

//         });

// }

// function addImage() {

//     new THREE.ImageLoader()
//         .setCrossOrigin('*')
//         .load('./can/1.jpg', function(image) {
//             const texture = new THREE.CanvasTexture(image);
//             console.log(texture);
//             const material = new THREE.MeshBasicMaterial({
//                 color: 0xffffff,
//                 map: texture
//             });

//             addCube(material);



//         });



// }



// const geometry = new THREE.BoxGeometry(1, 1, 1);

// function addCube(material) {

//     const cube = new THREE.Mesh(geometry, material);
//     cube.position.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
//     cube.rotation.set(Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI);
//     cubes.add(cube);

// }

// function init() {

//     const container = document.createElement('div');
//     document.body.appendChild(container);


//     // CAMERA

//     camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1500);
//     camera.position.set(0, 4, 7);
//     camera.lookAt(0, 0, 0);

//     // SCENE

//     scene = new THREE.Scene();

//     //

//     group = new THREE.Group();
//     scene.add(group);

//     cubes = new THREE.Group();
//     group.add(cubes);

//     // RENDERER

//     renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setPixelRatio(window.devicePixelRatio);
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     container.appendChild(renderer.domElement);

//     // TESTS

//     // setTimeout(addImage, 300);
//     addImage();
//     // EVENTS

//     window.addEventListener('resize', onWindowResize);

// }

// function onWindowResize() {

//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();

//     renderer.setSize(window.innerWidth, window.innerHeight);

// }

// function animate() {

//     group.rotation.y = performance.now() / 3000;

//     renderer.render(scene, camera);

//     requestAnimationFrame(animate);

// }