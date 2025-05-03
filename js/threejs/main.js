import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { Game } from './game.js';
import { Config } from './config.js';
import { AssetLoader } from './assetLoader.js';
import { UI } from './ui.js';

// Create a global game variable
let gameInstance;

// Define startGame function in the global scope
window.startGame = function() {
    if (gameInstance) {
        gameInstance.start();
        document.querySelector(".start-button").style.display = "none";
    } else {
        console.error("Game not initialized yet");
    }
};

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create the main game instance
    gameInstance = new Game();
    
    // Initialize the game
    gameInstance.init().then(() => {
        console.log('Game initialized successfully');
        
        // Update the status board every second
        setInterval(() => {
            UI.updateStatusBoard(gameInstance.getState());
        }, 1000);
    });
});