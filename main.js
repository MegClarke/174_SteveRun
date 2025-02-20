import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const scene = new THREE.Scene();

//THREE.PerspectiveCamera( fov angle, aspect ratio, near depth, far depth );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 5, 10);
controls.target.set(0, 5, 0);

// Rendering 3D axis
const createAxisLine = (color, start, end) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color: color });
    return new THREE.Line(geometry, material);
};
const xAxis = createAxisLine(0xff0000, new THREE.Vector3(0, 0, 0), new THREE.Vector3(3, 0, 0)); // Red
const yAxis = createAxisLine(0x00ff00, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 3, 0)); // Green
const zAxis = createAxisLine(0x0000ff, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 3)); // Blue
scene.add(xAxis);
scene.add(yAxis);
scene.add(zAxis);


// Setting up the lights
const pointLight = new THREE.PointLight(0xffffff, 100, 100);
pointLight.position.set(5, 5, 5); // Position the light
scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0.5, .0, 1.0).normalize();
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x505050);  // Soft white light
scene.add(ambientLight);

const phong_material = new THREE.MeshPhongMaterial({
    color: 0x00ff00, // Green color
    shininess: 100   // Shininess of the material
});


// Const Variables
const h_st = 0.8
const w_st = 0.6
const d_st = 2 //arbitrary and should be variable

const h_tt = 1.6
const w_tt = 0.6
const d_tt = 2 //arbitrary and should be variable

const h_p = 1.2
const w_p = 0.4
const max_h_jump = 1

const w_track = 0.6

//short train
const short_train_positions = new Float32Array([
    // Front face
    -h_st, -w_st,  d_st / 2, // 0
     h_st, -w_st,  d_st / 2, // 1
     h_st,  w_st,  d_st / 2, // 2
    -h_st,  w_st,  d_st / 2, // 3

    // Left face
    -h_st, -w_st, -d_st / 2, // 4
    -h_st, -w_st,  d_st / 2, // 5
    -h_st,  w_st,  d_st / 2, // 6
    -h_st,  w_st, -d_st / 2, // 7
  
    // Top face
    -h_st,  w_st,  d_st / 2, // 8
     h_st,  w_st,  d_st / 2, // 9
     h_st,  w_st, -d_st / 2, // 10
    -h_st,  w_st, -d_st / 2, // 11
  
    // Bottom face
    -h_st, -w_st,  d_st / 2, // 12
    -h_st, -w_st, -d_st / 2, // 13
     h_st, -w_st, -d_st / 2, // 14
     h_st, -w_st,  d_st / 2, // 15

    // Right face
     h_st, -w_st,  d_st / 2, // 16
     h_st, -w_st, -d_st / 2, // 17
     h_st,  w_st, -d_st / 2, // 18
     h_st,  w_st,  d_st / 2, // 19
  
    // Back face
     h_st, -w_st, -d_st / 2, // 20
    -h_st, -w_st, -d_st / 2, // 21
    -h_st,  w_st, -d_st / 2, // 22
     h_st,  w_st, -d_st / 2, // 23
  ]);
  
  const short_train_indices = [
    // Front face
    0, 1, 2,
    0, 2, 3,
  
    // Left face
    4, 5, 6,
    4, 6, 7,
  
    // Top face
    8, 9, 10,
    8, 10, 11,
  
    // Bottom face
    12, 13, 14,
    12, 14, 15,

    // Right face
    16, 17, 18,
    16, 18, 19,

    // Back face
    20, 21, 22,
    20, 22, 23
  ];
  
  // Compute normals
  const short_train_normals = new Float32Array([
    // Front face
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
  
    // Left face
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
  
    // Top face
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
  
    // Bottom face
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
  
    // Right face
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    // Back face
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1
  ]);

const short_train_geometry = new THREE.BufferGeometry();
short_train_geometry.setAttribute('position', new THREE.BufferAttribute(short_train_positions, 3));
short_train_geometry.setAttribute('normal', new THREE.BufferAttribute(short_train_normals, 3));
short_train_geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(short_train_indices), 1));

