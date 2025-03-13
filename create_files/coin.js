import * as THREE from 'three';

export function createGoldCoin(textureLoader) {
  const coinGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 32);
  
  const coinMaterial = new THREE.MeshStandardMaterial({
    color: 0xffee00,
    metalness: .2,     // Maximum metallic effect
    roughness: 0.1,   // Very smooth surface for shininess
    emissive: 0xFFD700, // Slight glow effect
    emissiveIntensity: 0.3, // Controls the glow effect
  });

  const coin = new THREE.Mesh(coinGeometry, coinMaterial);
  
  // Rotate to lay flat
  coin.rotation.x = Math.PI / 2;
  coin.castShadow = true;
  coin.receiveShadow = true;

  return coin;
}
