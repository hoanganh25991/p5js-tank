// Configuration for the game
export class Config {
    // Gameplay Mechanics
    static ENEMIES_TO_KILL = 1_000_000_000; // Number of enemies to kill before pausing
    static MAX_ENEMIES = 50; // Maximum number of enemies at any time
    
    // Bullet and Skill Properties
    static BULLET_SPEED = 8; // Speed of the player's bullets
    static ENEMY_BULLET_SPEED = 3; // Speed of the enemy's bullets
    static BULLET_MAX_DISTANCE = 1000; // Maximum distance bullets can travel
    static BULLET_FIRE_INTERVAL = 30; // Fire bullets every 500ms (30 frames at 60 FPS)
    static BULLET_SIZE = 5;
    
    // Skill Properties
    static SKILL_SPEED = 12; // Speed of the skills
    static SKILL_BASE_SIZE = 30; // Base size of the skill
    static SKILL_MAX_DISTANCE = 2000; // Maximum distance skills can travel
    static SKILL_EXPAND_DISTANCE = 0; // Distance after which the skill expands
    
    // Enemy Settings
    static ENEMY_SHOOTING_DISTANCE = 500; // Maximum distance for enemies to shoot
    static ENEMY_SPAWN_DISTANCE = 1500; // Maximum distance for enemies to spawn
    
    // Camera Settings
    static MIN_CAMERA_HEIGHT = -500; // Minimum camera height (ground level)
    static MAX_CAMERA_HEIGHT = 0; // Maximum camera height (tank level)
    static MIN_ZOOM_LEVEL = 0.04; // Maximum zoom level
    static MAX_ZOOM_LEVEL = 2; // Minimum zoom level
    
    // Movement Speeds
    static PLAYER_MOVE_SPEED = 6; // Speed of the player's tank
    static ENEMY_MOVE_SPEED = 2; // Speed of the enemies
    
    // Visual Aids
    static AIM_LINE_LENGTH = 2000; // Configurable length of the aim line
    
    // Ground Settings
    static GROUND_TILE_SIZE = 16000; // Size of each ground tile
    static GROUND_TILES = 1; // Number of tiles in each direction
    static GROUND_REPEAT_DISTANCE = 16000; // Distance before ground repeats
    
    // Tank Settings
    static TANK_SIZE = 75; // Tank size
    
    // Skill cooldowns (in milliseconds)
    static COOLDOWNS = {
        a: 500,
        s: 500,
        d: 500,
        f: 500,
        g: 500,
        h: 500
    };
    
    // Default skill targets
    static DEFAULT_TARGETS = {
        a: 1,
        s: 3,
        d: 10,
        f: 1,
        g: 1,
        h: 5
    };
    
    // Default skill sizes
    static DEFAULT_SIZES = {
        a: 3,
        s: 1,
        d: 1,
        f: 10,
        g: 1,
        h: 5
    };
}