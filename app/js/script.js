//getting solution words from the json file
let gameOver = false;
const target_wordsUrl = 'target_words.json';

function fetchTargetWords() {
  return fetch(target_wordsUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error fetching target_words:', error);
      return null;
    });
}

function getRandomWord(target_words) {
  const keys = Object.keys(target_words);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return target_words[randomKey];
}

let solution;

// Fetch the target_words and get a random word
fetchTargetWords().then(target_words => {
  if (target_words) {
    solution = getRandomWord(target_words);
    console.log(solution);
  }
});


// getting dictionary file
const dictionaryUrl = 'dictionary.json';

// Function to fetch the JSON data
function fetchDictionary() {
  return fetch(dictionaryUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error fetching target_words:', error);
      return null;
    });
}
let dictionary;
fetchDictionary().then(fetchedDictionary => {
  if (fetchedDictionary) {
    dictionary = fetchedDictionary;
    console.log('Dictionary fetched successfully');
  }
});

function isWordInDictionary(word, dictionary) {
  return dictionary.includes(word);
}


//detect the keypress event

const lettersPattern = /^[a-zA-Z]$/;
let currentGuessCount=1;
let currentGuess=document.querySelector('#guess'+currentGuessCount);
let currentLetters = currentGuess.dataset.letters;

document.addEventListener("keydown", (e) => {
  let keyElement = document.querySelector(`.key[data-key="${e.key}"]`);
  if (keyElement) {
    keyElement.classList.add('marked');
  }
  if (gameOver) {
    return;
  }
  //if key is a letter
  let keyPress = e.key;
  if(keyPress.length==1 && lettersPattern.test(keyPress)){
  updateLetters(keyPress);
  }
  //if key is backspace
  else if(e.key==='Backspace'){
    deleteFromLetters(e.key);
}
//if key is enter
else if(e.key==='Enter' && currentGuess.dataset.letters.length==5 &&currentGuessCount<=6){
  let guessWord = currentGuess.dataset.letters;

  if (isWordInDictionary(guessWord, dictionary)) {
    console.log('enter');
    let localGuessCount = currentGuessCount;
    let revealPromises = [];
    for(let i=0; i<5; i++){
      revealPromises.push(revealTile(i,checkLetter(i,localGuessCount)));
    }
    matchedPositions = [];
    let currentGuessForWin = currentGuess; // Store the current guess
    Promise.all(revealPromises).then(() => {
      if (guessWord === solution) {
        winTiles(currentGuessForWin); // Pass the stored current guess
        gameOver = true;
        return; // Stop further execution
      }
      else if (currentGuessCount > 6) {
        alert('You lose! The correct word was ' + solution);
        gameOver = true;
        return; // Stop further execution
      }
    });

    currentGuess.dataset.completed = 'true';
    if (!gameOver) {
      currentGuessCount++;
      currentGuess = document.querySelector('#guess' + currentGuessCount);
    }
  }
  else{
    errorTiles(currentGuess);
  }
}
});


let isWinAnimationRunning = false;
let flipTimeout = null;

const winTiles = (currentGuess) => {
  clearTimeout(flipTimeout);
  gameOver = true;
  const currentGuessCount = currentGuess.id.replace('guess', '');
  const tiles = Array.from({length: 5}, (_, i) => document.querySelector('#guess' + currentGuessCount + 'Tile' + (i + 1)));
  
  let index = 0;
  const intervalId = setInterval(() => {
    if (index < tiles.length) {
      const tile = tiles[index];
      if (tile) { // Check if the tile exists
        tile.classList.add('win');
        setTimeout(() => {
          tile.classList.remove('win');
        }, 2000); // Remove the 'win' class after 2 seconds
      }
      index++;
    } else {
      clearInterval(intervalId);
      isWinAnimationRunning = false; // Set the flag to false after the win animation finishes
    }
  }, 100); // Delay increases by 100 milliseconds for each tile
}


const errorTiles = (currentGuess) => {
  const errorMessage = document.querySelector('.not_in_the_list');
  if (errorMessage !== null) {
    errorMessage.classList.remove('not_in_the_list');
    errorMessage.classList.add('not_in_the_list--visible');

    // Add the jiggle animation to the current guess
    currentGuess.classList.add('jiggle');

    setTimeout(() => {
      errorMessage.classList.remove('not_in_the_list--visible');
      errorMessage.classList.add('not_in_the_list');

      // Remove the jiggle animation from the current guess
      currentGuess.classList.remove('jiggle');
    }, 2000);
  }
}
//update "letters"

