// Configuration variables

// Gameplay Mechanics
const ENEMIES_TO_KILL = 1000; // Number of enemies to kill before pausing
const MAX_ENEMIES = 50; // Maximum number of enemies at any time

// Bullet and Skill Properties

// Bullet Properties
const BULLET_SPEED = 8; // Speed of the player's bullets
const ENEMY_BULLET_SPEED = 3; // Speed of the enemy's bullets
const BULLET_MAX_DISTANCE = 1000; // Maximum distance bullets can travel
const BULLET_FIRE_INTERVAL = 30; // Fire bullets every 500ms (30 frames at 60 FPS)
const BULLET_SIZE = 5;

// Skill Properties
const SKILL_MAX_DISTANCE = 1000; // Maximum distance skills can travel
const SKILL_SPEED = 8; // Speed of the skills
const SKILL_EXPAND_DISTANCE = 700; // Distance after which the skill expands
const SKILL_MAX_SIZE = 30; // Maximum size of the skill

// Enemy Settings
const ENEMY_SHOOTING_DISTANCE = 500; // Increased maximum distance for enemies to shoot
const ENEMY_SPAWN_DISTANCE = 1500; // Increased maximum distance for enemies to shoot

// Camera Settings
const MIN_CAMERA_HEIGHT = -500; // Minimum camera height (ground level)
const MAX_CAMERA_HEIGHT = 0; // Maximum camera height (tank level)

// Movement Speeds
const PLAYER_MOVE_SPEED = 6; // Speed of the player's tank
const ENEMY_MOVE_SPEED = 2; // Speed of the enemies

// Visual Aids
const AIM_LINE_LENGTH = 1000; // Configurable length of the aim line
let playerX = 0;
let playerZ = 0;
let bullets = [];
let enemyBullets = [];
let enemies = [];
let skills = [];
let moving = { left: false, right: false, up: false, down: false };
let playerHealth = 1000; // Default health
let enemiesKilled = 0;
let tankSize = 75; // Tank size
let zoomLevel = 0.2; // Default zoom level

let playerAngle = 0; // Tank body angle
let turretAngle = 0; // Turret angle
let cameraAngle = 0; // Camera angle
let targetTurretAngle = 0;

let rotatingLeft = false;
let rotatingRight = false;

let cameraHeight = MAX_CAMERA_HEIGHT - 112; // Initial camera height
let increasingHeight = false;
let decreasingHeight = false;

let skillSoundMap = {};
let skillAngle = 0;

let shurikenModel;

let casting = {
  a: false,
  s: false,
  d: false,
  f: false,
};

let lastCastTime = {
  a: 0,
  s: 0,
  d: 0,
  f: 0,
};

const cooldown = {
  a: 500, // 500 milliseconds
  s: 500,
  d: 500,
  f: 500,
};

// Expose the game state to the global window object
window.state = {
  playerHealth,
  enemiesKilled,
  cameraHeight,
  cameraAngle,
};

window.gamePaused = true;

function preload() {
  groundTexture = loadImage("photo-1422651355218-53453822ebb8.jpg"); // Ground texture
  tankTexture = loadImage("photo-1539538507524-eab6a4184604.jpg"); // Tank texture
  skillSoundMap = {
    a: loadSound("steampunk-weapon-single-shot-188051.mp3"),
    s: loadSound("barrett-m107-sound-effect-245967.mp3"),
    d: loadSound("gun-shots-from-a-distance-23-39722.mp3"),
    f: loadSound("gun-shot-sound-effect-224087.mp3"),
  };
  myFont = loadFont("opensans-light.ttf");
  shurikenModel = loadModel("shuriken.obj", true);
  fireBall = loadModel("fireball.obj", true);
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  spawnEnemies(10); // Spawn 10 enemies
  textFont(myFont); // Set the font
  textSize(32); // Set the text size
  textAlign(CENTER, CENTER); // Align text to center
}

