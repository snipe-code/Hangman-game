let currentWord = '';
let guessedLetters = new Set();
let strikes = 0;
let currentDifficulty = 'normal';
let streak = parseInt(localStorage.getItem('hangmanStreak')) || 0;
let gameInProgress = false;

async function fetchWord(difficulty) {
    let minLength, maxLength;
    switch(difficulty) {
        case 'easy':
            minLength = 3;
            maxLength = 4;
            break;
        case 'normal':
            minLength = 5;
            maxLength = 8;
            break;
        case 'hard':
            minLength = 9;
            maxLength = 15;
            break;
    }
    
    const response = await fetch(`https://random-word-api.herokuapp.com/word?length=${Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength}`);
    const [word] = await response.json();
    return word.toUpperCase();
}

function updateDifficultyDisplay() {
    const display = document.getElementById('diffDisplay');
    display.textContent = `Current Difficulty: ${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}`;
    
    document.querySelectorAll('.difficultyBtn').forEach(btn => {
        if (btn.textContent.toLowerCase() === currentDifficulty) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

function setDifficulty(difficulty) {
    if (difficulty === currentDifficulty) {
        updateMessage('You are already playing on this difficulty!');
        return;
    }
    if (gameInProgress) return;
    currentDifficulty = difficulty;
    updateDifficultyDisplay();
    resetGame();
}

function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';
    const qwertyLayout = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];

    qwertyLayout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboardRow';
        row.forEach(letter => {
            const button = document.createElement('button');
            button.textContent = letter;
            button.className = 'keyBtn';
            button.onclick = () => guessLetter(letter);
            rowDiv.appendChild(button);
        });
        keyboard.appendChild(rowDiv);
    });
}

function updateWordDisplay() {
    const display = document.getElementById('wordDisplay');
    display.textContent = currentWord
        .split('')
        .map(letter => guessedLetters.has(letter) ? letter : '_')
        .join(' ');
}

function updateMessage(text) {
    const message = document.getElementById('msgText');
    message.textContent = text;
    message.style.animation = 'none';
    message.offsetHeight;
}

function updateStreak() {
    const streakDisplay = document.getElementById('streakDisplay');
    streakDisplay.innerHTML = streak > 0 ? `<div class="streakCount">Streak: ${streak}🔥</div>` : '';
    localStorage.setItem('hangmanStreak', streak.toString());
}

function guessLetter(letter) {
    if (guessedLetters.has(letter)) return;
    gameInProgress = true;
    document.querySelectorAll('.difficultyBtn').forEach(btn => btn.disabled = true);

    guessedLetters.add(letter);
    const button = Array.from(document.getElementsByClassName('keyBtn'))
        .find(btn => btn.textContent === letter);
    button.disabled = true;

    if (!currentWord.includes(letter)) {
        const strikeElements = document.getElementsByClassName('strikeIcon');
        strikeElements[strikes].classList.add('activeStrike');
        strikes++;
        button.classList.add('incorrect');

        if (strikes === 10) {
            updateMessage(`You lost! The word was: ${currentWord}`);
            streak = 0;
            updateStreak();
            setTimeout(resetGame, 2000);
            return;
        }
    } else {
        button.classList.add('correct');
    }

    updateWordDisplay();
  
    if (!currentWord
        .split('')
        .some(letter => !guessedLetters.has(letter))) {
        streak++;
        updateStreak();
        updateMessage('Congratulations! You won! 🎉');
        setTimeout(resetGame, 2000);
    }
}

async function resetGame() {
    currentWord = await fetchWord(currentDifficulty);
    guessedLetters = new Set();
    strikes = 0;
    gameInProgress = false;
  
    document.querySelectorAll('.difficultyBtn').forEach(btn => btn.disabled = false);
    const strikeElements = document.getElementsByClassName('strikeIcon');
    Array.from(strikeElements).forEach(strike => {
        strike.classList.remove('activeStrike');
    });
  
    document.getElementById('msgText').textContent = '';
    document.getElementById('wordDisplay').style.animation = 'none';
    createKeyboard();
    updateWordDisplay();
    updateStreak();
    updateDifficultyDisplay();
}

resetGame();