const short_train_obj = new THREE.Mesh( short_train_geometry, phong_material );

// wireframe geometry
const st_wireframe_vertices = new Float32Array([
  // Front face
    -h_st, -w_st, d_st / 2,
     h_st, -w_st, d_st / 2,
     h_st, -w_st, d_st / 2,
     h_st, w_st, d_st / 2,
     h_st, w_st, d_st / 2,
    -h_st, w_st, d_st / 2,
    -h_st, w_st, d_st / 2,
    -h_st, -w_st, d_st / 2,

  // Left face
    -h_st, w_st, d_st / 2,
    -h_st, w_st, -d_st / 2,
    -h_st, w_st, -d_st / 2,
    -h_st, -w_st, -d_st / 2,
    -h_st, -w_st, -d_st / 2,
    -h_st, -w_st, d_st / 2,

  // Back face
     -h_st, w_st, -d_st / 2,
      h_st, w_st, -d_st / 2,
      h_st, w_st, -d_st / 2,
      h_st, -w_st, -d_st / 2,
      h_st, -w_st, -d_st / 2,
    -h_st, -w_st, -d_st / 2,
     

  // Right face
      h_st, w_st, -d_st / 2,
      h_st, w_st, d_st / 2,
      h_st, -w_st, d_st / 2,
      h_st, -w_st, -d_st / 2,
]);

const st_wireframe_geometry = new THREE.BufferGeometry();
st_wireframe_geometry.setAttribute( 'position', new THREE.BufferAttribute( st_wireframe_vertices, 3 ) );

const short_train_wireframe_obj = new THREE.LineSegments( st_wireframe_geometry );

// helper functions for transformations
function translationMatrix(tx, ty, tz) {
	return new THREE.Matrix4().set(
		1, 0, 0, tx,
		0, 1, 0, ty,
		0, 0, 1, tz,
		0, 0, 0, 1
	);
}

function rotationMatrixZ(theta) {
	return new THREE.Matrix4().set(
    Math.cos(theta), -Math.sin(theta), 0, 0,
    Math.sin(theta), Math.cos(theta), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
	);
}

function scalingMatrix(sx, sy, sz) {
  return new THREE.Matrix4().set(
    sx, 0, 0, 0,
    0, sy, 0, 0,
    0, 0, sz, 0,
    0, 0, 0, 1
  );
}

let st_mesh = [], st_wireframe = [];
for (let i = 0; i < 1; i++) {
  let st_m = short_train_obj.clone();
  let st_wf = short_train_wireframe_obj.clone();
  st_m.matrixAutoUpdate = false;
  st_wf.matrixAutoUpdate = false;
  st_wf.visible = false;
  st_mesh.push(st_m);
  st_wireframe.push(st_wf);
  scene.add(st_m);
  scene.add(st_wf);
}

// Animation Setup
let animation_time = 0, delta_animation_time, speed = 0.5, positionZ = 0;
const clock = new THREE.Clock();
let still = false;

function animate() {
  renderer.render(scene, camera);
  controls.update();
  if (!still) {
    delta_animation_time = clock.getDelta();
    animation_time += delta_animation_time;
    positionZ += speed * delta_animation_time;
    if (positionZ < -10) positionZ = 0; // Reset position
    st_mesh.forEach((m, i) => {
      const transform = translationMatrix(0, 0, positionZ);
      m.matrix.copy(transform);
      st_wireframe[i].matrix.copy(transform);
    });
  }
}

renderer.setAnimationLoop(animate);

// Window Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Key Press Handler
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 's': // Toggle movement
      still = !still;
      still ? clock.stop() : clock.start();
      break;
    case 'w': // Toggle wireframe
      st_mesh.forEach((m, i) => {
        m.visible = !m.visible;
        st_wireframe[i].visible = !st_wireframe[i].visible;
      });
      break;
    default:
      console.log(`Key ${event.key} pressed`);
  }
});