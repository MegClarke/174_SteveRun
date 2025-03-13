// main.js

import * as THREE from 'three';
import { initializeScene } from './scene_setup.js';
import { translationMatrix } from './transformations.js';
import { createTrain } from './create_files/train.js';
import { createTrainTracks } from './create_files/train_tracks.js';
import { createFloor } from './create_files/floor.js'; // Import the floor function
import { createGoldCoin } from './create_files/coin.js';
import { createWalls } from './create_files/walls.js';
import { createScoreDisplay, updateScoreDisplay } from './create_files/score_display.js';
import { Steve } from './create_files/steve.js';
import { showGameOver } from './game_over.js';


import {
  TRAIN_DIMENSIONS,
  TRACK_WIDTH,
  ANIMATION_SETTINGS,
} from './constants.js';

const { scene, camera, renderer, controls } = initializeScene();
//controls.enabled = false;
//THIS SHOULD BE ON AFTER EVERyTHING IS FIXED


const startZ = 5;
const textureLoader = new THREE.TextureLoader();

// Create Three Tracks of Trains (Left, Center, Right)
let allTracks = [[], [], []]; // Left, Center, Right tracks
const trainTypes = [TRAIN_DIMENSIONS.SHORT, TRAIN_DIMENSIONS.TALL];
const depthOptions = [2, 2.5, 3, 3.5, 4];
const spacingOptions = [0, 1, 3, 4.5, 8, 10, 20];
const trackPositions = [-TRACK_WIDTH, 0, TRACK_WIDTH];

let currentZPosition = [0, 0, 0];
function generateCoinsForTrain(xPos, randomType, randomDepth, baseZ) {
  const numCoins = Math.floor(Math.random() * 3); // 0, 1, or 2 coins
  let coins = [];
  if (numCoins > 0) {
    // Calculate spacing along the train's top face (which goes from -d/2 to d/2)
    const trainHalfDepth = randomDepth / 2; // since createTrain halves d internally
    const spacing = randomDepth / (numCoins + 1);
    for (let j = 0; j < numCoins; j++) {
      let coin = createGoldCoin();
      // Compute offset along z so coins are spread out along the train's length
      const offsetZ = -trainHalfDepth + spacing * (j + 1);
      coin.position.set(xPos, randomType.h + 0.1, baseZ + offsetZ);
      coin.userData.offsetZ = offsetZ;
      scene.add(coin);
      coins.push(coin);
    }
  }
  return coins;
}

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
    // Instead of duplicating coin code here:
    let coins = generateCoinsForTrain(xPos, randomType, randomDepth, currentZPosition[trackIndex]);
    allTracks[trackIndex].push({ mesh, wireframe, coins, positionZ: currentZPosition[trackIndex] });

    //allTracks[trackIndex].push({ mesh, wireframe, coin, positionZ: currentZPosition }); // ✅ Store coin (could be null)
    allTracks[trackIndex].push({ mesh, wireframe, coins, positionZ: currentZPosition[trackIndex]});
    //huh idk which one of these is right actually, added coin to the second one

  }
});


//WALLS

const walls1 = createWalls(textureLoader);
const walls2 = createWalls(textureLoader);

// Position the walls to align with your floor segments (assuming floor segments are 50 units apart)
walls1.position.z = 0;
walls2.position.z = -50;

scene.add(walls1, walls2);

// Create two overlapping train tracks
const trainTracks1 = createTrainTracks(textureLoader, 0.8, 50);
const trainTracks2 = createTrainTracks(textureLoader, 0.8, 50);
trainTracks1.position.z = startZ;       // Instead of 0
trainTracks2.position.z = startZ - 50;    // Instead of -50
scene.add(trainTracks1, trainTracks2);

// Create two overlapping floors
const floor1 = createFloor(textureLoader);
const floor2 = createFloor(textureLoader);

floor1.position.z = startZ;
floor2.position.z = startZ - 50;
scene.add(floor1, floor2);

//Light!
const topLight = new THREE.PointLight(0xffffff, 2, 100); // Color, Intensity, Distance
topLight.position.set(0, 5, 0); // Place it above the scene
topLight.castShadow = true; // Enable shadows for realism
scene.add(topLight);

// Optional: Add ambient light for overall brightness
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const steve = new Steve(); 
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
const scoreDisplay = createScoreDisplay(score);
document.body.appendChild(scoreDisplay);

let boundingBoxSteve = new THREE.Box3().setFromObject(steve);

let allTrainBoundingBoxes = [
  [new THREE.Box3(), new THREE.Box3(), new THREE.Box3()],
  [new THREE.Box3(), new THREE.Box3(), new THREE.Box3()],
  [new THREE.Box3(), new THREE.Box3(), new THREE.Box3()]
];

