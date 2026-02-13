const canvas = document.getElementById('ludoBoard');
const ctx = canvas.getContext('2d');
const size = 600;
const step = size / 15;

const rollBtn = document.getElementById('rollBtn');
const rollStatus = document.getElementById('rollStatus');
const d1ctx = document.getElementById('dice1').getContext('2d');
const d2ctx = document.getElementById('dice2').getContext('2d');

const colors = {
    red: "#FF3B30", blue: "#007AFF", green: "#4CD964", yellow: "#FFCC00", white: "#FFFFFF", border: "#333"
};

let isAiGame = false;
let humanColor = 'red'; 
let gameStarted = false;
let players = ['red', 'green', 'yellow', 'blue'];
let currentTurnIndex = 0; 
let diceValues = [1, 1]; 
let usedDice = [true, true]; 
let bonusRolls = 0;
let selectedDieIndex = null; 

const sounds = { dice: new Audio('071950_dice-rolling-88974.mp3') };

function speak(text, pitch = 1.0, rate = 0.9) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'en-GB'; 
    msg.pitch = pitch; 
    msg.rate = rate;
    window.speechSynthesis.speak(msg);
}

function playRastaVoice() { speak("Go back weh yuh come from", 0.7, 0.8); }
function playHomeVoice() { speak("Goal", 1.0, 0.9); }
function playCaptureVoice() { speak("Go back weh you come from", 0.8, 1.0); }
function playBlockedVoice() { speak("Bwoy, yuh cyaa pass yah so!", 0.6, 0.85); }

window.startGame = function(mode) {
    const menu = document.getElementById('startMenu');
    if (menu) menu.style.display = 'none';
    gameStarted = true;
    usedDice = [true, true]; 
    if (mode === 'all') { isAiGame = false; } 
    else { isAiGame = true; humanColor = mode; }
    rollStatus.innerText = `${players[currentTurnIndex].toUpperCase()}'s turn!`;
    updateDiceDisplay();
    if (isAiGame && players[currentTurnIndex] !== humanColor) { setTimeout(aiTurn, 1000); }
};

const outerTrack = [[1,6],[2,6],[3,6],[4,6],[5,6],[6,5],[6,4],[6,3],[6,2],[6,1],[6,0],[7,0],[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[9,6],[10,6],[11,6],[12,6],[13,6],[14,6],[14,7],[14,8],[13,8],[12,8],[11,8],[10,8],[9,8],[8,9],[8,10],[8,11],[8,12],[8,13],[8,14],[7,14],[6,14],[6,13],[6,12],[6,11],[6,10],[6,9],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8],[0,7],[1,7]];

const paths = {
    red: [...outerTrack.slice(0, 51), ...outerTrack.slice(51, 52), [1,7], [2,7], [3,7], [4,7], [5,7], [7,7]],
    green: [...outerTrack.slice(13, 52), ...outerTrack.slice(0, 12), [7,1], [7,2], [7,3], [7,4], [7,5], [7,7]],
    yellow: [...outerTrack.slice(26, 52), ...outerTrack.slice(0, 25), [13,7], [12,7], [11,7], [10,7], [9,7], [7,7]],
    blue: [...outerTrack.slice(39, 52), ...outerTrack.slice(0, 38), [7,13], [7,12], [7,11], [7,10], [7,9], [7,7]]
};

let allTokens = {
    red: [{id:0,pos:-1,startX:1.5,startY:1.5},{id:1,pos:-1,startX:4.5,startY:1.5},{id:2,pos:-1,startX:1.5,startY:4.5},{id:3,pos:-1,startX:4.5,startY:4.5}],
    green: [{id:0,pos:-1,startX:10.5,startY:1.5},{id:1,pos:-1,startX:13.5,startY:1.5},{id:2,pos:-1,startX:10.5,startY:4.5},{id:3,pos:-1,startX:13.5,startY:4.5}],
    yellow: [{id:0,pos:-1,startX:10.5,startY:10.5},{id:1,pos:-1,startX:13.5,startY:10.5},{id:2,pos:-1,startX:10.5,startY:13.5},{id:3,pos:-1,startX:13.5,startY:13.5}],
    blue: [{id:0,pos:-1,startX:1.5,startY:10.5},{id:1,pos:-1,startX:4.5,startY:10.5},{id:2,pos:-1,startX:1.5,startY:13.5},{id:3,pos:-1,startX:4.5,startY:13.5}]
};

