import * as THREE from 'three';
import { Config } from './config.js';

export class Bullet {
    constructor(scene, x, y, z, dx, dz, isPlayerBullet = true) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, y, z);
        this.direction = new THREE.Vector2(dx, dz);
        this.distanceTraveled = 0;
        this.isPlayerBullet = isPlayerBullet;
        
        // Create bullet mesh
        this.createBullet();
    }
    
    // Create bullet mesh
    createBullet() {
        const geometry = new THREE.SphereGeometry(Config.BULLET_SIZE, 8, 8);
        const material = new THREE.MeshPhongMaterial({ 
            color: this.isPlayerBullet ? 0x00ff00 : 0xff0000,
            emissive: this.isPlayerBullet ? 0x00ff00 : 0xff0000,
            emissiveIntensity: 0.5
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
        
        // Update position
        this.updatePosition();
    }
    
    // Update bullet position
    update(speed) {
        // Move bullet
        this.position.x += this.direction.x * speed;
        this.position.z += this.direction.y * speed;
        this.distanceTraveled += speed;
        
        // Update position
        this.updatePosition();
    }
    
    // Update bullet position
    updatePosition() {
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
    }
    
    // Remove bullet from scene
    remove() {
        this.scene.remove(this.mesh);
    }
}