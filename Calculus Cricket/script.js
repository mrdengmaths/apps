// DOM Elements
        const levelDisplay = document.getElementById('level-display');
        const runsDisplay = document.getElementById('runs-display');
        const wicketsDisplay = document.getElementById('wickets-display');
        const levelTitle = document.getElementById('level-title');
        const questionSpan = document.getElementById('question');
        const answerInput = document.getElementById('answer');
        const submitBtn = document.getElementById('submit-btn');
        const feedbackDiv = document.getElementById('feedback');
        const gameArea = document.getElementById('game-area');
        const winScreen = document.getElementById('win-screen');
        const finalRunsSpan = document.getElementById('final-runs');
        const finalWicketsSpan = document.getElementById('final-wickets');
        const playAgainBtn = document.getElementById('play-again-btn');
        const outModal = document.getElementById('out-modal');
        const correctAnswerModal = document.getElementById('correct-answer-modal');
        const pointsDisplay = document.getElementById('points-display');
       
        // Game State
        let state = {};
        const possibleScores = [1, 2, 3, 4, 6];

        const levelDetails = [
            { title: "The Opener: Power Rule (Lvl 2 at 20 runs)" },
            { title: "Building a Partnership: Polynomials (Lvl 3 at 40 runs)" },
            { title: "The Googly: Chain Rule (Lvl 4 at 70 runs)" },
            { title: "Pace & Spin: Product & Quotient Rules (Lvl 5 at 100 runs)" },
            { title: "The Finisher: Advanced Functions (Win after 5 correct)" },
        ];

        // --- UTILITY FUNCTIONS ---
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function standardizeAnswer(input) {
            let clean = input.replace(/\s+/g, '').toLowerCase();
            clean = clean.replace(/(?<![a-z0-9\d)\]])x/g, '1x');
            clean = clean.replace(/\(-x/g, '(-1x');
            clean = clean.replace(/\*\*/g, '^');
            return clean;
        }

        // --- QUESTION GENERATION ---
        function generateQuestion() {
            state.currentPoints = possibleScores[Math.floor(Math.random() * possibleScores.length)];
            const level = state.level;
            let question = '', answer = '';

            switch (level) {
                case 1: { // ax^n
                    const a = getRandomInt(2, 9);
                    const n = getRandomInt(2, 7);
                    question = `${a}x^{${n}}`;
                    const newCoeff = a * n;
                    const newPow = n - 1;
                    answer = newPow === 1 ? `${newCoeff}x` : `${newCoeff}x^${newPow}`;
                    break;
                }
                case 2: { // ax^n + bx^m
                    const a = getRandomInt(2, 9);
                    const n = getRandomInt(3, 7);
                    const b = getRandomInt(2, 9) * (Math.random() > 0.5 ? 1 : -1);
                    const m = getRandomInt(1, n - 1);
                   
                    question = `${a}x^{${n}} ${b > 0 ? '+' : '-'} ${Math.abs(b)}${m === 1 ? 'x' : `x^{${m}}`}`;
                   
                    const term1_a = `${a*n}x^${n-1}`;
                    let term2_a = '';
                    if (m > 1) {
                         term2_a = `${b*m > 0 ? '+' : ''}${b*m}x^${m-1}`;
                    } else {
                         term2_a = `${b > 0 ? '+' : ''}${b}`;
                    }
                    answer = `${term1_a}${term2_a}`;
                    break;
                }
                case 3: { // a(bx+c)^n
                    const a = getRandomInt(2, 5);
                    const b = getRandomInt(2, 5);
                    const c = getRandomInt(1, 9) * (Math.random() > 0.5 ? 1 : -1);
                    const n = getRandomInt(2, 6);
                   
                    question = `${a}(${b}x${c > 0 ? '+' : ''}${c})^{${n}}`;
                    const newCoeff = a * b * n;
                    const newPow = n - 1;
                    answer = newPow === 1 ? `${newCoeff}(${b}x${c > 0 ? '+' : ''}${c})` : `${newCoeff}(${b}x${c > 0 ? '+' : ''}${c})^${newPow}`;
                    break;
                }
                case 4: { // Product or Quotient
                    if (Math.random() > 0.5) { // Product Rule: (x^n)(ax+b)
                        const n = getRandomInt(2, 4);
                        const a = getRandomInt(2, 5);
                        const b = getRandomInt(1, 5);
                        question = `(x^{${n}})(${a}x+${b})`;
                        const newCoeff1 = a * (n + 1);
                        const newCoeff2 = b * n;
                        answer = `${newCoeff1}x^${n}+${newCoeff2}x^${n-1}`;
                    } else { // Quotient Rule: (ax+b)/(cx+d)
                        const a = getRandomInt(1, 5);
                        const b = getRandomInt(1, 5);
                        const c = getRandomInt(1, 5);
                        const d = getRandomInt(1, 5);
                        if (a*d - b*c === 0) return generateQuestion();
                       
                        question = `\\frac{${a}x+${b}}{${c}x+${d}}`;
                        answer = `${a*d - b*c}/(${c}x+${d})^2`;
                    }
                    break;
                }
                case 5: { // Trig, Exp, Log
                    const funcs = ['sin', 'cos', 'exp', 'ln'];
                    const chosenFunc = funcs[getRandomInt(0, 3)];
                    const a = getRandomInt(2, 9);
                   
                    switch (chosenFunc) {
                        case 'sin': {
                            const b = getRandomInt(2, 7);
                            question = `${a}\\sin(${b}x)`;
                            answer = `${a*b}cos(${b}x)`;
                            break;
                        }
                        case 'cos': {
                            const b = getRandomInt(2, 7);
                            question = `${a}\\cos(${b}x)`;
                            answer = `${-a*b}sin(${b}x)`;
                            break;
                        }
                        case 'exp': {
                            const b = getRandomInt(2, 7);
                            question = `${a}e^{${b}x}`;
                            answer = `${a*b}e^(${b}x)`;
                            break;
                        }
                        case 'ln': {
                            question = `${a}\\ln(x)`;
                            answer = `${a}/x`;
                            break;
                        }
                    }
                    break;
                }
            }
            state.currentQuestion = { question, answer };
        }

        // --- UI AND STATE MANAGEMENT ---
        function updateUI() {
            levelDisplay.textContent = state.level;
            runsDisplay.textContent = state.runs;
            wicketsDisplay.textContent = state.wickets;
            levelTitle.textContent = levelDetails[state.level - 1].title;
            pointsDisplay.textContent = state.currentPoints;
            katex.render(state.currentQuestion.question, questionSpan, {
                throwOnError: false,
                displayMode: true
            });
            answerInput.value = '';
            answerInput.focus();
        }

        function showFeedback(message, runsScored) {
            feedbackDiv.textContent = message + ` You score ${runsScored} runs!`;
            feedbackDiv.className = 'h-10 mt-2 text-lg font-semibold text-green-300 feedback-correct';
            setTimeout(() => {
                feedbackDiv.textContent = '';
                feedbackDiv.className = 'h-10 mt-2 text-lg font-semibold';
            }, 2500);
        }

        function checkLevelProgression() {
            const runs = state.runs;
            const currentLevel = state.level;
            let didLevelUp = false;

            if (currentLevel === 1 && runs >= 20) {
                levelUp(2);
                didLevelUp = true;
            } else if (currentLevel === 2 && runs >= 40) {
                levelUp(3);
                didLevelUp = true;
            } else if (currentLevel === 3 && runs >= 70) {
                levelUp(4);
                didLevelUp = true;
            } else if (currentLevel === 4 && runs >= 100) {
                levelUp(5);
                didLevelUp = true;
            } else if (currentLevel === 5) {
                state.runsInLevel++;
                if (state.runsInLevel >= 5) {
                    endGame();
                    return; // Exit to prevent new question
                }
            }

            if (!didLevelUp) {
                generateQuestion();
                updateUI();
            }
        }

        function checkAnswer() {
            const userAnswer = standardizeAnswer(answerInput.value);
            const correctAnswer = standardizeAnswer(state.currentQuestion.answer);

            if (userAnswer === correctAnswer) {
                const points = state.currentPoints;
                state.runs += points;
                showFeedback('SIX! A perfect shot!', points);
                checkLevelProgression();
            } else {
                submitBtn.disabled = true;
                answerInput.disabled = true;
                outModal.classList.remove('hidden');
                correctAnswerModal.textContent = state.currentQuestion.answer;

                setTimeout(() => {
                    outModal.classList.add('hidden');
                    state.wickets++;
                    generateQuestion();
                    updateUI();
                    submitBtn.disabled = false;
                    answerInput.disabled = false;
                    answerInput.focus();
                }, 3000);
            }
        }
       
        function levelUp(newLevel) {
            submitBtn.disabled = true;
            answerInput.disabled = true;
           
            feedbackDiv.textContent = "Level Up! Well batted!";
            feedbackDiv.className = "h-10 mt-2 text-lg font-semibold text-yellow-300";
            setTimeout(() => {
                state.level = newLevel;
                if (newLevel === 5) {
                    state.runsInLevel = 0; // Special case for final level
                }
                generateQuestion();
                updateUI();
                feedbackDiv.textContent = "";
                submitBtn.disabled = false;
                answerInput.disabled = false;
            }, 3000);
        }

        function endGame() {
            gameArea.classList.add('hidden');
            winScreen.classList.remove('hidden');
            finalRunsSpan.textContent = state.runs;
            finalWicketsSpan.textContent = state.wickets;
        }

        function init() {
            state = {
                level: 1,
                runs: 0,
                wickets: 0,
                currentQuestion: {},
                currentPoints: 0
            };
            gameArea.classList.remove('hidden');
            winScreen.classList.add('hidden');
            outModal.classList.add('hidden');
            submitBtn.disabled = false;
            answerInput.disabled = false;
           
            generateQuestion();
            updateUI();
        }

        // --- EVENT LISTENERS ---
        submitBtn.addEventListener('click', checkAnswer);
        answerInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });
        playAgainBtn.addEventListener('click', init);

        // --- INITIALIZE GAME ---
        init();