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
controls.enabled = false;


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


    // Decide on a random number of coins (0 to 2 coins) to place on this train
    const numCoins = Math.floor(Math.random() * 3); // 0, 1, or 2 coins
    let coins = [];
    if (numCoins > 0) {
      // Calculate spacing along the train's top face (which goes from -d/2 to d/2)
      const trainHalfDepth = randomDepth / 2;  // because createTrain halves d internally
      const spacing = randomDepth / (numCoins + 1);
      for (let j = 0; j < numCoins; j++) {
        let coin = createGoldCoin();
        // Compute offset along z so coins are spread out along the train's length
        const offsetZ = -trainHalfDepth + spacing * (j + 1);
        // Position coin relative to the train's current z position
        coin.position.set(xPos, randomType.h + 0.1, currentZPosition[trackIndex] + offsetZ);
        // Save the offset in coin.userData for later updates in animate()
        coin.userData.offsetZ = offsetZ;
        scene.add(coin);
        coins.push(coin);
      }
    }

    //allTracks[trackIndex].push({ mesh, wireframe, coin, positionZ: currentZPosition }); // ✅ Store coin (could be null)
    allTracks[trackIndex].push({ mesh, wireframe, coins, positionZ: currentZPosition[trackIndex]});
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
let currentColumn = 0;         // Start at center (0)
const minColumn = -1;          // Leftmost column index
const maxColumn = 1;           // Rightmost column index
const columnSpacing = 0.8;     // Spacing multiplier for each column
let targetX = currentColumn * columnSpacing; // Initial target x position
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
      if (train.coins && train.coins.length > 0) {
        for (let k = train.coins.length - 1; k >= 0; k--) {
          let coin = train.coins[k];
          const boundingBoxCoin = new THREE.Box3().setFromObject(coin);
          if (boundingBoxSteve.intersectsBox(boundingBoxCoin)) {
            console.log("Coin collected!");
            score += 1;
            scoreDisplay.innerHTML = `Score: ${score}`;
            scene.remove(coin);
            train.coins.splice(k, 1);
          }
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
    
      // Iterate backwards over the track array
      for (let i = track.length - 1; i >= 0; i--) { // CHANGED: Use backwards loop
        let train = track[i];
    
        // Move train forward
        train.positionZ += ANIMATION_SETTINGS.SPEED * delta;
        train.mesh.position.z = train.positionZ;
        train.wireframe.position.z = train.positionZ;
    
        // Check if train should be removed
        if (train.positionZ > ANIMATION_SETTINGS.DISAPPEAR_POSITION) {
          // Remove the train from the scene
          scene.remove(train.mesh);
          scene.remove(train.wireframe);
          if (train.coins && train.coins.length > 0) {
            train.coins.forEach(coin => scene.remove(coin));
          }
          // Remove the train from the array
          track.splice(i, 1); // CHANGED: Remove current train safely
    
          // Create new train
          const randomType = trainTypes[Math.floor(Math.random() * trainTypes.length)];
          const randomDepth = depthOptions[Math.floor(Math.random() * depthOptions.length)];
          const randomSpacing = spacingOptions[Math.floor(Math.random() * spacingOptions.length)];
    
          // Ensure new train is placed far back
          const lastTrainZ = track.length > 0 ? track[track.length - 1].positionZ : -10;
          const newTrainZ = lastTrainZ - (randomDepth + randomSpacing);
    
          const { mesh, wireframe } = createTrain(randomType.w, randomType.h, randomDepth, textureLoader);
          mesh.matrixAutoUpdate = false;
          wireframe.matrixAutoUpdate = false;
          wireframe.visible = false;

          mesh.position.set(xPos, 0, newTrainZ);
          wireframe.position.set(xPos, 0, newTrainZ);

          // ➡️ NEW: Immediately update the transformation matrix for the new train
          const transform = translationMatrix(xPos, 0, newTrainZ);
          mesh.matrix.copy(transform);
          wireframe.matrix.copy(transform);

          scene.add(mesh);
          scene.add(wireframe);

          // Add new train to track
          track.push({ mesh, wireframe, positionZ: newTrainZ });

        } else {
          // Apply transformation matrix only if the train was not removed
          const transform = translationMatrix(train.mesh.position.x, 0, train.positionZ);
          train.mesh.matrix.copy(transform);
          train.wireframe.matrix.copy(transform);
    
          if (train.coins && train.coins.length > 0) {
            train.coins.forEach(coin => {
              coin.position.z = train.positionZ + coin.userData.offsetZ;
            });
          }
        }
      }
    });

    const cameraOffset = new THREE.Vector3(0, 3, 5);

    // Inside your animate() function, after updating Steve's position:
    const desiredCameraPos = steve.position.clone().add(cameraOffset);
    // Smoothly interpolate using lerp; 0.1 is the interpolation factor (0 - no movement, 1 - instant movement)
    camera.position.lerp(desiredCameraPos, 0.2);
    camera.lookAt(steve.position);

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
      currentColumn = Math.max(minColumn, currentColumn - 1);
      targetX = currentColumn * columnSpacing;
      break;
    case 'd':
    case 'D':
      currentColumn = Math.min(maxColumn, currentColumn + 1);
      targetX = currentColumn * columnSpacing;
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
