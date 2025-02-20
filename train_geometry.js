import * as THREE from 'three';

/**
 * Creates a train geometry with specified dimensions.
 * @param {number} w - Width of the train.
 * @param {number} h - Height of the train.
 * @param {number} d - Depth of the train.
 * @param {THREE.Material} material - Material for the mesh.
 * @returns {Object} - Contains the mesh and wireframe objects.
 */

export function createTrain(w, h, d, material) {
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
        0, 1, 2, 
        0, 2, 3, 
        
        4, 5, 6, 
        4, 6, 7,

        8, 9, 10, 
        8, 10, 11, 
        
        12, 13, 14, 
        12, 14, 15,

        16, 17, 18, 
        16, 18, 19, 
        
        20, 21, 22, 
        20, 22, 23,
    ];

    const normals = new Float32Array([
        0, 0, 1, 
        0, 0, 1, 
        0, 0, 1, 
        0, 0, 1,

        -1, 0, 0, 
        -1, 0, 0, 
        -1, 0, 0, 
        -1, 0, 0,

        0, 1, 0, 
        0, 1, 0, 
        0, 1, 0, 
        0, 1, 0,

        0, -1, 0, 
        0, -1, 0, 
        0, -1, 0, 
        0, -1, 0,

        1, 0, 0, 
        1, 0, 0, 
        1, 0, 0, 
        1, 0, 0,

        0, 0, -1, 
        0, 0, -1, 
        0, 0, -1, 
        0, 0, -1,
    ]);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

    const mesh = new THREE.Mesh(geometry, material);

    const wireframeGeometry = new THREE.EdgesGeometry(geometry);
    const wireframe = new THREE.LineSegments(
        wireframeGeometry,
        new THREE.LineBasicMaterial({ color: 0xffffff })
    );

    return { mesh, wireframe };
}
