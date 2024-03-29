import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import * as lil from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

{
    const animationContainer = document.querySelector("#loader")

    // Loader
    const textureLoader = new THREE.TextureLoader()
    // const landMatcap = textureLoader.load('/textures/matcaps/7-test.png')
    const seaMatcap = textureLoader.load('/textures/matcaps/11.png')

    // Canvas
    // Canvas Globe
    const canvas = document.querySelector(".webgl")

    // Scene
    const scene = new THREE.Scene()

    let globe = new THREE.Group()
    var object = new THREE.Object3D()
    let startAnimation = false
    const gltfLoader = new GLTFLoader()
    gltfLoader.load('/models/low_poly_earth1.glb',
        (data) => {
            // on Loaded
            object = data.scene
            object.position.set(0, -0.1, 0)
            // console.log(object.children);
            globe = object.children[0]
            // globe.position.set(0, 0, 0)
            scene.add(object)
            globe.children[1].scale.set(1.045, 1.045, 1.045)
            globe.children[0].material.map = seaMatcap
            globe.children[1].material.color.setHex(0xC3ED18)
            // globe.children[1].material.color.setHex(0xA5ED17)
            // globe.children[0].material.color.setHex(0x0000ff)
            globe.children[0].material.roughness = 0.98
            globe.children[1].material.roughness = 0.93

            setInterval(() => {
                animationContainer.classList.add('hidden')
            }, 1000);
            parameters.zoom()
        },
        () => {
            animationContainer.classList.remove('hidden')
        })



    // Utils
    const displayText = (heading, subHeading) => {

        // const title = document.createElement("h4")
        // title.innerHTML = "A message from Country"
        // title.classList.add("connection_message")
        // document.body.appendChild(title)

        const title = document.querySelector(".connection_message")
        gsap.fromTo(title.style, {
            opacity: 0
        },
            {
                duration: 5,
                ease: "power2.in",
                opacity: 100,
                onComplete: () => {
                    gsap.to(title.style, {
                        duration: 7,
                        ease: "power2.out",
                        opacity: 0,
                    })
                }
            })
    }

    document.querySelector('button.simulate').addEventListener("click", () => {
        parameters.animate()
    })
    // GUI
    const gui = new lil.GUI()

    if (window.location.hash != "#debug") {
        gui.hide()
        document.querySelector('button.simulate').hide
    }


    let tween = null
    let tween2 = null
    let startUpdates = false
    const parameters = {
        color: 0xff0000,
        toggleAnimation: () => {
            startAnimation = !startAnimation
        },
        toggleGlobe: () => {
            globe.visible = !globe.visible
        },
        revolve: () => {
            tween2 = gsap.to(object.rotation,
                {
                    repeat: -1,
                    duration: 26,
                    ease: "none",
                    y: Math.PI * 2
                    // x: object.rotation.x + Math.PI * 0.1
                })
        },
        animate: () => {

            displayText("Text", "Sub Text")

            const country = "australai"
            var p = object.getObjectByName(country).getWorldPosition(new THREE.Vector3())
            // console.log(p);

            tween = gsap.to(camera.position,
                {
                    x: () => {
                        const result = (p.x < 0) ? p.x - 3 : p.x + 3;
                        return result
                    },
                    y: () => {
                        const result = (p.y < 0) ? p.y - 3 : p.y + 3;
                        return result
                    },
                    z: () => {
                        const result = (p.z < 0) ? p.z - 3 : p.z + 3;
                        return result
                    },
                    onUpdate: () => {
                        tween2.pause()
                        animatedRing.position.x = (p.x < 0) ? p.x - 0.1 : p.x + 0.1;
                        animatedRing.position.y = (p.y < 0) ? p.y - 0.1 : p.y + 0.1;
                        animatedRing.position.z = (p.z < 0) ? p.z - 0.1 : p.z + 0.1;
                        // animatedRing.lookAt(p)
                        animatedRing.rotation.z = Math.PI * 0.5
                        animatedRing.rotation.x = -Math.PI * 0.5
                        animatedRing.rotation.y = Math.PI * 0.5
                        // animatedRing.rotation.x = Math.PI * 0.5
                        animatedRing.visible = true
                    },
                    onComplete: () => {
                        tween2.resume()
                        animatedRing.visible = false

                        gsap.to(camera.position, {
                            x: 0,
                            y: 0,
                            z: 7.5,
                            duration: 6,
                            ease: "back.out(3.5)",
                            onComplete: () => {
                                camera.lookAt(object)
                            }
                        })
                    },
                    duration: 10,
                    ease: "back.out(4)"
                });
        },
        zoom: () => {
            gsap.fromTo(camera.position, {
                x: Math.random() * -3,
                y: Math.random() * -4,
                z: Math.random() * -2,
            }, {
                x: 0,
                y: 0,
                z: 7,
                duration: 4,
                ease: "back.out(2)",
                onStart: () => {
                    startUpdates = true
                    parameters.revolve()
                }
            })
        }
    }

    // GUI DEBUG
    // gui.add(parameters, 'toggleAnimation')
    gui.add(parameters, 'toggleGlobe')
    gui.add(parameters, 'animate')
    // gui.add(parameters, 'revolve')
    // gui.add(parameters, 'zoom')

    // Object
    const animatedRing = createAnimatedRings()
    animatedRing.scale.set(0.2, 0.2, 0.2)
    animatedRing.visible = false
    scene.add(animatedRing)

    // const tween3 = gsap.fromTo([animatedRing.children[0], animatedRing.children[1], animatedRing.children[2]], {
    //     opacity : [0,0,0]
    // },
    //     {

    //     })

    // gui.add(animatedRing, 'visible')
    var helper = new THREE.BoxHelper(animatedRing, 0xff0000);
    helper.update();
    helper.visible = false
    // If you want a visible bounding box
    scene.add(helper);

    // Light
    const lightGroup = createLightGroup()
    scene.add(lightGroup)

    // Camera
    const camera = new THREE.PerspectiveCamera(20, sizes.width / sizes.height)
    camera.position.z = 7
    scene.add(camera)

    // Controls
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(sizes.width, sizes.height)
    // renderer.setClearColor(0xC3E7F5, 1);


    document.getElementById('canvas').appendChild(renderer.domElement);
    // document.getElementById('canvas-globe').appendChild(renderer.domElement);
    renderer.render(scene, camera)

    const clock = new THREE.Clock()


    // Animations
    const tick = () => {
        // Clock
        const elapsedTime = clock.getElapsedTime()
        animateRing(animatedRing, elapsedTime)

        if (startUpdates) {
            controls.update()
        }
        renderer.render(scene, camera)
        window.requestAnimationFrame(tick)
    }

    tick()

    // Events
    window.addEventListener("resize", () => {
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight

        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio))
    })

}