function draw() {
  if (window.gamePaused) {
    updateWindowState();
    return;
  }

  // Update camera angle based on key presses
  if (rotatingLeft) {
    cameraAngle -= PI / 180; // Rotate left
  }
  if (rotatingRight) {
    cameraAngle += PI / 180; // Rotate right
  }

  // Adjust camera height based on key presses
  if (increasingHeight) {
    cameraHeight = min(cameraHeight + 2, MAX_CAMERA_HEIGHT); // Increase camera height, but not above tank level
  }
  if (decreasingHeight) {
    cameraHeight = max(cameraHeight - 2, MIN_CAMERA_HEIGHT); // Decrease camera height, but not below ground level
  }

  background(135, 206, 235); // Sky color

  // Lighting
  ambientLight(75); // Ánh sáng môi trường
  directionalLight(255, 255, 255, 0, 1, -1);

  // Draw ground
  push();
  translate(0, 200, 0);
  rotateX(HALF_PI);
  noStroke();
  texture(groundTexture);
  plane(20000, 20000);
  pop();

  // Move camera with player and apply zoom
  zoomLevel = getDynamicZoomLevel();
  let camX = playerX + (cos(cameraAngle) * 200) / zoomLevel;
  let camZ = playerZ + (sin(cameraAngle) * 200) / zoomLevel;
  // Adjust camera height and ensure it rotates around the tank
  camera(camX, cameraHeight / zoomLevel, camZ, playerX, 0, playerZ, 0, 1, 0);

  // Draw tank
  drawTank();

  // Draw aim lines for active skills
  drawSkillAimLines();

  // Draw bullets
  drawBullets();

  // Draw enemy bullets
  drawEnemyBullets();

  // Draw skills
  drawSkills();

  // Draw cast skills
  drawCastSkills();

  // Draw enemies
  drawEnemies();

  // Update player position
  updatePlayerPosition();

  // Update enemies position
  updateEnemiesPosition();

  // Update the global state if needed
  updateWindowState();

  updateTurretAngle();

  // Check collisions
  checkCollisions();

  // Automatically fire bullets every BULLET_FIRE_INTERVAL frames
  if (frameCount % BULLET_FIRE_INTERVAL === 0) {
    fireBullet();
  }
}

function getDynamicZoomLevel() {
  const screenWidth = windowWidth;

  if (screenWidth < 1024) {
    return 0.1;
  }

  return 0.2;
}

function updateWindowState() {
  window.state.playerHealth = playerHealth;
  window.state.enemiesKilled = enemiesKilled;
  window.state.cameraHeight = cameraHeight;
  window.state.cameraAngle = cameraAngle;
}

function drawTank() {
  push();
  translate(playerX, 0, playerZ);
  rotateY(playerAngle); // Rotate tank body
  // Tank body
  texture(tankTexture);
  box(tankSize, 20, tankSize);
  // Turret
  translate(0, -15, 0);
  rotateY(turretAngle - playerAngle); // Rotate turret independently
  box(30, 10, 30);
  // Gun barrel
  translate(0, 0, -20); // Position the barrel at the front of the turret
  rotateX(HALF_PI); // Rotate the barrel 90 degrees to lie horizontally
  fill(100); // Set a color for the barrel
  cylinder(5, 40); // Create a cylinder for the barrel
  pop();
}

function drawAimLine(target) {
  let dx = target.x - playerX;
  let dz = target.z - playerZ;
  let angle = atan2(dz, dx);

  push();
  stroke(255, 255, 0, 150); // Yellow line
  strokeWeight(2);
  let aimX = playerX + cos(angle) * AIM_LINE_LENGTH;
  let aimZ = playerZ + sin(angle) * AIM_LINE_LENGTH;
  line(playerX, 0, playerZ, aimX, 0, aimZ);
  pop();
}

function drawSkillAimLines() {
  for (let skill of skills) {
    if (skill.lifetime > 0) {
      drawAimLine(skill.target);
    }
  }
}

function findNearestEnemies(numTargets) {
  let sortedEnemies = [...enemies].sort((a, b) => {
    let distA = dist(playerX, 0, playerZ, a.x, 0, a.z);
    let distB = dist(playerX, 0, playerZ, b.x, 0, b.z);
    return distA - distB;
  });
  return sortedEnemies.slice(0, numTargets);
}

