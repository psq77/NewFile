const puzzleContainer = document.getElementById('game-container');
const resetButton = document.getElementById('reset-button');
const puzzleInfo = prompt('Welcome to 15 Puzzle Game!\nPlease choose the puzzle size (3, 4, or 5):');
const puzzleSize = Math.max(3, Math.min(5, parseInt(puzzleInfo))) || 4; // Default to 4x4 if user enters an invalid size
puzzleContainer.style.setProperty('--puzzle-size', puzzleSize);
let puzzleBoard;
let moveCounter = 0;
let timer;
let touchStartX = 0;
let touchStartY = 0;


const moveSound = new Audio('move-sound.mp3'); // Replace 'move-sound.mp3' with your sound file

function generatePuzzle() {
    const numbers = Array.from({ length: puzzleSize * puzzleSize - 1 }, (_, index) => index + 1);
    const flattened = numbers.sort(() => Math.random() - 0.5);
    flattened.push(null);
    return Array.from({ length: puzzleSize }, (_, row) => flattened.slice(row * puzzleSize, (row + 1) * puzzleSize));
}

function renderPuzzle() {
    puzzleContainer.innerHTML = '';
    puzzleBoard.flat().forEach((number) => {
        const piece = document.createElement('div');
        piece.className = `puzzle-piece ${number === null ? 'empty-piece' : ''}`;
        piece.textContent = number !== null ? number : '';
        piece.addEventListener('click', () => handleMove(number));
        puzzleContainer.appendChild(piece);
    });

    updateMoveCounter();
}

function handleMove(number) {
    // Clicking on pieces is disabled in this version

    // You can choose whether to allow clicking on pieces or only use arrow keys for movement.
}

function handleKeyPress(event) {
    const key = event.key;

    if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
        const emptyRow = puzzleBoard.findIndex((r) => r.includes(null));
        const emptyCol = puzzleBoard[emptyRow].indexOf(null);

        let newRow = emptyRow;
        let newCol = emptyCol;

        if (key === 'ArrowUp' && emptyRow < puzzleSize - 1) {
            newRow++;
        } else if (key === 'ArrowDown' && emptyRow > 0) {
            newRow--;
        } else if (key === 'ArrowLeft' && emptyCol < puzzleSize - 1) {
            newCol++;
        } else if (key === 'ArrowRight' && emptyCol > 0) {
            newCol--;
        } else {
            // Invalid move
            return;
        }

        if (canMove(newRow, newCol, emptyRow, emptyCol)) {
            const number = puzzleBoard[newRow][newCol];
            puzzleBoard[newRow][newCol] = null;
            puzzleBoard[emptyRow][emptyCol] = number;

            moveCounter++;
            updateMoveCounter();
            moveSound.play();

            if (isSolved()) {
                stopTimer();
                alert(`Congratulations! You solved the puzzle in ${moveCounter} moves and ${formatTime(timer)} seconds.`);
            }

            renderPuzzle();
        }
    }

    if (event.type === 'touchstart') {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    }

    if (event.type === 'touchend') {
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Adjust sensitivity based on your preference
        const sensitivity = 50;

        // Determine swipe direction and handle the movement
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > sensitivity) {
            if (deltaX > 0) {
                handleSwipe('right');
            } else {
                handleSwipe('left');
            }
        } else if (Math.abs(deltaY) > sensitivity) {
            if (deltaY > 0) {
                handleSwipe('down');
            } else {
                handleSwipe('up');
            }
        }
    }

}

function handleSwipe(direction) {
    const emptyRow = puzzleBoard.findIndex((r) => r.includes(null));
    const emptyCol = puzzleBoard[emptyRow].indexOf(null);

    let newRow = emptyRow;
    let newCol = emptyCol;

    switch (direction) {
        case 'up':
            newRow++;
            break;
        case 'down':
            newRow--;
            break;
        case 'left':
            newCol++;
            break;
        case 'right':
            newCol--;
            break;
        default:
            return;
    }

    

    if (canMove(newRow, newCol, emptyRow, emptyCol)) {
        const number = puzzleBoard[newRow][newCol];
        puzzleBoard[newRow][newCol] = null;
        puzzleBoard[emptyRow][emptyCol] = number;

        moveCounter++;
        updateMoveCounter();
        moveSound.play();

        if (isSolved()) {
            stopTimer();
            alert(`Congratulations! You solved the puzzle in ${moveCounter} moves and ${formatTime(timer)}.`);
        }

        renderPuzzle();
    }
}

function canMove(row, col, emptyRow, emptyCol) {
    return (
        (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
        (col === emptyCol && Math.abs(row - emptyRow) === 1)
    );
}

function isSolved() {
    const flatBoard = puzzleBoard.flat();
    for (let i = 0; i < flatBoard.length - 1; i++) {
        if (flatBoard[i] !== i + 1) {
            return false;
        }
    }
    return true;
}

function updateMoveCounter() {
    const moveCounterElement = document.getElementById('move-counter');
    moveCounterElement.textContent = `Moves: ${moveCounter}`;
}

function startTimer() {
    let startTime = Date.now();
    timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        updateTimer(elapsedTime);
    }, 1000);
}

function updateTimer(elapsedTime) {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = `Time: ${formatTime(elapsedTime)}`;
}

function stopTimer() {
    clearInterval(timer);
}

function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const formattedSeconds = seconds % 60;
    return `${minutes}:${formattedSeconds < 10 ? '0' : ''}${formattedSeconds}`;
}

// Reset the game
function resetGame() {
    stopTimer();
    moveCounter = 0;
    updateMoveCounter();
    puzzleBoard = generatePuzzle();
    renderPuzzle();
    startTimer();
}

// Initial setup
resetGame();

// Add event listener for the reset button
resetButton.addEventListener('click', resetGame);

// Add event listener for key press
document.addEventListener('keydown', handleKeyPress);
document.addEventListener('touchstart', handleKeyPress);
document.addEventListener('touchend', handleKeyPress);

