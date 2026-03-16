// =============================
// PHYSIOFLOW v0.3
// FASE 1 + 2 + 3 COMPLETO
// =============================

// ----- ESTADOS -----
let appState = "menu";
let selectedArea = null;

// ----- ML5 & VIDEO -----
let video;
let bodyPose;
let poses = [];
let connections;
let modelLoaded = false;

// ----- EXERCÍCIO -----
let targetPose = null;
let feedbackMsg = "Prepare-se...";
let threshold = 50;

// =============================
// PRELOAD
// =============================
function preload() {
  bodyPose = ml5.bodyPose("MoveNet", { flipped: true });
}

// =============================
// SETUP
// =============================
function setup() {
  createCanvas(windowWidth, windowHeight);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  bodyPose.detectStart(video, gotPoses);
  connections = bodyPose.getSkeleton();

  // Pose alvo: bracos em "T" (reabilitacao braquial)
  targetPose = {
    leftWrist: { x: 100, y: 240 },
    rightWrist: { x: 540, y: 240 },
    leftShoulder: { x: 220, y: 240 },
    rightShoulder: { x: 420, y: 240 }
  };

  textAlign(CENTER, CENTER);
  rectMode(CENTER);
}

// Callback ml5
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
// ECRA A - MENU
// =============================
function drawMenuScreen() {
  // Titulo
  fill(255);
  noStroke();
  textSize(52);
  text("PhysioFlow", width / 2, height * 0.18);

  textSize(20);
  fill(180);
  text("Selecione a area de treino", width / 2, height * 0.28);

  // Botoes
  drawButton("Braquial", width / 2, height * 0.42);
  drawButton("Dorsal", width / 2, height * 0.54);
  drawButton("Lombar", width / 2, height * 0.66);
}

// =============================
// ECRA B - EXERCICIO
// =============================
function drawExerciseScreen() {
  let vx = width / 2 - 320;
  let vy = height / 2 - 240;

  push();
  translate(vx, vy);

  // 1. Video espelhado
  push();
  translate(640, 0);
  scale(-1, 1);
  image(video, 0, 0, 640, 480);
  pop();

  // 2. Moldura
  stroke(59, 130, 246);
  strokeWeight(4);
  noFill();
  rectMode(CORNER);
  rect(-2, -2, 644, 484, 10);
  rectMode(CENTER);

  // 3. Avatar alvo
  drawTargetAvatar();

  // 4. Esqueleto + validacao
  if (modelLoaded && poses.length > 0) {
    drawSkeleton(poses[0]);
    checkPose(poses[0]);
  } else if (!modelLoaded) {
    fill(255, 200, 0);
    noStroke();
    textSize(18);
    text("A carregar modelo de visao...", 320, 240);
  }

  pop();

  // UI por cima
  drawExerciseUI();
}

// =============================
// AVATAR ALVO (FANTASMA)
// =============================
function drawTargetAvatar() {
  // Linha guia entre ombros
  stroke(59, 130, 246, 120);
  strokeWeight(10);
  line(
    targetPose.leftShoulder.x, targetPose.leftShoulder.y,
    targetPose.rightShoulder.x, targetPose.rightShoulder.y
  );

  // Circulos alvo nos pulsos
  noStroke();
  fill(59, 130, 246, 160);
  circle(targetPose.leftWrist.x, targetPose.leftWrist.y, 44);
  circle(targetPose.rightWrist.x, targetPose.rightWrist.y, 44);

  // Labels
  fill(255, 255, 255, 200);
  noStroke();
  textSize(13);
  text("MAO", targetPose.leftWrist.x, targetPose.leftWrist.y - 30);
  text("MAO", targetPose.rightWrist.x, targetPose.rightWrist.y - 30);
}

