let image, customFunction, animateId, spriteAnimateId;

let board = [],
  sprites = [];
for (let i = 0; i < 5; i++) {
  board[i] = new Array(5);
}

let currentTime, lastRender;

let historyImages = [],
  currentHistoryImg;

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

let tableDim = 5;

const cellWidth = canvas.width;
const cellHeight = canvas.height / 5;

const symbolHeight = cellHeight / 1.5;
const symbolWidth = cellWidth / 1.5;

let numOfSymbols = 11;

c.lineWidth = 5;
c.strokeStyle = "black";

function drawTable() {
  //for (let i = 0; i < tableDim; i++)
  c.strokeRect(0, 0, cellWidth, canvas.height);
}

function generateRandomNumber() {
  return Math.floor(Math.random() * numOfSymbols);
}

let symbols = [],
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
    if (isSymbols) symbols.push(image);
    else sprites.push(image);
    getImages(counter + 1, isSymbols);
  };
}

getImages(0, true);

let randomNumber,
  centeredHeight = (cellHeight - symbolHeight) / 2,
  centeredWidth = (cellWidth - symbolWidth) / 2;

function drawImages() {
  //for (let j = 0; j < tableDim; j++) {
  for (let i = 0; i <= tableDim; i++) {
    randomNumber = generateRandomNumber();
    board[0][i] = {
      y: (i - 1) * cellHeight + centeredHeight,
      x: centeredWidth,
      img: symbols[randomNumber],
    };
    c.drawImage(
      symbols[randomNumber],
      centeredWidth,
      //j * cellWidth + centeredWidth,
      (i - 1) * cellHeight + centeredHeight,
      symbolWidth,
      symbolHeight
    );
  }
  //}
}

let currentImg = generateRandomNumber(),
  animationId;

let animateCounter = 0,
  currentSymbol,
  movementSpeed = canvas.height / 15,
  animatesPerSecond = 62,
  lastAnimate = animatesPerSecond * 3,
  prevFinishedAnimate = lastAnimate / (tableDim - 1),
  spaceBlocked = false;

let stoppedColumns = new Array(tableDim);
stoppedColumns.fill(false, 0);

function drawSymbol(currentSymbol, j) {
  /*if (currentSymbol.y >= canvas.height) {
    currentImg = generateRandomNumber();
    currentSymbol.img = symbols[currentImg];
    currentSymbol.y = -cellHeight + centeredHeight;
  }
  if (animateCounter >= lastAnimate + (i - 1) * prevFinishedAnimate) {
    currentSymbol.y = (j - 1) * cellHeight + centeredHeight;
    board[i][j] = currentSymbol;
  }
  c.drawImage(
    currentSymbol.img,
    i * cellWidth + centeredWidth,
    currentSymbol.y,
    symbolWidth,
    symbolHeight
  );
  currentSymbol.y += movementSpeed;*/
  if (currentSymbol.y >= canvas.height) {
    currentImg = generateRandomNumber();
    currentSymbol.img = symbols[currentImg];
    currentSymbol.y = -cellHeight + centeredHeight;
  }
  if (animateCounter + 1 === lastAnimate) {
    currentSymbol.y = (j - 1) * cellHeight + centeredHeight;
    board[0][j] = currentSymbol;
  }
  c.drawImage(
    currentSymbol.img,
    centeredWidth,
    currentSymbol.y,
    symbolWidth,
    symbolHeight
  );
  currentSymbol.y += movementSpeed;
}