function createLightGroup() {
    const lightGroup = new THREE.Group

    const ambientLight = new THREE.AmbientLight(0xffffff, 6)

    const pointLight1 = new THREE.PointLight(0xffffff, 2.8, 5, 1)
    pointLight1.position.set(-3, -2, 2)

    const pointLight3 = new THREE.PointLight(0xffffff, 1.5, 5, 1)
    pointLight3.position.set(3, 1, -1)

    const pointLight4 = new THREE.PointLight(0xffffff, 1.5, 5, 1)
    pointLight4.position.set(2, -2, -1)

    const pointLight2 = new THREE.PointLight(0xffffff, 2.9, 10)
    pointLight2.position.set(0, 0, 4)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(-10, 30, 50)

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight3.position.set(0, 30, -30)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight2.position.set(-30, -30, -50)

    const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)
    directionalLightHelper.visible = false

    const directionalLightHelper2 = new THREE.DirectionalLightHelper(directionalLight2)
    directionalLightHelper2.visible = false
    lightGroup.add(
        ambientLight,
        pointLight1,
        pointLight2,
        pointLight3,
        pointLight4,
        directionalLight,
        directionalLight2,
        directionalLight3,
        directionalLightHelper,
        directionalLightHelper2
    )
    return lightGroup
}


function createAnimatedRings() {
    const animatedRing = new THREE.Group()
    const ringl = new THREE.Mesh(
        new THREE.TorusBufferGeometry(1, 0.05, 32, 32),
        new THREE.MeshBasicMaterial({ color: 'white', transparent: true })
    )
    const ringm = new THREE.Mesh(
        new THREE.TorusBufferGeometry(0.7, 0.05, 32, 32),
        new THREE.MeshBasicMaterial({ color: 'white', transparent: true })
    )
    const rings = new THREE.Mesh(
        new THREE.TorusBufferGeometry(0.4, 0.05, 32, 32),
        new THREE.MeshBasicMaterial({ color: 'white', transparent: true })
    )
    ringl.rotation.x = Math.PI * 0.5
    ringl.scale.z = 0.4
    ringm.rotation.x = Math.PI * 0.5
    ringm.scale.z = 0.4
    rings.rotation.x = Math.PI * 0.5
    rings.scale.z = 0.4
    animatedRing.add(rings, ringm, ringl)

    return animatedRing
}

function animateRing(group, elapsedTime) {
    elapsedTime = elapsedTime * 1.5
    group.children[0].position.y = Math.abs(Math.cos(elapsedTime))
    group.children[0].material.opacity = 1 - group.children[0].position.y
    group.children[0].scale.x = 1 - group.children[0].material.opacity
    group.children[0].scale.y = 1 - group.children[0].material.opacity

    group.children[1].position.y = Math.abs(Math.cos(elapsedTime)) + 0.2
    group.children[1].material.opacity = 1 - group.children[1].position.y
    group.children[1].scale.x = 1 - group.children[1].material.opacity
    group.children[1].scale.y = 1 - group.children[1].material.opacity

    group.children[2].position.y = Math.abs(Math.cos(elapsedTime)) + 0.4
    group.children[2].material.opacity = 1 - group.children[2].position.y
    group.children[2].scale.x = 1 - group.children[2].material.opacity
    group.children[2].scale.y = 1 - group.children[2].material.opacity
}
