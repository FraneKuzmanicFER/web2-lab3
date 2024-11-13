// game.js

// Odabir canvas elementa i postavljanje konteksta za crtanje
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Postavljanje dimenzija canvas elementa na veličinu prozora
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Inicijalizacija zvučnih efekata
const startSound = new Audio('../audio/game-start-6104.mp3');
const endSound = new Audio('../audio/game-over-arcade-6435.mp3');
const paddleHitSound = new Audio('../audio/game-ball-tap.wav');
const brickHitSound = new Audio('../audio/game-ball-tap.wav');
const wallBounceSound = new Audio('../audio/game-ball-tap.wav');
const victorySound = new Audio('../audio/victory-85561.mp3');
const achievementSound = new Audio('../audio/achievement.mp3');

// Deklaracija globalnih varijabli za postavke igre
let numBricks;
let ballSpeed;

// Dimenzije palice (pravokutnog objekta) i pozicija na početku
const paddleWidth = 110;
const paddleHeight = 10;
let paddleX = (canvas.width - paddleWidth) / 2; // X pozicija palice
let rightPressed = false;
let leftPressed = false;

// Parametri lopte: polumjer, početna pozicija (X, Y), i kut kretanja
let ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let angle = (Math.random() * 120 + 30) * (Math.PI / 180); // Nasumičan početni kut odbijanja
let dx; // Brzina lopte u X smjeru
let dy; // Brzina lopte u Y smjeru

// Postavke cigli
let brickColumnCount; // Broj stupaca cigli
let brickRowCount; // Broj redova cigli
let totalBrickWidth; // Ukupna širina cigli u redu
let brickOffsetLeft;
const brickHeight = 20; // Visina svake cigle
const brickPadding = 10; // Razmak između cigli
const brickOffsetTop = 50;
let brickWidth = 80; // Širina svake cigle

// Polje za spremanje objekata cigli
let bricks = [];
let score = 0; // Trenutni rezultat
let gameOver = false; // Zastavica za provjeru završetka igre
let bestScore = parseInt(localStorage.getItem("bestScore")) || 0; // Najbolji rezultat se sprema u local storage

// Funkcija za pokretanje igre
function startGame() {
    startSound.play();
    numBricks = document.getElementById("numBricks").value;
    ballSpeed = document.getElementById("ballSpeed").value;

    localStorage.setItem("numBricks", numBricks);
    localStorage.setItem("ballSpeed", ballSpeed);

    document.getElementById("settings").style.display = "none";
    document.getElementById("game").style.display = "block";

    // Inicijalizacija parametara igre
    initGameParameters();
    // Poziv funkcije za crtanje igre
    draw();
}

// Funkcija za crtanje palice
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = '#FF0000';
  ctx.fill();
  ctx.lineWidth = 2; 
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();  
  ctx.closePath();
}

// Funkcija za crtanje lopte
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFF00';
  ctx.fill();
  ctx.closePath();
}

// Funkcija za crtanje cigli
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = '#00FF00'; 
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#FFFFFF';
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}

// Event listeneri za tipke lijevo i desno
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    rightPressed = true;
  } else if (e.key === 'ArrowLeft') {
    leftPressed = true;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowRight') {
    rightPressed = false;
  } else if (e.key === 'ArrowLeft') {
    leftPressed = false;
  }
});

// Funkcija za crtanje rezultata
function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'right';
    ctx.fillText('Score: ' + score, canvas.width - 10, 20);
    ctx.fillText('Best: ' + bestScore, canvas.width - 10, 40);
}

