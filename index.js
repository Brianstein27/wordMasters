let buffer = "";
let count = 0;

let wordOfTheDay = "";
let map = "";

const wordOfTheDayAPI = "https://words.dev-apis.com/word-of-the-day";
const wordAPI = "https://words.dev-apis.com/validate-word";

const scoreboard = document.querySelector(".scoreboard");
const messageboard = document.querySelector(".messageboard");

// add basic key functionality
document.addEventListener("keydown", function (event) {
  if (buffer.length < 5 && isLetter(event.key)) {
    buffer += event.key;
    assignToScoreboard(event.key);
  }
});

document.addEventListener("keydown", function (event) {
  if (buffer.length != 0 && event.key === "Backspace") {
    backspace();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    enter();
  }
});

function assignToScoreboard(key) {
  scoreboard.children[count].children[buffer.length - 1].innerText = key;
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function backspace() {
  buffer = buffer.slice(0, buffer.length - 1);
  scoreboard.children[count].children[buffer.length].innerText = "";
}

function enter() {
  map = makeMap(wordOfTheDay);
  checkValidity(buffer).then(function (response) {
    if (response.validWord) {
      compareWords();
      evaluate();
      count++;
      if (count < 6) {
        eventMessage("valid");
        buffer = "";
      } else {
        eventMessage("gameover");
      }
    } else {
      eventMessage("invalid");
    }
  });
}

// Get word of the day from API
async function getWordOfTheDay() {
  const promise = await fetch(wordOfTheDayAPI);
  return await promise.json();
}

getWordOfTheDay().then(function (response) {
  wordOfTheDay = response.word;
});

// Post guess to API to check validity of the word
async function checkValidity(word) {
  const promise = await fetch(wordAPI, {
    method: "POST",
    body: JSON.stringify({ word: word }),
  });
  return await promise.json();
}

// event message
function eventMessage(event) {
  switch (event) {
    case "invalid":
      messageboard.innerText = "Not a valid word";
      break;
    case "gameover":
      messageboard.innerText = "Game Over! Come back tomorrow.";
      break;
    case "win":
      messageboard.style.color = "green";
      messageboard.innerText = "You win! Come back tomorrow.";
      break;
    case "valid":
      messageboard.innerText = "";
    default:
      break;
  }
}

// compare guess to word of the day
function compareWords() {
  for (let i = 0; i < buffer.length; i++) {
    // exact match
    if (buffer[i].toUpperCase() === wordOfTheDay[i].toUpperCase()) {
      scoreboard.children[count].children[i].classList.add("right");
      map[buffer[i]]--;
    }
  }
  // close match
  for (let i = 0; i < buffer.length; i++) {
    if (buffer[i].toUpperCase() === wordOfTheDay[i].toUpperCase()) {
      // do nothing
    } else if (map[buffer[i]] && map[buffer[i]] > 0) {
      scoreboard.children[count].children[i].classList.add("close");
      map[buffer[i]]--;
    } else {
      // no match
      scoreboard.children[count].children[i].classList.add("wrong");
    }
  }
  // for (let i = 0; i < buffer.length; i++) {
  //   if (
  //     scoreboard.children[count].children[i].classList.contains("right") !=
  //       true &&
  //     scoreboard.children[count].children[i].classList.contains("close") != true
  //   ) {
  //   }
  // }
}

// check winning condition
function evaluate() {
  let winCount = 0;
  for (let i = 0; i < buffer.length; i++) {
    if (scoreboard.children[count].children[i].classList.contains("right")) {
      winCount++;
      console.log(winCount);
    }
  }
  if (winCount === 5) {
    eventMessage("win");
    document.removeEventListenerEventListener("keydown", function (event) {
      if (buffer.length < 5 && isLetter(event.key)) {
        buffer += event.key;
        assignToScoreboard(event.key);
      }
    });
  }
}

function makeMap(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    if (obj[array[i]]) {
      obj[array[i]]++;
    } else {
      obj[array[i]] = 1;
    }
  }
  return obj;
}
