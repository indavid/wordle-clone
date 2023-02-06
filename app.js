const ANSWER_URL = 'https://words.dev-apis.com/word-of-the-day';
const VALID_URL = 'https://words.dev-apis.com/validate-word';

const letters = document.querySelectorAll('.letter');
const spinner = document.querySelector('.spinner');
const keys = document.querySelectorAll('.key');

let position = 0;
let wordLimit = 5;
let answer = '';
let isGameOver = false;

// async/await functions
// GET the answer of the day from the server
async function getAnswer() {
  try {
    const response = await fetch(ANSWER_URL);
    const data = await response.json();
    setLoading(false);
    answer = data.word;
  } catch (error) {
    console.error('Could not get right answer');
  }
}

// POST method to see if word is an actual 5 letter word
async function validateWord(guess) {
  setLoading(true);
  const input = {
    "word": guess
  }
  try {
    const response = await fetch(VALID_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    const output = await response.json();
    setLoading(false);
    return output.validWord;
  } catch (error) {
    console.error('Could not validate guess');
  }
}

// Helper functions
// Set loading icon visible or hidden depending on AJAX request
function setLoading(isLoading) {
  isLoading ? spinner.style.visibility = 'visible' : spinner.style.visibility = 'hidden';
}

// Check if key.event is an English letter
function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

// Check if key.event is a Korean letter
function isKorean(letter) {
  const koreanRegex = /[\u3130-\u318F\uAC00-\uD7AF]+/;
  console.log(letter + " " + koreanRegex.test(letter));
  return koreanRegex.test(letter);
}

function convertToKorean(letter) {
  const englishToKorean = {
    q: "ㅂ",
    w: "ㅈ",
    e: "ㄷ",
    r: "ㄱ",
    t: "ㅅ",
    y: "ㅛ",
    u: "ㅕ",
    i: "ㅑ",
    o: "ㅐ",
    p: "ㅔ",
    a: "ㅁ",
    s: "ㄴ",
    d: "ㅇ",
    f: "ㄹ",
    g: "ㅎ",
    h: "ㅗ",
    j: "ㅓ",
    k: "ㅏ",
    l: "ㅣ",
    z: "ㅋ",
    x: "ㅌ",
    c: "ㅊ",
    v: "ㅍ",
    b: "ㅠ",
    n: "ㅜ",
    m: "ㅡ",
  }
  if (englishToKorean[letter.toLowerCase()]) {
    return englishToKorean[letter.toLowerCase()];
  }
}

// Add letter to current word up to the limit
function addLetter(letter) {
  if (position < wordLimit && position < 30) {
    letters[position].innerText = letter;
    letters[position].style.borderColor = colors.gray;
    position++;
  }
}

// Delete the last letter from current word
function deleteLetter(letter) {
  if (isGameOver) {
    return;
  }
  else if (position > wordLimit - 5) {
    letters[position - 1].innerText = '';
    letters[position - 1].style.borderColor = colors.ltgray;
    position--;
  } else {
    letters[position].innerText = '';
    letters[position].style.borderColor = colors.ltgray;
  }
}

// Make a map out of an array of letters
function makeMap(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    } else {
      obj[letter] = 1;
    }
  }
  return obj;
}

// Main functions
// Everytime user presses enter, check to see if word is correct, wrong, or valid
async function checkWord() {
  // word is all filled up
  if (position === wordLimit) {
    let guess = '';
    // get the guess word
    for (let i = position - 5; i < wordLimit; i++) {
      guess += letters[i].innerText.toLowerCase();
    }
    // if guess is a valid word
    console.log(await validateWord(guess));
    if (await validateWord(guess)) {
      console.log('why am i running');
      // color the letters depending on correctness
      const answerMap = makeMap(answer); // Keep track of letter count
      let j = 0;
      for (let i = position - 5; i < wordLimit; i++) {
        if (answer.includes(guess[j]) && answerMap[guess[j]] != 0) {
          letters[i].style.backgroundColor = colors.yellow;
          letters[i].style.borderColor = colors.yellow;
          letters[i].style.color = colors.white;
          if (guess[j] === answer[j]) {
            letters[i].style.backgroundColor = colors.green;
            letters[i].style.color = colors.white;
            letters[i].style.borderColor = colors.green;
          }
          answerMap[guess[j]]--;
        } else {
          letters[i].style.backgroundColor = colors.gray;
          letters[i].style.borderColor = colors.gray;
          letters[i].style.color = colors.white;
        }
        j++;
      }
      // check if guess is answer 
      if (guess === answer) {
        isGameOver = true;
        spinner.innerText = '🏆 🏆 🏆';
        setTimeout(() => {
          alert(`You win! Congratulations!`);
        }, '300');
        setLoading(true);
        spinner.style.animation = 'null';
      } else if (wordLimit === 30) {
        // wait before giving alert to color the blocks
        setTimeout(() => {
          alert(`You Lose! The correct answer was ${answer}`);
        }, '300');
      } else {
        // advance to next word block
        wordLimit += 5;
      }
    } else {
      // not a valid word - stay in same word block
      for (let i = position - 5; i < wordLimit; i++) {
        requestAnimationFrame((time) => {
          requestAnimationFrame((time) => {
            letters[i].style.animation = 'blink 1s linear';
          });
          letters[i].style.animation = '';
        });
      }
      return;
    }
  } else { // needs more letters
    // do nothing
    return;
  }
}

// Listen for user's keyboard events
async function init() {
  // Load Answer from API
  await getAnswer();
  // Listen to keyboard for user input
  document.body.addEventListener('keydown', function(event) {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      deleteLetter();
    } else if (event.key === 'Enter') {
      checkWord();
    } else if (isKorean(event.key)) {
      addLetter(event.key);
    } else if (isLetter(event.key)) {
      addLetter(convertToKorean(event.key));
    } else {
      event.preventDefault;
    }
  });
  // Listen to keyboard buttons for user input
  keys.forEach(key => {
    key.addEventListener('click', () => {
      if (isKorean(key.innerText)) {
        addLetter(key.innerText);
      } else if (key.innerText === 'Enter') {
        checkWord();
      } else if (key.innerText === 'Backspace') {
        deleteLetter();
      }
      console.log(`I am the key ${key.innerText}`);
    });
  });
}

init();