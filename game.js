// ======================
// Galaxy Defender
// Part 1
// ======================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// Hide loading screen
setTimeout(() => {
    document.getElementById("loading").style.display = "none";
}, 1000);

// ---------------------
// Game Variables
// ---------------------

let score = 0;
let level = 1;
let lives = 20;
let gamePaused = false;

const bullets = [];
const enemies = [];
const stars = [];

// ---------------------
// Player
// ---------------------

const player = {
    x: canvas.width / 2,
    y: canvas.height - 120,
    width: 50,
    height: 70,
    speed: 4
};

// ---------------------
// Stars
// ---------------------

for (let i = 0; i < 200; i++) {

    stars.push({

        x: Math.random() * canvas.width,

        y: Math.random() * canvas.height,

        size: Math.random() * 3,

        speed: 1 + Math.random() * 4

    });

}

// ---------------------
// Keyboard
// ---------------------

const keys = {};

document.addEventListener("keydown", e => {

    keys[e.key] = true;

    if (e.code === "Space")
        shoot();

});

document.addEventListener("keyup", e => {

    keys[e.key] = false;

});

// ---------------------
// Mobile Controls
// ---------------------

let moveLeft = false;
let moveRight = false;

const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");
const shootBtn = document.getElementById("shoot");

leftBtn.addEventListener("touchstart", () => moveLeft = true);
leftBtn.addEventListener("touchend", () => moveLeft = false);

rightBtn.addEventListener("touchstart", () => moveRight = true);
rightBtn.addEventListener("touchend", () => moveRight = false);

shootBtn.addEventListener("touchstart", shoot);

// ---------------------
// Shoot
// ---------------------

function shoot() {

    bullets.push({

        x: player.x,

        y: player.y - 25,

        width: 6,

        height: 18,

        speed: 12

    });

}

// ---------------------
// Enemy Spawner
// ---------------------

setInterval(() => {

    if (gamePaused) return;

    enemies.push({

        x: Math.random() * (canvas.width - 60),

        y: -80,

        width: 45,

        height: 45,

        speed: 2 + Math.random() * level

    });

}, 900);

// ---------------------
// Update
// ---------------------

function update() {

    if (gamePaused) return;

    if (keys["ArrowLeft"] || keys["a"] || moveLeft)
        player.x -= player.speed;

    if (keys["ArrowRight"] || keys["d"] || moveRight)
        player.x += player.speed;

    player.x = Math.max(
        player.width / 2,
        Math.min(canvas.width - player.width / 2, player.x)
    );

    bullets.forEach(b => b.y -= b.speed);

    enemies.forEach(e => e.y += e.speed);

}

// ---------------------
// Draw Stars
// ---------------------

function drawStars() {

    ctx.fillStyle = "white";

    stars.forEach(star => {

        star.y += star.speed;

        if (star.y > canvas.height) {

            star.y = 0;

            star.x = Math.random() * canvas.width;

        }

        ctx.beginPath();

        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

        ctx.fill();

    });

}

// ---------------------
// Draw Ship
// ---------------------

function drawPlayer() {

    ctx.save();

    ctx.translate(player.x, player.y);

    // Wings
    ctx.fillStyle = "#1E88E5";

    ctx.beginPath();

    ctx.moveTo(0, -35);

    ctx.lineTo(-22, 30);

    ctx.lineTo(0, 12);

    ctx.lineTo(22, 30);

    ctx.closePath();

    ctx.fill();

    // Cockpit
    ctx.fillStyle = "#90CAF9";

    ctx.beginPath();

    ctx.arc(0, -5, 10, 0, Math.PI * 2);

    ctx.fill();

    // Engine glow

    ctx.fillStyle = "orange";

    ctx.beginPath();

    ctx.moveTo(-8, 30);

    ctx.lineTo(0, 50);

    ctx.lineTo(8, 30);

    ctx.fill();

    ctx.restore();

}

// ---------------------
// Draw Bullets
// ---------------------

