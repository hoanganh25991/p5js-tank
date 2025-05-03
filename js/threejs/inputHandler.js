import { Config } from './config.js';

export class InputHandler {
    constructor(game) {
        this.game = game;
    }
    
    // Set up event listeners for keyboard and mouse input
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
        
        // Mouse events
        document.addEventListener('mousedown', (event) => this.handleMouseDown(event));
        document.addEventListener('mouseup', (event) => this.handleMouseUp(event));
        document.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        document.addEventListener('wheel', (event) => this.handleMouseWheel(event));
    }
    
    // Handle key down events
    handleKeyDown(event) {
        if (this.game.paused) return;
        
        const key = event.key.toLowerCase();
        const keyCode = event.keyCode;
        
        switch (keyCode) {
            case 37: // Left arrow
                this.game.moving.left = true;
                break;
            case 39: // Right arrow
                this.game.moving.right = true;
                break;
            case 38: // Up arrow
                this.game.moving.up = true;
                break;
            case 40: // Down arrow
                this.game.moving.down = true;
                break;
        }
        
        switch (key) {
            case 'a':
                this.game.casting.a = true;
                break;
            case 's':
                this.game.casting.s = true;
                break;
            case 'd':
                this.game.casting.d = true;
                break;
            case 'f':
                this.game.casting.f = true;
                break;
            case 'g':
                this.game.casting.g = true;
                break;
            case 'h':
                this.game.casting.h = true;
                break;
            case 'q':
                this.game.rotatingLeft = true;
                break;
            case 'w':
                this.game.rotatingRight = true;
                break;
            case 'e':
                this.game.increasingHeight = true;
                break;
            case 'r':
                this.game.decreasingHeight = true;
                break;
            case 't':
                this.game.movingCloser = true;
                break;
            case 'y':
                this.game.movingFarther = true;
                break;
        }
    }
    
    // Handle key up events
    handleKeyUp(event) {
        if (this.game.paused) return;
        
        const key = event.key.toLowerCase();
        const keyCode = event.keyCode;
        
        switch (keyCode) {
            case 37: // Left arrow
                this.game.moving.left = false;
                break;
            case 39: // Right arrow
                this.game.moving.right = false;
                break;
            case 38: // Up arrow
                this.game.moving.up = false;
                break;
            case 40: // Down arrow
                this.game.moving.down = false;
                break;
        }
        
        switch (key) {
            case 'a':
                this.game.casting.a = false;
                break;
            case 's':
                this.game.casting.s = false;
                break;
            case 'd':
                this.game.casting.d = false;
                break;
            case 'f':
                this.game.casting.f = false;
                break;
            case 'g':
                this.game.casting.g = false;
                break;
            case 'h':
                this.game.casting.h = false;
                break;
            case 'q':
                this.game.rotatingLeft = false;
                break;
            case 'w':
                this.game.rotatingRight = false;
                break;
            case 'e':
                this.game.increasingHeight = false;
                break;
            case 'r':
                this.game.decreasingHeight = false;
                break;
            case 't':
                this.game.movingCloser = false;
                break;
            case 'y':
                this.game.movingFarther = false;
                break;
        }
    }
    
    // Handle mouse down events
    handleMouseDown(event) {
        if (this.game.paused) return;
        
        // Middle mouse button
        if (event.button === 1) {
            this.game.isMiddleMouseDown = true;
            this.game.lastMouseX = event.clientX;
            this.game.lastMouseY = event.clientY;
        }
    }
    
    // Handle mouse up events
    handleMouseUp(event) {
        if (this.game.paused) return;
        
        // Middle mouse button
        if (event.button === 1) {
            this.game.isMiddleMouseDown = false;
        }
    }
    
    // Handle mouse move events
    handleMouseMove(event) {
        if (this.game.paused || !this.game.isMiddleMouseDown) return;
        
        // Calculate mouse movement
        const deltaX = event.clientX - this.game.lastMouseX;
        const deltaY = event.clientY - this.game.lastMouseY;
        
        // Adjust camera angle based on horizontal movement
        this.game.cameraAngle += deltaX * 0.01;
        
        // Adjust camera height based on vertical movement
        this.game.cameraHeight = Math.max(
            Math.min(
                this.game.cameraHeight - deltaY * 2,
                Config.MAX_CAMERA_HEIGHT
            ),
            Config.MIN_CAMERA_HEIGHT
        );
        
        // Update last position
        this.game.lastMouseX = event.clientX;
        this.game.lastMouseY = event.clientY;
    }
    
    // Handle mouse wheel events
    handleMouseWheel(event) {
        if (this.game.paused) return;
        
        // Prevent default behavior (page scrolling)
        event.preventDefault();
        
        // Adjust zoom level with mouse wheel when middle mouse is not held
        if (!this.game.isMiddleMouseDown) {
            const zoomChange = event.deltaY > 0 ? 0.01 : -0.01;
            this.game.zoomLevel = Math.max(
                Math.min(
                    this.game.zoomLevel + zoomChange,
                    Config.MAX_ZOOM_LEVEL
                ),
                Config.MIN_ZOOM_LEVEL
            );
        }
    }
}