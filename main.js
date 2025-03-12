// main.js

import * as THREE from 'three';
import { initializeScene } from './scene_setup.js';
import { createTrain } from './train_geometry.js';
import { translationMatrix, rotationMatrixZ, scalingMatrix } from './transformations.js';
import { createTrainTracks } from './train_tracks.js';
import {
  TRAIN_DIMENSIONS,
  PLAYER_DIMENSIONS,
  TRACK_WIDTH,
  MATERIAL_PROPERTIES,
  ANIMATION_SETTINGS,
} from './constants.js';

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

let currentZPosition = [0, 0, 0];
trackPositions.forEach((xPos, trackIndex) => {
  for (let i = 0; i < 5; i++) {
    const randomType = trainTypes[Math.floor(Math.random() * trainTypes.length)];
    const randomDepth = depthOptions[Math.floor(Math.random() * depthOptions.length)];
    const randomSpacing = spacingOptions[Math.floor(Math.random() * spacingOptions.length)];
    currentZPosition[trackIndex] -= (randomDepth + randomSpacing);

    const { mesh, wireframe } = createTrain(randomType.w, randomType.h, randomDepth, phongMaterial);
    mesh.matrixAutoUpdate = false;
    wireframe.matrixAutoUpdate = false;
    wireframe.visible = false;

    mesh.position.set(xPos, 0, currentZPosition[trackIndex]);
    wireframe.position.set(xPos, 0, currentZPosition[trackIndex]);

    scene.add(mesh);
    scene.add(wireframe);

    allTracks[trackIndex].push({ mesh, wireframe, positionZ: currentZPosition[trackIndex]});
  }
});

// Load Train Tracks
const textureLoader = new THREE.TextureLoader();
const trainTracks = createTrainTracks(textureLoader, .8, 50); // Adjust width and length
scene.add(trainTracks);


// Create Minecraft Steve using BoxGeometry with smaller proportions
const steve = new THREE.Group();

const headMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc99 }); // Light skin color
const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x0066ff }); // Blue shirt
const legMaterial = new THREE.MeshBasicMaterial({ color: 0x3333cc }); // Dark blue pants
const armMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc99 }); // Same as head for arms

// Head
const head = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), headMaterial);
head.position.set(0, 0.35, 0);
steve.add(head);

// Torso
const torso = new THREE.Mesh(new THREE.BoxGeometry(0.225, 0.2, 0.075), bodyMaterial);
torso.position.set(0, 0.175, 0);
steve.add(torso);

// Left Arm
const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.15, 0.075), armMaterial);
leftArm.position.set(-0.15, 0.20, 0);
steve.add(leftArm);

// Right Arm
const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.15, 0.075), armMaterial);
rightArm.position.set(0.15, 0.20, 0);
steve.add(rightArm);

// Left Leg
const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.15, 0.075), legMaterial);
leftLeg.position.set(-0.075, 0, 0);
steve.add(leftLeg);

// Right Leg
const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.15, 0.075), legMaterial);
rightLeg.position.set(0.075, 0, 0);
steve.add(rightLeg);

// Position Steve at the origin
steve.position.set(0, 0, 0);
scene.add(steve);

// Animation Variables
let clock = new THREE.Clock();
let still = false;
let runTime = 0; // Variable to track the time for leg and arm animation

// Sprite Physics Variables
let velocityY = 0;
const gravity = -0.005;
const jumpForce = 0.11;
let isJumping = false;

// Smooth movement variables
let targetX = steve.position.x; // Target X position
const moveSpeed = 0.1; // Controls how smooth the movement is

let boundingBoxSteve = new THREE.Box3().setFromObject(steve);
let steveBoxHelper = new THREE.Box3Helper(boundingBoxSteve, 0xffff00);
scene.add(steveBoxHelper);

let allTrainBoundingBoxes = [
  [new THREE.Box3(), new THREE.Box3()],
  [new THREE.Box3(), new THREE.Box3()],
  [new THREE.Box3(), new THREE.Box3()]
];

for (let i = 0; i < allTrainBoundingBoxes.length; i++) {
  for (let j = 0; j < allTrainBoundingBoxes[i].length; j++) {
    let trainBoxHelper = new THREE.Box3Helper(allTrainBoundingBoxes[i][j], 0xff0000);
    scene.add(trainBoxHelper);
  }
}