// =============================
// ESQUELETO DO UTILIZADOR
// =============================
function drawSkeleton(pose) {
  // Conexoes
  for (let i = 0; i < connections.length; i++) {
    let pA = pose.keypoints[connections[i][0]];
    let pB = pose.keypoints[connections[i][1]];

    if (pA.confidence > 0.1 && pB.confidence > 0.1) {
      stroke(0, 220, 0);
      strokeWeight(3);
      line(pA.x, pA.y, pB.x, pB.y);
    }
  }

  // Pontos
  for (let i = 0; i < pose.keypoints.length; i++) {
    let kp = pose.keypoints[i];
    if (kp.confidence > 0.1) {
      fill(255, 50, 50);
      noStroke();
      circle(kp.x, kp.y, 10);
    }
  }
}

// =============================
// VALIDACAO DA POSE
// =============================
function checkPose(pose) {
  // MoveNet: 9 = left_wrist, 10 = right_wrist
  let lw = pose.keypoints[9];
  let rw = pose.keypoints[10];

  if (lw.confidence > 0.2 && rw.confidence > 0.2) {
    let dLeft = dist(lw.x, lw.y, targetPose.leftWrist.x, targetPose.leftWrist.y);
    let dRight = dist(rw.x, rw.y, targetPose.rightWrist.x, targetPose.rightWrist.y);

    if (dLeft < threshold && dRight < threshold) {
      feedbackMsg = "PERFEITO! MANTENHA A POSE!";

      // Brilho nos alvos quando correto
      noFill();
      stroke(0, 255, 100);
      strokeWeight(4);
      circle(targetPose.leftWrist.x, targetPose.leftWrist.y, 70);
      circle(targetPose.rightWrist.x, targetPose.rightWrist.y, 70);

    } else if (dLeft < threshold * 2 || dRight < threshold * 2) {
      feedbackMsg = "Quase! Continue a subir os bracos!";
    } else {
      feedbackMsg = "Eleve os bracos ate aos alvos azuis";
    }
  } else {
    feedbackMsg = "Posicione-se em frente a camara";
  }
}

// =============================
// UI DO EXERCICIO
// =============================
function drawExerciseUI() {
  // Barra de feedback
  fill(15, 23, 42, 210);
  noStroke();
  rect(width / 2, 50, 500, 60, 12);

  fill(255);
  noStroke();
  textSize(20);
  text(feedbackMsg, width / 2, 50);

  // Area selecionada
  fill(59, 130, 246);
  noStroke();
  rect(width / 2, height - 110, 220, 36, 8);
  fill(255);
  textSize(15);
  text("Treino: " + selectedArea, width / 2, height - 110);

  // Botao sair
  drawButton("Sair", width / 2, height - 60);
}

// =============================
// BOTAO GENERICO
// =============================
function drawButton(label, x, y) {
  let bw = 220;
  let bh = 48;
  let hover =
    mouseX > x - bw / 2 && mouseX < x + bw / 2 &&
    mouseY > y - bh / 2 && mouseY < y + bh / 2;

  fill(hover ? 79 : 37, hover ? 140 : 99, hover ? 255 : 235);
  noStroke();
  rect(x, y, bw, bh, 12);

  fill(255);
  textSize(17);
  text(label, x, y);
}

// =============================
// INTERACAO COM RATO
// =============================
function mousePressed() {
  if (appState === "menu") {
    if (isButtonClicked(width / 2, height * 0.42)) { selectedArea = "Braquial"; appState = "exercise"; feedbackMsg = "Prepare-se..."; }
    if (isButtonClicked(width / 2, height * 0.54)) { selectedArea = "Dorsal"; appState = "exercise"; feedbackMsg = "Prepare-se..."; }
    if (isButtonClicked(width / 2, height * 0.66)) { selectedArea = "Lombar"; appState = "exercise"; feedbackMsg = "Prepare-se..."; }
  } else if (appState === "exercise") {
    if (isButtonClicked(width / 2, height - 60)) { appState = "menu"; }
  }
}

function isButtonClicked(x, y) {
  return (
    mouseX > x - 110 && mouseX < x + 110 &&
    mouseY > y - 24 && mouseY < y + 24
  );
}

// =============================
// RESPONSIVIDADE
// =============================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
