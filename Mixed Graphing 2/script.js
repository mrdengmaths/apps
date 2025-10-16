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
    const solidBtn = document.getElementById('solid-btn');
    const dottedBtn = document.getElementById('dotted-btn');
    const keyPointContainer = document.getElementById('key-point-container');
    const keyPointLabel = document.getElementById('key-point-label');
    const asymptotesContainer = document.getElementById('asymptotes-container');

    // --- State variables ---
    let drawing = false;
    let currentPath = [];
    let drawingHistory = [];
    let currentLineStyle = 'solid';
    let currentQuestion = null;
    let scale;
    let canvasSize = { width: 500, height: 500 };
    let workingCanvas;
    
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
            if (!drawing) return; 
            e.preventDefault(); 
            const pos = getPos(e); 
            currentPath.push(pos);
            ctx.strokeStyle = '#e2e8f0'; 
            ctx.lineWidth = 2; 
            ctx.lineCap = 'round'; 
            ctx.lineJoin = 'round';
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

        canvas.width = size * dpr; 
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        
        solutionCanvas.width = size * dpr; 
        solutionCanvas.height = size * dpr;
        solutionCanvas.style.width = `${size}px`;
        solutionCanvas.style.height = `${size}px`;

        ctx.scale(dpr, dpr);
        solutionCtx.scale(dpr, dpr);

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
        drawingHistory.forEach(item => {
            ctx.strokeStyle = '#a78bfa'; // Lavender color for drawing
            if (item.style === 'dotted') { ctx.setLineDash([5, 8]); } else { ctx.setLineDash([]); }
            if (item.path.length < 2) return;
            ctx.beginPath(); ctx.moveTo(item.path[0].x, item.path[0].y);
            for (let i = 1; i < item.path.length; i++) { ctx.lineTo(item.path[i].x, item.path[i].y); }
            ctx.stroke();
        });
        ctx.setLineDash([]);
    }

    function getPos(evt) { const rect = canvas.getBoundingClientRect(); const isTouch = !!evt.touches; return { x: (isTouch ? evt.touches[0].clientX : evt.clientX) - rect.left, y: (isTouch ? evt.touches[0].clientY : evt.clientY) - rect.top }; }
    function startDrawing(e) { e.preventDefault(); drawing = true; currentPath = []; currentPath.push(getPos(e)); }
    function stopDrawing() { if (!drawing) return; drawing = false; if (currentPath.length > 1) { drawingHistory.push({ path: currentPath, style: currentLineStyle }); } redrawAll(); }
    function draw(e) { 
        if (!drawing) return; 
        e.preventDefault(); 
        const pos = getPos(e); 
        currentPath.push(pos); 
        ctx.setLineDash(currentLineStyle === 'dotted' ? [5, 8] : []);
        ctx.strokeStyle = '#a78bfa';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath(); 
        if(currentPath.length > 1) { 
            ctx.moveTo(currentPath[currentPath.length-2].x, currentPath[currentPath.length-2].y); 
            ctx.lineTo(pos.x, pos.y); 
        } 
        ctx.stroke(); 
    }

    // --- Question Generation ---
    function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    function randNonZero(min, max) { let val = 0; while (val === 0) { val = randInt(min, max); } return val; }
    
    const questionGenerators = {
        line: () => { const m = randNonZero(-2, 2); const xInt = randInt(-8, 8); const c = -m * xInt; return { type: 'line', katex: `y = ${m}x ${c >= 0 ? '+' : ''} ${c}`, yInts: [c], xInts: [xInt], asymptotes: [], plot: (x) => m * x + c }; },
        parabola: () => { const a = [-1, 1][randInt(0,1)]; const h = randInt(-6, 6); const p = randInt(1, 4); const k = -a * p * p; if(Math.abs(k) > 10) return questionGenerators.parabola(); const yInt = a*h*h + k; const xInts = [h-p, h+p].sort((a,b)=>a-b); if (Math.abs(yInt) > 10 || Math.abs(xInts[0]) > 10 || Math.abs(xInts[1]) > 10) return questionGenerators.parabola(); return { type: 'parabola', katex: `y = ${a === 1 ? '' : '-'}(x ${h > 0 ? '-' : '+'} ${Math.abs(h)})^2 ${k >= 0 ? '+' : ''} ${k}`, yInts: [yInt], xInts, asymptotes: [], plot: (x) => a*(x-h)*(x-h)+k, concavity: a > 0 ? 'up' : 'down', vertex: {h,k} }; },
        parabolaStandard: () => {
            const a = [-1, 1][randInt(0,1)]; let r1 = randInt(-8, 8); let r2 = randInt(-8, 8);
            while ((r1 + r2) % 2 !== 0 || r1 === r2) { r1 = randInt(-8, 8); r2 = randInt(-8, 8); }
            const h = (r1 + r2) / 2; const k = a * (h - r1) * (h - r2);
            if (Math.abs(h) > 10 || Math.abs(k) > 10) return questionGenerators.parabolaStandard();
            const b = -a * (r1 + r2); const c = a * r1 * r2;
            if (Math.abs(c) > 10) return questionGenerators.parabolaStandard();
            const b_sign = b >= 0 ? '+' : '-'; const c_sign = c >= 0 ? '+' : '-';
            const a_str = Math.abs(a) === 1 ? (a === 1 ? '' : '-') : a;
            return { type: 'parabola', katex: `y = ${a_str}x^2 ${b_sign} ${Math.abs(b)}x ${c_sign} ${Math.abs(c)}`, yInts: [c], xInts: [r1, r2].sort((a,b)=>a-b), asymptotes: [], plot: (x) => a*x*x + b*x + c, concavity: a > 0 ? 'up' : 'down', vertex: {h, k} };
        },
        polynomial: () => { const r1=randInt(-5,5); let r2=randInt(-5,5); while(r2===r1)r2=randInt(-5,5); let r3=randInt(-5,5); while(r3===r1||r3===r2)r3=randInt(-5,5); const roots=[r1,r2,r3].sort((a,b)=>a-b); const yInt=-roots[0]*-roots[1]*-roots[2]; if (Math.abs(yInt) > 10) return questionGenerators.polynomial(); const f=(r)=>`(x ${r > 0 ? '-' : '+'} ${Math.abs(r)})`; return { type: 'polynomial', katex: `y = ${f(r1)}${f(r2)}${f(r3)}`, yInts: [yInt], xInts: roots, asymptotes: [], plot: (x)=>(x-r1)*(x-r2)*(x-r3) }; },
        cubicInflection: () => {
            const k = [-1, 1][randInt(0,1)]; const b = randInt(-5, 5); const p = randInt(1, 2); 
            const c = -k * Math.pow(p, 3);
            if (Math.abs(c) > 10) return questionGenerators.cubicInflection();
            const xInt = b + p; const yInt = k * Math.pow(-b, 3) + c;
            if (Math.abs(xInt) > 10 || Math.abs(yInt) > 10) return questionGenerators.cubicInflection();
            const k_str = Math.abs(k) === 1 ? (k === 1 ? '' : '-') : k;
            return { type: 'cubic', katex: `y = ${k_str}(x ${b > 0 ? '-' : '+'} ${Math.abs(b)})^3 ${c >= 0 ? '+' : ''} ${c}`, yInts: [yInt], xInts: [xInt], asymptotes: [], plot: (x) => k * Math.pow(x-b, 3) + c, inflection: {h: b, k: c}};
        },
        hyperbola: () => { const h = randNonZero(-8, 8); const k = randNonZero(-8, 8); const aFactors = [1,2,3,4,5,6].filter(n => Math.abs(n * Math.min(Math.abs(h), Math.abs(k))) <= 10); const factor = aFactors[randInt(0, aFactors.length-1)] || 1; const a = randNonZero(-2, 2) * factor; const yInt = (a/-h) + k; const xInt = h - (a/k); if (!Number.isInteger(xInt) || !Number.isInteger(yInt)) return questionGenerators.hyperbola(); return { type: 'hyperbola', katex: `y = \\frac{${a}}{x ${h > 0 ? '-' : '+'} ${Math.abs(h)}} ${k >= 0 ? '+' : ''} ${k}`, yInts: [yInt], xInts: [xInt], asymptotes: [`x=${h}`,`y=${k}`], plot: (x)=>(x===h) ? NaN : a/(x-h)+k }; },
        exponential: () => { const b = 2; const p = randInt(1,3); const k = -Math.pow(b, p); return { type: 'exponential', katex: `y = 2^x ${k >= 0 ? '+' : ''} ${k}`, yInts: [1+k], xInts: [p], asymptotes: [`y=${k}`], plot: (x)=>Math.pow(b,x)+k }; },
        log: () => { const b = 2; const p = randInt(1,3); const h = -Math.pow(b, p); return { type: 'log', katex: `y = \\log_{2}(x ${h > 0 ? '-' : '+'} ${Math.abs(h)})`, yInts: [p], xInts: [1+h], asymptotes: [`x=${h}`], plot: (x)=>(x<=h)?NaN:Math.log2(x-h) }; },
        absoluteValue: () => {
            const k = randNonZero(-2, 2);
            const h = randInt(-5, 5);
            const p = randInt(1, 4);
            const c = -k * p;
            if (Math.abs(c) > 10) return questionGenerators.absoluteValue();
            const yInt = k * Math.abs(0 - h) + c;
            if (Math.abs(yInt) > 10) return questionGenerators.absoluteValue();
            const xInts = [h - p, h + p].sort((a,b)=>a-b);
            return { type: 'absoluteValue', katex: `y = ${k === 1 ? '' : (k === -1 ? '-' : k)}|x ${h > 0 ? '-' : '+'} ${Math.abs(h)}| ${c >= 0 ? '+' : ''} ${c}`, yInts: [yInt], xInts: xInts, asymptotes: [], plot: (x) => k * Math.abs(x - h) + c, vertex: { h: h, k: c } };
        },
        semicircle: () => { 
            const h=randInt(-4,4); const k=randInt(-4,4); const r=randInt(3, 6); const sign=Math.random()<0.5?1:-1;
            let yInts = [];
            if (r*r >= h*h) { yInts.push(sign * Math.sqrt(r*r - h*h) + k); }
            let xInts = [];
            if (r*r >= k*k) { const d = Math.sqrt(r*r - k*k); xInts.push(h + d, h - d); }
            return { type: 'semicircle', katex: `y = ${sign<0?'-':''}\\sqrt{${r*r} - (x ${h>0?'-':'+'} ${Math.abs(h)})^2} ${k>=0?'+':''} ${k}`, yInts: yInts, xInts: xInts, asymptotes:[], plot: (x)=>(r*r-((x-h)*(x-h))<0) ? NaN : sign*Math.sqrt(r*r-((x-h)*(x-h)))+k, isTop: sign > 0, center: {h,k}, radius: r }; 
        }
    };

    function generateNewQuestion() {
        keyPointContainer.classList.add('hidden');
        document.getElementById('center-radius-container').classList.add('hidden');
        asymptotesContainer.classList.add('hidden');
        
        const types = Object.keys(questionGenerators);
        const randomType = types[Math.floor(Math.random() * types.length)];
        currentQuestion = questionGenerators[randomType]();
        
        switch(currentQuestion.type) {
            case 'parabola':
            case 'absoluteValue':
                keyPointContainer.classList.remove('hidden');
                keyPointLabel.textContent = 'Vertex (h, k)';
                break;
            case 'cubic':
                keyPointContainer.classList.remove('hidden');
                keyPointLabel.textContent = 'Point of Inflection (b, c)';
                break;
            case 'semicircle':
                document.getElementById('center-radius-container').classList.remove('hidden');
                break;
        }
        
        if (['hyperbola', 'exponential', 'log'].includes(currentQuestion.type)) {
            asymptotesContainer.classList.remove('hidden');
        }

        questionEl.innerHTML = `Sketch the graph of: $$${currentQuestion.katex}$$`;
        renderMathInElement(questionEl);
        drawingHistory = [];
        document.querySelectorAll('input[type="number"]').forEach(input => input.value = '');
        if (workingCanvas) workingCanvas.clear();
        feedbackEl.classList.add('hidden');
        shapeFeedbackEl.classList.add('hidden');
        solutionCanvas.classList.add('hidden');
        inputsSolutionEl.classList.add('hidden');
        showInputsSolutionBtn.classList.add('hidden');
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

        let asymCorrect = true; let asymHints = [];
        const correctAsymX = currentQuestion.asymptotes.find(a => a.startsWith('x='))?.split('=')[1];
        const correctAsymY = currentQuestion.asymptotes.find(a => a.startsWith('y='))?.split('=')[1];
        const userAsymX = document.getElementById('asymptote-x').value;
        const userAsymY = document.getElementById('asymptote-y').value;

        if (correctAsymX !== undefined && (!userAsymX || Math.abs(parseFloat(userAsymX) - parseFloat(correctAsymX)) > 0.1)) { asymCorrect = false; asymHints.push("Check your vertical asymptote (x=...)."); } 
        else if (correctAsymX === undefined && userAsymX !== '') { asymCorrect = false; asymHints.push("This graph doesn't have a vertical asymptote."); }
        if (correctAsymY !== undefined && (!userAsymY || Math.abs(parseFloat(userAsymY) - parseFloat(correctAsymY)) > 0.1)) { asymCorrect = false; asymHints.push("Check your horizontal asymptote (y=...)."); } 
        else if (correctAsymY === undefined && userAsymY !== '') { asymCorrect = false; asymHints.push("This graph doesn't have a horizontal asymptote."); }

        let extraFeaturesCorrect = true; let extraFeaturesHints = [];
        if (currentQuestion.vertex) {
            const userKX = parseFloat(document.getElementById('key-point-x').value); const userKY = parseFloat(document.getElementById('key-point-y').value); const {h, k} = currentQuestion.vertex;
            if (isNaN(userKX) || isNaN(userKY) || Math.abs(userKX - h) > 0.1 || Math.abs(userKY - k) > 0.1) { extraFeaturesCorrect = false; extraFeaturesHints.push("Check the coordinates of the vertex."); }
        }
        if (currentQuestion.inflection) {
            const userIX = parseFloat(document.getElementById('key-point-x').value); const userIY = parseFloat(document.getElementById('key-point-y').value); const {h, k} = currentQuestion.inflection;
            if (isNaN(userIX) || isNaN(userIY) || Math.abs(userIX - h) > 0.1 || Math.abs(userIY - k) > 0.1) { extraFeaturesCorrect = false; extraFeaturesHints.push("Check the point of inflection."); }
        }
        if (currentQuestion.type === 'semicircle') {
            const userCX = parseFloat(document.getElementById('center-x').value); const userCY = parseFloat(document.getElementById('center-y').value); const userR = parseFloat(document.getElementById('radius').value); const {h, k} = currentQuestion.center; const {radius} = currentQuestion;
            if (isNaN(userCX) || isNaN(userCY) || Math.abs(userCX - h) > 0.1 || Math.abs(userCY - k) > 0.1) { extraFeaturesCorrect = false; extraFeaturesHints.push("Check the coordinates of the center."); }
            if (isNaN(userR) || Math.abs(userR - radius) > 0.1) { extraFeaturesCorrect = false; extraFeaturesHints.push("Check the radius."); }
        }
        
        feedbackEl.classList.remove('hidden', 'bg-green-200/20', 'text-green-300', 'bg-red-200/20', 'text-red-300');
        if (xIntsCorrect && yIntsCorrect && asymCorrect && extraFeaturesCorrect) {
            feedbackEl.classList.add('bg-green-200/20', 'text-green-300');
            feedbackEl.textContent = 'Great! All your values are correct. Now try sketching the graph.';
        } else {
            let hints = [];
            if (!xIntsCorrect) hints.push("Check your x-intercepts. Hint: set y=0.");
            if (!yIntsCorrect) hints.push("Check your y-intercepts. Hint: set x=0.");
            if (!asymCorrect) hints.push(...asymHints);
            if (!extraFeaturesCorrect) hints.push(...extraFeaturesHints);
            feedbackEl.classList.add('bg-red-200/20', 'text-red-300');
            feedbackEl.innerHTML = `Not quite. <br> ${hints.join('<br>')}`;
            showInputsSolutionBtn.classList.remove('hidden');
        }
    }

    function analyzeShape(question, allDrawnPaths) {
        const solidPaths = allDrawnPaths.filter(p => p.style === 'solid');
        if (solidPaths.length === 0) return ["You haven't drawn the main graph line yet!"];
        const fullPath = solidPaths.flatMap(p => p.path);
        if (fullPath.length < 10) return ["Please draw a more complete curve."];
        
        let totalDeviation = 0;
        let pointsCompared = 0;
        const origin = { x: canvasSize.width / 2, y: canvasSize.height / 2 };

        if (question.plot) {
            const findYatX = (xPixel, path) => {
                let closestPoint = null;
                let minDistance = Infinity;
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

        } else if (question.type === 'semicircle') {
            let totalPoints = 0;
            let correctPoints = 0;
            fullPath.forEach((point, i) => {
                if (i % 5 !== 0) return;
                totalPoints++;
                const xVal = (point.x - origin.x) / scale;
                const yVal = (origin.y - point.y) / scale;
                const { h, k } = question.center;
                const { radius } = question;
                const distanceFromCenter = Math.sqrt(Math.pow(xVal - h, 2) + Math.pow(yVal - k, 2));
                const error = Math.abs(distanceFromCenter - radius);
                const tolerance = radius * 0.20; // 20% margin for radius
                if (error < tolerance) correctPoints++;
            });
            const accuracy = totalPoints > 0 ? correctPoints / totalPoints : 0;
            if (accuracy > 0.7) return [];
            return ["Your semicircle isn't the right size or in the right position."];
        }
        return ["Cannot check this graph type."];
    }
    
    function checkShape() {
        if (!currentQuestion) return;
        const shapeHints = analyzeShape(currentQuestion, drawingHistory);
        shapeFeedbackEl.classList.remove('hidden', 'bg-green-200/20', 'text-green-300', 'bg-red-200/20', 'text-red-300');
        if (shapeHints.length === 0) {
            shapeFeedbackEl.classList.add('bg-green-200/20', 'text-green-300');
            shapeFeedbackEl.textContent = "Excellent sketch! The shape and position look great.";
            triggerConfetti();
        } else {
            shapeFeedbackEl.classList.add('bg-red-200/20', 'text-red-300');
            shapeFeedbackEl.innerHTML = shapeHints.join('<br>');
        }
    }

    // --- Solution and other helper functions ---
    function showInputsSolution() {
        if(!currentQuestion) return;
        const { xInts, yInts, asymptotes, vertex, center, radius, inflection } = currentQuestion;
        let html = [];
        const formatNum = (n) => n.toFixed(2).replace(/\.00$/, '');
        const clean = (arr) => arr.filter(n => n !== null && isFinite(n));
        const cleanXInts = clean(xInts);
        html.push(`<strong>X-Intercepts:</strong> ${cleanXInts.length > 0 ? cleanXInts.map(formatNum).join(', ') : 'None'}`);
        const cleanYInts = clean(yInts);
        html.push(`<strong>Y-Intercepts:</strong> ${cleanYInts.length > 0 ? cleanYInts.map(formatNum).join(', ') : 'None'}`);
        if (asymptotes.length > 0) { html.push(`<strong>Asymptotes:</strong> ${asymptotes.join(', ')}`); }
        if (vertex) { html.push(`<strong>Vertex:</strong> (${formatNum(vertex.h)}, ${formatNum(vertex.k)})`); }
        if (inflection) { html.push(`<strong>Point of Inflection:</strong> (${formatNum(inflection.h)}, ${formatNum(inflection.k)})`); }
        if (center) { html.push(`<strong>Center:</strong> (${formatNum(center.h)}, ${formatNum(center.k)})`); }
        if (radius) { html.push(`<strong>Radius:</strong> ${formatNum(radius)}`); }
        inputsSolutionEl.innerHTML = html.join('<br>');
        inputsSolutionEl.classList.remove('hidden');
    }

    function drawSolution() {
        if (!currentQuestion) return;
        solutionCanvas.classList.remove('hidden');
        const w = canvasSize.width; const h = canvasSize.height; const origin = { x: w / 2, y: h / 2 };
        solutionCtx.clearRect(0,0,w,h);
        solutionCtx.lineWidth = 3; solutionCtx.strokeStyle = 'rgba(56, 189, 248, 0.8)'; // Light Blue
        solutionCtx.beginPath();
        
        if (currentQuestion.plot) {
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
        }
        solutionCtx.stroke();

        if (currentQuestion.asymptotes.length > 0) {
            solutionCtx.strokeStyle = 'rgba(244, 114, 182, 0.7)'; solutionCtx.fillStyle = 'rgba(244, 114, 182, 1)'; solutionCtx.font = '12px Inter';
            solutionCtx.lineWidth = 2; solutionCtx.setLineDash([5, 5]);
            currentQuestion.asymptotes.forEach(asym => {
                const [variable, valueStr] = asym.split('='); const value = parseFloat(valueStr);
                solutionCtx.beginPath();
                if (variable === 'x') { const pX = origin.x + value * scale; solutionCtx.moveTo(pX, 0); solutionCtx.lineTo(pX, h); solutionCtx.fillText(asym, pX + 5, 15); } 
                else { const pY = origin.y - value * scale; solutionCtx.moveTo(0, pY); solutionCtx.lineTo(w, pY); solutionCtx.fillText(asym, w - 45, pY - 5); }
                solutionCtx.stroke();
            });
            solutionCtx.setLineDash([]);
        }
        
        const formatNum = (n) => n.toFixed(1).replace(/\.0$/, '');
        const clean = (arr) => arr.filter(n => n !== null && isFinite(n));
        
        // Draw Dots for key points
        solutionCtx.fillStyle = '#38bdf8'; // Bright blue for intercept dots
        clean(currentQuestion.xInts).forEach(x => { const pX = origin.x + x * scale, pY = origin.y; solutionCtx.beginPath(); solutionCtx.arc(pX, pY, 4, 0, 2*Math.PI); solutionCtx.fill(); });
        clean(currentQuestion.yInts).forEach(y => { const pX = origin.x, pY = origin.y - y * scale; solutionCtx.beginPath(); solutionCtx.arc(pX, pY, 4, 0, 2*Math.PI); solutionCtx.fill(); });
        
        if(currentQuestion.vertex){
            solutionCtx.fillStyle = '#f59e0b'; // Amber for vertex
            const pX = origin.x + currentQuestion.vertex.h * scale, pY = origin.y - currentQuestion.vertex.k * scale;
            solutionCtx.beginPath(); solutionCtx.arc(pX, pY, 5, 0, 2*Math.PI); solutionCtx.fill();
        }
         if(currentQuestion.inflection){
            solutionCtx.fillStyle = '#10b981'; // Emerald for inflection
            const pX = origin.x + currentQuestion.inflection.h * scale, pY = origin.y - currentQuestion.inflection.k * scale;
            solutionCtx.beginPath(); solutionCtx.arc(pX, pY, 5, 0, 2*Math.PI); solutionCtx.fill();
        }

        // Draw Labels for key points
        solutionCtx.fillStyle = '#e2e8f0'; 
        solutionCtx.font = '12px Inter';

        clean(currentQuestion.xInts).forEach(x => { const pX = origin.x + x * scale, pY = origin.y; solutionCtx.fillText(`(${formatNum(x)}, 0)`, pX + 5, pY - 5); });
        clean(currentQuestion.yInts).forEach(y => { const pX = origin.x, pY = origin.y - y * scale; solutionCtx.fillText(`(0, ${formatNum(y)})`, pX + 5, pY - 5); });
        if(currentQuestion.vertex){ const {h,k} = currentQuestion.vertex; const pX = origin.x + h * scale, pY = origin.y - k * scale; solutionCtx.fillText(`V(${formatNum(h)}, ${formatNum(k)})`, pX + 8, pY + 8); }
        if(currentQuestion.inflection){ const {h,k} = currentQuestion.inflection; const pX = origin.x + h * scale, pY = origin.y - k * scale; solutionCtx.fillText(`(${formatNum(h)}, ${formatNum(k)})`, pX + 8, pY + 8); }
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

    // --- Initial Setup and Event Listeners ---
    workingCanvas = setupHandwritingCanvas('working-canvas', 'undo-working-btn');
    
    newQuestionBtn.addEventListener('click', generateNewQuestion);
    checkInputsBtn.addEventListener('click', checkInputs);
    showInputsSolutionBtn.addEventListener('click', showInputsSolution);
    checkShapeBtn.addEventListener('click', checkShape);
    showSolutionBtn.addEventListener('click', drawSolution);
    solidBtn.addEventListener('click', () => { currentLineStyle = 'solid'; solidBtn.classList.add('active'); dottedBtn.classList.remove('active'); });
    dottedBtn.addEventListener('click', () => { currentLineStyle = 'dotted'; dottedBtn.classList.add('active'); solidBtn.classList.remove('active'); });
    undoBtn.addEventListener('click', () => { drawingHistory.pop(); redrawAll(); });
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    window.addEventListener('resize', () => { resizeCanvas(); if(workingCanvas) workingCanvas.resize(); });

    resizeCanvas();
    if(workingCanvas) workingCanvas.resize(); // Initial resize for handwriting canvas
    generateNewQuestion();
});
