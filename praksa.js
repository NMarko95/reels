let image, animateId, spriteAnimateId;

let board = [],
  sprites = [];
for (let i = 0; i < 5; i++) {
  board[i] = new Array(5);
}

let currentTime, lastRender;

const canvas = document.querySelector(".main-canvas");
const c = canvas.getContext("2d");

const winCanvas = document.querySelector(".win-canvas");
const winC = winCanvas.getContext("2d");

canvas.height = innerHeight;

let tableDim = 5;

const cellWidth = canvas.width;
const cellHeight = canvas.height / 5;

const symbolHeight = cellHeight / 1.5;
const symbolWidth = cellWidth / 1.5;

let gameWidth;
let gameHeight;

let availableSymbols = [3, 5, 7, 8, 10];

let scores = [
  {
    id: 3,
    score: 0,
  },
  {
    id: 5,
    score: 0,
  },
  {
    id: 7,
    score: 0,
  },
  {
    id: 8,
    score: 0,
  },
];

function generateRandomNumber() {
  const randomNumber = Math.floor(Math.random() * availableSymbols.length);
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

getImages(0, true);

let randomNumber,
  randomSymbol,
  centeredHeight = (cellHeight - symbolHeight) / 2,
  centeredWidth = (cellWidth - symbolWidth) / 2;

function drawImages() {
  for (let i = 0; i <= tableDim; i++) {
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
  }
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

function drawSymbol(currentSymbol, j) {
  if (currentSymbol.y >= canvas.height) {
    currentImg = generateRandomNumber();
    currentSymbol.img = symbols[currentImg];
    currentSymbol.y = -cellHeight + centeredHeight / 2;
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
    if (animateCounter === animatesPerSecond * 2.5)
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
  spriteDim = 260,
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

const canvasContainer = document.querySelector(".canvas-container");

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

const imageContainers = document.querySelectorAll("img");
const spanArray = document.querySelectorAll("span");

let correctSpan, symbolImg, symbolSrcArray, symbolNumber;

function checkWin() {
  document.body.style.pointerEvents = "auto";
  symbolNumber = getImageNumber();
  currentSprite = sprites.find((sprite) =>
    sprite.src.includes(`${symbolNumber}.png`)
  );
  if (symbolNumber == 10) {
    spanArray.forEach((span) => (span.innerHTML = "0"));
    scores.forEach((score) => (score.score = 0));
  } else {
    imageContainers.forEach((img) => {
      symbolSrcArray = img.src.split("/");
      if (
        symbolSrcArray[symbolSrcArray.length - 1].includes(`${symbolNumber}`)
      ) {
        scores.forEach((score) => {
          if (score.id === parseInt(symbolNumber)) {
            correctSpan = img.parentNode.querySelector("span");
            score.score++;
            correctSpan.innerHTML = score.score;
          }
        });
      }
    });
  }
  animateWin();
}

function spin() {
  getImages(0, false);
  spriteAnimateCounter = 0;
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

const scoreContainers = document.querySelectorAll(".score");
const mainContainer = document.querySelector(".main");

let containerHeight, containerWidth;

let aspectRatioScreen = {
  widthScale: 16,
  heightScale: 9,
};

/*function resize(innerWidth, innerHeight) {
  if (innerWidth > innerHeight) {
    if (
      gameHeight + 5 >= window.innerHeight &&
      window.innerWidth >= gameWidth
    ) {
      gameHeight = innerHeight;
      gameWidth = (gameHeight * 16) / 9;
    } else {
      gameWidth = innerWidth;
      gameHeight = (gameWidth * 9) / 16;
    }
  } else {
    if (
      gameHeight + 5 >= window.innerHeight &&
      window.innerWidth >= gameWidth
    ) {
      gameWidth = innerWidth;
      gameHeight = (gameWidth * 16) / 9;
    } else {
      gameHeight = innerHeight;
      gameWidth = (gameHeight * 9) / 16;
    }
  }

  resizeElements(gameWidth, gameHeight);
}

function resizeElements(width, height) {
  mainContainer.style.width = width + "px";
  mainContainer.style.height = height + "px";
}*/

function proportionalScaleCanvasScore() {
  canvas.style.height = mainContainer.style.height;
  canvas.style.width = `calc(${mainContainer.style.height} / 5)`;
  winCanvas.style.height = winCanvas.style.width = canvas.style.width;
  scoreContainers.forEach((sc) => {
    sc.style.width = `calc((${mainContainer.style.width} - ${canvas.style.width}) / 2)`;
  });
}

let onloadScale;

function proportionalScale(isLandscape) {
  containerHeight = parseInt(mainContainer.style.height.split("p")[0]);
  containerWidth = parseInt(mainContainer.style.width.split("p")[0]);
  if (isLandscape) {
    if (
      containerHeight + 5 >= window.innerHeight &&
      window.innerWidth >= containerWidth
    ) {
      mainContainer.style.height = `${window.innerHeight}px`;
      mainContainer.style.width = `${
        (parseFloat(window.innerHeight) * aspectRatioScreen.widthScale) /
        aspectRatioScreen.heightScale
      }px`;
    } else {
      // slucaj za onload
      if (mainContainer.style.height === "") {
        if (onloadScale > 1.7778) {
          mainContainer.style.height = `${window.innerHeight}px`;
          mainContainer.style.width = `${
            (parseFloat(window.innerHeight) * aspectRatioScreen.widthScale) /
            aspectRatioScreen.heightScale
          }px`;
        } else {
          mainContainer.style.width = `${window.innerWidth}px`;
          mainContainer.style.height = `${
            (parseFloat(window.innerWidth) * aspectRatioScreen.heightScale) /
            aspectRatioScreen.widthScale
          }px`;
        }
      } else {
        mainContainer.style.width = `${window.innerWidth}px`;
        mainContainer.style.height = `${
          (parseFloat(window.innerWidth) * aspectRatioScreen.heightScale) /
          aspectRatioScreen.widthScale
        }px`;
      }
    }
  } else {
    if (
      containerWidth + 5 >= window.innerWidth &&
      window.innerHeight >= containerHeight
    ) {
      mainContainer.style.width = `${window.innerWidth}px`;
      mainContainer.style.height = `${
        (parseFloat(window.innerWidth) * aspectRatioScreen.widthScale) /
        aspectRatioScreen.heightScale
      }px`;
    } else {
      // slucaj za onload
      if (mainContainer.style.width === "") {
        if (onloadScale < 0.5625) {
          mainContainer.style.width = `${window.innerWidth}px`;
          mainContainer.style.height = `${
            (window.innerWidth * aspectRatioScreen.widthScale) /
            aspectRatioScreen.heightScale
          }px`;
        } else {
          mainContainer.style.height = `${window.innerHeight}px`;
          mainContainer.style.width = `${
            (parseFloat(window.innerHeight) * aspectRatioScreen.heightScale) /
            aspectRatioScreen.widthScale
          }px`;
        }
      } else {
        mainContainer.style.height = `${window.innerHeight}px`;
        mainContainer.style.width = `${
          (parseFloat(window.innerHeight) * aspectRatioScreen.heightScale) /
          aspectRatioScreen.widthScale
        }px`;
      }
    }
  }
  proportionalScaleCanvasScore();
}

addEventListener("load", () => {
  let interval = setInterval(() => {
    if (imagesLoaded) {
      imagesLoaded = false;
      drawImages();
      clearInterval(interval);
    }
  });
  onloadScale = innerWidth / innerHeight;
  proportionalScale(window.innerWidth > window.innerHeight);
});

addEventListener("keydown", (e) => {
  if (e.code === "Space" && !spaceBlocked) {
    movementSpeed = canvas.height / 15;
    cancelAnimationFrame(spriteAnimateId);
    spaceBlocked = true;
    spin();
  }
});

window.onresize = () => {
  proportionalScale(window.innerWidth > window.innerHeight);
};
