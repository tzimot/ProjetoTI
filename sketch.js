// =============================
// PHYSIOFLOW v1.2
// REMOVIDO: MAOS NOS OMBROS
// =============================

let appState = "menu";
let selectedArea = null;

let video, bodyPose, poses = [], connections, modelLoaded = false;

const POSES_LOGIC = {
  "Braquial": [
    { name: "Elevacao em T", id: "t_pose", desc: "Bracos abertos horizontalmente" },
    { name: "Elevacao em V", id: "v_pose", desc: "Maos acima da cabeca em V" },
    { name: "Goalpost (U)", id: "u_pose", desc: "Cotovelos dobrados para cima" },
    { name: "Bracos a Frente", id: "front_pose", desc: "Maos a frente do peito" }
  ],
  "Dorsal": [
    { name: "Maos na Nuca", id: "nuca_pose", desc: "Cotovelos altos e abertos" },
    { name: "W-Pose", id: "w_pose", desc: "Cotovelos para baixo e para fora" },
    { name: "Remada Alta", id: "row_pose", desc: "Puxe os cotovelos para cima" }
    // Removido: Maos nos Ombros
  ],
  "Lombar": [
    { name: "Inclinacao Esq", id: "tilt_left", desc: "Incline o tronco para a esquerda" },
    { name: "Inclinacao Dir", id: "tilt_right", desc: "Incline o tronco para a direita" },
    { name: "Maos nas Ancas", id: "hands_hips", desc: "Cotovelos para fora, bico" },
    { name: "Bracos ao Ceu", id: "arms_up", desc: "Estique-se todo para cima" }
  ]
};

let currentPose = null;
let feedbackMsg = "A carregar...";
let reps = 0;
let holdTimer = 0;
let requiredHold = 60;
let isResting = false;
let restTimer = 0;
let restDuration = 90;

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
  if (appState === "menu") drawMenuScreen();
  else if (appState === "exercise") drawExerciseScreen();
}

function drawMenuScreen() {
  fill(255); noStroke(); textSize(52);
  text("PhysioFlow", width / 2, height * 0.2);
  fill(150); textSize(20);
  text("Selecione a zona de reabilitacao", width / 2, height * 0.3);
  drawButton("Braquial", width / 2, height * 0.45);
  drawButton("Dorsal", width / 2, height * 0.55);
  drawButton("Lombar", width / 2, height * 0.65);
}

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

function drawPoseHelper(ox, oy) {
  push();
  translate(ox, oy);
  let w = 160, h = 200;
  fill(20, 30, 50, 230); stroke(100, 150, 255, 180); strokeWeight(1.5);
  rect(w / 2, h / 2 + 20, w + 20, h + 50, 14);
  noStroke(); fill(180, 210, 255); textSize(11);
  text("COMO FAZER", w / 2, 10);
  let cx = w / 2;
  let hy = 35;
  let sy = 60;
  let ey = 95;
  let wy = 125;
  let hiy = 130;
  let lsy = 175;
  let lx = cx - 28;
  let rx = cx + 28;
  noStroke(); fill(255, 220, 180);
  circle(cx, hy, 22);
  stroke(100, 200, 255); strokeWeight(3);
  line(cx, sy, cx, hiy);
  line(cx, hiy, lx, lsy);
  line(cx, hiy, rx, lsy);
  stroke(0, 230, 120); strokeWeight(3.5);
  switch (currentPose.id) {
    case "t_pose":
      line(lx, sy, lx - 35, sy); line(lx - 35, sy, lx - 50, sy);
      line(rx, sy, rx + 35, sy); line(rx + 35, sy, rx + 50, sy);
      break;
    case "v_pose":
      line(lx, sy, lx - 20, sy - 25); line(lx - 20, sy - 25, lx - 10, sy - 50);
      line(rx, sy, rx + 20, sy - 25); line(rx + 20, sy - 25, rx + 10, sy - 50);
      break;
    case "u_pose":
      line(lx, sy, lx - 30, sy); line(lx - 30, sy, lx - 30, sy - 35);
      line(rx, sy, rx + 30, sy); line(rx + 30, sy, rx + 30, sy - 35);
      break;
    case "front_pose":
      line(lx, sy, lx - 10, ey); line(lx - 10, ey, cx - 15, ey + 10);
      line(rx, sy, rx + 10, ey); line(rx + 10, ey, cx + 15, ey + 10);
      break;
    case "nuca_pose":
      line(lx, sy, lx - 30, sy - 20); line(lx - 30, sy - 20, cx - 10, hy + 5);
      line(rx, sy, rx + 30, sy - 20); line(rx + 30, sy - 20, cx + 10, hy + 5);
      break;
    case "w_pose":
      line(lx, sy, lx - 25, sy + 30); line(lx - 25, sy + 30, lx - 40, sy + 5);
      line(rx, sy, rx + 25, sy + 30); line(rx + 25, sy + 30, rx + 40, sy + 5);
      break;
    case "row_pose":
      line(lx, sy, lx - 20, sy - 25); line(lx - 20, sy - 25, cx - 10, sy - 10);
      line(rx, sy, rx + 20, sy - 25); line(rx + 20, sy - 25, cx + 10, sy - 10);
      break;
    case "tilt_left":
      push(); translate(cx, (sy + hiy) / 2); rotate(0.28);
      stroke(100, 200, 255); line(0, -(hiy - sy) / 2, 0, (hiy - sy) / 2);
      stroke(0, 230, 120);
      line(-28, -(hiy - sy) / 2 + 5, -28 - 20, (hiy - sy) / 2 - 10);
      line(28, -(hiy - sy) / 2 + 5, 28 + 20, (hiy - sy) / 2 - 10);
      pop();
      break;
    case "tilt_right":
      push(); translate(cx, (sy + hiy) / 2); rotate(-0.28);
      stroke(100, 200, 255); line(0, -(hiy - sy) / 2, 0, (hiy - sy) / 2);
      stroke(0, 230, 120);
      line(-28, -(hiy - sy) / 2 + 5, -28 - 20, (hiy - sy) / 2 - 10);
      line(28, -(hiy - sy) / 2 + 5, 28 + 20, (hiy - sy) / 2 - 10);
      pop();
      break;
    case "hands_hips":
      line(lx, sy, lx - 30, sy + 40); line(lx - 30, sy + 40, lx - 10, sy + 55);
      line(rx, sy, rx + 30, sy + 40); line(rx + 30, sy + 40, rx + 10, sy + 55);
      break;
    case "arms_up":
      line(lx, sy, lx - 10, sy - 30); line(lx - 10, sy - 30, lx - 5, sy - 60);
      line(rx, sy, rx + 10, sy - 30); line(rx + 10, sy - 30, rx + 5, sy - 60);
      break;
  }
  noStroke(); fill(200); textSize(10);
  text(currentPose.desc, w / 2, h + 25);
  pop();
}

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
      reps++; holdTimer = 0; isResting = true; restTimer = restDuration;
      pickRandomPose();
    }
  } else {
    holdTimer = max(0, holdTimer - 1);
    feedbackMsg = currentPose.name + ": " + currentPose.desc;
  }
}