function checkCollisions() {
  boundingBoxSteve.setFromObject(steve);
  
  const steveRightX = steve.position.x + 0.375;
  const steveLeftX = steve.position.x;

  let standingOnTrain = false;
  let crashRight = false;
  let crashLeft = false;
  let trainTopY = 0;
  for (let i = 0; i < 3; i++) {
    const track = allTracks[i];
    for (let j = 0; j < 3; j++) {
      const train = track[j];
      const boundingBoxTrain = allTrainBoundingBoxes[i][j]
      boundingBoxTrain.setFromObject(train.mesh);
      
      if (boundingBoxSteve.intersectsBox(boundingBoxTrain)) {
        console.log("Collision detected!");
        trainTopY = boundingBoxTrain.max.y - boundingBoxTrain.min.y;
        const steveBottomY = steve.position.y; 
        const steveFrontZ = boundingBoxSteve.min.z;

        // Check if Steve is landing on top of the train
        if (steveBottomY >= trainTopY - 0.1) {
          console.log("On top!");
          standingOnTrain = true;
        }
        if (targetX  >= steve.position.x + 0.2 && steve.position.z <= boundingBoxTrain.max.z) { //account for unfinished lerp
          console.log("Target Position: ", targetX);
          console.log("Crash Right!");
          crashRight = true;
        }
        if (targetX <= steve.position.x - 0.2 && steve.position.z <= boundingBoxTrain.max.z) { //account for unfinished lerp
          console.log("Steve Position: ", steve.position.x);
          console.log("Target Position: ", targetX);
          console.log("Crash Left!");
          crashLeft = true;
        }
        if (!standingOnTrain && !crashRight && !crashLeft && (steveFrontZ <= boundingBoxTrain.max.z)) {
          console.log("Crash Front!");
          gameOver = true;
          renderer.setAnimationLoop(null);
          showGameOver(score);
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
  if(crashRight){
    if (steveRightX >= 0) {
      targetX = 0;
    }
    else if (steveRightX <= 0) {
      targetX = -TRACK_WIDTH;
    }
  }
  if(crashLeft){
    if (steveLeftX >= 0) {
      targetX = TRACK_WIDTH;
    }
    else if (steveLeftX <= 0) {
      targetX = 0;
    }
  }
  
  
  for (const track of allTracks) {
    for (let i = track.length - 1; i >= 0; i--) {
      let train = track[i];
      // Check if Steve collects a coin
      if (train.coins && train.coins.length > 0) {
        for (let k = train.coins.length - 1; k >= 0; k--) {
          let coin = train.coins[k];
          const boundingBoxCoin = new THREE.Box3().setFromObject(coin);
          if (boundingBoxSteve.intersectsBox(boundingBoxCoin)) {
            console.log("Coin collected!");
            score += 1;
            updateScoreDisplay(scoreDisplay, score);
            scene.remove(coin);
            train.coins.splice(k, 1);
          }
        }
      }
    }
  }
}

let gameOver = false;
function animate() {
  if (gameOver) return;
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
    steve.animateLimbs(runTime);

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

          // After you create new train and compute newTrainZ, add coins:
          let coins = generateCoinsForTrain(xPos, randomType, randomDepth, newTrainZ);
          track.push({ mesh, wireframe, coins, positionZ: newTrainZ });


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

    const cameraOffset = new THREE.Vector3(0, 2, 3);

    // Inside your animate() function, after updating Steve's position:
    const desiredCameraPos = steve.position.clone().add(cameraOffset);
    // Smoothly interpolate using lerp; 0.1 is the interpolation factor (0 - no movement, 1 - instant movement)
    camera.position.lerp(desiredCameraPos, 0.2);
    camera.lookAt(steve.position);

    trainTracks1.position.z += ANIMATION_SETTINGS.SPEED * delta / 2 ;
    trainTracks2.position.z += ANIMATION_SETTINGS.SPEED * delta / 2 ;

    floor1.position.z += ANIMATION_SETTINGS.SPEED * delta / 2 ;
    floor2.position.z += ANIMATION_SETTINGS.SPEED * delta / 2 ;

    walls1.position.z += ANIMATION_SETTINGS.SPEED * delta / 2;
    walls2.position.z += ANIMATION_SETTINGS.SPEED * delta / 2;

    // Swap positions instead of resetting instantly
    if (trainTracks1.position.z > startZ + 50) {
      trainTracks1.position.z = trainTracks2.position.z - 50;
    }
    if (trainTracks2.position.z > startZ + 50) {
      trainTracks2.position.z = trainTracks1.position.z - 50;
    }
    
    if (floor1.position.z > startZ) {
      floor1.position.z = floor2.position.z - 50;
    }
    if (floor2.position.z > startZ) {
      floor2.position.z = floor1.position.z - 50;
    }
    
    if (walls1.position.z > startZ + 50) {
      walls1.position.z = walls2.position.z - 50;
    }
    if (walls2.position.z > startZ + 50) {
      walls2.position.z = walls1.position.z - 50;
    }
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
      currentColumn = Math.max(minColumn, currentColumn - 1);
      targetX = currentColumn * columnSpacing;
      console.log("Current Column: ", currentColumn);
      console.log("Target X: ", targetX);
      break;
    case 'd':
    case 'D':
      currentColumn = Math.min(maxColumn, currentColumn + 1);
      targetX = currentColumn * columnSpacing;
      console.log("Current Column: ", currentColumn);
      console.log("Target X: ", targetX);
      break;
    case 'w':
    case 'W':
      if (!isJumping) {
        velocityY = jumpForce;
        isJumping = true;
      }
      break;
    default:
      console.log(`Key ${event.key} pressed`);
  }
});
