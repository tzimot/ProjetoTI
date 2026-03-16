// =============================
// PHYSIOFLOW v0.1
// FASE 1 - UI + GESTÃO DE ESTADOS
// =============================

// ----- ESTADOS DA APLICAÇÃO -----
let appState = "menu";
// Estados possíveis:
// "menu"
// "exercise"

// ----- VARIÁVEIS GLOBAIS -----
let selectedArea = null;

// =============================
// SETUP
// =============================
function setup() {
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);
}

// =============================
// DRAW LOOP PRINCIPAL
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
// ECRÃ A - MENU
// =============================
function drawMenuScreen() {

    fill(255);
    textSize(42);
    text("PhysioFlow", width / 2, height * 0.2);

    textSize(20);
    text("Selecione a área de treino", width / 2, height * 0.3);

    drawButton("Braquial", width / 2, height * 0.45);
    drawButton("Dorsal", width / 2, height * 0.55);
    drawButton("Lombar", width / 2, height * 0.65);
}

// =============================
// ECRÃ B - EXERCÍCIO
// =============================
function drawExerciseScreen() {

    fill(255);
    textSize(32);
    text("Área selecionada:", width / 2, height * 0.2);

    textSize(28);
    text(selectedArea, width / 2, height * 0.3);

    textSize(18);
    text("Aqui será iniciada a validação do movimento (Fase 2)", width / 2, height * 0.4);

    drawButton("Voltar ao Menu", width / 2, height * 0.8);
}

// =============================
// BOTÃO GENÉRICO
// =============================
function drawButton(label, x, y) {

    let buttonWidth = 250;
    let buttonHeight = 50;

    let hover =
        mouseX > x - buttonWidth / 2 &&
        mouseX < x + buttonWidth / 2 &&
        mouseY > y - buttonHeight / 2 &&
        mouseY < y + buttonHeight / 2;

    fill(hover ? 59 : 37, hover ? 130 : 99, hover ? 246 : 235);
    rectMode(CENTER);
    rect(x, y, buttonWidth, buttonHeight, 12);

    fill(255);
    textSize(18);
    text(label, x, y);
}

// =============================
// INTERAÇÃO COM RATO
// =============================
function mousePressed() {

    if (appState === "menu") {

        if (isButtonClicked(height * 0.45)) {
            selectedArea = "Braquial";
            appState = "exercise";
        }

        if (isButtonClicked(height * 0.55)) {
            selectedArea = "Dorsal";
            appState = "exercise";
        }

        if (isButtonClicked(height * 0.65)) {
            selectedArea = "Lombar";
            appState = "exercise";
        }

    } else if (appState === "exercise") {

        if (isButtonClicked(height * 0.8)) {
            appState = "menu";
        }

    }
}

// =============================
// DETEÇÃO DE CLIQUE
// =============================
function isButtonClicked(yPos) {

    let buttonWidth = 250;
    let buttonHeight = 50;

    return (
        mouseX > width / 2 - buttonWidth / 2 &&
        mouseX < width / 2 + buttonWidth / 2 &&
        mouseY > yPos - buttonHeight / 2 &&
        mouseY < yPos + buttonHeight / 2
    );
}

// =============================
// RESPONSIVIDADE
// =============================
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}