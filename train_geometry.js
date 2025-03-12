import * as THREE from 'three';

/**
 * Creates a train geometry with a texture.
 * @param {number} w - Width of the train.
 * @param {number} h - Height of the train.
 * @param {number} d - Depth of the train.
 * @param {THREE.TextureLoader} textureLoader - Three.js texture loader instance.
 * @param {string} texturePath - Path to the texture image.
 * @returns {Object} - Contains the train mesh and wireframe.
 */
export function createTrain(w, h, d, textureLoader) {
    w = w / 2;
    d = d / 2;

    const positions = new Float32Array([
        // Front face
        -w, 0,  d, 
         w, 0,  d, 
         w, h,  d, 
        -w, h,  d,

        // Left face
        -w, 0, -d,
        -w, 0,  d, 
        -w, h,  d, 
        -w, h, -d,

        // Top face
        -w, h,  d, 
         w, h,  d, 
         w, h, -d,
        -w, h, -d,

        // Bottom face
        -w, 0,  d, 
        -w, 0, -d, 
         w, 0, -d, 
         w, 0,  d,

        // Right face
         w, 0,  d, 
         w, 0, -d, 
         w, h, -d, 
         w, h,  d,

        // Back face
         w, 0, -d, 
        -w, 0, -d, 
        -w, h, -d, 
         w, h, -d,
    ]);

    const indices = [
        0, 1, 2, 0, 2, 3, // Front
        4, 5, 6, 4, 6, 7, // Left
        8, 9, 10, 8, 10, 11, // Top
        12, 13, 14, 12, 14, 15, // Bottom
        16, 17, 18, 16, 18, 19, // Right
        20, 21, 22, 20, 22, 23, // Back
    ];

    // ✅ Add texture coordinates (UV mapping)
    const uvs = new Float32Array([
        // Front face
        0, 0,  1, 0,  1, 1,  0, 1,

        // Left face
        0, 0,  1, 0,  1, 1,  0, 1,

        // Top face
        0, 0,  1, 0,  1, 1,  0, 1,

        // Bottom face
        0, 0,  1, 0,  1, 1,  0, 1,

        // Right face
        0, 0,  1, 0,  1, 1,  0, 1,

        // Back face
        0, 0,  1, 0,  1, 1,  0, 1,
    ]);

    // ✅ Create and apply texture
    const texture = textureLoader.load('./assets/trainpicagain.webp');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    //texture.repeat.set(w / 5, h /); // Adjust texture tiling based on size

    const material = new THREE.MeshBasicMaterial({ map: texture});

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2)); // Add texture coordinates
    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

    const mesh = new THREE.Mesh(geometry, material);

    const wireframeGeometry = new THREE.EdgesGeometry(geometry);
    const wireframe = new THREE.LineSegments(
        wireframeGeometry,
        new THREE.LineBasicMaterial({ color: 0xffffff })
    );

    return { mesh, wireframe };
}