function fireBullet() {
  let targets = findNearestEnemies(1); // Find the nearest enemy
  if (targets.length > 0) {
    let target = targets[0];
    let dx = target.x - playerX;
    let dz = target.z - playerZ;
    let angle = atan2(dz, dx);
    targetTurretAngle = -atan2(dz, dx) - HALF_PI;
    bullets.push({
      x: playerX,
      y: 0,
      z: playerZ,
      dx: cos(angle),
      dz: sin(angle),
      distanceTraveled: 0,
    });

    // Draw aim line for the bullet
    drawAimLine(target);
  }
}

function updateTurretAngle() {
  turretAngle = lerp(turretAngle, targetTurretAngle, 0.1);
}

function drawBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    bullet.x += bullet.dx * BULLET_SPEED;
    bullet.z += bullet.dz * BULLET_SPEED;
    bullet.distanceTraveled += BULLET_SPEED;

    push();
    translate(bullet.x, bullet.y, bullet.z);
    sphere(BULLET_SIZE);
    pop();

    // Remove bullets that have traveled beyond the maximum distance
    if (bullet.distanceTraveled > BULLET_MAX_DISTANCE) {
      bullets.splice(i, 1);
    }
  }
}

function drawEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    let bullet = enemyBullets[i];
    bullet.x += bullet.dx * ENEMY_BULLET_SPEED;
    bullet.z += bullet.dz * ENEMY_BULLET_SPEED;
    bullet.distanceTraveled += ENEMY_BULLET_SPEED;

    push();
    translate(bullet.x, bullet.y, bullet.z);
    sphere(BULLET_SIZE);
    pop();

    // Remove bullets that have traveled beyond the maximum distance
    if (bullet.distanceTraveled > BULLET_MAX_DISTANCE) {
      enemyBullets.splice(i, 1);
    }
  }
}

function drawSkills() {
  skillAngle += 0.05;
  for (let i = skills.length - 1; i >= 0; i--) {
    let skill = skills[i];
    skill.x += skill.dx * SKILL_SPEED;
    skill.z += skill.dz * SKILL_SPEED;
    skill.lifetime--;
    skill.distanceTraveled += SKILL_SPEED;

    push();
    translate(skill.x, skill.y, skill.z);
    let size = map(
      skill.distanceTraveled,
      0,
      SKILL_EXPAND_DISTANCE,
      10,
      SKILL_MAX_SIZE * skill.sizeFactor // Use the dynamic size factor
    );
    size = constrain(size, 10, SKILL_MAX_SIZE * skill.sizeFactor); // Ensure size does not exceed max size

    rotateY(skillAngle);
    if (skill.type === "a") {
      fill(255, 0, 0, skill.lifetime * 5);
      drawFireball(size / 100);
    } else if (skill.type === "s") {
      fill(0, 255, 255, skill.lifetime * 5);
      box(size, size, size);
    } else if (skill.type === "d") {
      fill(255, 165, 0, skill.lifetime * 5);
      cone(size, size * 2);
    } else if (skill.type === "f") {
      fill(255, 255, 0, skill.lifetime * 5);
      drawShuriken((size / 100) * 1.5);
    }
    pop();

    // Remove skills that have traveled beyond the maximum distance
    if (skill.distanceTraveled > SKILL_MAX_DISTANCE || skill.lifetime <= 0) {
      skills.splice(i, 1);
    }
  }
}

function drawCastSkills() {
  let currentTime = millis();

  if (casting.a && currentTime - lastCastTime.a >= cooldown.a) {
    castSkill("a", 1, 3, skillSoundMap["a"]);
    lastCastTime.a = currentTime;
  }
  if (casting.s && currentTime - lastCastTime.s >= cooldown.s) {
    castSkill("s", 3, 2, skillSoundMap["s"]);
    lastCastTime.s = currentTime;
  }
  if (casting.d && currentTime - lastCastTime.d >= cooldown.d) {
    castSkill("d", 10, 1, skillSoundMap["d"]);
    lastCastTime.d = currentTime;
  }
  if (casting.f && currentTime - lastCastTime.f >= cooldown.f) {
    castSkill("f", 1, 7, skillSoundMap["f"]);
    lastCastTime.f = currentTime;
  }
}
function drawShuriken(size) {
  scale(size);
  model(shurikenModel);
}

