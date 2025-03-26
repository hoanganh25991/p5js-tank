function updateStatusBoard() {
    const statusBoard = document.getElementById('statusBoard');
    const { playerHealth, enemiesKilled, cameraHeight, cameraAngle, zoomLevel } = window.state;
    // Update the status board content
    statusBoard.innerHTML = `
      <strong>Status Board</strong><br>
      Health: ${playerHealth}<br>
      Enemies Killed: ${enemiesKilled}<br>
      Camera Height: ${cameraHeight.toFixed(2)}<br>
      Camera Angle: ${(cameraAngle * (180 / Math.PI)).toFixed(2)}°<br>
      Zoom Level: ${zoomLevel}°
    `;
  }
  
document.addEventListener('DOMContentLoaded', function() {
  updateStatusBoard()
  setInterval(updateStatusBoard, 1000);
});