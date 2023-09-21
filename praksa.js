const canvas = document.getElementsByClassName("main-canvas")[0];
const context = canvas.getContext("2d");

const winCanvas = document.getElementsByClassName("win-canvas")[0];
const winContext = winCanvas.getContext("2d");

const gameContainer = document.getElementsByClassName("game")[0];
gameContainer.style.display = "none";

const options = document.getElementsByClassName("options")[0];
options.style.display = "none";

const tableHeads = document.querySelectorAll(".th");
const bankSpan = document.getElementsByClassName("bank")[0];
const betSpan = document.getElementsByClassName("bet")[0];
const balanceSpan = document.getElementsByClassName("balance")[0];

const collectBtn = document.getElementsByClassName("collect-btn")[0];
collectBtn.addEventListener("click", collectMoney);

const tables = document.querySelectorAll(".table");

const mainContainer = document.getElementsByClassName("main")[0];

let image,
  spriteAnimateId = {
    id: 0,
  };

let tableDim = 2,
  spriteDim = 260;

let board = [],
  sprites = [];

for (let i = 0; i < tableDim; i++) {
  board[i] = new Array(tableDim);
}

let currentTime, lastRender;

canvas.height = spriteDim * tableDim;
canvas.width = spriteDim;

let cellWidth = canvas.width,
  cellHeight = canvas.height;

let symbolHeight = cellHeight / 1.3,
  symbolWidth = cellWidth / 1.3;

let gameWidth, gameHeight;

let availableSymbols = [0, 3, 5, 7, 8, 10];

let scores = [
  {
    id: 3,
    multiplier: 2,
    currentLevel: 5,
    active: false,
  },
  {
    id: 7,
    multiplier: 1,
    currentLevel: 5,
    active: false,
  },
  {
    id: 8,
    multiplier: 1,
    currentLevel: 5,
    active: false,
  },
  {
    id: 5,
    multiplier: 2,
    currentLevel: 5,
    active: false,
  },
];

function generateRandomNumber() {
  randomNumber = Math.floor(Math.random() * availableSymbols.length);
  return randomNumber;
}

let symbols = [],
  imagesLoaded = false,
  animateCounter;

function getImages(counter, isSymbols) {
  if (counter === availableSymbols.length) {
    imagesLoaded = true;
    return;
  }
  image = new Image();
  image.setAttribute(
    "src",
    `./images/${isSymbols ? "Symbols" : "Sprites"}/${
      availableSymbols[counter]
    }.png`
  );
  image.onload = () => {
    if (isSymbols) symbols.push(image);
    else sprites.push(image);
    getImages(counter + 1, isSymbols);
  };
}

const backgroundAudio = new Audio("./sounds/background.mp3");
backgroundAudio.volume = 0.5;
backgroundAudio.loop = true;

getImages(0, true);

let randomNumber,
  randomSymbol,
  centeredHeight = (cellHeight - symbolHeight) / 2,
  centeredWidth = (cellWidth - symbolWidth) / 2;

function drawImages(isCollect) {
  for (let i = 0; i < tableDim; i++) {
    if (!isCollect) {
      randomSymbol = generateRandomNumber();
      board[0][i] = {
        y: (i - 1) * cellHeight + centeredHeight,
        x: centeredWidth,
        img: symbols[randomSymbol],
      };
      context.drawImage(
        symbols[randomSymbol],
        0,
        0,
        symbols[randomSymbol].width,
        symbols[randomSymbol].height,
        centeredWidth,
        (i - 1) * cellHeight + centeredHeight,
        symbolWidth,
        symbolHeight
      );
    } else {
      context.drawImage(
        board[0][i].img,
        0,
        0,
        board[0][i].img.width,
        board[0][i].img.height,
        centeredWidth,
        winningSymbol.img.src === board[0][i].img.src ? tops[1] : tops[0],
        symbolWidth,
        symbolHeight
      );
    }
  }
}

let spaceBlocked = true;
let speed = canvas.height / 10;
let tops = [];

