import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { LIGHTING_SETTINGS, CAMERA_SETTINGS } from './constants.js';

/**
 * Initializes and returns the scene, camera, renderer, and controls.
 * Also adds axis lines and lighting to the scene.
 * @returns {Object} - { scene, camera, renderer, controls }
 */
export function initializeScene() {
  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(
    CAMERA_SETTINGS.FOV,
    CAMERA_SETTINGS.ASPECT_RATIO,
    CAMERA_SETTINGS.NEAR,
    CAMERA_SETTINGS.FAR
  );
  camera.position.set(...CAMERA_SETTINGS.POSITION);

  // Renderer
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Orbit Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 5, 0);

  // Lighting
  const pointLight = new THREE.PointLight(
    LIGHTING_SETTINGS.POINT_LIGHT.color,
    LIGHTING_SETTINGS.POINT_LIGHT.intensity,
    LIGHTING_SETTINGS.POINT_LIGHT.distance
  );
  pointLight.position.set(...LIGHTING_SETTINGS.POINT_LIGHT.position);
  scene.add(pointLight);

  const directionalLight = new THREE.DirectionalLight(
    LIGHTING_SETTINGS.DIRECTIONAL_LIGHT.color,
    LIGHTING_SETTINGS.DIRECTIONAL_LIGHT.intensity
  );
  directionalLight.position.set(...LIGHTING_SETTINGS.DIRECTIONAL_LIGHT.position).normalize();
  scene.add(directionalLight);

  scene.add(new THREE.AmbientLight(LIGHTING_SETTINGS.AMBIENT_LIGHT.color));

  const loader = new THREE.TextureLoader();
  loader.load(
    './assets/clouds.jpg', // Make sure the image exists
    (texture) => {
        scene.background = texture;
    },
    undefined,
    (error) => {
        console.error('Error loading background texture:', error);
    }
);
  return { scene, camera, renderer, controls };
}