const safeIndices = [0, 13, 26, 39];

function isPathBlocked(token, color, moveAmount) {
    if (token.pos === -1 && moveAmount !== 6) return { blocked: true };
    let startPos = (token.pos === -1) ? -1 : token.pos;
    
    // FIX: Exact dice needed to go home
    if (startPos + moveAmount >= paths[color].length) return { blocked: true };

    for (let i = 1; i <= moveAmount; i++) {
        let checkPos = startPos + i;
        let coord = paths[color][checkPos];
        for (let otherColor of players) {
            if (otherColor === color) continue;
            const opponentsOnSquare = allTokens[otherColor].filter(t => {
                const c = getCoord(otherColor, t.pos);
                return c && c[0] === coord[0] && c[1] === coord[1];
            });
            if (opponentsOnSquare.length >= 2) return { blocked: true, x: coord[0], y: coord[1] };
        }
    }
    return { blocked: false };
}

function getCoord(color, pos) { return (pos === -1) ? null : paths[color][pos]; }

function canTokenMove(token, color, dieIdx) {
    if (dieIdx === null || usedDice[dieIdx]) return false;
    const val = diceValues[dieIdx];
    return !isPathBlocked(token, color, val).blocked;
}

rollBtn.addEventListener('click', () => {
    if (!gameStarted || rollBtn.disabled) return;
    diceValues = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
    usedDice = [false, false];
    
    // FIX: Only a 6 allows an extra turn
    if (diceValues[0] === 6) bonusRolls++;
    if (diceValues[1] === 6) bonusRolls++;
    
    selectedDieIndex = 0; 
    sounds.dice.play();
    rollBtn.disabled = true;
    updateDiceDisplay();
    checkNoMovesPossible();
});

document.getElementById('dice1').addEventListener('click', () => { if(!usedDice[0]) { selectedDieIndex = 0; updateDiceDisplay(); }});
document.getElementById('dice2').addEventListener('click', () => { if(!usedDice[1]) { selectedDieIndex = 1; updateDiceDisplay(); }});

canvas.addEventListener('click', (e) => {
    if (!gameStarted || (isAiGame && players[currentTurnIndex] !== humanColor)) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / (rect.width / 15);
    const mouseY = (e.clientY - rect.top) / (rect.height / 15);
    const color = players[currentTurnIndex];
    const clickedToken = allTokens[color].find(t => {
        const coord = (t.pos === -1) ? [t.startX, t.startY] : paths[color][t.pos];
        const tx = (t.pos === -1) ? coord[0] : coord[0] + 0.5;
        const ty = (t.pos === -1) ? coord[1] : coord[1] + 0.5;
        return Math.sqrt(Math.pow(mouseX - tx, 2) + Math.pow(mouseY - ty, 2)) < 0.6;
    });
    if (clickedToken) processMove(clickedToken, color);
});

function processMove(token, color) {
    if (token) {
        if (selectedDieIndex === null || usedDice[selectedDieIndex]) return;
        const moveVal = diceValues[selectedDieIndex];
        if (!canTokenMove(token, color, selectedDieIndex)) {
            playBlockedVoice();
            return;
        }
        token.pos = (token.pos === -1) ? 0 : token.pos + moveVal;
        checkCapture(color, token.pos);
        if (token.pos === paths[color].length - 1) playHomeVoice();
        usedDice[selectedDieIndex] = true;
        selectedDieIndex = usedDice.indexOf(false);
        if (selectedDieIndex === -1) selectedDieIndex = null;
        updateDiceDisplay();
    }
    if (usedDice.every(d => d === true)) {
        moveToNextTurn();
    } else {
        checkNoMovesPossible();
    }
}

function moveToNextTurn() {
    if (bonusRolls > 0) {
        bonusRolls--;
        rollBtn.disabled = false;
        rollStatus.innerText = "Extra Roll! " + players[currentTurnIndex].toUpperCase();
    } else {
        currentTurnIndex = (currentTurnIndex + 1) % 4;
        rollBtn.disabled = false;
        rollStatus.innerText = `${players[currentTurnIndex].toUpperCase()}'s turn!`;
    }
    if (isAiGame && players[currentTurnIndex] !== humanColor) { setTimeout(aiTurn, 1000); }
}

