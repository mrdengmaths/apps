(() => {
    const STORAGE_KEY = 'mrDengQuizProgress';
    const STYLE_ID = 'mr-deng-quiz-progress-style';
    const TRACKER_ID = 'mr-deng-quiz-progress';
    const TOGGLE_ID = 'mr-deng-quiz-progress-toggle';

    function readProgress() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
            console.warn('Could not read quiz progress from localStorage.', error);
            return [];
        }
    }

    function writeProgress(items) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (error) {
            console.warn('Could not save quiz progress to localStorage.', error);
        }
    }

    function toQuestionList(items) {
        if (!Array.isArray(items)) {
            return [];
        }

        return items.map((item, index) => {
            const number = item.number ?? item.q ?? index + 1;
            const topic = item.topic || 'Topic revision';
            const text = item.text || item.question || '';
            return { number, topic, text };
        });
    }

    function getQuizName() {
        const heading = document.querySelector('h1');
        return (heading ? heading.textContent.trim() : document.title || 'Quiz').replace(/\s+/g, ' ');
    }

    function formatTimestamp(isoString) {
        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) {
            return 'Unknown date';
        }

        return new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    }

    function getCurrentScore() {
        const scoreEl = document.getElementById('score');
        if (scoreEl) {
            const value = Number(scoreEl.textContent.trim());
            if (!Number.isNaN(value)) {
                return value;
            }
        }

        if (typeof window.currentQuizScore === 'number') {
            return window.currentQuizScore;
        }

        return null;
    }

    function getQuestionTotal() {
        if (typeof window.correctAnswers === 'object') {
            return Object.keys(window.correctAnswers).length;
        }

        const radioCount = document.querySelectorAll('input[type="radio"]').length;
        if (radioCount > 0) {
            const names = new Set();
            document.querySelectorAll('input[type="radio"]').forEach((input) => names.add(input.name));
            return names.size;
        }

        return 0;
    }

    function getWrongQuestions() {
        if (Array.isArray(window.wrongQuestionData)) {
            return toQuestionList(window.wrongQuestionData);
        }

        const questions = [];
        const answerMap = window.correctAnswers || {};

        Object.keys(answerMap).forEach((key) => {
            const selected = document.querySelector(`input[name="${key}"]:checked`);
            const answerValue = selected ? selected.value : null;
            const correctValue = answerMap[key];

            if (answerValue !== correctValue) {
                questions.push({
                    number: Number(key.replace(/[^0-9]/g, '')) || key,
                    topic: (window.questionMeta && window.questionMeta[key] && window.questionMeta[key].topic) || 'Topic revision',
                    text: (window.questionMeta && window.questionMeta[key] && window.questionMeta[key].text) || key
                });
            }
        });

        return questions;
    }

    function recordCurrentAttempt() {
        if (!document.getElementById('score') && typeof window.correctAnswers !== 'object') {
            return;
        }

        const score = getCurrentScore();
        const total = getQuestionTotal();
        const wrongQuestions = getWrongQuestions();

        if (score === null || total === 0) {
            return;
        }

        const record = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            timestamp: new Date().toISOString(),
            quizName: getQuizName(),
            quizUrl: window.location.href,
            score,
            total,
            wrongQuestions
        };

        const history = readProgress();
        const nextHistory = [record].concat(history).slice(0, 50);
        writeProgress(nextHistory);
        renderProgress();
    }

    function clearProgress() {
        const confirmed = window.confirm('Reset all stored quiz progress? This cannot be undone.');
        if (!confirmed) {
            return;
        }

        writeProgress([]);
        renderProgress();
    }

    function buildProgressPanel() {
        if (document.getElementById(TRACKER_ID)) {
            return;
        }

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            #${TOGGLE_ID} {
                position: fixed;
                right: 20px;
                bottom: 20px;
                z-index: 2000;
                border: none;
                border-radius: 18px;
                background: linear-gradient(135deg, #005b94, #19a7ce);
                color: #fff;
                padding: 0.9rem 1.1rem;
                font-family: 'Poppins', sans-serif;
                font-size: 0.95rem;
                font-weight: 700;
                box-shadow: 0 12px 28px rgba(0, 91, 148, 0.28);
                cursor: pointer;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }

            #${TOGGLE_ID}:hover {
                transform: translateY(-2px);
                box-shadow: 0 16px 30px rgba(0, 91, 148, 0.32);
            }

            #${TRACKER_ID} {
                position: fixed;
                right: 20px;
                bottom: 86px;
                width: min(360px, calc(100vw - 28px));
                max-height: 70vh;
                overflow: hidden;
                background: rgba(255, 255, 255, 0.96);
                border: 1px solid rgba(15, 23, 42, 0.08);
                border-radius: 18px;
                box-shadow: 0 18px 38px rgba(15, 23, 42, 0.18);
                z-index: 1999;
                display: none;
                font-family: 'Poppins', sans-serif;
                color: #1f2937;
            }

            #${TRACKER_ID}.is-open {
                display: block;
            }

            .mr-deng-progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 0.8rem;
                padding: 1rem 1rem 0.75rem;
                border-bottom: 1px solid rgba(15, 23, 42, 0.08);
            }

            .mr-deng-progress-header h3 {
                margin: 0;
                font-size: 1rem;
                color: #002d4a;
            }

            .mr-deng-progress-reset {
                border: none;
                border-radius: 999px;
                background: #e2e8f0;
                color: #1f2937;
                font-weight: 700;
                padding: 0.5rem 0.75rem;
                cursor: pointer;
            }

            .mr-deng-progress-list {
                list-style: none;
                margin: 0;
                padding: 0.75rem 0.9rem 1rem;
                max-height: 52vh;
                overflow-y: auto;
            }

            .mr-deng-progress-item {
                border: 1px solid rgba(148, 163, 184, 0.25);
                border-radius: 12px;
                background: #f8fafc;
                padding: 0.8rem 0.8rem 0.65rem;
                margin-bottom: 0.7rem;
            }

            .mr-deng-progress-item:last-child {
                margin-bottom: 0;
            }

            .mr-deng-progress-link {
                display: inline-block;
                color: #005b94;
                font-weight: 700;
                text-decoration: none;
                margin-bottom: 0.35rem;
            }

            .mr-deng-progress-meta {
                font-size: 0.78rem;
                color: #475569;
                margin-bottom: 0.45rem;
            }

            .mr-deng-progress-score {
                font-weight: 700;
                color: #0f172a;
            }

            .mr-deng-progress-wrong {
                margin: 0.55rem 0 0;
                padding-left: 1.1rem;
                color: #374151;
                font-size: 0.8rem;
                line-height: 1.45;
            }

            .mr-deng-progress-empty {
                padding: 1rem 1rem 0.5rem;
                color: #475569;
                font-size: 0.9rem;
            }
        `;
        document.head.appendChild(style);

        const panel = document.createElement('div');
        panel.id = TRACKER_ID;
        panel.setAttribute('aria-live', 'polite');
        panel.innerHTML = `
            <div class="mr-deng-progress-header">
                <h3>Quiz progress</h3>
                <button type="button" class="mr-deng-progress-reset">Reset</button>
            </div>
            <div class="mr-deng-progress-panel-body"></div>
        `;

        const toggleButton = document.createElement('button');
        toggleButton.id = TOGGLE_ID;
        toggleButton.type = 'button';
        toggleButton.textContent = 'Quiz progress';
        toggleButton.setAttribute('aria-expanded', 'false');

        toggleButton.addEventListener('click', () => {
            const open = panel.classList.toggle('is-open');
            toggleButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        panel.querySelector('.mr-deng-progress-reset').addEventListener('click', () => {
            clearProgress();
        });

        document.body.appendChild(panel);
        document.body.appendChild(toggleButton);
    }

    function renderProgress() {
        const panel = document.getElementById(TRACKER_ID);
        if (!panel) {
            buildProgressPanel();
        }

        const body = document.querySelector('#' + TRACKER_ID + ' .mr-deng-progress-panel-body');
        if (!body) {
            return;
        }

        const items = readProgress();
        if (!items.length) {
            body.innerHTML = '<div class="mr-deng-progress-empty">No quiz attempts saved yet.</div>';
            return;
        }

        body.innerHTML = '<ul class="mr-deng-progress-list"></ul>';
        const list = body.querySelector('.mr-deng-progress-list');

        items.forEach((entry) => {
            const li = document.createElement('li');
            li.className = 'mr-deng-progress-item';

            const link = document.createElement('a');
            link.className = 'mr-deng-progress-link';
            link.href = entry.quizUrl || '#';
            link.textContent = entry.quizName || 'Quiz';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            const meta = document.createElement('div');
            meta.className = 'mr-deng-progress-meta';
            meta.textContent = formatTimestamp(entry.timestamp);

            const score = document.createElement('div');
            score.className = 'mr-deng-progress-score';
            score.textContent = `Mark: ${entry.score} / ${entry.total}`;

            const wrongList = document.createElement('ul');
            wrongList.className = 'mr-deng-progress-wrong';

            const questions = Array.isArray(entry.wrongQuestions) ? entry.wrongQuestions : [];
            if (questions.length === 0) {
                const none = document.createElement('li');
                none.textContent = 'No missed questions recorded.';
                wrongList.appendChild(none);
            } else {
                questions.slice(0, 8).forEach((item) => {
                    const q = document.createElement('li');
                    const number = item.number ?? '';
                    const text = item.text ? ` — ${item.text}` : '';
                    q.textContent = `Q${number}${text}`;
                    wrongList.appendChild(q);
                });
            }

            li.appendChild(link);
            li.appendChild(meta);
            li.appendChild(score);
            li.appendChild(wrongList);
            list.appendChild(li);
        });
    }

    function initProgressTracker() {
        buildProgressPanel();
        renderProgress();

        const originalSubmitQuiz = window.submitQuiz;
        if (typeof originalSubmitQuiz === 'function') {
            window.submitQuiz = function (...args) {
                const result = originalSubmitQuiz.apply(this, args);
                try {
                    recordCurrentAttempt();
                } catch (error) {
                    console.warn('Quiz progress could not be recorded.', error);
                }
                return result;
            };
        }

        window.QuizProgressTracker = {
            read: readProgress,
            reset: clearProgress,
            recordCurrentAttempt,
            render: renderProgress
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProgressTracker, { once: true });
    } else {
        initProgressTracker();
    }
})();
