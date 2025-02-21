// main.js

import * as THREE from 'three';
import { initializeScene } from './scene_setup.js';
import { createTrain } from './train_geometry.js';
import { translationMatrix, rotationMatrixZ, scalingMatrix } from './transformations.js';
import './background.js'; 
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



// Create Three Tracks of Trains (Left, Center, Right)
let allTracks = [[], [], []]; // Left, Center, Right tracks
const trainTypes = [TRAIN_DIMENSIONS.SHORT, TRAIN_DIMENSIONS.TALL];
const depthOptions = [2, 2.5, 3, 3.5, 4];
const spacingOptions = [0, 1, 3, 4.5, 8, 10, 20];
const trackPositions = [-TRACK_WIDTH, 0, TRACK_WIDTH];

trackPositions.forEach((xPos, trackIndex) => {
  let currentZPosition = 0;
  for (let i = 0; i < 10; i++) {
    const randomType = trainTypes[Math.floor(Math.random() * trainTypes.length)];
    const randomDepth = depthOptions[Math.floor(Math.random() * depthOptions.length)];
    const randomSpacing = spacingOptions[Math.floor(Math.random() * spacingOptions.length)];
    currentZPosition -= (randomDepth + randomSpacing);

    const { mesh, wireframe } = createTrain(randomType.w, randomType.h, randomDepth, phongMaterial);
    mesh.matrixAutoUpdate = false;
    wireframe.matrixAutoUpdate = false;
    wireframe.visible = false;

    mesh.position.set(xPos, 0, currentZPosition);
    wireframe.position.set(xPos, 0, currentZPosition);

    scene.add(mesh);
    scene.add(wireframe);

    allTracks[trackIndex].push({ mesh, wireframe, positionZ: currentZPosition });
  }
});

// Create a Box Geometry
const boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5); // 1x1x1 box
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green color
const box = new THREE.Mesh(boxGeometry, boxMaterial);

// Position the box at the origin (0, 0, 0)
box.position.set(0, 0, 0);

// Add the box to the scene
scene.add(box);



// Animation Variables
let clock = new THREE.Clock();
let still = false;

function animate() {
  renderer.render(scene, camera);
  controls.update();
  if (!still) {
    const delta = clock.getDelta();
    allTracks.forEach((track) => {
      track.forEach((train) => {
        train.positionZ += ANIMATION_SETTINGS.SPEED * delta;
        if (train.positionZ > ANIMATION_SETTINGS.DISAPPEAR_POSITION) {
          const removedTrain = track.shift(); 
          scene.remove(removedTrain.mesh);
          scene.remove(removedTrain.wireframe);
        }
        const transform = translationMatrix(train.mesh.position.x, 0, train.positionZ);
        train.mesh.matrix.copy(transform);
        train.wireframe.matrix.copy(transform);
      });
    });
    renderer.render(scene, camera);
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
    case 'a':
      case 'A':
        if (box.position.x > -0.75) { // Prevent moving left beyond -1
          box.position.x -= 0.75; // Move left
        }
        break;
      case 'd':
      case 'D':
        if (box.position.x < 0.75) { // Prevent moving right beyond 1
          box.position.x += 0.75; // Move right
        }
        break;
    case 'w':
    case 'W':
      box.position.y += 0.5; // Move up
      break;
    case 's':
    case 'S':
      box.position.y -= 0.5;
    case ' ':
      still = !still;
      still ? clock.stop() : clock.start();
      break;
    case '1':
      allTracks.forEach((track) =>
        track.forEach((train) => {
          train.mesh.visible = !train.mesh.visible;
          train.wireframe.visible = !train.wireframe.visible;
        })
      );
      break;
    default:
      console.log(`Key ${event.key} pressed`);
  }
});
