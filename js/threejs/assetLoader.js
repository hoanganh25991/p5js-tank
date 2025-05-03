import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

// Class to handle loading all game assets
export class AssetLoader {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.objLoader = new OBJLoader();
        this.mtlLoader = new MTLLoader();
        this.audioLoader = new THREE.AudioLoader();
        
        this.assets = {
            textures: {},
            models: {},
            sounds: {}
        };
    }
    
    // Load all assets needed for the game
    async loadAll() {
        try {
            await Promise.all([
                this.loadTextures(),
                this.loadModels(),
                this.loadSounds()
            ]);
            console.log('All assets loaded successfully');
            return this.assets;
        } catch (error) {
            console.error('Error loading assets:', error);
            throw error;
        }
    }
    
    // Load all textures
    async loadTextures() {
        const texturePromises = [
            this.loadTexture('ground', 'images/rocky_terrain_02_diff_4k.jpg'),
            this.loadTexture('tank', 'images/photo-1539538507524-eab6a4184604.jpg')
        ];
        
        await Promise.all(texturePromises);
    }
    
    // Load a single texture
    loadTexture(name, url) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                url,
                (texture) => {
                    this.assets.textures[name] = texture;
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error(`Error loading texture ${name}:`, error);
                    reject(error);
                }
            );
        });
    }
    
    // Load all 3D models
    async loadModels() {
        const modelPromises = [
            this.loadObjModel('shuriken', 'models/shuriken.obj'),
            this.loadObjModel('fireball', 'models/fireball.obj')
        ];
        
        await Promise.all(modelPromises);
    }
    
    // Load a single OBJ model
    loadObjModel(name, url) {
        return new Promise((resolve, reject) => {
            this.objLoader.load(
                url,
                (object) => {
                    this.assets.models[name] = object;
                    resolve(object);
                },
                undefined,
                (error) => {
                    console.error(`Error loading model ${name}:`, error);
                    reject(error);
                }
            );
        });
    }
    
    // Load all sound effects
    async loadSounds() {
        const soundPromises = [
            this.loadSound('skillA', 'sounds/steampunk-weapon-single-shot-188051.mp3'),
            this.loadSound('skillS', 'sounds/barrett-m107-sound-effect-245967.mp3'),
            this.loadSound('skillD', 'sounds/gun-shots-from-a-distance-23-39722.mp3'),
            this.loadSound('skillF', 'sounds/gun-shot-sound-effect-224087.mp3'),
            this.loadSound('skillG', 'sounds/surprise-sound-effect-99300.mp3'),
            this.loadSound('skillH', 'sounds/ocean-wave-fast-236009.mp3')
        ];
        
        await Promise.all(soundPromises);
    }
    
    // Load a single sound effect
    loadSound(name, url) {
        return new Promise((resolve, reject) => {
            this.audioLoader.load(
                url,
                (buffer) => {
                    this.assets.sounds[name] = buffer;
                    resolve(buffer);
                },
                undefined,
                (error) => {
                    console.error(`Error loading sound ${name}:`, error);
                    reject(error);
                }
            );
        });
    }
    
    // No font loading needed for Three.js implementation
}