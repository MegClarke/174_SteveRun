
// import * as THREE from 'three';


// // Start here.

// const l = 100
// const positions = new Float32Array([
//     // Front face
//     -l, -l,  l, // 0
//      l, -l,  l, // 1
//      l,  l,  l, // 2
//     -l,  l,  l, // 3

//     // Left face
//     -l, -l, -l, // 4
//     -l, -l,  l, // 5
//     -l,  l,  l, // 6 
//     -l,  l, -l, // 7
  
//     // Top face
//     -l,  l,  l, // 8
//      l,  l,  l, // 9
//      l,  l, -l, //10
//     -l,  l, -l, //11
    
//      // Bottom face
//     -l, -l,  l, // 12
//     -l, -l, -l, // 13
//      l, -l, -l, //14
//      l, -l,  l, //15
  
//     // Right face

//     l, -l, -l, // 16
//     l,  l, -l, // 17
//     l,  l,  l, // 18
//     l, -l,  l, // 19


//      // Back face

//     -l, -l,  -l, // 20
//     -l,  l,  -l, // 21
//     l,  l,  -l, // 22
//     l, -l,  -l, // 23


//   ]);
  
//   const indices = [
//     // Front face
//     0, 1, 2,
//     0, 2, 3,
  
//     // Left face
//     4, 5, 6,
//     4, 6, 7,
  
//     // Top face
//     8, 9, 10,
//     8, 10, 11,
  
//     // Bottom face
//     12, 13, 14, 
//     12, 14, 15,
  
//     // Right face
//     16, 17, 18,
//     16, 18, 19,

//     // Back face
//     20, 21, 22, 
//     20, 22, 23,
//   ];
  
//   // Compute normals
//   const normals = new Float32Array([
//     // Front face
//     0, 0, 2*l,
//     0, 0, 2*l,
//     0, 0, 2*l,
//     0, 0, 2*l,
  
//     // Left face
//     -2*l, 0, 0,
//     -2*l, 0, 0,
//     -2*l, 0, 0,
//     -2*l, 0, 0,
  
//     // Top 
//     0, 2*l, 0,
//     0, 2*l, 0,
//     0, 2*l, 0,
//     0, 2*l, 0,
  
//     // Bottom face

//     0, -2*l, 0,
//     0, -2*l, 0,
//     0, -2*l, 0,
//     0, -2*l, 0,
  
//     // Right face

//     2*l, 0, 0,
//     2*l, 0, 0,
//     2*l, 0, 0,
//     2*l, 0, 0,

//     // Back face

//     0, 0, -2*l,
//     0, 0, -2*l,
//     0, 0, -2*l,
//     0, 0, -2*l,
//   ]);

// const custom_cube_geometry = new THREE.BufferGeometry();
// custom_cube_geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// custom_cube_geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
// custom_cube_geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

// const blueMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });

// // Create the mesh with the custom geometry and blue material.
// let cubeMesh = new THREE.Mesh(custom_cube_geometry, blueMaterial);

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// // Now, add the cubeMesh to your scene (assuming you have a scene already defined).
// const scene = new THREE.Scene();
// scene.add(cubeMesh);