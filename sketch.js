// =============================
// PHYSIOFLOW v1.3 - FASE 5
// MENU PRINCIPAL + INSTRUCOES + HISTORICO
// =============================

let appState = "main_menu"; // main_menu | area_select | exercise | instructions | history
let selectedArea = null;

let video, bodyPose, poses = [], connections, modelLoaded = false;

const POSES_LOGIC = {
  "Braquial": [
    { name: "Elevacao em T", id: "t_pose", desc: "Bracos abertos horizontalmente" },
    { name: "Elevacao em V", id: "v_pose", desc: "Maos acima da cabeca em V" },
    { name: "Goalpost (U)", id: "u_pose", desc: "Cotovelos dobrados para cima" }
  ],
  "Dorsal": [
    { name: "Maos na Nuca", id: "nuca_pose", desc: "Cotovelos altos e abertos" },
    { name: "W-Pose", id: "w_pose", desc: "Cotovelos para baixo e para fora" },
    { name: "Remada Alta", id: "row_pose", desc: "Puxe os cotovelos para cima" }
  ],
  "Lombar": [
    { name: "Inclinacao Esq", id: "tilt_left", desc: "Incline o tronco para a esquerda" },
    { name: "Inclinacao Dir", id: "tilt_right", desc: "Incline o tronco para a direita" },
    { name: "Maos nas Ancas", id: "hands_hips", desc: "Cotovelos para fora, bico" },
    { name: "Bracos ao Ceu", id: "arms_up", desc: "Estique-se todo para cima" }
  ]
};

// Historico: highscore por zona
let highscores = { "Braquial": 0, "Dorsal": 0, "Lombar": 0 };

let currentPose = null;
let feedbackMsg = "A carregar...";
let reps = 0;
let holdTimer = 0;
let requiredHold = 60;
let isResting = false;
let restTimer = 0;
let restDuration = 90;
let sessionStart = 0; // millis() quando começa o treino

function preload() {
  bodyPose = ml5.bodyPose("MoveNet", { flipped: true });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  bodyPose.detectStart(video, (r) => { poses = r; modelLoaded = true; });
  connections = bodyPose.getSkeleton();
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
}

function draw() {
  background(15, 23, 42);
  switch (appState) {
    case "main_menu": drawMainMenu(); break;
    case "area_select": drawAreaSelect(); break;
    case "exercise": drawExerciseScreen(); break;
    case "instructions": drawInstructions(); break;
    case "history": drawHistory(); break;
  }
}

// =============================
// MENU PRINCIPAL
// =============================
function drawMainMenu() {
  // Logo / titulo
  fill(59, 130, 246); noStroke(); textSize(72);
  text("PhysioFlow", width / 2, height * 0.22);
  fill(100, 160, 255); textSize(18);
  text("Reabilitacao física de uma forma mais fácil", width / 2, height * 0.31);

  // Botoes principais
  drawButton("INICIAR TREINO", width / 2, height * 0.48, 300, 60);
  drawButton("INSTRUÇÕES", width / 2, height * 0.58, 300, 60);
  drawButton("HISTÓRICO", width / 2, height * 0.68, 300, 60);

  // Rodape
  fill(60); noStroke(); textSize(13);
  text("Desenvolvido por Timóteo Gres... não roubem.", width / 2, height * 0.92);
}

// =============================
// SELECAO DE ZONA
// =============================
function drawAreaSelect() {
  fill(255); noStroke(); textSize(40);
  text("Selecione a Zona", width / 2, height * 0.2);
  fill(120); textSize(17);
  text("Escolha a area de reabilitacao para hoje", width / 2, height * 0.29);

  drawButton("💪  Braquial", width / 2, height * 0.44, 280, 58);
  fill(150); textSize(13); text("Ombros e bracos", width / 2, height * 0.44 + 38);

  drawButton("🔙  Dorsal", width / 2, height * 0.57, 280, 58);
  fill(150); textSize(13); text("Costas e coluna superior", width / 2, height * 0.57 + 38);

  drawButton("🦴  Lombar", width / 2, height * 0.70, 280, 58);
  fill(150); textSize(13); text("Coluna lombar e core", width / 2, height * 0.70 + 38);

  drawButton("← Voltar", width / 2, height * 0.88, 180, 44);
}

