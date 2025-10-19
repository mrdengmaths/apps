document.addEventListener('DOMContentLoaded', () => {
    // --- Render Initial Math ---
    renderMathInElement(document.body, {
        delimiters: [
            {left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}
        ]
    });

    // --- Element selectors ---
    const questionEl = document.getElementById('question');
    const feedbackEl = document.getElementById('feedback');
    const shapeFeedbackEl = document.getElementById('shape-feedback');
    const showInputsSolutionBtn = document.getElementById('show-inputs-solution-btn');
    const inputsSolutionEl = document.getElementById('inputs-solution');
    const newQuestionBtn = document.getElementById('new-question-btn');
    const checkInputsBtn = document.getElementById('check-inputs-btn');
    const checkShapeBtn = document.getElementById('check-shape-btn');
    const showSolutionBtn = document.getElementById('show-solution-btn');
    const undoBtn = document.getElementById('undo-btn');
    const canvas = document.getElementById('drawing-canvas');
    const solutionCanvas = document.getElementById('solution-canvas');
    const ctx = canvas.getContext('2d');
    const solutionCtx = solutionCanvas.getContext('2d');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const fullscreenOpenIcon = document.getElementById('fullscreen-open-icon');
    const fullscreenCloseIcon = document.getElementById('fullscreen-close-icon');
    const correctAttemptsEl = document.getElementById('correct-attempts');
    const level1Btn = document.getElementById('level-1-btn');
    const level2Btn = document.getElementById('level-2-btn');
    const level3Btn = document.getElementById('level-3-btn');

    // --- State variables ---
    let drawing = false;
    let currentPath = [];
    let drawingHistory = [];
    let currentQuestion = null;
    let scale;
    let canvasSize = { width: 500, height: 500 };
    let workingCanvas;
    let correctAttempts = 0;
    let sketchCheckAllowed = true;
    let currentLevel = 1;
    
    // --- Handwriting Canvas Setup (Optimized for High-DPI) ---
    function setupHandwritingCanvas(canvasId, undoBtnId) {
        const canvas = document.getElementById(canvasId);
        const undoBtn = document.getElementById(undoBtnId);
        if (!canvas || !undoBtn) return null;
        
        const container = canvas.parentElement;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        let drawing = false, paths = [], currentPath = [];

        function resize() {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            ctx.scale(dpr, dpr);
            redraw();
        }

        function redraw() {
            ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr); 
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            paths.forEach(path => {
                if (path.length < 2) return;
                ctx.beginPath();
                ctx.moveTo(path[0].x, path[0].y);
                for (let i = 1; i < path.length; i++) {
                    ctx.lineTo(path[i].x, path[i].y);
                }
                ctx.stroke();
            });
        }
        
        function getPos(evt) { const rect = canvas.getBoundingClientRect(); const isTouch = !!evt.touches; return { x: (isTouch ? evt.touches[0].clientX : evt.clientX) - rect.left, y: (isTouch ? evt.touches[0].clientY : evt.clientY) - rect.top }; }
        function start(e) { e.preventDefault(); drawing = true; currentPath = []; currentPath.push(getPos(e)); }
        function stop() { if (!drawing) return; drawing = false; if (currentPath.length > 1) paths.push(currentPath); }
        function draw(e) { 
            if (!drawing) return; e.preventDefault(); 
            const pos = getPos(e); currentPath.push(pos);
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath(); 
            if(currentPath.length > 1) { 
                ctx.moveTo(currentPath[currentPath.length - 2].x, currentPath[currentPath.length - 2].y); 
                ctx.lineTo(pos.x, pos.y); 
            } 
            ctx.stroke(); 
        }

        undoBtn.addEventListener('click', () => { paths.pop(); redraw(); });
        canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stop); canvas.addEventListener('mouseout', stop);
        canvas.addEventListener('touchstart', start); canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stop);
        const clear = () => { paths = []; redraw(); };
        return { clear, resize };
    }

    // --- Main Canvas Logic ---
    function resizeCanvas() {
        const container = canvas.parentElement; 
        const size = Math.min(container.clientWidth, container.clientHeight);
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr; canvas.height = size * dpr;
        canvas.style.width = `${size}px`; canvas.style.height = `${size}px`;
        solutionCanvas.width = size * dpr; solutionCanvas.height = size * dpr;
        solutionCanvas.style.width = `${size}px`; solutionCanvas.style.height = `${size}px`;
        ctx.scale(dpr, dpr); solutionCtx.scale(dpr, dpr);
        canvasSize = { width: size, height: size };
        scale = size / 22;
        redrawAll();
    }

    function drawGrid() {
        const w = canvasSize.width, h = canvasSize.height, origin = { x: w / 2, y: h / 2 };
        ctx.clearRect(0, 0, w, h); ctx.strokeStyle = '#4a5568'; ctx.lineWidth = 1;
        for (let i = 1; i <= 10; i++) {
            ctx.beginPath(); ctx.moveTo(origin.x + i * scale, 0); ctx.lineTo(origin.x + i * scale, h); ctx.moveTo(origin.x - i * scale, 0); ctx.lineTo(origin.x - i * scale, h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, origin.y + i * scale); ctx.lineTo(w, origin.y + i * scale); ctx.moveTo(0, origin.y - i * scale); ctx.lineTo(w, origin.y - i * scale); ctx.stroke();
        }
        ctx.strokeStyle = '#a0aec0'; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
        ctx.fillStyle = '#a0aec0'; ctx.font = '12px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        for (let i = -10; i <= 10; i+=2) { if (i === 0) continue; ctx.fillText(i, origin.x + i * scale, origin.y + 5); }
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        for (let i = -10; i <= 10; i+=2) { if (i === 0) continue; ctx.fillText(i, origin.x - 5, origin.y - i * scale); }
    }
    
    function redrawAll() {
        drawGrid();
        ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.strokeStyle = '#a78bfa'; ctx.setLineDash([]);
        drawingHistory.forEach(item => {
            if (item.path.length < 2) return;
            ctx.beginPath(); ctx.moveTo(item.path[0].x, item.path[0].y);
            for (let i = 1; i < item.path.length; i++) { ctx.lineTo(item.path[i].x, item.path[i].y); }
            ctx.stroke();
        });
    }

    function getPos(evt) { const rect = canvas.getBoundingClientRect(); const isTouch = !!evt.touches; return { x: (isTouch ? evt.touches[0].clientX : evt.clientX) - rect.left, y: (isTouch ? evt.touches[0].clientY : evt.clientY) - rect.top }; }
    function startDrawing(e) { e.preventDefault(); drawing = true; currentPath = []; currentPath.push(getPos(e)); }
    function stopDrawing() { if (!drawing) return; drawing = false; if (currentPath.length > 1) { drawingHistory.push({ path: currentPath }); } redrawAll(); }
    function draw(e) { 
        if (!drawing) return; e.preventDefault(); 
        const pos = getPos(e); currentPath.push(pos); 
        ctx.setLineDash([]); ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 3;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); 
        if(currentPath.length > 1) { 
            ctx.moveTo(currentPath[currentPath.length-2].x, currentPath[currentPath.length-2].y); 
            ctx.lineTo(pos.x, pos.y); 
        } 
        ctx.stroke(); 
    }

    // --- Question Generation (NOW WITH LEVELS & FRACTIONS) ---
    function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    function randNonZero(min, max) { let val = 0; while (val === 0) { val = randInt(min, max); } return val; }
    
    // --- NEW: Helper to format 'a' value for KaTeX, including fractions ---
    function formatA(a) {
        if (Math.abs(a) === 1) {
            return a === 1 ? '' : '-';
        }
        if (Number.isInteger(a)) {
            return a.toString();
        }
        // Handle fractions
        const sign = a < 0 ? '-' : '';
        const absA = Math.abs(a);
        const denominator = 1 / absA;
        // Use Math.round to avoid floating point issues (e.g., 1/3 becomes 0.333...)
        return `${sign}\\frac{1}{${Math.round(denominator)}}`;
    }

    const questionGenerators = {
        level1: () => {
            // --- MODIFIED: Include fractional 'a' values ---
            const aValues = [-3, -2, -1, -1/2, -1/3, -1/4, 1/4, 1/3, 1/2, 1, 2, 3];
            let a, c, katex;

            if (Math.random() < 0.5) { // y = ax^2
                a = aValues[Math.floor(Math.random() * aValues.length)];
                c = 0;
                const a_str = formatA(a);
                katex = `y = ${a_str}x^2`;
            } else { // y = x^2 + c
                a = 1;
                c = randNonZero(-8, 8);
                const c_sign = c >= 0 ? '+' : '-';
                katex = `y = x^2 ${c_sign} ${Math.abs(c)}`;
            }
            const xInts = (a > 0 && c <= 0) || (a < 0 && c >= 0) ? [Math.sqrt(-c/a), -Math.sqrt(-c/a)] : [];
            return { type: 'parabola', katex, yInts: [c], xInts, plot: x => a*x*x + c, vertex: {h: 0, k: c} };
        },
        level2: () => {
            // --- MODIFIED: Include fractional 'a' values ---
            const aValues = [-3, -2, -1, -1/2, -1/3, -1/4, 1/4, 1/3, 1/2, 1, 2, 3];
            const a = aValues[Math.floor(Math.random() * aValues.length)];
            const c = randNonZero(-8, 8);
            const a_str = formatA(a);
            const c_sign = c >= 0 ? '+' : '-';
            const katex = `y = ${a_str}x^2 ${c_sign} ${Math.abs(c)}`;
            const xInts = (a > 0 && c <= 0) || (a < 0 && c >= 0) ? [Math.sqrt(-c/a), -Math.sqrt(-c/a)] : [];
            return { type: 'parabola', katex, yInts: [c], xInts, plot: x => a*x*x + c, vertex: {h: 0, k: c} };
        },
        level3: () => {
            const a = [-1, 1][randInt(0,1)]; let r1 = randInt(-8, 8); let r2 = randInt(-8, 8);
            while ((r1 + r2) % 2 !== 0 || r1 === r2) { r1 = randInt(-8, 8); r2 = randInt(-8, 8); }
            const h = (r1 + r2) / 2; const k = a * (h - r1) * (h - r2);
            if (Math.abs(h) > 10 || Math.abs(k) > 10) return questionGenerators.level3();
            const b = -a * (r1 + r2); const c = a * r1 * r2;
            if (Math.abs(c) > 10) return questionGenerators.level3();
            const b_sign = b >= 0 ? '+' : '-'; const c_sign = c >= 0 ? '+' : '-';
            const a_str = Math.abs(a) === 1 ? (a === 1 ? '' : '-') : a;
            const b_str = Math.abs(b) !== 0 ? ` ${b_sign} ${Math.abs(b)}x` : '';
            const c_str = Math.abs(c) !== 0 ? ` ${c_sign} ${Math.abs(c)}` : '';
            return { type: 'parabola', katex: `y = ${a_str}x^2${b_str}${c_str}`, yInts: [c], xInts: [r1, r2].sort((a,b)=>a-b), plot: (x) => a*x*x + b*x + c, vertex: {h, k} };
        }
    };

    function generateNewQuestion() {
        switch(currentLevel) {
            case 1: currentQuestion = questionGenerators.level1(); break;
            case 2: currentQuestion = questionGenerators.level2(); break;
            case 3: currentQuestion = questionGenerators.level3(); break;
            default: currentQuestion = questionGenerators.level1();
        }
        
        sketchCheckAllowed = true;
        questionEl.innerHTML = `Sketch the graph of: $$${currentQuestion.katex}$$`;
        
        renderMathInElement(questionEl, {
            delimiters: [
                {left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}
            ]
        });
        
        // Reset UI
        drawingHistory = [];
        document.querySelectorAll('input[type="number"]').forEach(input => input.value = '');
        if (workingCanvas) workingCanvas.clear();
        feedbackEl.classList.add('hidden');
        shapeFeedbackEl.classList.add('hidden');
        solutionCanvas.classList.add('hidden');
        inputsSolutionEl.classList.add('hidden');
        showInputsSolutionBtn.classList.add('hidden');
        showSolutionBtn.textContent = 'Show Curve';
        checkShapeBtn.disabled = false;
        redrawAll();
    }
    
    // --- Answer Checking with Hints ---
    function compareNumericArrays(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        const sorted1 = [...arr1].sort((a,b) => a-b);
        const sorted2 = [...arr2].sort((a,b) => a-b);
        return sorted1.every((val, index) => Math.abs(val - sorted2[index]) < 0.1);
    }

    function checkInputs() {
        if (!currentQuestion) return;
        feedbackEl.classList.remove('hidden');
        showInputsSolutionBtn.classList.add('hidden');
        inputsSolutionEl.classList.add('hidden');
        const userXInts = Array.from(document.querySelectorAll('.x-intercept-input')).map(i => parseFloat(i.value)).filter(v => !isNaN(v));
        const userYInts = Array.from(document.querySelectorAll('.y-intercept-input')).map(i => parseFloat(i.value)).filter(v => !isNaN(v));
        const correctXInts = currentQuestion.xInts.filter(n => n !== null && isFinite(n));
        const correctYInts = currentQuestion.yInts.filter(n => n !== null && isFinite(n));
        const xIntsCorrect = compareNumericArrays(userXInts, correctXInts);
        const yIntsCorrect = compareNumericArrays(userYInts, correctYInts);
        let vertexCorrect = true;
        const userKX = parseFloat(document.getElementById('key-point-x').value); 
        const userKY = parseFloat(document.getElementById('key-point-y').value); 
        const {h, k} = currentQuestion.vertex;
        if (isNaN(userKX) || isNaN(userKY) || Math.abs(userKX - h) > 0.1 || Math.abs(userKY - k) > 0.1) { 
            vertexCorrect = false;
        }
        
        feedbackEl.classList.remove('hidden', 'bg-green-200/20', 'text-green-300', 'bg-red-200/20', 'text-red-300');
        if (xIntsCorrect && yIntsCorrect && vertexCorrect) {
            feedbackEl.classList.add('bg-green-200/20', 'text-green-300');
            feedbackEl.textContent = 'Great! All your values are correct. Now try sketching the graph.';
        } else {
            let hints = [];
            if (!xIntsCorrect) hints.push("Check your x-intercepts.");
            if (!yIntsCorrect) hints.push("Check your y-intercept.");
            if (!vertexCorrect) hints.push("Check the coordinates of the vertex.");
            feedbackEl.classList.add('bg-red-200/20', 'text-red-300');
            feedbackEl.innerHTML = `Not quite. <br> ${hints.join('<br>')}`;
            showInputsSolutionBtn.classList.remove('hidden');
        }
    }

    function analyzeShape(question, allDrawnPaths) {
        if (allDrawnPaths.length === 0) return ["You haven't drawn the graph yet!"];
        const fullPath = allDrawnPaths.flatMap(p => p.path);
        if (fullPath.length < 10) return ["Please draw a more complete curve."];
        let totalDeviation = 0; let pointsCompared = 0;
        const origin = { x: canvasSize.width / 2, y: canvasSize.height / 2 };
        const findYatX = (xPixel, path) => {
            let closestPoint = null; let minDistance = Infinity;
            path.forEach(p => {
                const dist = Math.abs(p.x - xPixel);
                if (dist < minDistance) { minDistance = dist; closestPoint = p; }
            });
            if (closestPoint && minDistance < scale * 0.5) { return closestPoint.y; }
            return null;
        };
        for (let xCoord = -10; xCoord <= 10; xCoord++) {
            const trueYCoord = question.plot(xCoord);
            if (trueYCoord === null || isNaN(trueYCoord) || !isFinite(trueYCoord) || Math.abs(trueYCoord) > 10) continue;
            const xPixel = origin.x + xCoord * scale;
            const drawnYPixel = findYatX(xPixel, fullPath);
            if (drawnYPixel !== null) {
                const drawnYCoord = (origin.y - drawnYPixel) / scale;
                totalDeviation += Math.abs(drawnYCoord - trueYCoord);
                pointsCompared++;
            }
        }
        if (pointsCompared < 5) return ["Please draw a more complete curve covering more of the grid."];
        const averageDeviation = totalDeviation / pointsCompared;
        if (averageDeviation < 1.0) return []; // Success!
        return [`Your drawing is not accurate enough. The average vertical distance from the correct curve is ${averageDeviation.toFixed(1)} units, which is more than the allowed 1 unit.`];
    }
    
    function checkShape() {
        if (!currentQuestion || !sketchCheckAllowed) return;
        const shapeHints = analyzeShape(currentQuestion, drawingHistory);
        shapeFeedbackEl.classList.remove('hidden', 'bg-green-200/20', 'text-green-300', 'bg-red-200/20', 'text-red-300');
        if (shapeHints.length === 0) {
            shapeFeedbackEl.classList.add('bg-green-200/20', 'text-green-300');
            shapeFeedbackEl.textContent = "Excellent sketch! The shape and position look great.";
            triggerConfetti(); correctAttempts++;
            correctAttemptsEl.textContent = correctAttempts;
            sketchCheckAllowed = false; checkShapeBtn.disabled = true;
        } else {
            shapeFeedbackEl.classList.add('bg-red-200/20', 'text-red-300');
            shapeFeedbackEl.innerHTML = shapeHints.join('<br>');
        }
    }

    function showInputsSolution() {
        if(!currentQuestion) return;
        const { xInts, yInts, vertex } = currentQuestion;
        let html = [];
        const formatNum = (n) => n.toFixed(2).replace(/\.00$/, '');
        const clean = (arr) => arr.filter(n => n !== null && isFinite(n));
        const cleanXInts = clean(xInts);
        html.push(`<strong>X-Intercepts:</strong> ${cleanXInts.length > 0 ? cleanXInts.map(formatNum).join(', ') : 'None'}`);
        html.push(`<strong>Y-Intercept:</strong> ${clean(yInts).map(formatNum).join(', ')}`);
        if (vertex) { html.push(`<strong>Vertex:</strong> (${formatNum(vertex.h)}, ${formatNum(vertex.k)})`); }
        inputsSolutionEl.innerHTML = html.join('<br>');
        inputsSolutionEl.classList.remove('hidden');
    }

    function drawSolution() {
        if (!currentQuestion) return;
        solutionCanvas.classList.remove('hidden');
        const w = canvasSize.width; const h = canvasSize.height; const origin = { x: w / 2, y: h / 2 };
        solutionCtx.clearRect(0,0,w,h);
        solutionCtx.lineWidth = 3; solutionCtx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
        solutionCtx.beginPath();
        let firstPoint = true;
        for (let px = 0; px < w; px++) {
            const x = (px - origin.x) / scale; const y = currentQuestion.plot(x);
            if (!isNaN(y) && isFinite(y)) {
                const py = origin.y - y * scale;
                if (py > -h*2 && py < h*2) { 
                    if (firstPoint) { solutionCtx.moveTo(px, py); firstPoint = false; } 
                    else { solutionCtx.lineTo(px, py); } 
                } else { firstPoint = true; }
            } else { firstPoint = true; }
        }
        solutionCtx.stroke();
    }

    function triggerConfetti() {
        const container = document.getElementById('confetti-container');
        const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316'];
        for (let i = 0; i < 250; i++) {
            const isGlitter = Math.random() < 0.3;
            const particle = document.createElement('div');
            particle.classList.add(isGlitter ? 'glitter' : 'confetti');
            if (!isGlitter) {
               particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
               particle.style.transform = `rotate(${Math.random() * 360}deg)`;
            }
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.top = `${-20 - Math.random() * 20}px`;
            particle.style.animationDelay = `${Math.random() * 0.75}s`;
            container.appendChild(particle);
            setTimeout(() => particle.remove(), 3000);
        }
    }

    function toggleFullScreen() {
        const doc = window.document; const docEl = doc.documentElement;
        const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
        const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) { requestFullScreen.call(docEl); }
        else { cancelFullScreen.call(doc); }
    }

    function updateFullscreenIcons() {
        const doc = window.document;
        if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement) {
            fullscreenOpenIcon.classList.add('hidden');
            fullscreenCloseIcon.classList.remove('hidden');
        } else {
            fullscreenOpenIcon.classList.remove('hidden');
            fullscreenCloseIcon.classList.add('hidden');
        }
    }

    function preventCheating() {
        document.addEventListener('contextmenu', event => event.preventDefault());
        document.addEventListener('keydown', event => {
            if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J' || event.key === 'C')) || (event.metaKey && event.altKey && (event.key === 'i' || event.key === 'j' || event.key === 'c'))) {
                event.preventDefault();
            }
        });
    }

    // --- NEW: Level Selection Logic ---
    function setLevel(level) {
        currentLevel = level;
        [level1Btn, level2Btn, level3Btn].forEach(btn => btn.classList.remove('active'));
        if (level === 1) level1Btn.classList.add('active');
        if (level === 2) level2Btn.classList.add('active');
        if (level === 3) level3Btn.classList.add('active');
        generateNewQuestion();
    }

    // --- Initial Setup and Event Listeners ---
    workingCanvas = setupHandwritingCanvas('working-canvas', 'undo-working-btn');
    newQuestionBtn.addEventListener('click', generateNewQuestion);
    checkInputsBtn.addEventListener('click', checkInputs);
    showInputsSolutionBtn.addEventListener('click', showInputsSolution);
    checkShapeBtn.addEventListener('click', checkShape);
    level1Btn.addEventListener('click', () => setLevel(1));
    level2Btn.addEventListener('click', () => setLevel(2));
    level3Btn.addEventListener('click', () => setLevel(3));
    
    showSolutionBtn.addEventListener('click', () => {
        const isHidden = solutionCanvas.classList.contains('hidden');
        if (isHidden) { drawSolution(); showSolutionBtn.textContent = 'Hide Curve'; } 
        else { solutionCanvas.classList.add('hidden'); showSolutionBtn.textContent = 'Show Curve'; }
    });

    fullscreenBtn.addEventListener('click', toggleFullScreen);
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach( event =>
        document.addEventListener(event, updateFullscreenIcons)
    );

    undoBtn.addEventListener('click', () => { drawingHistory.pop(); redrawAll(); });
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    window.addEventListener('resize', () => { resizeCanvas(); if(workingCanvas) workingCanvas.resize(); });

    // --- Initialize App ---
    preventCheating();
    resizeCanvas();
    if(workingCanvas) workingCanvas.resize();
    generateNewQuestion();
});

