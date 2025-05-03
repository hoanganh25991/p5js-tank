import * as THREE from 'three';

export class Wave {
    constructor(scene, x, z, numTargets, maxRadius) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, 0, z);
        this.waves = Array.from({ length: numTargets }, () => ({ radius: 50, alpha: 1.0 }));
        this.maxRadius = maxRadius;
        this.speed = 8;
        this.waveGap = 100; // Gap between waves
        this.startTimes = [0, 10, 20, 30, 40]; // Stagger start times
        this.frameCount = 0;
        
        // Create wave meshes
        this.waveGroups = [];
        this.createWaves();
    }
    
    // Create wave meshes
    createWaves() {
        // Create a group for all waves
        this.waveGroup = new THREE.Group();
        this.scene.add(this.waveGroup);
        this.waveGroup.position.set(this.position.x, 0, this.position.z);
        
        // Create individual wave meshes
        for (let i = 0; i < this.waves.length; i++) {
            const waveGeometry = new THREE.RingGeometry(0, 50, 32);
            const waveMaterial = new THREE.MeshBasicMaterial({
                color: 0x00b4ff,
                transparent: true,
                opacity: 1.0,
                side: THREE.DoubleSide
            });
            
            const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
            waveMesh.rotation.x = -Math.PI / 2; // Rotate to lie flat on the ground
            waveMesh.position.y = 5; // Higher above ground to be visible
            
            this.waveGroups.push({
                mesh: waveMesh,
                material: waveMaterial
            });
            
            this.waveGroup.add(waveMesh);
        }
    }
    
    // Update wave animation
    update() {
        this.frameCount++;
        let anyWaveActive = false;
        
        for (let i = 0; i < this.waves.length; i++) {
            if (this.frameCount > this.startTimes[i]) {
                let wave = this.waves[i];
                let waveGroup = this.waveGroups[i];
                
                if (wave.radius < this.maxRadius) {
                    // Expand wave
                    wave.radius += this.speed;
                    wave.alpha = THREE.MathUtils.mapLinear(wave.radius, 50, this.maxRadius, 1.0, 0.0);
                    
                    // Update wave mesh
                    waveGroup.mesh.geometry.dispose();
                    waveGroup.mesh.geometry = new THREE.RingGeometry(wave.radius - 10, wave.radius, 32);
                    waveGroup.material.opacity = wave.alpha;
                    
                    anyWaveActive = true;
                    
                    // Check collision with enemies
                    this.checkCollisions(wave.radius);
                }
            } else {
                anyWaveActive = true;
            }
        }
        
        return anyWaveActive;
    }
    
    // Check collisions with enemies
    checkCollisions(radius) {
        // This is handled in the Game class
    }
    
    // Remove waves from scene
    remove() {
        this.scene.remove(this.waveGroup);
        
        // Dispose geometries and materials
        for (const waveGroup of this.waveGroups) {
            waveGroup.mesh.geometry.dispose();
            waveGroup.material.dispose();
        }
    }
}