function checkCollisions() {
  boundingBoxSteve.setFromObject(steve);
  let standingOnTrain = false;
  let trainTopY = 0;
  for (let i = 0; i < 3; i++) {
    const track = allTracks[i];
    for (let j = 0; j < 2; j++) {
      const train = track[j];
      const boundingBoxTrain = allTrainBoundingBoxes[i][j]
      boundingBoxTrain.setFromObject(train.mesh);
      
      if (boundingBoxSteve.intersectsBox(boundingBoxTrain)) {
        console.log("Collision detected!");
        trainTopY = boundingBoxTrain.max.y - boundingBoxTrain.min.y;
        const steveBottomY = steve.position.y; 

        // Check if Steve is landing on top of the train
        if (steveBottomY >= trainTopY - 0.02) {
          console.log("On top!");
          standingOnTrain = true;
        }
      }
    }
  }
  if (standingOnTrain) {
    steve.position.y = trainTopY + 0.1; // place steve on top of train (+0.1 so his feet don't go under)
    velocityY = 0;
    isJumping = false;
    console.log("Steve staying on top!");
  }
  //implement falling logic?
}

function animate() {
  controls.update();

  if (isJumping) {
    steve.position.y += velocityY;
    velocityY += gravity;
    if (steve.position.y <= 0) {
      steve.position.y = 0;
      velocityY = 0;
      isJumping = false;
    }
  }

  if (!still) {
    const delta = clock.getDelta();
    runTime += delta;  // Increase runTime to simulate leg and arm movement

    // Smoothly interpolate Steve's x position towards the target x position
    steve.position.x = THREE.MathUtils.lerp(steve.position.x, targetX, moveSpeed);

    // Animate the legs to simulate running
    const legRotation = Math.sin(runTime * 5) * 0.5; // Adjust speed and amplitude as needed
    leftLeg.rotation.x = legRotation;
    rightLeg.rotation.x = -legRotation;

    // Animate the arms to simulate running
    const armRotation = Math.sin(runTime * 5) * 0.5; // Adjust speed and amplitude as needed
    leftArm.rotation.x = -armRotation;
    rightArm.rotation.x = armRotation;

    trackPositions.forEach((xPos, trackIndex) => {
      let track = allTracks[trackIndex];
    
      for (let i = 0; i < track.length; i++) {
        let train = track[i];
    
        // Move train forward
        train.positionZ += ANIMATION_SETTINGS.SPEED * delta;
        train.mesh.position.z = train.positionZ;
        train.wireframe.position.z = train.positionZ;
    
        // Check if train should be removed
        if (train.positionZ > ANIMATION_SETTINGS.DISAPPEAR_POSITION) {
          // Remove from scene
          scene.remove(train.mesh);
          scene.remove(train.wireframe);
    
          // Remove from array
          track.shift(); // Remove the first train
    
          // Create new train
          const randomType = trainTypes[Math.floor(Math.random() * trainTypes.length)];
          const randomDepth = depthOptions[Math.floor(Math.random() * depthOptions.length)];
          const randomSpacing = spacingOptions[Math.floor(Math.random() * spacingOptions.length)];
    
          // Ensure new train is placed far back
          const lastTrainZ = track.length > 0 ? track[track.length - 1].positionZ : -10;
          const newTrainZ = lastTrainZ - (randomDepth + randomSpacing);
    
          const { mesh, wireframe } = createTrain(randomType.w, randomType.h, randomDepth, phongMaterial);
          mesh.matrixAutoUpdate = false;
          wireframe.matrixAutoUpdate = false;
          wireframe.visible = false;
    
          mesh.position.set(xPos, 0, newTrainZ);
          wireframe.position.set(xPos, 0, newTrainZ);
    
          scene.add(mesh);
          scene.add(wireframe);
    
          // Add new train to track
          track.push({ mesh, wireframe, positionZ: newTrainZ });
        }
    
        // Apply transformation matrix
        const transform = translationMatrix(train.mesh.position.x, 0, train.positionZ);
        train.mesh.matrix.copy(transform);
        train.wireframe.matrix.copy(transform);
      }
    });
  }

  checkCollisions();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Window Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Key Press Handler with smooth movement
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'a':
    case 'A':
      targetX = Math.max(-0.8, steve.position.x - 0.8); // Limit movement to -0.8
      break;
    case 'd':
    case 'D':
      targetX = Math.min(0.8, steve.position.x + 0.8); // Limit movement to 0.8
      break;
    case 'w':
    case 'W':
      if (!isJumping) {
        velocityY = jumpForce;
        isJumping = true;
      }
      break;
    case ' ':
      still = !still;
      still ? clock.stop() : clock.start();
      break;
    default:
      console.log(`Key ${event.key} pressed`);
  }
});
