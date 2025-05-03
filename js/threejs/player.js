import * as THREE from 'three';
import { Config } from './config.js';

export class Player {
    constructor(scene, assets) {
        this.scene = scene;
        this.assets = assets;
        
        // Player position
        this.position = new THREE.Vector3(0, 0, 0);
        
        // Player rotation
        this.angle = 0; // Tank body angle
        this.turretAngle = 0; // Turret angle
        this.targetTurretAngle = 0; // Target turret angle for smooth rotation
        
        // Create the tank mesh
        this.createTank();
    }
    
    // Create the tank mesh
    createTank() {
        // Create a group for the tank
        this.tankGroup = new THREE.Group();
        this.scene.add(this.tankGroup);
        
        // Create tank body
        const bodyGeometry = new THREE.BoxGeometry(Config.TANK_SIZE, 20, Config.TANK_SIZE);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            map: this.assets.textures.tank 
        });
        this.tankBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.tankBody.castShadow = true;
        this.tankBody.receiveShadow = true;
        this.tankGroup.add(this.tankBody);
        
        // Create turret group (for independent rotation)
        this.turretGroup = new THREE.Group();
        this.turretGroup.position.y = 15; // Position on top of the tank body
        this.tankGroup.add(this.turretGroup);
        
        // Create turret
        const turretGeometry = new THREE.BoxGeometry(30, 10, 30);
        const turretMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
        this.turret = new THREE.Mesh(turretGeometry, turretMaterial);
        this.turret.castShadow = true;
        this.turretGroup.add(this.turret);
        
        // Create gun barrel
        const barrelGeometry = new THREE.CylinderGeometry(5, 5, 40);
        const barrelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        this.barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        this.barrel.rotation.x = Math.PI / 2; // Rotate to lie horizontally
        this.barrel.position.z = -20; // Position at the front of the turret
        this.turretGroup.add(this.barrel);
        
        // Update position
        this.updatePosition();
    }
    
    // Move the tank
    move(dx, dz) {
        // Update position
        this.position.x += dx;
        this.position.z += dz;
        
        // Update tank angle if moving
        if (dx !== 0 || dz !== 0) {
            this.angle = Math.atan2(dz, dx);
        }
        
        // Update position
        this.updatePosition();
    }
    
    // Update tank position and rotation
    updatePosition() {
        // Update tank group position
        this.tankGroup.position.set(this.position.x, 0, this.position.z);
        
        // Update tank body rotation
        this.tankBody.rotation.y = this.angle;
        
        // Update turret rotation (relative to body)
        this.turretGroup.rotation.y = this.turretAngle - this.angle;
    }
    
    // Update turret angle with smooth interpolation
    updateTurretAngle() {
        // Smoothly interpolate towards target angle
        this.turretAngle = this.turretAngle + (this.targetTurretAngle - this.turretAngle) * 0.1;
        
        // Update position to apply the new angle
        this.updatePosition();
    }
    
    // Draw aim line to target
    drawAimLine(target) {
        // Remove previous aim line if exists
        if (this.aimLine) {
            this.scene.remove(this.aimLine);
        }
        
        // Calculate direction to target
        const dx = target.position.x - this.position.x;
        const dz = target.position.z - this.position.z;
        const angle = Math.atan2(dz, dx);
        
        // Calculate end point
        const aimX = this.position.x + Math.cos(angle) * Config.AIM_LINE_LENGTH;
        const aimZ = this.position.z + Math.sin(angle) * Config.AIM_LINE_LENGTH;
        
        // Create line geometry
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(this.position.x, 0, this.position.z),
            new THREE.Vector3(aimX, 0, aimZ)
        ]);
        
        // Create line material
        const material = new THREE.LineBasicMaterial({ 
            color: 0xffff00,
            transparent: true,
            opacity: 0.6,
            linewidth: 2
        });
        
        // Create line
        this.aimLine = new THREE.Line(geometry, material);
        this.scene.add(this.aimLine);
    }
}