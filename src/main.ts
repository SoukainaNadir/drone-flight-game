import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three-stdlib';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight);
camera.position.set(0, 3, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -10.85, 0) });

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0xFFF19B })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const groundBody = new CANNON.Body({ 
  mass: 0,
  shape: new CANNON.Plane()
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

let drone: THREE.Group;

const loader = new GLTFLoader();
loader.load('/Drone.glb', (gltf) => {
  drone = gltf.scene;
  drone.scale.set(3, 3, 3);
  drone.position.y = 5;
  scene.add(drone);
});

const droneBody = new CANNON.Body({
  mass: 1,
  shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.15, 0.5)),
  position: new CANNON.Vec3(0, 5, 0)
});
world.addBody(droneBody);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(10, 10, 10);
scene.add(sun);

const keys: { [key: string]: boolean } = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

function animate() {
  requestAnimationFrame(animate);
  
  world.step(1/60);
  
  const force = 15;
  if (keys['z']) droneBody.applyForce(new CANNON.Vec3(0, force, 0));
  
  if (keys['ArrowLeft']) droneBody.angularVelocity.y = 2;
  else if (keys['ArrowRight']) droneBody.angularVelocity.y = -2;
  else droneBody.angularVelocity.y *= 0.9;
  
  if (keys['ArrowUp']) {
    const dir = new CANNON.Vec3(0, 0, 10);
    droneBody.quaternion.vmult(dir, dir);
    droneBody.applyForce(dir);
  }
  if (keys['ArrowDown']) {
    const dir = new CANNON.Vec3(0, 0, -10);
    droneBody.quaternion.vmult(dir, dir);
    droneBody.applyForce(dir);
  }
  
  if (drone) {
  drone.position.copy(droneBody.position as any);
  drone.quaternion.copy(droneBody.quaternion as any);
  }
  
  camera.position.set(
    drone.position.x,
    drone.position.y + 3,
    drone.position.z + 15
  );
  camera.lookAt(drone.position);
  
  renderer.render(scene, camera);
}

animate();