function drawFireball(size) {
  ambientMaterial(255, 100, 0);
  scale(size);
  model(fireBall);
}

function drawEnemies() {
  for (let enemy of enemies) {
    push();
    translate(enemy.x, 0, enemy.z);
    fill(255, 0, 0); // Red for enemies
    box(40, 40, 40);
    pop();
  }
}

function updatePlayerPosition() {
  if (moving.left) {
    playerZ += PLAYER_MOVE_SPEED;
  }
  if (moving.right) {
    playerZ -= PLAYER_MOVE_SPEED;
  }
  if (moving.up) {
    playerX -= PLAYER_MOVE_SPEED;
  }
  if (moving.down) {
    playerX += PLAYER_MOVE_SPEED;
  }
}

function updateEnemiesPosition() {
  for (let enemy of enemies) {
    // Calculate the distance to the player
    let distanceToPlayer = dist(enemy.x, 0, enemy.z, playerX, 0, playerZ);

    // Check if the enemy is within shooting distance
    if (distanceToPlayer > ENEMY_SHOOTING_DISTANCE) {
      // Move towards the player if not within shooting distance
      let angle = atan2(playerZ - enemy.z, playerX - enemy.x);
      enemy.x += cos(angle) * ENEMY_MOVE_SPEED;
      enemy.z += sin(angle) * ENEMY_MOVE_SPEED;
    } else if (frameCount % 60 === 0) {
      // Shoot at the player if within shooting distance
      let bulletAngle = atan2(playerZ - enemy.z, playerX - enemy.x);
      enemyBullets.push({
        x: enemy.x,
        y: 0,
        z: enemy.z,
        dx: cos(bulletAngle),
        dz: sin(bulletAngle),
        distanceTraveled: 0,
      });
    }
  }
}

function keyPressed() {
  if (window.gamePaused) {
    return;
  }
  if (keyCode === LEFT_ARROW) {
    moving.left = true;
  } else if (keyCode === RIGHT_ARROW) {
    moving.right = true;
  } else if (keyCode === UP_ARROW) {
    moving.up = true;
  } else if (keyCode === DOWN_ARROW) {
    moving.down = true;
  } else if (key.toLowerCase() === "a") {
    casting.a = true;
  } else if (key.toLowerCase() === "s") {
    casting.s = true;
  } else if (key.toLowerCase() === "d") {
    casting.d = true;
  } else if (key.toLowerCase() === "f") {
    casting.f = true;
  } else if (key.toLowerCase() === "q") {
    rotatingLeft = true;
  } else if (key.toLowerCase() === "w") {
    rotatingRight = true;
  } else if (key.toLowerCase() === "e") {
    increasingHeight = true; // Start increasing camera height
  } else if (key.toLowerCase() === "r") {
    decreasingHeight = true; // Start decreasing camera height
  }
}

function keyReleased() {
  if (window.gamePaused) {
    return;
  }
  if (keyCode === LEFT_ARROW) {
    moving.left = false;
  } else if (keyCode === RIGHT_ARROW) {
    moving.right = false;
  } else if (keyCode === UP_ARROW) {
    moving.up = false;
  } else if (keyCode === DOWN_ARROW) {
    moving.down = false;
  } else if (key.toLowerCase() === "a") {
    casting.a = false;
  } else if (key.toLowerCase() === "s") {
    casting.s = false;
  } else if (key.toLowerCase() === "d") {
    casting.d = false;
  } else if (key.toLowerCase() === "f") {
    casting.f = false;
  } else if (key.toLowerCase() === "q") {
    rotatingLeft = false;
  } else if (key.toLowerCase() === "w") {
    rotatingRight = false;
  } else if (key.toLowerCase() === "e") {
    increasingHeight = false; // Stop increasing camera height
  } else if (key.toLowerCase() === "r") {
    decreasingHeight = false; // Stop decreasing camera height
  }
}

