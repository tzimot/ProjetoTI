// =============================
// PHYSIOFLOW v0.2
// FASE 2 - INTEGRAÇÃO ML5.JS (BODYPOSE)
// =============================

let appState = "menu";
let selectedArea = null;

// ----- VARIÁVEIS ML5 & VÍDEO -----
let video;
let bodyPose;
let poses = [];
let connections;
let modelLoaded = false;

// =============================
// PRELOAD - Carregar Modelo IA
// =============================
function preload() {
    // Carrega o modelo BodyPose (BlazePose ou MoveNet)
    bodyPose = ml5.bodyPose("MoveNet", { flipped: true });
}

// =============================
// SETUP
// =============================
function setup() {
    createCanvas(windowWidth, windowHeight);

    // ✅ Sem segundo argumento
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();

    // Iniciar deteção contínua
    bodyPose.detectStart(video, gotPoses);
    connections = bodyPose.getSkeleton();

    textAlign(CENTER, CENTER);
    rectMode(CENTER);
}

// Callback quando deteta poses
function gotPoses(results) {
    poses = results;
    if (!modelLoaded) modelLoaded = true;
}

// =============================
// DRAW LOOP
// =============================
function draw() {
    background(15, 23, 42);

    switch (appState) {
        case "menu":
            drawMenuScreen();
            break;

        case "exercise":
            drawExerciseScreen();
            break;
    }
}

// =============================
// ECRÃ B - EXERCÍCIO (COM VÍDEO)
// =============================
// =============================
// ECRÃ B - EXERCÍCIO (VÍDEO ESPELHADO)
// =============================
function drawExerciseScreen() {
    let vx = width / 2 - 320; // Posição X do canto esquerdo do vídeo
    let vy = height / 2 - 240; // Posição Y do topo do vídeo

    push();
    translate(vx, vy); // Movemos a origem para onde o vídeo começa

    // 1. DESENHAR VÍDEO ESPELHADO
    push();
    translate(640, 0); // Move para a direita do vídeo
    scale(-1, 1);      // Inverte horizontalmente
    image(video, 0, 0, 640, 480);
    pop();

    // 2. DESENHAR MOLDURA (Normal)
    stroke(59, 130, 246);
    strokeWeight(4);
    noFill();
    rectMode(CORNER);
    rect(-2, -2, 644, 484, 10);

    // 3. DESENHAR ESQUELETO (Normal - ml5 já compensa o flip se configurado)
    if (modelLoaded) {
        drawSkeleton();
    } else {
        fill(255, 200, 0);
        noStroke();
        textSize(18);
        text("⏳ A carregar modelo...", 320, 240);
    }
    pop();

    drawExerciseUI();
}

// =============================
// DESENHAR ESQUELETO (KEYPOINTS)
// =============================
function drawSkeleton() {
    if (poses.length > 0) {
        let pose = poses[0];

        // Desenhar Conexões
        for (let i = 0; i < connections.length; i++) {
            let pointA = pose.keypoints[connections[i][0]];
            let pointB = pose.keypoints[connections[i][1]];

            if (pointA.confidence > 0.1 && pointB.confidence > 0.1) {
                stroke(0, 255, 0);
                strokeWeight(3);
                line(pointA.x, pointA.y, pointB.x, pointB.y);
            }
        }

        // Desenhar Pontos
        for (let i = 0; i < pose.keypoints.length; i++) {
            let kp = pose.keypoints[i];
            if (kp.confidence > 0.1) {
                fill(255, 0, 0);
                noStroke();
                circle(kp.x, kp.y, 10);
            }
        }
    }
}

// =============================
// UI DO EXERCÍCIO
// =============================
function drawExerciseUI() {
    fill(255);
    textSize(24);
    text("Treino: " + selectedArea, width / 2, 50);

    drawButton("Sair", width / 2, height - 60);
}

// =============================
// MENU E BOTÕES (IGUAL À FASE 1)
// =============================
function drawMenuScreen() {
    fill(255);
    textSize(42);
    text("PhysioFlow", width / 2, height * 0.2);
    drawButton("Braquial", width / 2, height * 0.45);
    drawButton("Dorsal", width / 2, height * 0.55);
    drawButton("Lombar", width / 2, height * 0.65);
}

function drawButton(label, x, y) {
    let bw = 200; let bh = 45;
    let hover = mouseX > x - bw / 2 && mouseX < x + bw / 2 && mouseY > y - bh / 2 && mouseY < y + bh / 2;
    fill(hover ? 70 : 40, 130, 250);
    rect(x, y, bw, bh, 10);
    fill(255); textSize(16); text(label, x, y);
}

function mousePressed() {
    if (appState === "menu") {
        if (isButtonClicked(height * 0.45)) { selectedArea = "Braquial"; appState = "exercise"; }
        if (isButtonClicked(height * 0.55)) { selectedArea = "Dorsal"; appState = "exercise"; }
        if (isButtonClicked(height * 0.65)) { selectedArea = "Lombar"; appState = "exercise"; }
    } else if (appState === "exercise") {
        if (isButtonClicked(height - 60)) { appState = "menu"; }
    }
}

function isButtonClicked(y) {
    return mouseX > width / 2 - 100 && mouseX < width / 2 + 100 && mouseY > y - 22 && mouseY < y + 22;
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }