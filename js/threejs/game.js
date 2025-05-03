import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Config } from './config.js';
import { AssetLoader } from './assetLoader.js';
import { UI } from './ui.js';
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Bullet } from './bullet.js';
import { Skill } from './skill.js';
import { Ground } from './ground.js';
import { InputHandler } from './inputHandler.js';
import { Wave } from './wave.js';

export class Game {
    constructor() {
        // Game state
        this.paused = true;
        this.playerHealth = 1000;
        this.enemiesKilled = 0;
        
        // Game objects
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.skills = [];
        this.waves = [];
        
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Camera settings
        this.cameraAngle = Math.PI; // Start facing the opposite direction
        this.cameraHeight = -(Config.MAX_CAMERA_HEIGHT - 112); // Negative height to fix orientation
        this.cameraDistance = 200;
        this.zoomLevel = 0.2;
        
        // Input state
        this.moving = { left: false, right: false, up: false, down: false };
        this.rotatingLeft = false;
        this.rotatingRight = false;
        this.increasingHeight = false;
        this.decreasingHeight = false;
        this.movingCloser = false;
        this.movingFarther = false;
        this.casting = {
            a: false,
            s: false,
            d: false,
            f: false,
            g: false,
            h: false
        };
        
        // Skill casting
        this.lastCastTime = {
            a: 0,
            s: 0,
            d: 0,
            f: 0,
            g: 0,
            h: 0
        };
        
        // Mouse control
        this.isMiddleMouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Clock for frame-independent movement
        this.clock = new THREE.Clock();
        
        // Asset loader
        this.assetLoader = new AssetLoader();
        
        // UI
        this.ui = null;
        
        // Input handler
        this.inputHandler = null;
    }
    
    // Initialize the game
    async init() {
        // Load assets
        this.assets = await this.assetLoader.loadAll();
        
        // Set up Three.js scene
        this.setupScene();
        
        // Set up UI
        this.ui = new UI(this.scene, this.camera, this.renderer, this.assets);
        
        // Set up input handler
        this.inputHandler = new InputHandler(this);
        this.inputHandler.setupEventListeners();
        
        // Create player
        this.player = new Player(this.scene, this.assets);
        
        // Create ground
        this.ground = new Ground(this.scene, this.assets.textures.ground);
        
        // Spawn initial enemies
        this.spawnEnemies(20);
        console.log(`Spawned ${this.enemies.length} enemies`);
        
        // Start animation loop
        this.animate();
        
        return this;
    }
    
