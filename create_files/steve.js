import * as THREE from 'three';

export class Steve extends THREE.Group {
  constructor() {
    super(); // Initializes the THREE.Group
    
    // Materials
    const headMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc99 });
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x0066ff });
    const legMaterial = new THREE.MeshBasicMaterial({ color: 0x3333cc });
    const armMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc99 });

    // Head
    this.head = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), headMaterial);
    this.head.position.set(0, 0.425, 0);
    this.add(this.head);

    // Torso
    this.torso = new THREE.Mesh(new THREE.BoxGeometry(0.225, 0.2, 0.075), bodyMaterial);
    this.torso.position.set(0, 0.25, 0);
    this.add(this.torso);

    // Left Arm
    this.leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.15, 0.075), armMaterial);
    this.leftArm.position.set(-0.15, 0.275, 0);
    this.add(this.leftArm);

    // Right Arm
    this.rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.15, 0.075), armMaterial);
    this.rightArm.position.set(0.15, 0.275, 0);
    this.add(this.rightArm);

    // Left Leg
    this.leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.15, 0.075), legMaterial);
    this.leftLeg.position.set(-0.075, 0.075, 0);
    this.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.15, 0.075), legMaterial);
    this.rightLeg.position.set(0.075, 0.075, 0);
    this.add(this.rightLeg);

    // Position Steve at the origin (this is optional since it's the default)
    this.position.set(0, 0, 0);
  }

  animateLimbs(runtime, currentSpeed) {
    // Animate the legs to simulate running
    const legRotation = Math.sin(runtime * currentSpeed * 1.5) * 0.5; // Adjust speed/amplitude as needed
    this.leftLeg.rotation.x = legRotation;
    this.rightLeg.rotation.x = -legRotation;

    // Animate the arms to simulate running
    const armRotation = Math.sin(runtime *currentSpeed * 1.5) * 0.5;
    this.leftArm.rotation.x = -armRotation;
    this.rightArm.rotation.x = armRotation;
  }
}