for (let i = 0; i < tableDim; i++) {
  tops[i] = parseInt((i - 1) * cellHeight + centeredHeight);
}

let winningSymbol, spriteAnimateCounter;

winCanvas.height = cellHeight;
winCanvas.width = cellWidth;

function getImageNumber() {
  winningSymbol = board[0][tableDim - 2];
  symbolImg = winningSymbol.img;
  symbolSrcArray = symbolImg.src.split("/");
  return symbolSrcArray[symbolSrcArray.length - 1].split(".")[0];
}

let symbolImg, symbolSrcArray, symbolNumber, audio, currentSprite;

let bet = 10,
  currentBank = 5000,
  winAmount = 0,
  currentScore = 0,
  isDisabled = true,
  currentWinning = 0,
  animationData = {
    movementSpeed: speed,
  };

bankSpan.innerHTML = currentBank;
betSpan.innerHTML = bet;
balanceSpan.innerHTML = currentWinning;

function checkDisabledCollect() {
  scores.forEach((score) => {
    if (score.active) isDisabled = false;
  });
  collectBtn.disabled = isDisabled;
}

function collectMoney() {
  audio = new Audio("./sounds/collect.mp3");
  soundEnabled && audio.play();
  scores.forEach((score) => {
    if (score.active) currentScore = bet * score.multiplier;
    winAmount += currentScore;
    currentScore = 0;
  });
  currentWinning = 0;
  balanceSpan.innerHTML = currentWinning;
  currentBank += winAmount;
  bankSpan.innerHTML = currentBank;
  winAmount = 0;
  scatter(scores, currentWinning, balanceSpan);
  context.clearRect(0, 0, canvas.width, canvas.height);
  winContext.clearRect(0, 0, winCanvas.width, winCanvas.height);
  cancelAnimationFrame(spriteAnimateId.id);
  isDisabled = true;
  checkDisabledCollect();
  drawImages(true);
}

function spin() {
  if (soundEnabled) {
    audio?.pause();
    audio = new Audio("./sounds/roll.mp3");
    audio.play();
  }
  getImages(0, false);
  spriteAnimateCounter = 0;
  currentBank -= bet;
  bankSpan.innerHTML = currentBank;
  document.body.style.pointerEvents = "none";
  winCanvas.style.display = "none";
  currentTime = lastRender = Date.now();
  animateSymbols();
}

const spinBtn = document.getElementsByClassName("spin-btn")[0];
spinBtn.addEventListener("click", (e) => {
  e.target.blur();
  animationData.movementSpeed = speed;
  cancelAnimationFrame(spriteAnimateId.id);
  spaceBlocked = true;
  spin();
});

let aspectRatioScreen = {
  widthScale: 16,
  heightScale: 9,
};

const ASPECT_RATIO = 16 / 9;

let onloadScale,
  soundEnabled = false;

function playGame() {
  let interval = setInterval(() => {
    if (imagesLoaded) {
      soundEnabled && backgroundAudio.play();
      imagesLoaded = false;
      checkDisabledCollect();
      drawImages(false);
      onloadScale = innerWidth / innerHeight;
      resize();
      clearInterval(interval);
    }
  });
}

const soundBtn = document.querySelectorAll(".sound-btn");
const buttonsDiv = document.getElementsByClassName("sound-popup")[0];
soundBtn.forEach((sb) => {
  sb.addEventListener("click", () => {
    if (sb.classList.contains("yes")) soundEnabled = true;
    gameContainer.style.display = options.style.display = "flex";
    buttonsDiv.style.display = "none";
    spaceBlocked = false;
    playGame();
  });
});

addEventListener("load", () => {
  onloadScale = innerWidth / innerHeight;
  resize();
});

addEventListener("keydown", (e) => {
  if (e.code === "Space" && !spaceBlocked) {
    animationData.movementSpeed = speed;
    cancelAnimationFrame(spriteAnimateId.id);
    spaceBlocked = true;
    spin();
  }
});

window.onresize = () => {
  onloadScale = innerWidth / innerHeight;
  resize();
};
