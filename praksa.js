const canvas = document.querySelector(".main-canvas");
const context = canvas.getContext("2d");

const winCanvas = document.querySelector(".win-canvas");
const winContext = winCanvas.getContext("2d");

const gameContainer = document.querySelector(".game");
gameContainer.style.display = "none";

const options = document.querySelector(".options");
options.style.display = "none";

const canvasContainer = document.querySelector(".canvas-container");
const tableHeads = document.querySelectorAll(".th");
const bankSpan = document.querySelector(".bank");
const betSpan = document.querySelector(".bet");
const balanceSpan = document.querySelector(".balance");

const collectBtn = document.querySelector(".collect-btn");
collectBtn.addEventListener("click", collectMoney);

const tables = document.querySelectorAll(".table");

const scoreContainers = document.querySelectorAll(".score");
const mainContainer = document.querySelector(".main");

let image, animateId, spriteAnimateId;

let tableDim = 3,
  spriteDim = 260;

let board = [],
  sprites = [];

for (let i = 0; i < tableDim; i++) {
  board[i] = new Array(tableDim);
}

let currentTime, lastRender;

canvas.height = canvas.width = spriteDim;

const cellWidth = canvas.width,
  cellHeight = canvas.height;

const symbolHeight = cellHeight / 1.25,
  symbolWidth = cellWidth / 1.25;

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
  imagesLoaded = false;

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
        (i - 1) * cellHeight + centeredHeight,
        symbolWidth,
        symbolHeight
      );
    }
  }
}

let currentImg = generateRandomNumber(),
  animationId;

let animateCounter = 0,
  currentSymbol,
  movementSpeed = canvas.height / 5,
  animatesPerSecond = 62,
  lastAnimate = animatesPerSecond * 1.5,
  prevFinishedAnimate = lastAnimate / (tableDim - 1),
  spaceBlocked = true,
  slowSpeed = movementSpeed / 3;

function drawSymbol(currentSymbol, j) {
  if (currentSymbol.y >= canvas.height) {
    currentImg = generateRandomNumber();
    currentSymbol.img = symbols[currentImg];
    currentSymbol.y = -cellHeight;
  }
  if (animateCounter + 1 === lastAnimate)
    currentSymbol.y = (j - 1) * cellHeight + centeredHeight;
  context.drawImage(
    currentSymbol.img,
    0,
    0,
    currentSymbol.img.width,
    currentSymbol.img.height,
    centeredWidth,
    currentSymbol.y,
    symbolWidth,
    symbolHeight
  );
  board[0][j] = currentSymbol;
  currentSymbol.y += movementSpeed;
}

function animateSymbols() {
  if (animateCounter === lastAnimate) {
    animateCounter = 0;
    cancelAnimationFrame(animateId);
    spaceBlocked = false;
    checkWin();
  } else {
    if (animateCounter === animatesPerSecond) movementSpeed = slowSpeed;
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let j = 0; j < tableDim; j++) {
      currentSymbol = board[0][j];
      drawSymbol(currentSymbol, j);
    }
    animateCounter += 1;
    animateId = requestAnimationFrame(animateSymbols);
  }
}

let currentSprite,
  spriteAnimateCounter = 0,
  spriteAnimateTime = 40,
  winningSymbol;

winCanvas.height = winCanvas.width = spriteDim;

function animateWinSymbol() {
  if (currentTime - lastRender > spriteAnimateTime) {
    spriteAnimateCounter++;
    lastRender = Date.now();
  }
  if (spriteAnimateCounter >= 20) spriteAnimateCounter = 0;
  winContext.clearRect(0, 0, winCanvas.width, winCanvas.height);
  winContext.drawImage(
    currentSprite,
    0,
    spriteAnimateCounter * spriteDim,
    spriteDim,
    spriteDim,
    0,
    0,
    winCanvas.width,
    winCanvas.height
  );
  currentTime = Date.now();
  spriteAnimateId = requestAnimationFrame(animateWinSymbol);
}

function makeShadows() {
  context.globalAlpha = 0.5;
  context.clearRect(0, cellHeight * 2, cellWidth, cellHeight);
  context.fillRect(0, 0, cellWidth, canvas.height);
  context.globalAlpha = 1;
}

function animateWin() {
  currentTime = lastRender = Date.now();
  winCanvas.style.display = "block";
  makeShadows();
  animateWinSymbol();
}

function getImageNumber() {
  winningSymbol = board[0][tableDim - 2];
  symbolImg = winningSymbol.img;
  symbolSrcArray = symbolImg.src.split("/");
  return symbolSrcArray[symbolSrcArray.length - 1].split(".")[0];
}

let symbolImg,
  symbolSrcArray,
  symbolNumber,
  currentColumnImg,
  currentTd,
  currentScoreIndex,
  audio;