// Funkcija za prikaz poruke pobjede ili poraza
function drawMessage(message) {
    ctx.font = '48px Arial';
    ctx.fillStyle = '#FF0000'; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

// Funkcija za detekciju sudara između lopte i cigli
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy; // Preokreće smjer lopte nakon sudara
                    b.status = 0; // Skidanje cigle
                    score++; // Povećavanje rezultata
                    brickHitSound.play();
                    if (score % 10 === 0) {
                        achievementSound.play(); // Zvuk za svaku desetu ciglu
                    }
                    if (score === brickRowCount * brickColumnCount) {
                        drawMessage('YOU WIN, CONGRATULATIONS!');
                        victorySound.play();
                        gameOver = true;
                        if (score > bestScore) {
                            bestScore = score;
                            localStorage.setItem("bestScore", bestScore);
                        }
                        setTimeout(() => {
                            initGameParameters();
                            draw();
                        }, 1000);
                    }
                }
            }
        }
    }
}

// Funkcija draw() služi za iscrtavanje svih elemenata igre i upravljanje kretanjem te sudarima.
// Funkcija se poziva rekurzivno korištenjem requestAnimationFrame()
function draw() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Poziva funkcije za crtanje cigli, lopte, platforme, i rezultata.
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    // Provjerava sudare između lopte i cigli pomoću funkcije collisionDetection.
    collisionDetection();

    // Provjerava sudare lopte sa zidovima.
    // Ako lopta dodirne desni ili lijevi zid, mijenja smjer lopte u suprotan.
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
        wallBounceSound.play();
    }
    // Provjerava sudare lopte s gornjim zidom.
    // Ako lopta dodirne gornji rub, mijenja vertikalni smjer.
    if (y + dy < ballRadius) {
        dy = -dy;
        wallBounceSound.play();
    }
    // Ako lopta dodirne donji rub (ispod platforme), provjerava je li platforma uhvatila loptu.
    else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
            paddleHitSound.play();
        } else {
            drawMessage('GAME OVER');
            endSound.play();
            gameOver = true;
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem("bestScore", bestScore);
            }
            setTimeout(() => {
                initGameParameters();
                draw();
            }, 800);
        }
    }

    // Provjera je li pritisnuta desna ili lijeva tipka za kretanje platforme,
    // te pomiče platformu u odgovarajućem smjeru.
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    // Ažurira poziciju lopte na temelju njezinih trenutnih horizontalnih i vertikalnih brzina.
    x += dx;
    y += dy;

    // Rekurzivno poziva draw() kako bi se nastavila animacija igre.
    requestAnimationFrame(draw);
}

// Funkcija inicijalizira početne parametre igre, poput brzine lopte, kuta, pozicije cigli, itd.
function initGameParameters() {
    // Generira slučajan kut kretanja lopte između 30 i 150 stupnjeva
    angle = (Math.random() * 120 + 30) * (Math.PI / 180);

    dx = ballSpeed * Math.cos(angle);
    dy = -ballSpeed * Math.sin(angle);

    // Postavlja broj stupaca i redova cigli na temelju ukupnog broja cigli (numBricks),
    // kako bi se cigle ravnomjerno rasporedile po ekranu.
    brickColumnCount = Math.ceil(Math.sqrt(numBricks));
    brickRowCount = Math.ceil(numBricks / brickColumnCount);

    // Računa ukupnu širinu prostora zauzetog ciglama i pomiče ih kako bi bile centrirane na ekranu.
    const totalBrickWidth = brickColumnCount * (brickWidth + brickPadding) - brickPadding;
    brickOffsetLeft = (canvas.width - totalBrickWidth) / 2;

    bricks = [];
    let brickCount = 0;
    // Inicijalizira skup cigli i postavlja njihove koordinate.
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            if (brickCount < numBricks) {
                bricks[c][r] = { x: 0, y: 0, status: 1 };
                brickCount++;
            } else {
                bricks[c][r] = { x: 0, y: 0, status: 0 };
            }
        }
    }

    // Postavlja početne pozicije lopte i platforme.
    x = canvas.width / 2;
    y = canvas.height - 30;
    paddleX = (canvas.width - paddleWidth) / 2;
    // Resetira rezultat i status kraja igre.
    score = 0;
    gameOver = false;
}