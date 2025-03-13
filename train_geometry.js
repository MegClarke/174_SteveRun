import * as THREE from 'three';

/**
 * Creates a train geometry with a texture.
 * @param {number} w - Width of the train.
 * @param {number} h - Height of the train.
 * @param {number} d - Depth of the train.
 * @param {THREE.TextureLoader} textureLoader - Three.js texture loader instance.
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
        0, 1, 2, 0, 2, 3,       // Front
        4, 5, 6, 4, 6, 7,       // Left
        8, 9, 10, 8, 10, 11,     // Top
        12, 13, 14, 12, 14, 15,  // Bottom
        16, 17, 18, 16, 18, 19,  // Right
        20, 21, 22, 20, 22, 23,  // Back
    ];

    // ✅ Add texture coordinates (UV mapping)
    const uvs = new Float32Array([
        // Front face
        0, 0,  1, 0,  1, 1,  0, 1,

        // Left face (repeat on the sides as desired)
        0, 0,  4, 0,  4, 1,  0, 1,

        // Top face (UVs are irrelevant here since it will be gray)
        0, 0,  1, 0,  1, 1,  0, 1,

        // Bottom face
        0, 0,  1, 0,  1, 1,  0, 1,

        // Right face (repeat on the sides as desired)
        0, 0,  4, 0,  4, 1,  0, 1,

        // Back face
        0, 0,  1, 0,  1, 1,  0, 1,
    ]);

    // ✅ Create and apply texture
    const texture = textureLoader.load('./assets/trainpicagain.webp');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // The texture will be applied only to non-top faces based on the groups below.

    // ✳️ Create materials array
    const materials = [
      new THREE.MeshBasicMaterial({ map: texture }),      // Material index 0: textured
      new THREE.MeshBasicMaterial({ color: 0x808080 })       // Material index 1: gray (for the top face)
    ];

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

    // ✳️ Define groups for each face (6 indices per face)
    geometry.clearGroups();
    geometry.addGroup(0, 6, 0);   // Front face: textured
    geometry.addGroup(6, 6, 0);   // Left face: textured
    geometry.addGroup(12, 6, 1);  // Top face: gray
    geometry.addGroup(18, 6, 0);  // Bottom face: textured
    geometry.addGroup(24, 6, 0);  // Right face: textured
    geometry.addGroup(30, 6, 0);  // Back face: textured

    // ✳️ Use the materials array when creating the mesh
    const mesh = new THREE.Mesh(geometry, materials);

    const wireframeGeometry = new THREE.EdgesGeometry(geometry);
    const wireframe = new THREE.LineSegments(
        wireframeGeometry,
        new THREE.LineBasicMaterial({ color: 0xffffff })
    );

    return { mesh, wireframe };
}
