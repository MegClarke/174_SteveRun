// Description: This file contains the function that creates the score display.

export function createScoreDisplay(score) {
  const scoreDisplay = document.createElement('div');
  scoreDisplay.style.position = 'absolute';
  scoreDisplay.style.top = '10px';
  scoreDisplay.style.right = '20px';
  scoreDisplay.style.color = 'white';
  scoreDisplay.style.fontSize = '24px';
  scoreDisplay.style.fontFamily = 'Arial, sans-serif';
  scoreDisplay.style.fontWeight = 'bold';
  scoreDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  scoreDisplay.style.padding = '10px 20px';
  scoreDisplay.style.borderRadius = '10px';
  scoreDisplay.innerHTML = `Score: ${score}`;
  return scoreDisplay;
}

export function updateScoreDisplay(scoreDisplay, score) {
    scoreDisplay.innerHTML = `Score: ${score}`;
}