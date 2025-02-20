// main.js

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createTrain } from './train_geometry.js';
import {
  TRAIN_DIMENSIONS,
  PLAYER_DIMENSIONS,
  TRACK_WIDTH,
  MATERIAL_PROPERTIES,
  LIGHTING_SETTINGS,
  CAMERA_SETTINGS,
  ANIMATION_SETTINGS,
} from './constants.js';

// Scene, Camera, and Renderer Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  CAMERA_SETTINGS.FOV,
  CAMERA_SETTINGS.ASPECT_RATIO,
  CAMERA_SETTINGS.NEAR,
  CAMERA_SETTINGS.FAR
);
camera.position.set(...CAMERA_SETTINGS.POSITION);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);

// Rendering 3D axis
const createAxisLine = (color, start, end) => {
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  const material = new THREE.LineBasicMaterial({ color: color });
  return new THREE.Line(geometry, material);
};
const xAxis = createAxisLine(0xff0000, new THREE.Vector3(0, 0, 0), new THREE.Vector3(3, 0, 0)); // Red
const yAxis = createAxisLine(0x00ff00, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 3, 0)); // Green
const zAxis = createAxisLine(0x0000ff, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 3)); // Blue
scene.add(xAxis);
scene.add(yAxis);
scene.add(zAxis);

// Lighting
const pointLight = new THREE.PointLight(
  LIGHTING_SETTINGS.POINT_LIGHT.color,
  LIGHTING_SETTINGS.POINT_LIGHT.intensity,
  LIGHTING_SETTINGS.POINT_LIGHT.distance
);
pointLight.position.set(...LIGHTING_SETTINGS.POINT_LIGHT.position);
scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(
  LIGHTING_SETTINGS.DIRECTIONAL_LIGHT.color,
  LIGHTING_SETTINGS.DIRECTIONAL_LIGHT.intensity
);
directionalLight.position.set(...LIGHTING_SETTINGS.DIRECTIONAL_LIGHT.position).normalize();
scene.add(directionalLight);

scene.add(new THREE.AmbientLight(LIGHTING_SETTINGS.AMBIENT_LIGHT.color));

// Material
const phongMaterial = new THREE.MeshPhongMaterial({
  color: MATERIAL_PROPERTIES.COLOR,
  shininess: MATERIAL_PROPERTIES.SHININESS,
});


// Create Trains
let trains = [];
const trainTypes = [TRAIN_DIMENSIONS.SHORT, TRAIN_DIMENSIONS.TALL];
const depthOptions = [2, 2.5, 3, 3.5, 4];
const spacingOptions = [0, 1, 3, 4.5, 8, 12];
let currentZPosition = 0;

for (let i = 0; i < 10; i++) {
  const randomType = trainTypes[Math.floor(Math.random() * trainTypes.length)];  // Randomly select short or tall type
  const randomDepth = depthOptions[Math.floor(Math.random() * depthOptions.length)]; // Randomly select depth

  const { mesh, wireframe } = createTrain(randomType.w, randomType.h, randomDepth, phongMaterial);

  mesh.matrixAutoUpdate = false;
  wireframe.matrixAutoUpdate = false;
  wireframe.visible = false;

  const randomSpacing = spacingOptions[Math.floor(Math.random() * spacingOptions.length)];
  currentZPosition -= (randomDepth + randomSpacing);
  mesh.position.z = currentZPosition;
  wireframe.position.z = currentZPosition;

  scene.add(mesh);
  scene.add(wireframe);

  // Push train details for animation
  trains.push({ mesh, wireframe, positionZ: mesh.position.z });
}


function translationMatrix(tx, ty, tz) {
	return new THREE.Matrix4().set(
		1, 0, 0, tx,
		0, 1, 0, ty,
		0, 0, 1, tz,
		0, 0, 0, 1
	);
}

function rotationMatrixZ(theta) {
	return new THREE.Matrix4().set(
    Math.cos(theta), -Math.sin(theta), 0, 0,
    Math.sin(theta), Math.cos(theta), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
	);
}

function scalingMatrix(sx, sy, sz) {
  return new THREE.Matrix4().set(
    sx, 0, 0, 0,
    0, sy, 0, 0,
    0, 0, sz, 0,
    0, 0, 0, 1
  );
}


// Animation Variables
let clock = new THREE.Clock();
let still = false;

function animate() {
  renderer.render(scene, camera);
  controls.update();
  if (!still) {
    const delta = clock.getDelta();
    trains.forEach((train) => {
      train.positionZ += ANIMATION_SETTINGS.SPEED * delta;
      if (trains.length > 0 && trains[0].positionZ > ANIMATION_SETTINGS.DISAPPEAR_POSITION) {
        const removedTrain = trains.shift(); // Remove train that passed a certain point
        scene.remove(removedTrain.mesh);
        scene.remove(removedTrain.wireframe);
      }
      const transform = translationMatrix(0, 0, train.positionZ);
      train.mesh.matrix.copy(transform);
      train.wireframe.matrix.copy(transform);
    });
  }
}

renderer.setAnimationLoop(animate);

// Window Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Key Press Handler
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 's':
      still = !still;
      still ? clock.stop() : clock.start();
      break;
    case 'w':
      trains.forEach((train) => {
        train.mesh.visible = !train.mesh.visible;
        train.wireframe.visible = !train.wireframe.visible;
      });
      break;
    default:
      console.log(`Key ${event.key} pressed`);
  }
});
