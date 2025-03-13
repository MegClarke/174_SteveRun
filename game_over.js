// game_over.js
export function showGameOver(finalScore) {
    // Create an overlay element that covers the entire screen
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    // Use a semi-transparent background so the scene is still visible
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';
  
    // Create a "Game Over" text element
    const gameOverText = document.createElement('h1');
    gameOverText.innerText = 'Game Over';
    gameOverText.style.color = 'white';
    gameOverText.style.fontSize = '48px';
    gameOverText.style.marginBottom = '20px';
  
    // Create a score text element
    const scoreText = document.createElement('p');
    scoreText.innerText = `Score: ${finalScore}`;
    scoreText.style.color = 'white';
    scoreText.style.fontSize = '24px';

    // Create a Play Again button
    const playAgainButton = document.createElement('button');
    playAgainButton.innerText = 'Play Again';
    playAgainButton.style.padding = '10px 20px';
    playAgainButton.style.fontSize = '18px';
    playAgainButton.style.cursor = 'pointer';

    // When the button is clicked, reload the page
    playAgainButton.addEventListener('click', () => {
        window.location.reload();
    });
  
    // Append the texts to the overlay
    overlay.appendChild(gameOverText);
    overlay.appendChild(scoreText);
    overlay.appendChild(playAgainButton);
  
    // Append the overlay to the document body
    document.body.appendChild(overlay);
  }
  