import * as THREE from 'three';
import { Config } from './config.js';

export class Skill {
    constructor(scene, x, y, z, dx, dz, type, sizeFactor, assets) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, y, z);
        this.direction = new THREE.Vector2(dx, dz);
        this.type = type;
        this.sizeFactor = sizeFactor;
        this.assets = assets;
        this.distanceTraveled = 0;
        this.lifetime = 200;
        this.target = null;
        
        // Create skill mesh
        this.createSkill();
    }
    
    // Create skill mesh
    createSkill() {
        // Create a group for the skill
        this.skillGroup = new THREE.Group();
        this.scene.add(this.skillGroup);
        
        // Create different skill types
        switch (this.type) {
            case 'a': // Fireball
                this.createFireball();
                break;
            case 's': // Cube
                this.createCube();
                break;
            case 'd': // Cone
                this.createCone();
                break;
            case 'f': // Shuriken
                this.createShuriken();
                break;
            case 'g': // Mini tank
                this.createMiniTank();
                break;
            default:
                this.createDefaultSkill();
        }
        
        // Update position
        this.updatePosition();
    }
    
    // Create fireball skill
    createFireball() {
        if (this.assets.models.fireball) {
            // Clone the fireball model
            this.mesh = this.assets.models.fireball.clone();
            this.mesh.scale.set(this.sizeFactor * 0.3, this.sizeFactor * 0.3, this.sizeFactor * 0.3);
            
            // Apply material
            this.mesh.traverse(child => {
                if (child.isMesh) {
                    child.material = new THREE.MeshPhongMaterial({
                        color: 0xff0000,
                        emissive: 0xff5500,
                        emissiveIntensity: 0.5
                    });
                    child.castShadow = true;
                }
            });
        } else {
            // Fallback if model not loaded
            const geometry = new THREE.SphereGeometry(Config.SKILL_BASE_SIZE * this.sizeFactor * 0.1, 16, 16);
            const material = new THREE.MeshPhongMaterial({
                color: 0xff0000,
                emissive: 0xff5500,
                emissiveIntensity: 0.5
            });
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.castShadow = true;
        }
        
        this.skillGroup.add(this.mesh);
    }
    
    // Create cube skill
    createCube() {
        const size = Config.SKILL_BASE_SIZE * this.sizeFactor;
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8,
            emissive: 0x00ffff,
            emissiveIntensity: 0.3
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.skillGroup.add(this.mesh);
    }
    
    // Create cone skill
    createCone() {
        const radius = Config.SKILL_BASE_SIZE * this.sizeFactor * 0.5;
        const height = Config.SKILL_BASE_SIZE * this.sizeFactor * 2;
        const geometry = new THREE.ConeGeometry(radius, height, 16);
        const material = new THREE.MeshPhongMaterial({
            color: 0xffa500,
            transparent: true,
            opacity: 0.8,
            emissive: 0xffa500,
            emissiveIntensity: 0.3
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.rotation.x = Math.PI / 2; // Rotate to point forward
        this.skillGroup.add(this.mesh);
    }
    
    // Create shuriken skill
    createShuriken() {
        if (this.assets.models.shuriken) {
            // Clone the shuriken model
            this.mesh = this.assets.models.shuriken.clone();
            this.mesh.scale.set(this.sizeFactor * 0.1, this.sizeFactor * 0.1, this.sizeFactor * 0.1);
            
            // Apply material
            this.mesh.traverse(child => {
                if (child.isMesh) {
                    child.material = new THREE.MeshPhongMaterial({
                        color: 0xffff00,
                        emissive: 0xffff00,
                        emissiveIntensity: 0.3
                    });
                    child.castShadow = true;
                }
            });
        } else {
            // Fallback if model not loaded
            const geometry = new THREE.TorusGeometry(
                Config.SKILL_BASE_SIZE * this.sizeFactor * 0.5,
                Config.SKILL_BASE_SIZE * this.sizeFactor * 0.1,
                8,
                4
            );
            const material = new THREE.MeshPhongMaterial({
                color: 0xffff00,
                emissive: 0xffff00,
                emissiveIntensity: 0.3
            });
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.castShadow = true;
        }
        
        this.skillGroup.add(this.mesh);
    }
    
    // Create mini tank skill
    createMiniTank() {
        // Create tank body
        const bodyGeometry = new THREE.BoxGeometry(30, 10, 30);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        this.tankBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.tankBody.castShadow = true;
        this.skillGroup.add(this.tankBody);
        
        // Create turret
        const turretGeometry = new THREE.BoxGeometry(15, 5, 15);
        const turretMaterial = new THREE.MeshPhongMaterial({ color: 0x008800 });
        this.turret = new THREE.Mesh(turretGeometry, turretMaterial);
        this.turret.position.y = 7.5;
        this.turret.castShadow = true;
        this.skillGroup.add(this.turret);
        
        // Create gun barrel
        const barrelGeometry = new THREE.CylinderGeometry(2, 2, 20);
        const barrelMaterial = new THREE.MeshPhongMaterial({ color: 0x006600 });
        this.barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        this.barrel.rotation.x = Math.PI / 2; // Rotate to lie horizontally
        this.barrel.position.set(0, 7.5, -10);
        this.barrel.castShadow = true;
        this.skillGroup.add(this.barrel);
    }
    
    // Create default skill
    createDefaultSkill() {
        const geometry = new THREE.SphereGeometry(Config.SKILL_BASE_SIZE * this.sizeFactor * 0.5, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.3
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.skillGroup.add(this.mesh);
    }
    
    // Update skill position and properties
    update(speed) {
        // Decrease lifetime
        this.lifetime--;
        
        // Move skill
        this.position.x += this.direction.x * speed;
        this.position.z += this.direction.y * speed;
        this.distanceTraveled += speed;
        
        // Rotate skill for visual effect
        if (this.mesh) {
            this.mesh.rotation.x += 0.05;
            this.mesh.rotation.y += 0.05;
            this.mesh.rotation.z += 0.05;
        }
        
        // Update position
        this.updatePosition();
        
        // Draw aim line if targeting an enemy
        if (this.target) {
            this.drawAimLine();
        }
    }
    
    // Update skill position
    updatePosition() {
        this.skillGroup.position.set(this.position.x, this.position.y, this.position.z);
    }
    
    // Draw aim line to target
    drawAimLine() {
        // Remove previous aim line if exists
        if (this.aimLine) {
            this.scene.remove(this.aimLine);
        }
        
        // Create line geometry
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(this.position.x, 0, this.position.z),
            new THREE.Vector3(this.target.position.x, 0, this.target.position.z)
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
    
    // Remove skill from scene
    remove() {
        if (this.aimLine) {
            this.scene.remove(this.aimLine);
        }
        this.scene.remove(this.skillGroup);
    }
}