    // Set up the Three.js scene
    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50000);
        this.updateCameraPosition();
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        
        // Add lights
        this.setupLights();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    // Set up lights in the scene
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 1000, 0);
        directionalLight.castShadow = true;
        
        // Set up shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 5000;
        directionalLight.shadow.camera.left = -2000;
        directionalLight.shadow.camera.right = 2000;
        directionalLight.shadow.camera.top = 2000;
        directionalLight.shadow.camera.bottom = -2000;
        
        this.scene.add(directionalLight);
    }
    
    // Handle window resize
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.zoomLevel = this.getDynamicZoomLevel();
    }
    
    // Get dynamic zoom level based on screen size
    getDynamicZoomLevel() {
        const screenWidth = window.innerWidth;
        
        if (screenWidth < 1024) {
            return 0.1;
        }
        
        return 0.2;
    }
    
    // Start the game
    start() {
        this.paused = false;
    }
    
    // Pause the game
    pause() {
        this.paused = true;
    }
    
    // Main animation loop
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (!this.paused) {
            const delta = this.clock.getDelta();
            
            // Update camera position based on controls
            this.updateCamera(delta);
            
            // Update player
            this.updatePlayer(delta);
            
            // Update enemies
            this.updateEnemies(delta);
            
            // Update bullets
            this.updateBullets(delta);
            
            // Update skills
            this.updateSkills(delta);
            
            // Check collisions
            this.checkCollisions();
            
            // Auto-fire bullets
            this.autoFireBullets();
            
            // Update ground position relative to player
            this.ground.update(this.player.position.x, this.player.position.z);
            
            // Update UI
            this.ui.update();
        }
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
    
    // Update camera position and orientation
    updateCamera(delta) {
        // Update camera angle based on key presses
        if (this.rotatingLeft) {
            this.cameraAngle -= Math.PI / 180;
        }
        if (this.rotatingRight) {
            this.cameraAngle += Math.PI / 180;
        }
        
        // Adjust camera height based on key presses
        if (this.increasingHeight) {
            this.cameraHeight = Math.min(this.cameraHeight + 2, Config.MAX_CAMERA_HEIGHT);
        }
        if (this.decreasingHeight) {
            this.cameraHeight = Math.max(this.cameraHeight - 2, Config.MIN_CAMERA_HEIGHT);
        }
        
        // Move camera closer or further from the tank
        if (this.movingCloser) {
            this.zoomLevel = Math.min(this.zoomLevel + 0.005, Config.MAX_ZOOM_LEVEL);
        }
        if (this.movingFarther) {
            this.zoomLevel = Math.max(this.zoomLevel - 0.005, Config.MIN_ZOOM_LEVEL);
        }
        
        // Update camera position
        this.updateCameraPosition();
    }
    
    // Update camera position based on player position and camera settings
    updateCameraPosition() {
        if (!this.player) return;
        
        const playerPos = this.player.position;
        
        // Calculate camera position
        const camX = playerPos.x - (Math.cos(this.cameraAngle) * this.cameraDistance) / this.zoomLevel;
        const camZ = playerPos.z - (Math.sin(this.cameraAngle) * this.cameraDistance) / this.zoomLevel;
        
        // Update camera position and look at player
        this.camera.position.set(camX, Math.abs(this.cameraHeight) / this.zoomLevel, camZ);
        this.camera.lookAt(playerPos.x, 0, playerPos.z);
    }
    
    // Update player position and orientation
    updatePlayer(delta) {
        if (!this.player) return;
        
        // Calculate movement direction based on camera angle
        let moveX = 0;
        let moveZ = 0;
        
        if (this.moving.up) {
            moveX += Math.cos(this.cameraAngle) * Config.PLAYER_MOVE_SPEED;
            moveZ += Math.sin(this.cameraAngle) * Config.PLAYER_MOVE_SPEED;
        }
        if (this.moving.down) {
            moveX -= Math.cos(this.cameraAngle) * Config.PLAYER_MOVE_SPEED;
            moveZ -= Math.sin(this.cameraAngle) * Config.PLAYER_MOVE_SPEED;
        }
        if (this.moving.left) {
            moveX += Math.sin(this.cameraAngle) * Config.PLAYER_MOVE_SPEED;
            moveZ -= Math.cos(this.cameraAngle) * Config.PLAYER_MOVE_SPEED;
        }
        if (this.moving.right) {
            moveX -= Math.sin(this.cameraAngle) * Config.PLAYER_MOVE_SPEED;
            moveZ += Math.cos(this.cameraAngle) * Config.PLAYER_MOVE_SPEED;
        }
        
        // Update player position
        this.player.move(moveX, moveZ);
        
        // Update player turret angle
        this.player.updateTurretAngle();
    }
    
    // Update enemy positions and behaviors
    updateEnemies(delta) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Calculate distance to player
            const playerPos = this.player.position;
            const distanceToPlayer = new THREE.Vector2(
                enemy.position.x - playerPos.x,
                enemy.position.z - playerPos.z
            ).length();
            
            // Update enemy behavior based on distance to player
            if (distanceToPlayer > Config.ENEMY_SHOOTING_DISTANCE) {
                // Move towards player
                const angle = Math.atan2(
                    playerPos.z - enemy.position.z,
                    playerPos.x - enemy.position.x
                );
                
                const moveX = Math.cos(angle) * Config.ENEMY_MOVE_SPEED;
                const moveZ = Math.sin(angle) * Config.ENEMY_MOVE_SPEED;
                
                enemy.move(moveX, moveZ);
            } else if (Math.random() < 0.02) { // Approximately every 60 frames at 60 FPS
                // Shoot at player
                this.enemyShoot(enemy);
            }
        }
    }
    
    // Enemy shoots at player
    enemyShoot(enemy) {
        const playerPos = this.player.position;
        const bulletAngle = Math.atan2(
            playerPos.z - enemy.position.z,
            playerPos.x - enemy.position.x
        );
        
        const bullet = new Bullet(
            this.scene,
            enemy.position.x,
            0,
            enemy.position.z,
            Math.cos(bulletAngle),
            Math.sin(bulletAngle),
            false // Not from player
        );
        
        this.enemyBullets.push(bullet);
    }
    
    // Update bullets positions
    updateBullets(delta) {
        // Update player bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(Config.BULLET_SPEED);
            
            // Remove bullets that have traveled beyond the maximum distance
            if (bullet.distanceTraveled > Config.BULLET_MAX_DISTANCE) {
                bullet.remove();
                this.bullets.splice(i, 1);
            }
        }
        
        // Update enemy bullets
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            bullet.update(Config.ENEMY_BULLET_SPEED);
            
            // Remove bullets that have traveled beyond the maximum distance
            if (bullet.distanceTraveled > Config.BULLET_MAX_DISTANCE) {
                bullet.remove();
                this.enemyBullets.splice(i, 1);
            }
        }
    }
    
    // Update skills positions and effects
    updateSkills(delta) {
        // Update skills
        for (let i = this.skills.length - 1; i >= 0; i--) {
            const skill = this.skills[i];
            skill.update(Config.SKILL_SPEED);
            
            // Remove skills that have traveled beyond the maximum distance or expired
            if (skill.distanceTraveled > Config.SKILL_MAX_DISTANCE || skill.lifetime <= 0) {
                skill.remove();
                this.skills.splice(i, 1);
            }
        }
        
        // Update waves
        for (let i = this.waves.length - 1; i >= 0; i--) {
            const wave = this.waves[i];
            const isActive = wave.update();
            
            if (!isActive) {
                wave.remove();
                this.waves.splice(i, 1);
            }
        }
        
        // Process skill casting
        this.processCastSkills();
    }
    
    // Process skill casting based on key presses
    processCastSkills() {
        const currentTime = performance.now();
        const skillValues = this.ui.getSkillSliderValues();
        
        // Check each skill for casting
        Object.keys(this.casting).forEach(skill => {
            if (this.casting[skill] && currentTime - this.lastCastTime[skill] >= Config.COOLDOWNS[skill]) {
                this.castSkill(
                    skill,
                    skillValues[skill].target,
                    skillValues[skill].size
                );
                this.lastCastTime[skill] = currentTime;
            }
        });
    }
    
    // Cast a skill
    castSkill(type, numTargets, sizeFactor) {
        if (this.paused) return;
        
        console.log(`Casting skill ${type} with ${numTargets} targets and size ${sizeFactor}`);
        
        // Play skill sound
        this.playSkillSound(type);
        
        // Special handling for ally tanks (type 'g')
        if (type === 'g') {
            console.log('Spawning mini tank');
            this.spawnMiniTank();
            return;
        }
        
        // Special handling for wave effect (type 'h')
        if (type === 'h') {
            console.log('Creating wave effect');
            const wave = new Wave(
                this.scene,
                this.player.position.x,
                this.player.position.z,
                numTargets,
                Config.SKILL_BASE_SIZE * 5 * sizeFactor
            );
            this.waves.push(wave);
            return;
        }
        
        // Original behavior for other skills
        const targets = this.findNearestEnemies(numTargets);
        console.log(`Found ${targets.length} targets for skill ${type}`);
        
        // If no targets found, cast in a random direction
        if (targets.length === 0) {
            console.log('No targets found, casting in random direction');
            const randomAngle = Math.random() * Math.PI * 2;
            const skill = new Skill(
                this.scene,
                this.player.position.x,
                0,
                this.player.position.z,
                Math.cos(randomAngle),
                Math.sin(randomAngle),
                type,
                sizeFactor,
                this.assets
            );
            this.skills.push(skill);
            return;
        }
        
        for (const target of targets) {
            const dx = target.position.x - this.player.position.x;
            const dz = target.position.z - this.player.position.z;
            const angle = Math.atan2(dz, dx);
            
            console.log(`Casting skill ${type} at target at (${target.position.x}, ${target.position.z})`);
            
            const skill = new Skill(
                this.scene,
                this.player.position.x,
                0,
                this.player.position.z,
                Math.cos(angle),
                Math.sin(angle),
                type,
                sizeFactor,
                this.assets
            );
            
            skill.target = target;
            this.skills.push(skill);
        }
    }
    
    // Play sound effect for skill
    playSkillSound(type) {
        if (!this.assets.sounds[`skill${type.toUpperCase()}`]) return;
        
        // Create audio listener if not exists
        if (!this.audioListener) {
            this.audioListener = new THREE.AudioListener();
            this.camera.add(this.audioListener);
        }
        
        // Create audio source
        const sound = new THREE.Audio(this.audioListener);
        sound.setBuffer(this.assets.sounds[`skill${type.toUpperCase()}`]);
        sound.setVolume(0.5);
        sound.play();
    }
    
    // Spawn a mini tank (ally)
    spawnMiniTank() {
        const x = this.player.position.x + (Math.random() * 400 - 200);
        const z = this.player.position.z + (Math.random() * 400 - 200);
        
        // Random direction
        let dx = Math.random() * 2 - 1;
        let dz = Math.random() * 2 - 1;
        const dist = Math.sqrt(dx * dx + dz * dz);
        dx = dx / dist;
        dz = dz / dist;
        
        const skill = new Skill(
            this.scene,
            x,
            0,
            z,
            dx,
            dz,
            'g',
            1,
            this.assets
        );
        
        this.skills.push(skill);
    }
    
    // Find nearest enemies to player
    findNearestEnemies(numTargets) {
        if (!this.player) return [];
        
        // Sort enemies by distance to player
        const sortedEnemies = [...this.enemies].sort((a, b) => {
            const distA = new THREE.Vector2(
                a.position.x - this.player.position.x,
                a.position.z - this.player.position.z
            ).length();
            
            const distB = new THREE.Vector2(
                b.position.x - this.player.position.x,
                b.position.z - this.player.position.z
            ).length();
            
            return distA - distB;
        });
        
        return sortedEnemies.slice(0, numTargets);
    }
    
    // Automatically fire bullets at nearest enemy
    autoFireBullets() {
        // Fire bullets every BULLET_FIRE_INTERVAL frames
        if (Math.random() < 1 / Config.BULLET_FIRE_INTERVAL) {
            this.fireBullet();
        }
    }
    
    // Fire a bullet at the nearest enemy
    fireBullet() {
        const targets = this.findNearestEnemies(1);
        
        if (targets.length > 0) {
            const target = targets[0];
            const dx = target.position.x - this.player.position.x;
            const dz = target.position.z - this.player.position.z;
            const angle = Math.atan2(dz, dx);
            
            // Update player turret angle
            this.player.targetTurretAngle = -Math.atan2(dz, dx) - Math.PI / 2;
            
            // Create bullet
            const bullet = new Bullet(
                this.scene,
                this.player.position.x,
                0,
                this.player.position.z,
                Math.cos(angle),
                Math.sin(angle),
                true // From player
            );
            
            this.bullets.push(bullet);
        }
    }
    
    // Check collisions between game objects
    checkCollisions() {
        // Bullet collision with enemies
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                const distance = new THREE.Vector2(
                    bullet.position.x - enemy.position.x,
                    bullet.position.z - enemy.position.z
                ).length();
                
                if (distance < 40) {
                    enemy.health -= 10;
                    bullet.remove();
                    this.bullets.splice(i, 1);
                    
                    if (enemy.health <= 0) {
                        enemy.remove();
                        this.enemies.splice(j, 1);
                        this.enemiesKilled++;
                        
                        if (this.enemiesKilled >= Config.ENEMIES_TO_KILL) {
                            this.pause();
                        } else {
                            this.spawnEnemies(1);
                        }
                    }
                    
                    break;
                }
            }
        }
        
        // Skill collision with enemies
        for (let i = this.skills.length - 1; i >= 0; i--) {
            const skill = this.skills[i];
            
            // For ally tanks, use fixed size. For other skills, use expanding size
            const skillSize = skill.type === 'g'
                ? Config.SKILL_BASE_SIZE * 0.5 // Fixed size for ally tanks
                : Math.min(
                    Math.max(
                        10,
                        skill.distanceTraveled < Config.SKILL_EXPAND_DISTANCE
                            ? 10
                            : Config.SKILL_BASE_SIZE * skill.sizeFactor
                    ),
                    Config.SKILL_BASE_SIZE * skill.sizeFactor
                );
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (this.isColliding(skill, skillSize, enemy)) {
                    enemy.health -= 10;
                    
                    if (enemy.health <= 0) {
                        enemy.remove();
                        this.enemies.splice(j, 1);
                        this.enemiesKilled++;
                        
                        if (this.enemiesKilled >= Config.ENEMIES_TO_KILL) {
                            this.pause();
                        } else {
                            this.spawnEnemies(1);
                        }
                    }
                }
            }
        }
        
        // Enemy bullet collision with player
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            const distance = new THREE.Vector2(
                bullet.position.x - this.player.position.x,
                bullet.position.z - this.player.position.z
            ).length();
            
            if (distance < 40) {
                this.playerHealth -= 1;
                bullet.remove();
                this.enemyBullets.splice(i, 1);
                
                if (this.playerHealth <= 0) {
                    this.pause();
                }
            }
        }
    }
    
    // Check if a skill is colliding with an enemy
    isColliding(skill, skillSize, enemy) {
        // Check if the bounding boxes of the skill and enemy overlap
        return (
            skill.position.x - skillSize / 2 < enemy.position.x + 20 &&
            skill.position.x + skillSize / 2 > enemy.position.x - 20 &&
            skill.position.z - skillSize / 2 < enemy.position.z + 20 &&
            skill.position.z + skillSize / 2 > enemy.position.z - 20
        );
    }
    
    // Spawn enemies around the player
    spawnEnemies(count = 1) {
        if (!this.player) return;
        
        console.log(`Attempting to spawn ${count} enemies`);
        
        // Count the number of enemies within the spawn distance
        const enemiesWithinRadius = this.enemies.filter(enemy => {
            const distance = new THREE.Vector2(
                enemy.position.x - this.player.position.x,
                enemy.position.z - this.player.position.z
            ).length();
            
            return distance < Config.ENEMY_SPAWN_DISTANCE;
        }).length;
        
        console.log(`Current enemies within radius: ${enemiesWithinRadius}`);
        
        // Spawn new enemies if the count is below the maximum
        let spawned = 0;
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loops
        
        while (enemiesWithinRadius + spawned < Config.MAX_ENEMIES && spawned < count && attempts < maxAttempts) {
            attempts++;
            
            // Calculate a random distance between 200 and ENEMY_SPAWN_DISTANCE
            const spawnDistance = 200 + Math.random() * (Config.ENEMY_SPAWN_DISTANCE - 200);
            
            // Calculate a random angle
            const angle = Math.random() * Math.PI * 2;
            
            // Calculate position based on distance and angle
            const x = this.player.position.x + Math.cos(angle) * spawnDistance;
            const z = this.player.position.z + Math.sin(angle) * spawnDistance;
            
            // Ensure enemies do not spawn too close to the player
            const distance = new THREE.Vector2(
                x - this.player.position.x,
                z - this.player.position.z
            ).length();
            
            if (distance > Config.TANK_SIZE && distance < Config.ENEMY_SPAWN_DISTANCE) {
                const enemy = new Enemy(this.scene, x, z);
                this.enemies.push(enemy);
                spawned++;
                console.log(`Spawned enemy at (${x}, ${z}), distance: ${distance}`);
            }
        }
        
        console.log(`Successfully spawned ${spawned} enemies after ${attempts} attempts`);
    }
    
    // Get current game state
    getState() {
        return {
            playerHealth: this.playerHealth,
            enemiesKilled: this.enemiesKilled,
            cameraHeight: this.cameraHeight,
            cameraAngle: this.cameraAngle,
            zoomLevel: this.zoomLevel,
            gamePaused: this.paused
        };
    }
}