// =============================
// INSTRUCOES
// =============================
function drawInstructions() {
  fill(255); noStroke(); textSize(38);
  text("Como Jogar", width / 2, height * 0.1);

  let steps = [
    ["1. Posicione-se", "Fique de pe a 1-2 metros da camara. Garanta boa iluminacao e corpo visivel."],
    ["2. Escolha a Zona", "Selecione a area do corpo que deseja reabilitar hoje."],
    ["3. Imite a Pose", "O bonequinho mostra a pose correta. Imite - a com o seu corpo."],
    ["4. Mantenha 1 Segundo", "Quando a barra verde encher, a repeticao e contada!"],
    ["5. Descanse", "Tem 1.5s de descanso entre poses.  O proximo exercicio aparece automaticamente."]]

  for (let i = 0; i < steps.length; i++) {
    let x = width / 2 + (i % 2 === 0 ? -280 : 280);
    let y = height * 0.28 + floor(i / 2) * 160;
    if (i === 4) { x = width / 2; }

    fill(25, 38, 60); stroke(59, 130, 246); strokeWeight(1.5);
    rect(x, y, 460, 120, 16);
    noStroke();
    fill(59, 130, 246); textSize(15); text(steps[i][0], x, y - 35);
    fill(200); textSize(13); text(steps[i][1], x, y + 5);
  }

  drawButton("← Voltar ao Menu", width / 2, height * 0.9, 240, 48);
}

// =============================
// HISTORICO
// =============================
function drawHistory() {
  fill(255); noStroke(); textSize(38);
  text("Historico de Treino", width / 2, height * 0.1);
  fill(120); textSize(16);
  text("Melhor pontuacao por zona", width / 2, height * 0.18);

  let areas = ["Braquial", "Dorsal", "Lombar"];
  let icons = ["💪", "🔙", "🦴"];
  let colors = [color(59, 130, 246), color(16, 185, 129), color(245, 158, 11)];

  for (let i = 0; i < 3; i++) {
    let x = width / 2 + (i - 1) * 280;
    let y = height * 0.48;
    let hs = highscores[areas[i]];

    fill(25, 38, 60); stroke(colors[i]); strokeWeight(2);
    rect(x, y, 230, 220, 20);

    noStroke();
    fill(colors[i]); textSize(36); text(icons[i], x, y - 70);
    fill(255); textSize(20); text(areas[i], x, y - 35);

    // Numero grande
    fill(colors[i]); textSize(72); text(str(hs), x, y + 20);
    fill(180); textSize(14); text("reps (melhor sessao)", x, y + 70);

    // Estrelas (max 5, 1 por cada 5 reps)
    let stars = min(5, floor(hs / 3));
    fill(255, 200, 0); textSize(20);
    text("★".repeat(stars) + "☆".repeat(5 - stars), x, y + 100);
  }

  drawButton("← Voltar ao Menu", width / 2, height * 0.88, 240, 48);
}

// =============================
// ECRA DE EXERCICIO
// =============================
function drawExerciseScreen() {
  let vx = width / 2 - 320;
  let vy = height / 2 - 200;
  push();
  translate(vx, vy);
  push(); translate(640, 0); scale(-1, 1); image(video, 0, 0, 640, 480); pop();
  stroke(isResting ? color(255, 150, 0) : color(59, 130, 246));
  strokeWeight(4); noFill(); rect(320, 240, 640, 480, 10);
  if (modelLoaded && poses.length > 0) {
    drawSkeleton(poses[0]);
    processPoseLogic(poses[0]);
  }
  if (!isResting && currentPose) drawPoseHelper(20, 20);
  pop();
  drawExerciseUI();
}

