import * as THREE from 'three';

export class Enemy {
    constructor(scene, x, z) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, 0, z);
        this.health = 10;
        
        // Create enemy mesh
        this.createEnemy();
    }
    
    // Create enemy mesh
    createEnemy() {
        // Create a group for the enemy
        this.enemyGroup = new THREE.Group();
        this.scene.add(this.enemyGroup);
        
        // Create enemy body
        const geometry = new THREE.BoxGeometry(40, 40, 40);
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.enemyGroup.add(this.mesh);
        
        // Update position
        this.updatePosition();
    }
    
    // Move the enemy
    move(dx, dz) {
        // Update position
        this.position.x += dx;
        this.position.z += dz;
        
        // Update position
        this.updatePosition();
    }
    
    // Update enemy position
    updatePosition() {
        this.enemyGroup.position.set(this.position.x, 0, this.position.z);
    }
    
    // Remove enemy from scene
    remove() {
        this.scene.remove(this.enemyGroup);
    }
}