const updateLetters = (letter) => {
  if (!currentGuess.dataset.completed) {
    let oldLetters = currentGuess.dataset.letters;
    if (oldLetters.length < 5) {
      let newLetters = oldLetters + letter;
      currentGuess.dataset.letters = newLetters;
      updateTiles(oldLetters.length+1, letter);
    }
  }
};

//update tile markup
const updateTiles = (tileNumber, letter) => {
  let tile = document.querySelector("#guess" + currentGuessCount + "Tile" + tileNumber);
  if (tile) {
    tile.textContent = letter;
  }
};

  //backspace---delete last letter
  const deleteFromLetters = () => {
    if (!currentGuess.dataset.completed && !gameOver) {
      let oldLetters = currentGuess.dataset.letters;
      if (oldLetters.length > 0) {
        let newLetters = oldLetters.slice(0, -1);
        deletefromTiles(oldLetters.length);
        currentGuess.dataset.letters = newLetters;
      }
    }
  };
  //if backspace delete tile markup
  const deletefromTiles=(tileNumber)=>{
    console.log("tileNumber: " + tileNumber);
    if (!currentGuess.dataset.completed) {
      let tile = document.querySelector("#guess" + currentGuessCount + "Tile" + tileNumber);
      tile.textContent = '';
    }
    let currentTile= document.querySelector("#guess" + currentGuessCount + "Tile" + tileNumber);
     currentTile.dataset.letter='';
    currentTile.innerText='';
  }

  //submit and check word from the dictionary
  let matchedPositions = [];
  let correctlyGuessedLetters = new Array(5).fill(null);

  const checkLetter = (position, currentGuessCount) => {
    let guessedWord = currentGuess.dataset.letters;
    let guessLetter = guessedWord.charAt(position);
    let solutionLetter = solution.charAt(position);
    let gLetter = guessedWord.charAt(position);
      gLetter = guessLetter.toUpperCase();
    let keyElement = document.querySelector(`.key[data-key="${gLetter}"]`);
    if (guessLetter === solutionLetter) {
      correctlyGuessedLetters[position] = guessLetter;
      setTimeout(() => {
        revealTile(position, 'correct', currentGuessCount);
        if (keyElement.classList.contains('present')) {
          keyElement.classList.remove('present');
          keyElement.classList.add('correct');
        }
        else{
          keyElement.classList.add('correct');
        }
        currentGuessCount++;
      }, position * 150);
    } else if (
      solution.includes(guessLetter) &&
      correctlyGuessedLetters[position] !== guessLetter &&
      guessedWord.charAt(position) !== solution.charAt(position)
    ) {
      setTimeout(() => {
        revealTile(position, 'present', currentGuessCount);
        keyElement.classList.add('present');
        currentGuessCount++;
      }, position * 150);
    } else {
      setTimeout(() => {
        revealTile(position, 'absent', currentGuessCount);
        keyElement.classList.add('absent');
        currentGuessCount++;
      }, position * 150);
    }
    
  };
//reveal the word
const revealTile = (i, status, currentGuessCount) => {
  return new Promise(resolve => {
    let tileNumber = i + 1;
    let selector = "#guess" + currentGuessCount + "Tile" + tileNumber;
    let tile = document.querySelector(selector);
    if(!gameOver) {
      flipTile(tileNumber, status, currentGuessCount);
    }
    // Resolve the promise after a delay
    setTimeout(resolve, 1500); // Adjust this delay as needed
  });
};

const flipTile = (tileNumber, status, currentGuessCount) => {
  let selector = "#guess" + currentGuessCount + "Tile" + tileNumber;
  let tile = document.querySelector(selector);

  if (!tile || isWinAnimationRunning) { // Check if the win animation is running
    return;
  }

  tile.classList.add('flip-in');

  flipTimeout=setTimeout(() => {
    if (isWinAnimationRunning) { // Check if the win animation is running
      return;
    }
    tile.classList.remove('flip-in');
    tile.classList.add('flip-out');
    tile.classList.add(status); 
    // Add the color after the flip animation is complete
    switch (status) {
      case 'correct': tile.classList.add('correct'); break;
      
      case 'present': tile.classList.add('present'); break;
  
      case 'absent': tile.classList.add('absent'); break;
    }
  }, 500);
}