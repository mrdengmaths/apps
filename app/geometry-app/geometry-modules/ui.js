// algebra-modules/ui.js
class UI {
    constructor() {
        this.elements = {
            settingsScreen: document.getElementById('settings-screen'),
            gameScreen: document.getElementById('game-screen'),
            successScreen: document.getElementById('success-screen'),
            levelSelection: document.getElementById('level-selection-container'),
            streakCounter: document.getElementById('streak-counter'),
            levelName: document.getElementById('level-name'),
            timer: document.getElementById('timer'),
            questionText: document.getElementById('question-text'),
            feedbackMessage: document.getElementById('feedback-message'),
            testAnswerContent: document.getElementById('test-answer-content'),
            quitBtn: document.getElementById('quit-btn'),
            playAgainBtn: document.getElementById('play-again-btn'),
            completedLevel: document.getElementById('completed-level'),
            finalTime: document.getElementById('final-time'),
            finalRating: document.getElementById('final-rating'),
            bestTimeMessage: document.getElementById('best-time-message'),
            ratingExplanation: document.getElementById('rating-explanation'),
            skillPath: document.getElementById('skill-path'),
            skillPathContainer: document.getElementById('skill-path-container'),
            masteryProgressBars: document.getElementById('mastery-progress-bars'),
            toggleGridView: document.getElementById('toggle-grid-view'),
            continueNextBtn: document.getElementById('continue-next-btn'),
            replayLevelBtn: document.getElementById('replay-level-btn'),
            requiredStreakLabel: document.getElementById('required-streak-label'),
        };
        this.mathField = null;
        this.textInput = null;
        this.choiceButtons = [];
        this.selectedChoice = null;
        this.currentInputMode = 'math';
        this.MQ = null;
        this.currentView = 'skill-path'; // 'skill-path' or 'grid'
        this.setupToggleGridView();
        this.setupSuccessScreenButtons();

        if (this.elements.requiredStreakLabel && typeof CONFIG !== 'undefined') {
            this.elements.requiredStreakLabel.textContent = CONFIG.REQUIRED_STREAK;
        }
    }