function castSkill(type, numTargets, sizeFactor, skillSound) {
  if (window.gamePaused) {
    return;
  }
  if (skillSound) {
    skillSound.play();
  }
  let targets = findNearestEnemies(numTargets); // Find the nearest enemies

  for (let target of targets) {
    let dx = target.x - playerX;
    let dz = target.z - playerZ;
    let angle = atan2(dz, dx);
    skills.push({
      x: playerX,
      y: 0,
      z: playerZ,
      dx: cos(angle), // Use angle to determine direction
      dz: sin(angle), // Use angle to determine direction
      type: type,
      lifetime: 200, // Increased lifetime for skills
      distanceTraveled: 0,
      sizeFactor: sizeFactor, // Store the size factor
      target: target, // Store the target for aim line
    });
  }
}

function spawnEnemies() {
  // Count the number of enemies within the spawn distance
  let enemiesWithinRadius = enemies.filter((enemy) => {
    return (
      dist(enemy.x, 0, enemy.z, playerX, 0, playerZ) < ENEMY_SPAWN_DISTANCE
    );
  }).length;

  // Spawn new enemies if the count is below the maximum
  while (enemiesWithinRadius < MAX_ENEMIES) {
    let x = random(
      playerX - ENEMY_SPAWN_DISTANCE,
      playerX + ENEMY_SPAWN_DISTANCE
    );
    let z = random(
      playerZ - ENEMY_SPAWN_DISTANCE,
      playerZ + ENEMY_SPAWN_DISTANCE
    );

    // Ensure enemies do not spawn too close to the player
    if (dist(x, 0, z, playerX, 0, playerZ) > tankSize) {
      enemies.push({ x: x, z: z, health: 10 });
      enemiesWithinRadius++;
    }
  }
}

function checkCollisions() {
  // Bullet collision with enemies
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    for (let j = enemies.length - 1; j >= 0; j--) {
      let enemy = enemies[j];
      let d = dist(bullet.x, bullet.y, bullet.z, enemy.x, 0, enemy.z);
      if (d < 40) {
        enemies[j].health -= 10;
        bullets.splice(i, 1);
        if (enemies[j].health <= 0) {
          enemies.splice(j, 1);
          enemiesKilled++;
          if (enemiesKilled >= ENEMIES_TO_KILL) {
            window.gamePaused = true;
          } else {
            spawnEnemies(1);
          }
        }
        break;
      }
    }
  }

  // Skill collision with enemies
  for (let i = skills.length - 1; i >= 0; i--) {
    let skill = skills[i];
    let skillSize = map(
      skill.distanceTraveled,
      0,
      SKILL_EXPAND_DISTANCE,
      10,
      SKILL_MAX_SIZE * skill.sizeFactor
    );
    skillSize = constrain(skillSize, 10, SKILL_MAX_SIZE * skill.sizeFactor); // Ensure size does not exceed max size

    for (let j = enemies.length - 1; j >= 0; j--) {
      let enemy = enemies[j];
      if (isColliding(skill, skillSize, enemy)) {
        // If the enemy is within the skill's area
        enemies[j].health -= 10;
        if (enemies[j].health <= 0) {
          enemies.splice(j, 1);
          enemiesKilled++;
          if (enemiesKilled >= ENEMIES_TO_KILL) {
            window.gamePaused = true;
          } else {
            spawnEnemies(1);
          }
        }
      }
    }
  }

  // Enemy bullet collision with player
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    let bullet = enemyBullets[i];
    let d = dist(bullet.x, bullet.y, bullet.z, playerX, 0, playerZ);
    if (d < 40) {
      playerHealth -= 1;
      enemyBullets.splice(i, 1);
      if (playerHealth <= 0) {
        window.gamePaused = true;
      }
    }
  }
}

// Function to check if a skill is colliding with an enemy
function isColliding(skill, skillSize, enemy) {
  // Check if the bounding boxes of the skill and enemy overlap
  return (
    skill.x - skillSize / 2 < enemy.x + 20 &&
    skill.x + skillSize / 2 > enemy.x - 20 &&
    skill.z - skillSize / 2 < enemy.z + 20 &&
    skill.z + skillSize / 2 > enemy.z - 20
  );
}
