const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1920;
canvas.height = 1080;

const isTouchDevice = 'ontouchstart' in window;
if (isTouchDevice) {
    document.addEventListener("touchstart", handleInput, { passive: false });
} else {
    document.addEventListener("mousedown", handleInput);
}


const playerImg = new Image();
playerImg.src = "doraemon.png";
const obstacleImg = new Image();
obstacleImg.src = "car.png";
const groundImg = new Image();
groundImg.src = "road.jpg";
const bgImg = new Image();
bgImg.src = "night.jpg";

const jumpSound = new Audio("jump.wav");
jumpSound.volume = 0.7;
const gameoverSound = new Audio("crush.wav");
const carSound = new Audio("car.mp3");
const bgm = new Audio("bgm.mp3");
bgm.loop = true;
bgm.volume = 0.6;

const player = {
    x: 400,
    y: canvas.height - 340,
    width: 230,
    height: 240,
    vy: 0,
    onGround: true
};
const obstacle = {
    x: -300,
    y: canvas.height - 220,
    width: 220,
    height: 120,
    speed: 6100,
    //speed: 1100
};
const ground = {
    x: 0,
    y: canvas.height - 100,
    width: canvas.width,
    height: 100
};

const gravity = 5600;
const jumpPower = -1400;
const max = 5.0;
const min = 1.0;
let count = Math.floor(Math.random() * 5) + 1;
let shownCount = count; //表示用
let lastTime = performance.now();
let score = 0;
let scene = "title";
let bounceStart = 0;
let bounceDuration = 250; // ms






function init() {
    scene = "title";
    count = Math.floor(Math.random() * 5) + 1;
    shownCount = count;
    obstacle.x = -300;
    obstacle.y = canvas.height - 220;
    player.y = canvas.height - 300;
    player.vy = 0;
    score = 0;
    bgmStarted = false;
}



let bgmStarted = false;
function handleInput() {
    if (!bgmStarted) {
        bgm.play();    
        bgmStarted = true;
    }
    if (scene === "title") {
        lastTime = performance.now();
        scene = "game";
    }
    else if (scene === "game") {
        jump();
    }
    else if (scene === "gameover") {
        init();
    }
}


// ジャンプ処理
function jump() {
    if (player.onGround) {
        player.vy = jumpPower;
        player.onGround = false;
        jumpSound.currentTime = 0;
        jumpSound.play();
    }
}


// title
function updateTitle() {
}
function drawTitle() {
    ctx.fillStyle = "white";
    ctx.font = "200px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("タップでスタート",
        canvas.width / 2, canvas.height / 2);
}

//game
function updateGame(now) {
    const deltaTime = (now - lastTime) / 1000;
    lastTime = now;
    if (count > 0) {
        count -= deltaTime;
    } else {
        count = Math.floor(Math.random() * 5) + 1;
        shownCount = count;
        bounceStart = performance.now(); // バウンス開始
        obstacle.x = canvas.width; //障害物スポーン
        carSound.currentTime = 0;
        carSound.play();
        score += 1;

    }
    obstacle.x -= obstacle.speed * deltaTime;

    // 重力 
    player.vy += gravity * deltaTime;
    player.y += player.vy * deltaTime;


    // 地面判定 
    const groundY = canvas.height - 340;
    if (player.y >= groundY) {
        player.y = groundY;
        player.vy = 0;
        player.onGround = true;
    }


    if (isHit(player, obstacle)) {
        gameoverSound.currentTime = 0;
        gameoverSound.play();

        bgm.pause();
        bgm.currentTime = 0;

        scene = "gameover";
    }

}
function drawGame() {
    //背景
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    ctx.drawImage(
        playerImg,
        player.x,
        player.y,
        player.width,
        player.height
    );
    ctx.drawImage(
        obstacleImg,
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
    );
    //地面
    ctx.drawImage(
        groundImg,
        ground.x,
        ground.y,
        ground.width,
        ground.height
    );








    let scale = 1;
    if (bounceStart > 0) {
        let t = (performance.now() - bounceStart) / bounceDuration;
        if (t >= 1) {
            t = 1;
            bounceStart = 0;
        }
        scale = easeOutBack(t);
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2 - 200);
    ctx.scale(scale, scale);

    ctx.fillStyle = "yellow";
    ctx.font = "bold 264px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${shownCount}秒後`, 0, 0);

    ctx.restore();
    //count表示
//    ctx.fillStyle = "yellow";
//    ctx.font = "bold 264px sans-serif";
//    ctx.textAlign = "center";
//    ctx.fillText(`${shownCount}秒後`, canvas.width / 2, canvas.height / 2 - 200);
}
function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// gameover
function updateGameOver() {


}
function drawGameOver() {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.font = "bold 260px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ゲームオーバー",
        canvas.width / 2, canvas.height / 2 - 200);

    //score表示
    ctx.fillStyle = "white";
    ctx.font = "bold 230px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`よけた回数:${score - 1}`, canvas.width / 2, canvas.height / 2 + 200);


    ctx.drawImage(
        playerImg,
        player.x,
        player.y,
        player.width,
        player.height
    );
    ctx.drawImage(
        obstacleImg,
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
    );
    ctx.drawImage(
        groundImg,
        ground.x,
        ground.y,
        ground.width,
        ground.height
    );

}


function isHit(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// メインループ
function loop(now) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    switch (scene) {
        case "title":
            updateTitle();
            drawTitle();
            break;

        case "game":
            updateGame(now);
            drawGame();
            break;

        case "gameover":
            updateGameOver();
            drawGameOver();
            break;
    }

    requestAnimationFrame(loop);
}

loop();