function checkWin() {
  audio?.pause();
  document.body.style.pointerEvents = "auto";
  symbolNumber = getImageNumber();
  currentSprite = sprites.find((sprite) =>
    sprite.src.includes(`${symbolNumber}.png`)
  );
  if (symbolNumber == 10) {
    audio = new Audio("./sounds/scatter.mp3");
    soundEnabled && audio.play();
    scatter();
  } else if (symbolNumber == 0) {
    audio = new Audio("./sounds/wild.mp3");
    soundEnabled && audio.play();
    wild();
  } else {
    tableHeads.forEach((th, i) => {
      currentColumnImg = th.querySelector("img");
      if (currentColumnImg.src.includes(`${symbolNumber}.png`)) {
        scores.map((score, i) => {
          if (
            score.id == symbolNumber &&
            score.active &&
            score.multiplier <= 9
          ) {
            score.multiplier += 2;
            currentScoreIndex = i;
          }
          if (score.id == symbolNumber) {
            score.active = true;
            currentWinning = 0;
            scores.forEach((score) => {
              if (score.active) currentWinning += bet * score.multiplier;
            });
            balanceSpan.innerHTML = currentWinning;
          }
          return score;
        });
        if (scores[i].currentLevel > 0) {
          currentTd =
            th.parentNode.querySelectorAll(".td")[scores[i].currentLevel - 1];
          currentTd.style.color = "#680ab6";
          currentTd.style.backgroundColor = "#fff";
          scores[i].currentLevel -= 1;
        }
      }
    });
    audio = new Audio("./sounds/win.mp3");
    soundEnabled && audio.play();
  }
  checkDisabled();
  animateWin();
}

let bet = 10,
  currentBank = 5000,
  winAmount = 0,
  currentScore = 0,
  isDisabled = true,
  currentWinning = 0,
  tds;

bankSpan.innerHTML = currentBank;
betSpan.innerHTML = bet;
balanceSpan.innerHTML = currentWinning;

function checkDisabled() {
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
  scatter();
  context.clearRect(0, 0, canvas.width, canvas.height);
  winContext.clearRect(0, 0, winCanvas.width, winCanvas.height);
  cancelAnimationFrame(spriteAnimateId);
  isDisabled = true;
  checkDisabled();
  drawImages(true);
}

function scatter() {
  document.querySelectorAll(".td").forEach((td) => {
    td.style.color = "#fff";
    td.style.backgroundColor = "#525050";
  });
  scores.forEach((score) => {
    score.currentLevel = 5;
    score.active = false;
    if (score.id === 3 || score.id === 5) score.multiplier = 2;
    else score.multiplier = 1;
  });
  currentWinning = 0;
  balanceSpan.innerHTML = currentWinning;
}

function wild() {
  scores.forEach((score, i) => {
    if (score.active && score.multiplier <= 9) {
      score.multiplier += 2;
      currentScoreIndex = i;
    }
    score.active = true;
    currentWinning = 0;
    scores.forEach((score) => {
      if (score.active) currentWinning += bet * score.multiplier;
    });
    balanceSpan.innerHTML = currentWinning;
  });
  tables.forEach((table, i) => {
    if (scores[i].currentLevel > 0) {
      currentTd = table.querySelectorAll(".td")[scores[i].currentLevel - 1];
      currentTd.style.color = "#680ab6";
      currentTd.style.backgroundColor = "#fff";
      scores[i].currentLevel -= 1;
    }
  });
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

const spinBtn = document.querySelector(".spin-btn");
spinBtn.addEventListener("click", (e) => {
  e.target.blur();
  movementSpeed = canvas.height / 20;
  cancelAnimationFrame(spriteAnimateId);
  spaceBlocked = true;
  spin();
});

let aspectRatioScreen = {
  widthScale: 16,
  heightScale: 9,
};

const ASPECT_RATIO = 16 / 9;

function resize() {
  if (innerWidth > innerHeight) {
    if (onloadScale > ASPECT_RATIO) {
      gameHeight = innerHeight;
      gameWidth =
        (gameHeight * aspectRatioScreen.widthScale) /
        aspectRatioScreen.heightScale;
    } else {
      gameWidth = innerWidth;
      gameHeight =
        (gameWidth * aspectRatioScreen.heightScale) /
        aspectRatioScreen.widthScale;
    }
  } else {
    if (onloadScale > 1 / ASPECT_RATIO) {
      gameHeight = outerHeight;
      gameWidth =
        (gameHeight * aspectRatioScreen.heightScale) /
        aspectRatioScreen.widthScale;
    } else {
      gameWidth = outerWidth;
      gameHeight =
        (gameWidth * aspectRatioScreen.widthScale) /
        aspectRatioScreen.heightScale;
    }
  }

  resizeElements(gameWidth, gameHeight);
  proportionalScaleCanvasScore();
}

function resizeElements(width, height) {
  mainContainer.style.width = width + "px";
  mainContainer.style.height = height + "px";
}

function proportionalScaleCanvasScore() {
  canvas.style.height = `calc(${mainContainer.style.height} / 5)`;
  winCanvas.style.height = `calc(${canvas.style.height} / 1.5)`;
}

let onloadScale,
  soundEnabled = false;

function playGame() {
  let interval = setInterval(() => {
    if (imagesLoaded) {
      soundEnabled && backgroundAudio.play();
      imagesLoaded = false;
      checkDisabled();
      drawImages(false);
      onloadScale = innerWidth / innerHeight;
      resize();
      clearInterval(interval);
    }
  });
}

const soundBtn = document.querySelectorAll(".sound-btn");
const buttonsDiv = document.querySelector(".sound-popup");
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
    movementSpeed = canvas.height / 20;
    cancelAnimationFrame(spriteAnimateId);
    spaceBlocked = true;
    spin();
  }
});

window.onresize = () => {
  onloadScale = innerWidth / innerHeight;
  resize();
};
