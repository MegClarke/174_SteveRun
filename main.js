// main.js

import * as THREE from 'three';
import { initializeScene } from './scene_setup.js';
import { createTrain } from './train_geometry.js';
import { translationMatrix, rotationMatrixZ, scalingMatrix } from './transformations.js';
import { createTrainTracks } from './train_tracks.js';
import { createFloor } from './floor.js'; // Import the floor function
import { createGoldCoin } from './coin.js';


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


const textureLoader = new THREE.TextureLoader();
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

    const { mesh, wireframe } = createTrain(randomType.w, randomType.h, randomDepth, textureLoader);
    mesh.matrixAutoUpdate = false;
    wireframe.matrixAutoUpdate = false;
    wireframe.visible = false;

    mesh.position.set(xPos, 0, currentZPosition[trackIndex]);
    wireframe.position.set(xPos, 0, currentZPosition[trackIndex]);

    scene.add(mesh);
    scene.add(wireframe);


    const hasCoin = Math.random() < 1;  

    let coin = null; // ✅ Initialize coin variable
    if (hasCoin) {
      coin = createGoldCoin();
      coin.position.set(xPos, randomType.h + 0.1, currentZPosition);
      scene.add(coin);
    }
    
    //allTracks[trackIndex].push({ mesh, wireframe, coin, positionZ: currentZPosition }); // ✅ Store coin (could be null)
    allTracks[trackIndex].push({ mesh, wireframe, coin, positionZ: currentZPosition[trackIndex]});
    //huh idk which one of these is right actually, added coin to the second one

  }
});

// Create two overlapping train tracks
const trainTracks1 = createTrainTracks(textureLoader, 0.8, 50);
const trainTracks2 = createTrainTracks(textureLoader, 0.8, 50);
trainTracks1.position.z = 0;
trainTracks2.position.z = -50;
scene.add(trainTracks1, trainTracks2);

// Create two overlapping floors
const floor1 = createFloor(textureLoader);
const floor2 = createFloor(textureLoader);
floor1.position.z = 0;
floor2.position.z = -50;
scene.add(floor1, floor2);

//Light!
const topLight = new THREE.PointLight(0xffffff, 2, 100); // Color, Intensity, Distance
topLight.position.set(0, 5, 0); // Place it above the scene
topLight.castShadow = true; // Enable shadows for realism
scene.add(topLight);

// Optional: Add ambient light for overall brightness
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);


// Create Minecraft Steve using BoxGeometry with smaller proportions
const steve = new THREE.Group();
const boundingBoxSteve = new THREE.Box3();

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
const jumpForce = 0.12;
let isJumping = false;

// Smooth movement variables
let targetX = steve.position.x; // Target X position
const moveSpeed = 0.1; // Controls how smooth the movement is
// Create a score counter
let score = 0;

// Create an HTML element to display the score
const scoreDisplay = document.createElement('div');
scoreDisplay.style.position = 'absolute';
scoreDisplay.style.top = '10px';
scoreDisplay.style.right = '20px';
scoreDisplay.style.color = 'white';
scoreDisplay.style.fontSize = '24px';
scoreDisplay.style.fontFamily = 'Arial, sans-serif';
scoreDisplay.style.fontWeight = 'bold';
scoreDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
scoreDisplay.style.padding = '10px 20px';
scoreDisplay.style.borderRadius = '10px';
scoreDisplay.innerHTML = `Score: ${score}`;
document.body.appendChild(scoreDisplay);

function checkCollisions() {
  boundingBoxSteve.setFromObject(steve);

  for (const track of allTracks) {
    for (let i = track.length - 1; i >= 0; i--) {  // Loop backwards to remove items safely
      const train = track[i];
      const boundingBoxTrain = new THREE.Box3().setFromObject(train.mesh);

      if (boundingBoxSteve.intersectsBox(boundingBoxTrain)) {
        console.log("Collision with train detected!");
        return;
      }

      // Check if Steve collects a coin
      if (train.coin) {
        const boundingBoxCoin = new THREE.Box3().setFromObject(train.coin);
        if (boundingBoxSteve.intersectsBox(boundingBoxCoin)) {
          console.log("Coin collected!");
          score += 1;  // Increase score
          scoreDisplay.innerHTML = `Score: ${score}`; // Update the displayed score

          scene.remove(train.coin); // Remove coin from the scene
          train.coin = null;  // Prevent multiple collisions with the same coin
        }
      }
    }
  }
}


function animate() {
  renderer.render(scene, camera);
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
    const delta = clock.getDelta(); // it was too slow
    runTime += delta; // Increase runTime to simulate leg and arm movement

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
          const removedTrain = track.shift();
          scene.remove(removedTrain.mesh);
          scene.remove(removedTrain.wireframe);
          if (removedTrain.coin) {
            scene.remove(removedTrain.coin);
          }

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

        if (train.coin) {
          train.coin.position.z = train.positionZ;
        }
      }
    });

    renderer.render(scene, camera);

    // Move the train tracks and floor backward to simulate running
    trainTracks1.position.z += ANIMATION_SETTINGS.SPEED * delta / 2;
    trainTracks2.position.z += ANIMATION_SETTINGS.SPEED * delta / 2;

    // Move both floors
    floor1.position.z += ANIMATION_SETTINGS.SPEED * delta / 2;
    floor2.position.z += ANIMATION_SETTINGS.SPEED * delta / 2;

    // ✅ Swap positions instead of resetting instantly
    if (trainTracks1.position.z > 50) {
      trainTracks1.position.z = trainTracks2.position.z - 50; // Move behind the second track
    }
    if (trainTracks2.position.z > 50) {
      trainTracks2.position.z = trainTracks1.position.z - 50;
    }

    if (floor1.position.z > 0) {
      floor1.position.z = floor2.position.z - 50;
    }
    if (floor2.position.z > 0) {
      floor2.position.z = floor1.position.z - 50;
    }
  }

  checkCollisions();
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
