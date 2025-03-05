// train_tracks.js
import * as THREE from 'three';

export function createTrainTracks(textureLoader, trackWidth, trackLength) {
  const trackGroup = new THREE.Group();

  // Load Texture
  const texture = textureLoader.load('./assets/wood.jpg'); // Update the path if needed
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 1); // Adjust tiling as needed

  const trackMaterial = new THREE.MeshPhongMaterial({ map: texture });

  // Create Two Rails
  const railGeometry = new THREE.BoxGeometry(trackWidth * 0.1, 0.1, trackLength);
  const leftRail = new THREE.Mesh(railGeometry, trackMaterial);
  leftRail.position.set(-trackWidth * 0.4, -0.05, 0); // Adjust position
  trackGroup.add(leftRail);

  const rightRail = new THREE.Mesh(railGeometry, trackMaterial);
  rightRail.position.set(trackWidth * 0.4, -0.05, 0); // Adjust position
  trackGroup.add(rightRail);

  // Create Wooden Planks
  const plankGeometry = new THREE.BoxGeometry(trackWidth * 0.9, 0.05, 0.5);
  const plankMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });

  for (let i = 0; i < trackLength; i += 2) {
    const plank = new THREE.Mesh(plankGeometry, plankMaterial);
    plank.position.set(0, -0.08, -i);
    trackGroup.add(plank);
  }

  return trackGroup;
}
