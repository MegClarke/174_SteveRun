// walls.js (or add to main.js above animate function)
import * as THREE from 'three';
import { TRACK_WIDTH } from '../constants.js'; // if TRACK_WIDTH is exported

export function createWalls(textureLoader) {
  // Optionally, you can load a texture for the walls:
   const wallTexture = textureLoader.load('./assets/WALL.png');
   wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
   wallTexture.repeat.set(100, 10);

  // Use a basic material (or textured material if desired)
const wallMaterial = new THREE.MeshLambertMaterial({ map: wallTexture });

  // Define dimensions
  const wallWidth = 1;    // thickness of wall
  const wallHeight = 10;   // height above the floor
  const wallDepth = 50;   // length of one wall segment; adjust to match your floor track length

  // Create geometries
  const wallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);

  // Create left and right wall meshes
  const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
  const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);

  // Position walls relative to the track:
  // Place left wall at x = -TRACK_WIDTH - half the wall width,
  // and right wall at x = TRACK_WIDTH + half the wall width.
  leftWall.position.set(-(TRACK_WIDTH*1.75) - wallWidth/2, wallHeight/2, 0);
  rightWall.position.set((TRACK_WIDTH*1.75) + wallWidth/2, wallHeight/2, 0);

  // Group the walls together
  const wallGroup = new THREE.Group();
  wallGroup.add(leftWall);
  wallGroup.add(rightWall);

  return wallGroup;
}