function animateSymbols() {
  if (animateCounter === lastAnimate) {
    animateCounter = 0;
    cancelAnimationFrame(animateId);
    spaceBlocked = false;
    stoppedColumns.fill(false, 0);
    checkWin();
  } else {
    if (animateCounter === animatesPerSecond * 2.5)
      movementSpeed = canvas.height / 60;
    /*for (let i = 0; i < tableDim; i++) {
      if (animateCounter >= lastAnimate + (i - 1) * prevFinishedAnimate) {
        if (!stoppedColumns[i]) {
          c.clearRect(i * cellWidth, 0, cellWidth, canvas.height);
          for (let j = 0; j <= tableDim; j++) {
            currentSymbol = board[i][j];
            drawSymbol(currentSymbol, i, j);
          }
        } else stoppedColumns[i] = true;
        continue;
      }
      c.clearRect(i * cellWidth, 0, cellWidth, canvas.height);
      for (let j = 0; j <= tableDim; j++) {
        currentSymbol = board[i][j];
        drawSymbol(currentSymbol, i, j);
      }
    }*/
    c.clearRect(0, 0, cellWidth, canvas.height);
    for (let j = 0; j <= tableDim; j++) {
      currentSymbol = board[0][j];
      drawSymbol(currentSymbol, j);
    }
    drawTable();
    animateCounter += 1;
    animateId = requestAnimationFrame(animateSymbols);
  }
}

let winningSymbols = [],
  winSymbolCheck = "1",
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
  if (spriteAnimateCounter === 20) spriteAnimateCounter = 0;
  winningSymbols.forEach((symbol) => {
    c.clearRect(
      centeredWidth,
      symbol.y - movementSpeed,
      symbolWidth,
      symbolHeight
    );
    currentSprite = sprites[parsedWinSymbolCheck];
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
  document.body.style.pointerEvents = "auto";
  historyImages.push(canvas.toDataURL());
  let symbolNumber, symbolSrcArray, symbolImg;
  for (let j = 0; j <= tableDim; j++) {
    symbolImg = board[0][j].img;
    symbolSrcArray = symbolImg.src.split("/");
    symbolNumber = symbolSrcArray[symbolSrcArray.length - 1].split(".")[0];
    if (symbolNumber === winSymbolCheck && board[0][j].y > 0)
      winningSymbols.push(board[0][j]);
  }
  if (winningSymbols.length !== 0) animateWin();
}

function spin() {
  spriteAnimateCounter = 0;
  document.body.style.pointerEvents = "none";
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
    movementSpeed = canvas.height / 15;
    getImages(0, false);
    cancelAnimationFrame(spriteAnimateId);
    spaceBlocked = true;
    spin();
  }
});

// history

/*const historyBtn = document.querySelector(".history-btn");
const history = document.querySelector(".history");
const historyScreen = document.querySelector(".history-screen");
const historyCancel = document.querySelector(".history-cancel");
const historyScreenImg = historyScreen.querySelector("img");
const labelRange = document.querySelector(".current-img-label");
const range = document.querySelector("input[type=range]");
const rangeBtnPrev = document.querySelector(".range-btn.prev");
const rangeBtnNext = document.querySelector(".range-btn.next");

range.addEventListener("input", (e) => {
  currentHistoryImg = e.target.value - 1;
  historyScreenImg.src = historyImages[currentHistoryImg];
  labelRange.innerHTML = `${currentHistoryImg + 1}/${historyImages.length}`;
});

function changePicture(isNext) {
  if (isNext) {
    if (currentHistoryImg !== historyImages.length - 1) currentHistoryImg++;
  } else {
    if (currentHistoryImg !== 0) currentHistoryImg--;
  }
  historyScreenImg.src = historyImages[currentHistoryImg];
  labelRange.innerHTML = `${currentHistoryImg + 1}/${historyImages.length}`;
  range.value = currentHistoryImg + 1;
}

rangeBtnNext.addEventListener("click", () => changePicture(true));

rangeBtnPrev.addEventListener("click", () => changePicture(false));

historyBtn.addEventListener("click", () => {
  if (historyImages.length > 0) {
    history.classList.add("active");
    spaceBlocked = true;
    currentHistoryImg = 0;
    historyScreenImg.src = historyImages[currentHistoryImg];
    range.min = 1;
    range.max = historyImages.length;
    range.step = 1;
    range.value = 1;
    labelRange.innerHTML = `${currentHistoryImg + 1}/${historyImages.length}`;
  }
});

historyCancel.addEventListener("click", () => {
  history.classList.remove("active");
  spaceBlocked = false;
});*/