// =============================
// BONEQUINHO HELPER
// =============================
function drawPoseHelper(ox, oy) {
  push();
  translate(ox, oy);
  let w = 160, h = 200;
  fill(20, 30, 50, 230); stroke(100, 150, 255, 180); strokeWeight(1.5);
  rect(w / 2, h / 2 + 20, w + 20, h + 50, 14);
  noStroke(); fill(180, 210, 255); textSize(11);
  text("COMO FAZER", w / 2, 10);
  let cx = w / 2, hy = 35, sy = 60, ey = 95, hiy = 130, lsy = 175;
  let lx = cx - 28, rx = cx + 28;
  noStroke(); fill(255, 220, 180); circle(cx, hy, 22);
  stroke(100, 200, 255); strokeWeight(3);
  line(cx, sy, cx, hiy); line(cx, hiy, lx, lsy); line(cx, hiy, rx, lsy);
  stroke(0, 230, 120); strokeWeight(3.5);
  switch (currentPose.id) {
    case "t_pose":
      line(lx, sy, lx - 35, sy); line(lx - 35, sy, lx - 50, sy);
      line(rx, sy, rx + 35, sy); line(rx + 35, sy, rx + 50, sy); break;
    case "v_pose":
      line(lx, sy, lx - 20, sy - 25); line(lx - 20, sy - 25, lx - 10, sy - 50);
      line(rx, sy, rx + 20, sy - 25); line(rx + 20, sy - 25, rx + 10, sy - 50); break;
    case "u_pose":
      line(lx, sy, lx - 30, sy); line(lx - 30, sy, lx - 30, sy - 35);
      line(rx, sy, rx + 30, sy); line(rx + 30, sy, rx + 30, sy - 35); break;
    case "nuca_pose":
      line(lx, sy, lx - 30, sy - 20); line(lx - 30, sy - 20, cx - 10, hy + 5);
      line(rx, sy, rx + 30, sy - 20); line(rx + 30, sy - 20, cx + 10, hy + 5); break;
    case "w_pose":
      line(lx, sy, lx - 25, sy + 30); line(lx - 25, sy + 30, lx - 40, sy + 5);
      line(rx, sy, rx + 25, sy + 30); line(rx + 25, sy + 30, rx + 40, sy + 5); break;
    case "row_pose":
      line(lx, sy, lx - 20, sy - 25); line(lx - 20, sy - 25, cx - 10, sy - 10);
      line(rx, sy, rx + 20, sy - 25); line(rx + 20, sy - 25, cx + 10, sy - 10); break;
    case "tilt_left":
      push(); translate(cx, (sy + hiy) / 2); rotate(0.28);
      stroke(100, 200, 255); line(0, -(hiy - sy) / 2, 0, (hiy - sy) / 2);
      stroke(0, 230, 120);
      line(-28, -(hiy - sy) / 2 + 5, -28 - 20, (hiy - sy) / 2 - 10);
      line(28, -(hiy - sy) / 2 + 5, 28 + 20, (hiy - sy) / 2 - 10); pop(); break;
    case "tilt_right":
      push(); translate(cx, (sy + hiy) / 2); rotate(-0.28);
      stroke(100, 200, 255); line(0, -(hiy - sy) / 2, 0, (hiy - sy) / 2);
      stroke(0, 230, 120);
      line(-28, -(hiy - sy) / 2 + 5, -28 - 20, (hiy - sy) / 2 - 10);
      line(28, -(hiy - sy) / 2 + 5, 28 + 20, (hiy - sy) / 2 - 10); pop(); break;
    case "hands_hips":
      line(lx, sy, lx - 30, sy + 40); line(lx - 30, sy + 40, lx - 10, sy + 55);
      line(rx, sy, rx + 30, sy + 40); line(rx + 30, sy + 40, rx + 10, sy + 55); break;
    case "arms_up":
      line(lx, sy, lx - 10, sy - 30); line(lx - 10, sy - 30, lx - 5, sy - 60);
      line(rx, sy, rx + 10, sy - 30); line(rx + 10, sy - 30, rx + 5, sy - 60); break;
  }
  noStroke(); fill(200); textSize(10);
  text(currentPose.desc, w / 2, h + 25);
  pop();
}

// =============================
// ESQUELETO
// =============================
function drawSkeleton(pose) {
  stroke(isResting ? 150 : 0, 255, 0); strokeWeight(3);
  for (let i = 0; i < connections.length; i++) {
    let pA = pose.keypoints[connections[i][0]];
    let pB = pose.keypoints[connections[i][1]];
    if (pA.confidence > 0.2 && pB.confidence > 0.2) line(pA.x, pA.y, pB.x, pB.y);
  }
  for (let i = 0; i < pose.keypoints.length; i++) {
    let kp = pose.keypoints[i];
    if (kp.confidence > 0.2) { fill(255, 80, 80); noStroke(); circle(kp.x, kp.y, 8); }
  }
}

// =============================
// LOGICA DE JOGO
// =============================
function processPoseLogic(pose) {
  if (isResting) {
    restTimer--;
    feedbackMsg = "DESCANSE... Proximo: " + currentPose.name;
    if (restTimer <= 0) { isResting = false; feedbackMsg = "VAI!"; }
    return;
  }
  let ok = validateShape(pose, currentPose.id);
  if (ok) {
    holdTimer++;
    feedbackMsg = "MANTENHA! " + ceil((requiredHold - holdTimer) / 60) + "s";
    if (holdTimer >= requiredHold) {
      reps++;
      if (reps > highscores[selectedArea]) highscores[selectedArea] = reps;
      holdTimer = 0; isResting = true; restTimer = restDuration;
      pickRandomPose();
    }
  } else {
    holdTimer = max(0, holdTimer - 1);
    feedbackMsg = currentPose.name + ": " + currentPose.desc;
  }
}