function checkNoMovesPossible() {
    const color = players[currentTurnIndex];
    const canMoveAny = allTokens[color].some(t => {
        return (!usedDice[0] && canTokenMove(t, color, 0)) || (!usedDice[1] && canTokenMove(t, color, 1));
    });
    if (!canMoveAny) {
        rollStatus.innerText = "No moves! Passing turn...";
        setTimeout(() => {
            usedDice = [true, true];
            selectedDieIndex = null;
            updateDiceDisplay();
            moveToNextTurn();
        }, 1500);
    }
}

function checkCapture(movingColor, posIndex) {
    const targetCoord = paths[movingColor][posIndex];
    // FIX: Captured allowed even on start/birth (safeIndices still protect home stretches)
    if (!targetCoord || posIndex > 51) return;
    players.forEach(otherColor => {
        if (otherColor === movingColor) return;
        const opponents = allTokens[otherColor].filter(t => {
            const c = getCoord(otherColor, t.pos);
            return c && c[0] === targetCoord[0] && c[1] === targetCoord[1];
        });
        if (opponents.length === 1) {
            opponents[0].pos = -1;
            playCaptureVoice();
            playRastaVoice();
        }
    });
}

function aiTurn() {
    if (!isAiGame || players[currentTurnIndex] === humanColor || !gameStarted) return;
    rollBtn.click();
    setTimeout(() => {
        const color = players[currentTurnIndex];
        const solveTurn = () => {
            if (usedDice.every(d => d === true)) return;
            let bestMove = null;
            for (let dIdx of [0, 1]) {
                if (usedDice[dIdx]) continue;
                for (let t of allTokens[color]) {
                    if (canTokenMove(t, color, dIdx)) {
                        let score = 0;
                        if (t.pos === -1) score += 100;
                        if (!bestMove || score > bestMove.score) {
                            bestMove = { token: t, dieIdx: dIdx, score: score };
                        }
                    }
                }
            }
            if (bestMove) {
                selectedDieIndex = bestMove.dieIdx;
                processMove(bestMove.token, color);
                setTimeout(solveTurn, 800);
            }
        };
        solveTurn();
    }, 1500);
}

function drawDice(canvasCtx, number, isSelected, isUsed) {
    canvasCtx.clearRect(0, 0, 100, 100); canvasCtx.save();
    canvasCtx.globalAlpha = isUsed ? 0.2 : 1.0;
    canvasCtx.fillStyle = "#FFFFFF"; canvasCtx.beginPath(); canvasCtx.roundRect(10, 10, 80, 80, 15); canvasCtx.fill();
    canvasCtx.strokeStyle = isSelected ? "gold" : "#CCC"; canvasCtx.lineWidth = isSelected ? 5 : 2; canvasCtx.stroke();
    const pips = { 1:[[50,50]], 2:[[30,30],[70,70]], 3:[[30,30],[50,50],[70,70]], 4:[[30,30],[30,70],[70,30],[70,70]], 5:[[30,30],[30,70],[70,30],[70,70],[50,50]], 6:[[30,30],[30,50],[30,70],[70,30],[70,50],[70,70]] };
    if (number > 0) pips[number].forEach(p => { canvasCtx.fillStyle = "#333"; canvasCtx.beginPath(); canvasCtx.arc(p[0], p[1], 7, 0, Math.PI * 2); canvasCtx.fill(); });
    canvasCtx.restore();
}

function updateDiceDisplay() {
    drawDice(d1ctx, diceValues[0], selectedDieIndex === 0, usedDice[0]);
    drawDice(d2ctx, diceValues[1], selectedDieIndex === 1, usedDice[1]);
}

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color; ctx.fillRect(x * step, y * step, w * step, h * step);
    ctx.strokeStyle = colors.border; ctx.lineWidth = 1; ctx.strokeRect(x * step, y * step, w * step, h * step);
}

