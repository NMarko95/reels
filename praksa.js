// selectors
const canvas = document.querySelector(".main-canvas");
const c = canvas.getContext("2d");

const winCanvas = document.querySelector(".win-canvas");
const winC = winCanvas.getContext("2d");

const gameContainer = document.querySelector(".game");
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

let board = [],
  sprites = [];
for (let i = 0; i < 5; i++) {
  board[i] = new Array(5);
}

let currentTime, lastRender;

let tableDim = 5,
  spriteDim = 260;

canvas.height = spriteDim * 5;
canvas.width = spriteDim;

const cellWidth = canvas.width;
const cellHeight = canvas.height / 5;

const symbolHeight = cellHeight / 1.5;
const symbolWidth = cellWidth / 1.5;

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
  const randomNumber = Math.floor(Math.random() * availableSymbols.length);
  return randomNumber;
}

let symbols = [],
  imagesLoaded = false,
  backgroundLoaded = false;

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
backgroundAudio.volume = 0.2;
backgroundAudio.loop = true;

getImages(0, true);

let randomNumber,
  randomSymbol,
  centeredHeight = (cellHeight - symbolHeight) / 2,
  centeredWidth = (cellWidth - symbolWidth) / 2;

function drawImages(isCollect) {
  for (let i = 0; i <= tableDim; i++) {
    if (!isCollect) {
      randomSymbol = generateRandomNumber();
      board[0][i] = {
        y: (i - 1) * cellHeight + centeredHeight,
        x: centeredWidth,
        img: symbols[randomSymbol],
      };
      c.drawImage(
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
      c.drawImage(
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
  movementSpeed = canvas.height / 20,
  animatesPerSecond = 62,
  lastAnimate = animatesPerSecond * 1.5,
  prevFinishedAnimate = lastAnimate / (tableDim - 1),
  spaceBlocked = false;

function drawSymbol(currentSymbol, j) {
  if (currentSymbol.y >= canvas.height) {
    currentImg = generateRandomNumber();
    currentSymbol.img = symbols[currentImg];
    currentSymbol.y = -cellHeight;
  }
  if (animateCounter + 1 === lastAnimate)
    currentSymbol.y = (j - 1) * cellHeight + centeredHeight;
  c.drawImage(
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
    if (animateCounter === animatesPerSecond)
      movementSpeed = canvas.height / 60;
    c.clearRect(0, 0, cellWidth, canvas.height);
    for (let j = 0; j <= tableDim; j++) {
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
  winC.clearRect(0, 0, winCanvas.width, winCanvas.height);
  winC.drawImage(
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
  c.globalAlpha = 0.5;
  c.clearRect(0, cellHeight * 2, cellWidth, cellHeight);
  c.fillRect(0, 0, cellWidth, canvas.height);
  c.globalAlpha = 1;
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

let correctSpan,
  symbolImg,
  symbolSrcArray,
  symbolNumber,
  currentColumnImg,
  currentTd,
  currentScoreIndex,
  audio;

function checkWin() {
  audio.pause();
  document.body.style.pointerEvents = "auto";
  symbolNumber = getImageNumber();
  currentSprite = sprites.find((sprite) =>
    sprite.src.includes(`${symbolNumber}.png`)
  );
  if (symbolNumber == 10) {
    audio = new Audio("./sounds/scatter.mp3");
    audio.play();
    scatter();
  } else if (symbolNumber == 0) {
    audio = new Audio("./sounds/wild.mp3");
    audio.play();
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
    audio.play();
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
  audio.play();
  scores.forEach((score) => {
    if (score.active) {
      currentScore = bet * score.multiplier;
    }
    winAmount += currentScore;
    currentScore = 0;
  });
  currentWinning = 0;
  balanceSpan.innerHTML = currentWinning;
  currentBank += winAmount;
  bankSpan.innerHTML = currentBank;
  winAmount = 0;
  scatter();
  c.clearRect(0, 0, canvas.width, canvas.height);
  winC.clearRect(0, 0, winCanvas.width, winCanvas.height);
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
  scores.map((score, i) => {
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
    return score;
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
  if (backgroundAudio.paused) backgroundAudio.play();
  audio?.pause();
  audio = new Audio("./sounds/roll.mp3");
  audio.play();
  getImages(0, false);
  spriteAnimateCounter = 0;
  currentBank -= bet;
  bankSpan.innerHTML = currentBank;
  document.body.style.pointerEvents = "none";
  winCanvas.style.display = "none";
  currentTime = lastRender = Date.now();
  let interval = setInterval(() => {
    if (imagesLoaded) {
      imagesLoaded = false;
      clearInterval(interval);
      animateSymbols();
    }
  });
}

const spinBtn = document.querySelector(".spin-btn");
spinBtn.addEventListener("click", (e) => {
  e.target.blur();
  movementSpeed = canvas.height / 20;
  cancelAnimationFrame(spriteAnimateId);
  spaceBlocked = true;
  spin();
});

let containerHeight, containerWidth;

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
  canvas.style.height = `calc(${mainContainer.style.height} * 0.85)`;
  canvas.style.width = `calc(${canvas.style.height} / 5)`;
  winCanvas.style.height =
    winCanvas.style.width = `calc(${canvas.style.width} / 1.5)`;
  winCanvas.style.top = `calc(${canvas.style.height} * 0.4 + ${canvas.style.height} / 30)`;
  winCanvas.style.left = `calc(${winCanvas.style.width} / 4)`;
  scoreContainers.forEach(
    (sc) =>
      (sc.style.width = `calc((${mainContainer.style.width} - ${canvas.style.width}) / 2)`)
  );
}

let onloadScale;

addEventListener("load", () => {
  let interval = setInterval(() => {
    if (imagesLoaded) {
      imagesLoaded = false;
      checkDisabled();
      drawImages(false);
      onloadScale = innerWidth / innerHeight;
      resize();
      clearInterval(interval);
    }
  });
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