function drawBullets() {

    ctx.fillStyle = "#ffeb3b";

    bullets.forEach(b => {

        ctx.fillRect(

            b.x - b.width / 2,

            b.y,

            b.width,

            b.height

        );

    });

}

// ---------------------
// Draw Enemies
// ---------------------

function drawEnemies() {

    enemies.forEach(enemy => {

        ctx.fillStyle = "#E53935";

        ctx.beginPath();

        ctx.moveTo(enemy.x + 22, enemy.y);

        ctx.lineTo(enemy.x, enemy.y + 40);

        ctx.lineTo(enemy.x + 45, enemy.y + 40);

        ctx.closePath();

        ctx.fill();

    });

}
// ======================
// Part 2
// ======================

// Explosions
const particles = [];

function explode(x, y) {

    for (let i = 0; i < 20; i++) {

        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 8,
            dy: (Math.random() - 0.5) * 8,
            life: 40
        });

    }

}

function drawParticles() {

    for (let i = particles.length - 1; i >= 0; i--) {

        const p = particles[i];

        p.x += p.dx;
        p.y += p.dy;

        p.life--;

        ctx.fillStyle = `rgba(255,165,0,${p.life / 40})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0)
            particles.splice(i, 1);

    }

}

// --------------------
// Collision
// --------------------

function hit(a, b) {

    return (

        a.x - a.width / 2 < b.x + b.width &&
        a.x + a.width / 2 > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y

    );

}

// --------------------
// Game Logic
// --------------------

function gameLogic() {

    // Bullets hit enemies

    for (let i = bullets.length - 1; i >= 0; i--) {

        for (let j = enemies.length - 1; j >= 0; j--) {

            if (hit(bullets[i], enemies[j])) {

                explode(
                    enemies[j].x + enemies[j].width / 2,
                    enemies[j].y + enemies[j].height / 2
                );

                bullets.splice(i, 1);
                enemies.splice(j, 1);

                score += 10;

                document.getElementById("score").textContent = score;

                break;

            }

        }

    }

    // Enemy reaches player

    for (let i = enemies.length - 1; i >= 0; i--) {

        if (enemies[i].y > canvas.height) {

            enemies.splice(i, 1);

            lives--;

            document.getElementById("lives").textContent = lives;

            if (lives <= 0)
                endGame();

        }

    }

}

// --------------------
// Draw HUD
// --------------------

function drawHUD() {

    document.getElementById("score").textContent = score;

    document.getElementById("level").textContent = level;

}

// --------------------
// Pause
// --------------------

const pauseMenu = document.getElementById("pauseMenu");

document.getElementById("pauseButton").onclick = () => {

    gamePaused = true;

    pauseMenu.classList.remove("hidden");

};

document.getElementById("resumeButton").onclick = () => {

    gamePaused = false;

    pauseMenu.classList.add("hidden");

};

// --------------------
// Game Over
// --------------------

function endGame() {

    gamePaused = true;

    document.getElementById("gameOver").classList.remove("hidden");

    document.getElementById("finalScore").textContent = score;

}

// --------------------
// Draw Everything
// --------------------

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawStars();

    drawPlayer();

    drawBullets();

    drawEnemies();

    drawParticles();

}

// --------------------
// Clean Arrays
// --------------------

function cleanup() {

    for (let i = bullets.length - 1; i >= 0; i--) {

        if (bullets[i].y < -20)
            bullets.splice(i, 1);

    }

    for (let i = enemies.length - 1; i >= 0; i--) {

        if (enemies[i].y > canvas.height + 100)
            enemies.splice(i, 1);

    }

}

// --------------------
// Increase Difficulty
// --------------------

setInterval(() => {

    level++;

}, 15000);

// --------------------
// Main Loop
// --------------------

function gameLoop() {

    update();

    gameLogic();

    cleanup();

    drawHUD();

    draw();

    requestAnimationFrame(gameLoop);

}

gameLoop();