function drawFootballToken(x, y, color, count, index, isSelectable, isTurn) {
    ctx.save();
    let scale = count > 1 ? 0.6 : 1.0;
    let offsetX = count > 1 ? ((index % 2) - 0.5) * (step * 0.5) : 0;
    let offsetY = count > 1 ? (Math.floor(index / 2) - 0.5) * (step * 0.5) : 0;
    const px = (x * step) + offsetX, py = (y * step) + offsetY;
    const playerSize = (step * 0.4) * scale;
    if (isSelectable) { ctx.shadowBlur = 15; ctx.shadowColor = "white"; ctx.strokeStyle = "white"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(px, py + (playerSize * 0.5), playerSize * 1.5, 0, Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(px - playerSize, py, playerSize * 2, playerSize * 1.2, [5, 5, 0, 0]); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#FFDBAC"; ctx.beginPath(); ctx.arc(px, py - (playerSize * 0.2), playerSize * 0.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
}

function drawShield(x, y, color) {
    ctx.save();
    const px = x * step, py = y * step;
    ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(px, py, step*0.35, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = "14px Arial"; ctx.textAlign = "center"; ctx.fillText("🛡️", px, py + 5);
    ctx.restore();
}

function drawBases() {
    drawRect(0, 0, 6, 6, colors.red); drawRect(9, 0, 6, 6, colors.green);
    drawRect(9, 9, 6, 6, colors.yellow); drawRect(0, 9, 6, 6, colors.blue);
    const posGroups = {};
    players.forEach(color => {
        allTokens[color].forEach(t => {
            const coord = (t.pos === -1) ? [t.startX, t.startY] : paths[color][t.pos];
            const key = `${coord[0].toFixed(1)},${coord[1].toFixed(1)}`;
            if (!posGroups[key]) posGroups[key] = [];
            posGroups[key].push({ token: t, colorName: color });
        });
    });
    Object.entries(posGroups).forEach(([key, group]) => {
        const [kx, ky] = key.split(',').map(Number);
        group.forEach((item, i) => {
            const isTurn = (item.colorName === players[currentTurnIndex]);
            const isSelectable = isTurn && selectedDieIndex !== null && canTokenMove(item.token, item.colorName, selectedDieIndex);
            drawFootballToken((item.token.pos === -1 ? kx : kx + 0.5), (item.token.pos === -1 ? ky : ky + 0.5), colors[item.colorName], group.length, i, isSelectable, isTurn);
        });
        if (group.length >= 2 && group[0].token.pos !== -1 && group.every(it => it.colorName === group[0].colorName)) {
            drawShield(kx + 0.5, ky + 0.5, colors[group[0].colorName]);
        }
    });
}

function drawTracks() {
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            if ((i >= 6 && i <= 8) || (j >= 6 && j <= 8)) {
                if (i >= 6 && i <= 8 && j >= 6 && j <= 8) continue;
                drawRect(i, j, 1, 1, colors.white);
                if (i > 0 && i < 6 && j === 7) drawRect(i, j, 1, 1, colors.red);
                if (j > 0 && j < 6 && i === 7) drawRect(i, j, 1, 1, colors.green);
                if (i > 8 && i < 14 && j === 7) drawRect(i, j, 1, 1, colors.yellow);
                if (j > 8 && j < 14 && i === 7) drawRect(i, j, 1, 1, colors.blue);
                if (i === 1 && j === 6) drawRect(i, j, 1, 1, colors.red);
                if (i === 8 && j === 1) drawRect(i, j, 1, 1, colors.green);
                if (i === 13 && j === 8) drawRect(i, j, 1, 1, colors.yellow);
                if (i === 6 && j === 13) drawRect(i, j, 1, 1, colors.blue);
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, size, size);
    drawTracks();
    const center = size / 2;
    const triangles = [{p:[6,6,6,9],c:colors.red},{p:[6,6,9,6],c:colors.green},{p:[9,6,9,9],c:colors.yellow},{p:[6,9,9,9],c:colors.blue}];
    triangles.forEach(t => { ctx.fillStyle = t.c; ctx.beginPath(); ctx.moveTo(center,center); ctx.lineTo(t.p[0]*step,t.p[1]*step); ctx.lineTo(t.p[2]*step,t.p[3]*step); ctx.closePath(); ctx.fill(); ctx.stroke(); });
    drawBases();
    updateDiceDisplay();
    requestAnimationFrame(animate);
}

animate();