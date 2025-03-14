export function createMistakeDisplay(initialMistakes = 0) {
    const display = document.createElement('div');
    display.style.position = 'absolute';
    display.style.top = '50px'; // adjust position if needed
    display.style.right = '20px';
    display.style.color = 'white';
    display.style.fontSize = '24px';
    display.style.fontFamily = 'Arial, sans-serif';
    display.style.fontWeight = 'bold';
    display.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    display.style.padding = '10px 20px';
    display.style.borderRadius = '10px';
    display.innerHTML = `Mistakes: ${initialMistakes}`;
    return display;
  }
  
  export function updateMistakeDisplay(display, mistakes) {
    display.innerHTML = `Mistakes: ${mistakes}`;
  }
  