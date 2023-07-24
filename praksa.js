let image, customFunction, animateId, spriteAnimateId;

let board = [],
  sprites = [];
for (let i = 0; i < 5; i++) {
  board[i] = new Array(5);
}

const aspectRatioScreen = {
  widthScale: 16,
  heightScale: 9,
};

let currentTime, lastRender;

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

let tableDim = 5;

const cellWidth = canvas.width / 5;
const cellHeight = canvas.height / 5;

const symbolHeight = cellHeight / 1.5;
const symbolWidth = cellWidth / 1.5;

let numOfSymbols = 11;

c.lineWidth = 5;
c.strokeStyle = "gold";

function drawTable() {
  for (let i = 0; i < tableDim; i++)
    c.strokeRect(i * cellWidth, 0, cellWidth, canvas.height);
}

function generateRandomNumber() {
  return Math.floor(Math.random() * numOfSymbols);
}

let images = [],
  imagesLoaded = false;

function getImages(counter, isSymbols) {
  if (counter === numOfSymbols) {
    imagesLoaded = true;
    return;
  }
  image = new Image();
  image.setAttribute(
    "src",
    `./images/${isSymbols ? "Symbols" : "Sprites"}/${counter}.png`
  );
  image.onload = () => {
    if (isSymbols) images.push(image);
    else sprites.push(image);
    getImages(counter + 1, isSymbols);
  };
}

getImages(0, true);

let randomNumber,
  centeredHeight = (cellHeight - symbolHeight) / 2,
  centeredWidth = (cellWidth - symbolWidth) / 2;

function drawImages() {
  for (let j = 0; j < tableDim; j++) {
    for (let i = 0; i <= tableDim; i++) {
      randomNumber = generateRandomNumber();
      board[j][i] = {
        y: (i - 1) * cellHeight + centeredHeight,
        x: j * cellWidth + centeredWidth,
        img: images[randomNumber],
      };
      c.drawImage(
        images[randomNumber],
        j * cellWidth + centeredWidth,
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
  movementSpeed = canvas.height / 15,
  lastAnimate = 62,
  prevFinishedAnimate = 10,
  spaceBlocked = false,
  differenceLines;

function drawSymbol(currentSymbol, i, j) {
  if (currentSymbol.y >= canvas.height) {
    currentImg = generateRandomNumber();
    currentSymbol.img = images[currentImg];
    currentSymbol.y = -cellHeight + centeredHeight;
  }
  if (animateCounter + 1 === lastAnimate) {
    currentSymbol.y = (j - 1) * cellHeight + centeredHeight;
    board[i][j] = currentSymbol;
  }
  if (currentSymbol.img !== undefined) {
    c.drawImage(
      currentSymbol.img,
      i * cellWidth + centeredWidth,
      currentSymbol.y,
      symbolWidth,
      symbolHeight
    );
  }
  currentSymbol.y += movementSpeed;
}

function animateSymbols() {
  if (animateCounter === lastAnimate) {
    animateCounter = 0;
    cancelAnimationFrame(animateId);
    spaceBlocked = false;
    checkWin();
  } else {
    if (animateCounter < lastAnimate)
      for (let i = 0; i < tableDim; i++) {
        c.clearRect(i * cellWidth, 0, cellWidth, canvas.height);
        for (let j = 0; j <= tableDim; j++) {
          currentSymbol = board[i][j];
          drawSymbol(currentSymbol, i, j);
        }
      }
    drawTable();
    animateCounter += 1;
    animateId = requestAnimationFrame(animateSymbols);
  }
}

let winningSymbols = [],
  winSymbolCheck = "4",
  parsedWinSymbolCheck = parseInt(winSymbolCheck),
  currentSprite,
  spriteAnimateCounter = 0,
  spriteAnimateTime = 40,
  spriteDim = 260;

function animateWinSymbols() {
  if (currentTime - lastRender > spriteAnimateTime) {
    spriteAnimateCounter++;
    lastRender = Date.now();
  }
  if (spriteAnimateCounter >= 20) spriteAnimateCounter = 0;
  winningSymbols.forEach((symbol) => {
    c.clearRect(symbol.x, symbol.y - movementSpeed, symbolWidth, symbolHeight);
    currentSprite = sprites[parsedWinSymbolCheck];
    c;
    c.drawImage(
      sprites[parsedWinSymbolCheck],
      0,
      spriteAnimateCounter * spriteDim,
      spriteDim,
      spriteDim,
      symbol.x,
      symbol.y - movementSpeed,
      symbolWidth,
      symbolHeight
    );
  });
  currentTime = Date.now();
  spriteAnimateId = requestAnimationFrame(animateWinSymbols);
}

function animateWin() {
  currentTime = lastRender = Date.now();
  animateWinSymbols();
}

function checkWin() {
  getImages(0, false);
  let symbolNumber, symbolSrcArray, symbolImg;
  for (let i = 0; i < tableDim; i++) {
    for (let j = 0; j <= tableDim; j++) {
      symbolImg = board[i][j].img;
      symbolSrcArray = symbolImg.src.split("/");
      symbolNumber = symbolSrcArray[symbolSrcArray.length - 1].split(".")[0];
      if (symbolNumber === winSymbolCheck && board[i][j].y > 0)
        winningSymbols.push(board[i][j]);
    }
  }
  if (winningSymbols.length !== 0) animateWin();
}

function spin() {
  winningSymbols = [];
  currentTime = lastRender = Date.now();
  animateSymbols();
}

drawTable();

addEventListener("load", () => {
  let interval = setInterval(() => {
    if (imagesLoaded) {
      imagesLoaded = false;
      drawImages();
      clearInterval(interval);
    }
  });
});

addEventListener("keydown", (e) => {
  if (e.code === "Space" && !spaceBlocked) {
    cancelAnimationFrame(spriteAnimateId);
    spaceBlocked = true;
    spin();
  }
});
