import * as THREE from 'three';
import { Config } from './config.js';

// Class to handle UI elements
export class UI {
    constructor(scene, camera, renderer, assets) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.assets = assets;
        
        this.skillSliders = {
            a: { target: null, size: null },
            s: { target: null, size: null },
            d: { target: null, size: null },
            f: { target: null, size: null },
            g: { target: null, size: null },
            h: { target: null, size: null }
        };
        
        this.setupSkillSliders();
    }
    
    // Set up skill sliders
    setupSkillSliders() {
        const skills = ['a', 's', 'd', 'f', 'g', 'h'];
        const sliderY = 20;
        const sliderSpacing = 60;
        
        skills.forEach((skill, index) => {
            const y = sliderY + index * sliderSpacing;
            
            // Target slider (1-100)
            this.skillSliders[skill].target = document.createElement('input');
            this.skillSliders[skill].target.type = 'range';
            this.skillSliders[skill].target.min = 1;
            this.skillSliders[skill].target.max = 100;
            this.skillSliders[skill].target.value = this.getDefaultTargets(skill);
            this.skillSliders[skill].target.style.position = 'absolute';
            this.skillSliders[skill].target.style.right = '220px';
            this.skillSliders[skill].target.style.top = y + 'px';
            this.skillSliders[skill].target.style.width = '160px';
            document.body.appendChild(this.skillSliders[skill].target);
            
            // Size slider (0.1-10)
            this.skillSliders[skill].size = document.createElement('input');
            this.skillSliders[skill].size.type = 'range';
            this.skillSliders[skill].size.min = 1;
            this.skillSliders[skill].size.max = 100;
            this.skillSliders[skill].size.value = this.getDefaultSize(skill) * 10;
            this.skillSliders[skill].size.style.position = 'absolute';
            this.skillSliders[skill].size.style.right = '220px';
            this.skillSliders[skill].size.style.top = (y + 20) + 'px';
            this.skillSliders[skill].size.style.width = '160px';
            document.body.appendChild(this.skillSliders[skill].size);
        });
    }
    
    // Get default target values for skills
    getDefaultTargets(skill) {
        return Math.min(Config.DEFAULT_TARGETS[skill] || 1, 100);
    }
    
    // Get default size values for skills
    getDefaultSize(skill) {
        return Math.min(Config.DEFAULT_SIZES[skill] || 1, 10);
    }
    
    // Update the status board with current game state
    static updateStatusBoard(state) {
        const statusBoard = document.getElementById('statusBoard');
        if (!statusBoard) return;
        
        const { playerHealth, enemiesKilled, cameraHeight, cameraAngle, zoomLevel } = state;
        
        statusBoard.innerHTML = `
            <strong>Status Board</strong><br>
            Health: ${playerHealth}<br>
            Enemies Killed: ${enemiesKilled}<br>
            ------------------------------<br>
            Camera Height: ${cameraHeight.toFixed(2)}<br>
            Camera Angle: ${(cameraAngle * (180 / Math.PI)).toFixed(2)}°<br>
            Zoom Level: ${zoomLevel.toFixed(2)}
        `;
    }
    
    // Render skill slider labels
    renderSkillSliderLabels() {
        // This is handled in HTML/CSS now, not in the 3D scene
        const skills = ['a', 's', 'd', 'f', 'g', 'h'];
        
        skills.forEach((skill, index) => {
            const y = 20 + index * 60;
            const targetValue = this.skillSliders[skill].target.value;
            const sizeValue = (this.skillSliders[skill].size.value / 10).toFixed(1);
            
            // Create or update label elements
            let targetLabel = document.getElementById(`skill-${skill}-target-label`);
            let sizeLabel = document.getElementById(`skill-${skill}-size-label`);
            
            if (!targetLabel) {
                targetLabel = document.createElement('div');
                targetLabel.id = `skill-${skill}-target-label`;
                targetLabel.style.position = 'absolute';
                targetLabel.style.right = '50px';
                targetLabel.style.top = (y + 15) + 'px';
                targetLabel.style.color = 'white';
                document.body.appendChild(targetLabel);
            }
            
            if (!sizeLabel) {
                sizeLabel = document.createElement('div');
                sizeLabel.id = `skill-${skill}-size-label`;
                sizeLabel.style.position = 'absolute';
                sizeLabel.style.right = '50px';
                sizeLabel.style.top = (y + 35) + 'px';
                sizeLabel.style.color = 'white';
                document.body.appendChild(sizeLabel);
            }
            
            targetLabel.textContent = `Skill ${skill.toUpperCase()} - Targets: ${targetValue}`;
            sizeLabel.textContent = `Size: ${sizeValue}`;
        });
    }
    
    // Update UI elements
    update() {
        this.renderSkillSliderLabels();
    }
    
    // Get the current skill slider values
    getSkillSliderValues() {
        const values = {};
        
        Object.keys(this.skillSliders).forEach(skill => {
            values[skill] = {
                target: parseInt(this.skillSliders[skill].target.value),
                size: parseFloat(this.skillSliders[skill].size.value) / 10
            };
        });
        
        return values;
    }
}