function validateShape(pose, id) {
  let kp = pose.keypoints;
  let ls = kp[5], rs = kp[6], le = kp[7], re = kp[8],
    lw = kp[9], rw = kp[10], lh = kp[11], rh = kp[12], n = kp[0];
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
    case "front_pose":
      return (abs(le.y - ls.y) < tol && dist(le.x, re.x, 0, 0) < sDist * 1.1);
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

function drawExerciseUI() {
  fill(15, 23, 42, 230); noStroke(); rect(width / 2, 60, 600, 70, 15);
  fill(isResting ? color(255, 150, 0) : 255); textSize(22);
  text(feedbackMsg, width / 2, 60);
  drawStatBox("REPS", str(reps), width / 2 + 400, height / 2);
  drawStatBox("ZONA", selectedArea, width / 2 - 400, height / 2);
  let barW = 640;
  fill(30, 41, 59); rect(width / 2, height - 120, barW, 20, 10);
  let prog = map(holdTimer, 0, requiredHold, 0, barW);
  fill(0, 255, 100); rectMode(CORNER);
  rect(width / 2 - barW / 2, height - 130, prog, 20, 10);
  rectMode(CENTER);
  drawButton("Sair do Treino", width / 2, height - 50);
}

function drawStatBox(label, val, x, y) {
  push(); translate(x, y);
  fill(30, 41, 59, 220); stroke(59, 130, 246); strokeWeight(2);
  rect(0, 0, 140, 110, 20);
  noStroke(); fill(59, 130, 246); textSize(14); text(label, 0, -30);
  fill(255); textSize(val.length > 8 ? 18 : 42); text(val, 0, 15);
  pop();
}

function drawButton(label, x, y) {
  let bw = 240, bh = 50;
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

function mousePressed() {
  if (appState === "menu") {
    let ys = [height * 0.45, height * 0.55, height * 0.65];
    let areas = ["Braquial", "Dorsal", "Lombar"];
    for (let i = 0; i < 3; i++) {
      if (mouseX > width / 2 - 120 && mouseX < width / 2 + 120 &&
        mouseY > ys[i] - 25 && mouseY < ys[i] + 25) {
        selectedArea = areas[i]; reps = 0; isResting = false; holdTimer = 0;
        pickRandomPose(); appState = "exercise";
      }
    }
  } else if (appState === "exercise") {
    if (mouseX > width / 2 - 120 && mouseX < width / 2 + 120 &&
      mouseY > height - 75 && mouseY < height - 25) appState = "menu";
  }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
