// Function to update and render the status board
function updateStatusBoard() {
    const statusBoard = document.getElementById('statusBoard');
    if (!statusBoard) {
      // Create the status board if it doesn't exist
      const newStatusBoard = document.createElement('div');
      newStatusBoard.id = 'statusBoard';
      newStatusBoard.style.position = 'absolute';
      newStatusBoard.style.top = '10px';
      newStatusBoard.style.left = '10px';
      newStatusBoard.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      newStatusBoard.style.padding = '10px';
      newStatusBoard.style.borderRadius = '5px';
      newStatusBoard.style.zIndex = '10';
      document.body.appendChild(newStatusBoard);
    }
  
    // Access the global state
    const { playerHealth, enemiesKilled, cameraHeight, cameraAngle } = window.state;
  
    // Update the status board content
    statusBoard.innerHTML = `
      <strong>Status Board</strong><br>
      Health: ${playerHealth}<br>
      Enemies Killed: ${enemiesKilled}<br>
      Camera Height: ${cameraHeight.toFixed(2)}<br>
      Camera Angle: ${(cameraAngle * (180 / Math.PI)).toFixed(2)}°
    `;
  }
  
  // Update the status board every 2 seconds
  setInterval(updateStatusBoard, 2000);