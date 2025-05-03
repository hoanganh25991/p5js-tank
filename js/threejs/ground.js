import * as THREE from 'three';
import { Config } from './config.js';

export class Ground {
    constructor(scene, groundTexture) {
        this.scene = scene;
        this.groundTexture = groundTexture;
        
        // Configure ground texture
        this.groundTexture.wrapS = THREE.RepeatWrapping;
        this.groundTexture.wrapT = THREE.RepeatWrapping;
        this.groundTexture.repeat.set(0.25, 0.25); // Scale UV coordinates to 1/4 to make texture 4x larger
        
        // Create ground tiles
        this.groundTiles = [];
        this.createGround();
    }
    
    // Create ground tiles
    createGround() {
        // Create a group for all ground tiles
        this.groundGroup = new THREE.Group();
        this.scene.add(this.groundGroup);
        
        // Create ground tiles in a grid
        for (let x = -Config.GROUND_TILES; x <= Config.GROUND_TILES; x++) {
            for (let z = -Config.GROUND_TILES; z <= Config.GROUND_TILES; z++) {
                this.createGroundTile(x, z);
            }
        }
    }
    
    // Create a single ground tile
    createGroundTile(gridX, gridZ) {
        const geometry = new THREE.PlaneGeometry(Config.GROUND_TILE_SIZE, Config.GROUND_TILE_SIZE);
        const material = new THREE.MeshStandardMaterial({
            map: this.groundTexture,
            side: THREE.DoubleSide,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const tile = new THREE.Mesh(geometry, material);
        tile.rotation.x = -Math.PI / 2; // Rotate to lie flat
        tile.position.set(
            gridX * Config.GROUND_REPEAT_DISTANCE,
            0,
            gridZ * Config.GROUND_REPEAT_DISTANCE
        );
        tile.receiveShadow = true;
        
        this.groundTiles.push({
            mesh: tile,
            gridX: gridX,
            gridZ: gridZ
        });
        
        this.groundGroup.add(tile);
    }
    
    // Update ground position relative to player
    update(playerX, playerZ) {
        // Calculate which grid cell the player is in
        const gridX = Math.floor(playerX / Config.GROUND_REPEAT_DISTANCE);
        const gridZ = Math.floor(playerZ / Config.GROUND_REPEAT_DISTANCE);
        
        // Check if any tiles need to be repositioned
        for (const tile of this.groundTiles) {
            // Calculate the distance in grid units
            const distX = tile.gridX - gridX;
            const distZ = tile.gridZ - gridZ;
            
            // If the tile is too far away, reposition it
            if (Math.abs(distX) > Config.GROUND_TILES || Math.abs(distZ) > Config.GROUND_TILES) {
                // Calculate new grid position
                let newGridX = tile.gridX;
                let newGridZ = tile.gridZ;
                
                if (distX > Config.GROUND_TILES) {
                    newGridX = gridX - Config.GROUND_TILES;
                } else if (distX < -Config.GROUND_TILES) {
                    newGridX = gridX + Config.GROUND_TILES;
                }
                
                if (distZ > Config.GROUND_TILES) {
                    newGridZ = gridZ - Config.GROUND_TILES;
                } else if (distZ < -Config.GROUND_TILES) {
                    newGridZ = gridZ + Config.GROUND_TILES;
                }
                
                // Update tile position
                tile.gridX = newGridX;
                tile.gridZ = newGridZ;
                tile.mesh.position.set(
                    newGridX * Config.GROUND_REPEAT_DISTANCE,
                    0,
                    newGridZ * Config.GROUND_REPEAT_DISTANCE
                );
            }
        }
    }
}