    initializeMathQuill() {
        this.MQ = MathQuill.getInterface(2);
        
        // Initialize static math examples on settings screen
        const staticExamples = [
            'power-example',
            'fraction-example',
            'sqrt-example',
            'nthroot-example'
        ];
        
        staticExamples.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.MQ.StaticMath(element);
            }
        });
    }

    showScreen(screenName) {
        ['settings', 'game', 'success'].forEach(s => {
            this.elements[`${s}Screen`].classList.toggle('hidden', s !== screenName);
        });
    }

    renderLevelGrid(levelGroups, onSelect) {
        this.elements.levelSelection.innerHTML = '';
        for (const groupName in levelGroups) {
            const title = createEl('h2', { className: 'level-section-title', textContent: groupName });
            const grid = createEl('div', { className: 'level-grid' });
            
            levelGroups[groupName].forEach(level => {
                const bestTime = StorageManager.getBestTime(level.key);
                const rating = bestTime ? StorageManager.getRating(bestTime, level.key) : null;
                const ratingClass = rating ? `rating-${rating.key === 'true-mastery' ? 'queen' : rating.key}` : 'rating-none';
                
                const btn = createEl('div', { className: `level-btn ${ratingClass}` });
                btn.dataset.levelKey = level.key;
                
                const levelTitle = createEl('div', { className: 'level-title' });
                levelTitle.innerHTML = level.name;
                const bestTimeText = createEl('div', { 
                    className: 'best-time', 
                    textContent: bestTime ? `Best: ${new Timer().formatTime(bestTime)}` : 'No time set'
                });

                btn.append(levelTitle, bestTimeText);
                btn.addEventListener('click', () => {
                    const level = Object.values(levelGroups).flat().find(l => l.key === btn.dataset.levelKey);
                    onSelect(level);
                });
                grid.append(btn);
            });
            this.elements.levelSelection.append(title, grid);
        }
    }

    renderPrompt(problemLineContainer, question) {
        if (question.problemType === 'latex') {
            const problemContainer = createEl('span');
            problemLineContainer.appendChild(problemContainer);
            const problemMath = this.MQ.StaticMath(problemContainer);
            problemMath.latex(question.problem);
            return;
        }

        const promptText = createEl('div', {
            className: 'geometry-prompt-text',
            textContent: question.problem
        });
        problemLineContainer.appendChild(promptText);

        if (question.diagram) {
            const diagramBlock = createEl('pre', {
                className: 'geometry-diagram',
                textContent: question.diagram
            });
            problemLineContainer.appendChild(diagramBlock);
        }
    }

    displayQuestion(question) {
        this.elements.questionText.innerHTML = '';
        this.mathField = null;
        this.textInput = null;
        this.choiceButtons = [];
        this.selectedChoice = null;
        
        // Create problem line container
        const problemLineContainer = createEl('div', { className: 'problem-line' });
        this.elements.questionText.appendChild(problemLineContainer);

        this.renderPrompt(problemLineContainer, question);

        const questionFormat = question.format || 'math';
        this.currentInputMode = questionFormat;

        if (questionFormat === 'mcq') {
            const optionsContainer = createEl('div', { className: 'mcq-options-container' });
            const optionLabels = ['A', 'B', 'C', 'D'];

            question.choices.forEach((choice, idx) => {
                const optionButton = createEl('button', {
                    className: 'mcq-option-btn',
                    textContent: `${optionLabels[idx]}. ${choice}`
                });
                optionButton.type = 'button';
                optionButton.dataset.choiceValue = choice;
                optionButton.addEventListener('click', () => {
                    this.choiceButtons.forEach(btn => btn.classList.remove('selected'));
                    optionButton.classList.add('selected');
                    this.selectedChoice = choice;

                    // Submit immediately on click for multiple-choice questions.
                    const event = new CustomEvent('answer-selected');
                    document.dispatchEvent(event);
                });
                this.choiceButtons.push(optionButton);
                optionsContainer.appendChild(optionButton);
            });

            this.elements.questionText.appendChild(optionsContainer);
            return;
        }

        if (questionFormat === 'text' || questionFormat === 'numeric') {
            const textInputRow = createEl('div', { className: 'text-input-row' });
            const textInput = createEl('input', {
                className: 'text-answer-input',
                type: questionFormat === 'numeric' ? 'number' : 'text',
                placeholder: question.placeholder || 'Type your answer',
                autocomplete: 'off'
            });

            if (questionFormat === 'numeric') {
                textInput.step = 'any';
                textInput.inputMode = 'decimal';
            }

            textInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const event = new CustomEvent('mathquill-enter');
                    document.dispatchEvent(event);
                }
            });

            textInputRow.appendChild(textInput);
            this.elements.questionText.appendChild(textInputRow);
            this.textInput = textInput;

            setTimeout(() => this.textInput.focus(), 100);
            return;
        }
        
        // Create answer line container
        const answerLineContainer = createEl('div', { className: 'answer-line' });
        this.elements.questionText.appendChild(answerLineContainer);
        
        // Add equals sign
        const equalsSign = createEl('span', { 
            className: 'equals-sign',
            textContent: ' = '
        });
        answerLineContainer.appendChild(equalsSign);
        
        // Create editable math field for the answer
        const answerContainer = createEl('span', {
            className: 'mathquill-editable'
        });
        answerLineContainer.appendChild(answerContainer);
        
        // Initialize the math field
        this.mathField = this.MQ.MathField(answerContainer, {
            spaceBehavesLikeTab: true,
            leftRightIntoCmdGoes: 'up',
            restrictMismatchedBrackets: true,
            supSubsRequireOperand: true,
            charsThatBreakOutOfSupSub: '+-=<>',
            autoSubscriptNumerals: false,
            autoCommands: 'pi theta sqrt nthroot',
            handlers: {
                enter: () => {
                    // Trigger check answer when Enter is pressed
                    const event = new CustomEvent('mathquill-enter');
                    document.dispatchEvent(event);
                }
            }
        });
        
        // Focus the math field
        setTimeout(() => this.mathField.focus(), 100);
    }

    getAnswerFromUI() {
        if (this.currentInputMode === 'mcq') {
            return this.selectedChoice;
        }
        if (this.currentInputMode === 'text' || this.currentInputMode === 'numeric') {
            return this.textInput ? this.textInput.value : null;
        }
        if (!this.mathField) return null;
        return this.mathField.latex();
    }

    clearAnswer() {
        if (this.currentInputMode === 'mcq') {
            this.selectedChoice = null;
            this.choiceButtons.forEach(btn => btn.classList.remove('selected'));
            return;
        }
        if (this.currentInputMode === 'text' || this.currentInputMode === 'numeric') {
            if (this.textInput) {
                this.textInput.value = '';
                this.textInput.focus();
            }
            return;
        }
        if (this.mathField) {
            this.mathField.latex('');
            this.mathField.focus();
        }
    }

    updateStreak(streak) { 
        this.elements.streakCounter.textContent = streak; 
    }

    updateLevelName(levelName) {
        this.elements.levelName.innerHTML = levelName;
    }

    showFeedback(isCorrect, message, correctAnswer = null, answerFormat = 'math') {
        this.elements.feedbackMessage.innerHTML = '';
        this.elements.feedbackMessage.className = `feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;
        
        if (!isCorrect && correctAnswer) {
            const textPart = createEl('span', { textContent: 'Correct answer: ' });
            this.elements.feedbackMessage.appendChild(textPart);

            if (answerFormat === 'math') {
                const answerSpan = createEl('span');
                this.elements.feedbackMessage.appendChild(answerSpan);
                const staticMath = this.MQ.StaticMath(answerSpan);
                staticMath.latex(correctAnswer);
            } else {
                const answerSpan = createEl('span', { textContent: correctAnswer });
                this.elements.feedbackMessage.appendChild(answerSpan);
            }
        } else {
            this.elements.feedbackMessage.textContent = message;
        }
    }

    clearFeedback() { 
        this.elements.feedbackMessage.textContent = ''; 
    }

    updateTestAnswer(answer) {
        // For testing purposes - displays the correct answer
        if (this.elements.testAnswerContent) {
            this.elements.testAnswerContent.innerHTML = '';
            const staticMath = this.MQ.StaticMath(this.elements.testAnswerContent);
            staticMath.latex(answer);
        }
    }

    showInputFeedback(isCorrect) {
        if (this.currentInputMode === 'mcq') {
            if (!this.selectedChoice) return;
            this.choiceButtons.forEach(btn => {
                if (btn.dataset.choiceValue === this.selectedChoice) {
                    btn.classList.remove('correct', 'incorrect');
                    btn.classList.add(isCorrect ? 'correct' : 'incorrect');
                }
            });
            return;
        }

        if (this.currentInputMode === 'text' || this.currentInputMode === 'numeric') {
            if (this.textInput) {
                this.textInput.classList.remove('correct', 'incorrect');
                this.textInput.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
            return;
        }

        const mathQuillEl = this.elements.questionText.querySelector('.mq-editable-field');
        if (mathQuillEl) {
            mathQuillEl.classList.remove('correct', 'incorrect');
            mathQuillEl.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
    }

    clearInputFeedback() {
        if (this.currentInputMode === 'mcq') {
            this.choiceButtons.forEach(btn => btn.classList.remove('correct', 'incorrect'));
            return;
        }

        if (this.currentInputMode === 'text' || this.currentInputMode === 'numeric') {
            if (this.textInput) {
                this.textInput.classList.remove('correct', 'incorrect');
            }
            return;
        }

        const mathQuillEl = this.elements.questionText.querySelector('.mq-editable-field');
        if (mathQuillEl) {
            mathQuillEl.classList.remove('correct', 'incorrect');
        }
    }

    showSuccess(levelName, time, rating, isNewBest, previousBest) {
        console.log('Showing success screen for:', levelName);
        
        this.elements.completedLevel.innerHTML = levelName;
        this.elements.finalTime.textContent = new Timer().formatTime(time);
        this.elements.finalRating.textContent = rating.name;
        
        if (isNewBest) {
            this.elements.bestTimeMessage.textContent = previousBest 
                ? `New personal best! Beat your old time of ${new Timer().formatTime(previousBest)}.`
                : `You've set your first record!`;
        } else {
            this.elements.bestTimeMessage.textContent = `Your best time is still ${new Timer().formatTime(previousBest)}.`;
        }
        
        this.showScreen('success');
    }

    // --- Learning Path UI Methods ---

    setupSuccessScreenButtons() {
        // Continue to Next Challenge button
        if (this.elements.continueNextBtn) {
            this.elements.continueNextBtn.addEventListener('click', () => {
                if (this.onContinueNext) {
                    this.onContinueNext();
                }
            });
        }

        // Replay Level button
        if (this.elements.replayLevelBtn) {
            this.elements.replayLevelBtn.addEventListener('click', () => {
                if (this.onReplayLevel) {
                    this.onReplayLevel();
                }
            });
        }
    }

    // Set callback functions for success screen buttons
    setSuccessScreenCallbacks(onContinueNext, onReplayLevel) {
        this.onContinueNext = onContinueNext;
        this.onReplayLevel = onReplayLevel;
    }

    setupToggleGridView() {
        if (this.elements.toggleGridView) {
            this.elements.toggleGridView.addEventListener('click', () => {
                this.toggleView();
            });
        }
    }

    toggleView() {
        if (this.currentView === 'skill-path') {
            this.currentView = 'grid';
            this.elements.skillPath.classList.add('hidden');
            this.elements.levelSelection.classList.remove('hidden');
            this.elements.toggleGridView.textContent = 'Show Learning Path';
        } else {
            this.currentView = 'skill-path';
            this.elements.levelSelection.classList.add('hidden');
            this.elements.skillPath.classList.remove('hidden');
            this.elements.toggleGridView.textContent = 'Show All Levels';
        }
    }

    renderSkillPath(levelGroups, onSelect, masteryData) {
        this.elements.skillPath.innerHTML = '';
        const pathContainer = createEl('div', { className: 'skill-path-scroll' });
        
        // Flatten all levels to create linear path
        const allLevels = [];
        let currentSection = '';
        
        Object.keys(levelGroups).forEach(groupName => {
            levelGroups[groupName].forEach(level => {
                if (groupName !== currentSection) {
                    allLevels.push({ type: 'section', name: groupName });
                    currentSection = groupName;
                }
                allLevels.push({ type: 'level', ...level, groupName });
            });
        });

        // Find next available level (first level without mastery)
        let nextAvailableIndex = -1;
        allLevels.forEach((item, index) => {
            if (item.type === 'level' && nextAvailableIndex === -1) {
                const bestTime = StorageManager.getBestTime(item.key);
                const rating = bestTime ? StorageManager.getRating(bestTime, item.key) : null;
                // Check if level needs attention (not mastered)
                if (!rating || (rating.key !== 'mastery' && rating.key !== 'true-mastery')) {
                    // Found the next level that needs practice
                    nextAvailableIndex = index;
                }
            }
        });

        // Render path items
        allLevels.forEach((item, index) => {
            if (item.type === 'section') {
                const section = createEl('div', { className: 'skill-path-section' });
                const sectionTitle = createEl('div', { 
                    className: 'skill-path-section-title',
                    textContent: item.name 
                });
                section.appendChild(sectionTitle);
                pathContainer.appendChild(section);
            } else if (item.type === 'level') {
                const node = this.createSkillPathNode(item, index === nextAvailableIndex);
                node.addEventListener('click', () => onSelect(item));
                pathContainer.appendChild(node);
            }
        });

        this.elements.skillPath.appendChild(pathContainer);

        // Add horizontal scroll wheel support
        this.setupHorizontalScroll(pathContainer);

        // Auto-scroll to next available level
        if (nextAvailableIndex !== -1) {
            setTimeout(() => {
                this.scrollToNextLevel(nextAvailableIndex, allLevels);
            }, 100);
        }
    }

    createSkillPathNode(level, isNext = false) {
        const bestTime = StorageManager.getBestTime(level.key);
        const rating = bestTime ? StorageManager.getRating(bestTime, level.key) : null;
        const ratingClass = rating ? `rating-${rating.key === 'true-mastery' ? 'queen' : rating.key}` : 'rating-none';
        
        const node = createEl('div', { 
            className: `skill-path-node ${ratingClass} ${isNext ? 'current' : ''}` 
        });
        node.dataset.levelKey = level.key;
        
        const label = createEl('div', { 
            className: 'skill-path-label'
        });
        label.innerHTML = level.name;
        
        const timeDisplay = createEl('div', { 
            className: 'skill-path-time',
            textContent: bestTime ? `Best: ${new Timer().formatTime(bestTime)}` : 'Not attempted'
        });
        
        node.append(label, timeDisplay);
        return node;
    }

    scrollToNextLevel(levelIndex, allLevels) {
        const scrollContainer = this.elements.skillPath.querySelector('.skill-path-scroll');
        if (!scrollContainer) return;

        // Find the actual level node (skip sections)
        const levelNodes = scrollContainer.querySelectorAll('.skill-path-node');
        let actualLevelIndex = 0;
        
        for (let i = 0; i < levelIndex; i++) {
            if (allLevels[i].type === 'level') {
                actualLevelIndex++;
            }
        }
        
        if (levelNodes[actualLevelIndex]) {
            const nodeLeft = levelNodes[actualLevelIndex].offsetLeft;
            const containerWidth = scrollContainer.clientWidth;
            const scrollPosition = nodeLeft - (containerWidth / 2) + 50;
            
            scrollContainer.scrollTo({
                left: Math.max(0, scrollPosition),
                behavior: 'smooth'
            });
        }
    }

    setupHorizontalScroll(container) {
        // Add horizontal scroll wheel support
        container.addEventListener('wheel', (e) => {
            // Only handle horizontal scrolling when there's horizontal content
            if (container.scrollWidth > container.clientWidth) {
                e.preventDefault();
                
                // Scroll horizontally based on wheel delta
                const scrollAmount = e.deltaY * 2; // Multiply for faster scrolling
                container.scrollLeft += scrollAmount;
            }
        });
    }

    renderMasteryProgressBars(progressData) {
        if (!this.elements.masteryProgressBars) return;
        
        this.elements.masteryProgressBars.innerHTML = '';
        
        progressData.forEach(topic => {
            const container = createEl('div', { className: '' });
            
            const label = createEl('div', { className: 'mastery-progress-label flex justify-between items-center mb-1' });
            const titleSpan = createEl('span', { 
                className: 'font-medium text-gray-700',
                textContent: topic.name 
            });
            const statsSpan = createEl('span', { 
                className: 'text-sm text-gray-500',
                textContent: `${topic.masteredCount}/${topic.totalCount} mastered`
            });
            label.append(titleSpan, statsSpan);
            
            const progressBar = createEl('div', { 
                className: 'mastery-progress-bar bg-gray-200 rounded-full h-4 overflow-hidden'
            });
            const progressFill = createEl('div', { 
                className: 'mastery-progress-fill h-full flex items-center justify-center text-xs text-white font-medium transition-all duration-300',
                style: { 
                    width: `${topic.percentage}%`,
                    backgroundColor: topic.color
                }
            });
            
            if (topic.percentage > 20) {
                progressFill.textContent = `${topic.percentage}%`;
            }
            
            progressBar.appendChild(progressFill);
            container.append(label, progressBar);
            
            this.elements.masteryProgressBars.appendChild(container);
        });
    }

    updateLevelsInterface(levelGroups, onSelect, masteryData) {
        // Render mastery progress bars first
        if (masteryData) {
            this.renderMasteryProgressBars(masteryData);
        }

        // Render both skill path and grid (grid starts hidden)
        this.renderSkillPath(levelGroups, onSelect, masteryData);
        this.renderLevelGrid(levelGroups, onSelect);
        
        // Show skill path by default
        if (this.currentView === 'skill-path') {
            this.elements.levelSelection.classList.add('hidden');
            this.elements.skillPath.classList.remove('hidden');
        }
    }
}