// =============================
// VALIDACAO
// =============================
function validateShape(pose, id) {
  let kp = pose.keypoints;
  let ls = kp[5], rs = kp[6], le = kp[7], re = kp[8],
    lw = kp[9], rw = kp[10], n = kp[0];
  if (ls.confidence < 0.3 || rs.confidence < 0.3) return false;
  let sDist = dist(ls.x, ls.y, rs.x, rs.y);
  let tol = sDist * 0.35;
  switch (id) {
    case "t_pose":
      return (abs(le.y - ls.y) < tol && abs(re.y - rs.y) < tol && dist(le.x, re.x, 0, 0) > sDist * 1.2);
    case "v_pose":
      return (le.y < ls.y && re.y < rs.y && lw.y < le.y && rw.y < re.y);
    case "u_pose":
      return (abs(le.y - ls.y) < tol && lw.y < le.y && rw.y < re.y);
    case "nuca_pose":
      return (le.y < ls.y && re.y < rs.y && dist(le.x, re.x, 0, 0) > sDist * 1.1);
    case "w_pose":
      return (le.y > ls.y && re.y > rs.y && lw.y < le.y && rw.y < re.y);
    case "row_pose":
      return (le.y < ls.y && re.y < rs.y && lw.y > le.y && rw.y > re.y);
    case "tilt_left": return (ls.y > rs.y + sDist * 0.2);
    case "tilt_right": return (rs.y > ls.y + sDist * 0.2);
    case "hands_hips":
      return (le.y > ls.y && re.y > rs.y && dist(le.x, re.x, 0, 0) > sDist * 1.3);
    case "arms_up":
      return (lw.y < n.y - sDist * 0.4 && rw.y < n.y - sDist * 0.4);
  }
  return false;
}

// =============================
// UI DO EXERCICIO
// =============================
function drawExerciseUI() {
  // Feedback topo
  fill(15, 23, 42, 230); noStroke(); rect(width / 2, 60, 600, 70, 15);
  fill(isResting ? color(255, 150, 0) : 255); textSize(22);
  text(feedbackMsg, width / 2, 60);

  // Stats
  drawStatBox("REPS", str(reps), width / 2 + 400, height / 2);
  drawStatBox("ZONA", selectedArea, width / 2 - 400, height / 2);

  // Barra de progresso
  let barW = 640;
  fill(30, 41, 59); rect(width / 2, height - 120, barW, 20, 10);
  let prog = map(holdTimer, 0, requiredHold, 0, barW);
  fill(0, 255, 100); rectMode(CORNER);
  rect(width / 2 - barW / 2, height - 130, prog, 20, 10);
  rectMode(CENTER);

  drawButton("Sair do Treino", width / 2, height - 50, 240, 50);
}

// =============================
// UTILS
// =============================
function drawStatBox(label, val, x, y) {
  push(); translate(x, y);
  fill(30, 41, 59, 220); stroke(59, 130, 246); strokeWeight(2);
  rect(0, 0, 140, 110, 20);
  noStroke(); fill(59, 130, 246); textSize(14); text(label, 0, -30);
  fill(255); textSize(val.length > 8 ? 18 : 42); text(val, 0, 15);
  pop();
}

function drawButton(label, x, y, bw = 240, bh = 50) {
  let h = mouseX > x - bw / 2 && mouseX < x + bw / 2 && mouseY > y - bh / 2 && mouseY < y + bh / 2;
  fill(h ? 70 : 40, 130, 250); noStroke(); rect(x, y, bw, bh, 12);
  fill(255); textSize(18); text(label, x, y);
}

function pickRandomPose() {
  let list = POSES_LOGIC[selectedArea];
  let next = random(list);
  if (currentPose && next.id === currentPose.id) return pickRandomPose();
  currentPose = next;
}

function startExercise(area) {
  selectedArea = area;
  reps = 0; isResting = false; holdTimer = 0;
  sessionStart = millis();
  pickRandomPose();
  appState = "exercise";
}

// =============================
// INPUT
// =============================
function mousePressed() {
  let mx = mouseX, my = mouseY;

  if (appState === "main_menu") {
    if (hitBtn(mx, my, width / 2, height * 0.48, 300, 60)) appState = "area_select";
    if (hitBtn(mx, my, width / 2, height * 0.58, 300, 60)) appState = "instructions";
    if (hitBtn(mx, my, width / 2, height * 0.68, 300, 60)) appState = "history";
  }
  else if (appState === "area_select") {
    if (hitBtn(mx, my, width / 2, height * 0.44, 280, 58)) startExercise("Braquial");
    if (hitBtn(mx, my, width / 2, height * 0.57, 280, 58)) startExercise("Dorsal");
    if (hitBtn(mx, my, width / 2, height * 0.70, 280, 58)) startExercise("Lombar");
    if (hitBtn(mx, my, width / 2, height * 0.88, 180, 44)) appState = "main_menu";
  }
  else if (appState === "exercise") {
    if (hitBtn(mx, my, width / 2, height - 50, 240, 50)) appState = "main_menu";
  }
  else if (appState === "instructions") {
    if (hitBtn(mx, my, width / 2, height * 0.9, 240, 48)) appState = "main_menu";
  }
  else if (appState === "history") {
    if (hitBtn(mx, my, width / 2, height * 0.88, 240, 48)) appState = "main_menu";
  }
}

function hitBtn(mx, my, x, y, bw, bh) {
  return mx > x - bw / 2 && mx < x + bw / 2 && my > y - bh / 2 && my < y + bh / 2;
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
