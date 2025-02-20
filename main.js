// main.js

import * as THREE from 'three';
import { initializeScene } from './scene_setup.js';
import { createTrain } from './train_geometry.js';
import { translationMatrix, rotationMatrixZ, scalingMatrix } from './transformations.js';
import {
  TRAIN_DIMENSIONS,
  PLAYER_DIMENSIONS,
  TRACK_WIDTH,
  MATERIAL_PROPERTIES,
  ANIMATION_SETTINGS,
} from './constants.js';

// 🌟 Initialize Scene, Camera, Renderer, Controls
const { scene, camera, renderer, controls } = initializeScene();

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
