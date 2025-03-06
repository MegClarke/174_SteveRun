import * as THREE from 'three';

export function createFloor(textureLoader) {
    // Load texture
    const texture = textureLoader.load('./assets/grass.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    // ✅ Adjust the repeat values to control tiling
    texture.repeat.set(100, 100); // Increase these numbers to repeat more

    // Create floor geometry and material
    const floorGeometry = new THREE.PlaneGeometry(100, 100); // Adjust size as needed
    const floorMaterial = new THREE.MeshBasicMaterial({ map: texture });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);

    // Rotate to lay flat
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.1; // Set to ground level

    return floor; // Return the floor so it can be added to the scene
}
