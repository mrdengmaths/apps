let quizSubmitted = false;
let wrongQuestionData = [];
window.wrongQuestionData = wrongQuestionData;
let mqFields = {};
let mqKeyboards = {};

const MATH_KEYS = [
    { label: 'x^2', action: 'cmd', value: '^2' },
    { label: 'x^n', action: 'cmd', value: '^' },
    { label: 'frac', action: 'cmd', value: '\\frac' },
    { label: 'sqrt', action: 'cmd', value: '\\sqrt' },
    { label: '( )', action: 'write', value: '()' },
    { label: 'pi', action: 'write', value: '\\pi' },
    { label: 'theta', action: 'write', value: '\\theta' },
    { label: 'times', action: 'write', value: '\\times' },
    { label: '/', action: 'write', value: '/' },
    { label: '-', action: 'write', value: '-' }
];

function latexToComparable(value) {
    if (value == null) {
        return '';
    }

    return String(value)
        .replace(/\\left|\\right/g, '')
        .replace(/\\cdot|\\times/g, 'x')
        .replace(/\\frac\s*\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
        .replace(/\\sqrt\s*\{([^{}]+)\}/g, 'sqrt($1)')
        .replace(/[{}]/g, '')
        .replace(/\s+/g, '');
}

function ensureJQueryAsset() {
    if (typeof window.jQuery !== 'undefined') {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const scriptId = 'jquery-js-shared';
        const existing = document.getElementById(scriptId);
        if (existing) {
            if (typeof window.jQuery !== 'undefined') {
                resolve();
                return;
            }
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', () => reject(new Error('jQuery failed to load')));
            return;
        }

        const jqScript = document.createElement('script');
        jqScript.id = scriptId;
        jqScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js';
        jqScript.onload = () => resolve();
        jqScript.onerror = () => reject(new Error('jQuery failed to load'));
        document.head.appendChild(jqScript);
    });
}

function ensureMathQuillAssets() {
    if (typeof window.MathQuill !== 'undefined') {
        return Promise.resolve();
    }

    // MathQuill 0.10.1 expects jQuery to already be on the page, same as app/algebra-app.
    return ensureJQueryAsset().then(() => new Promise((resolve, reject) => {
        const cssId = 'mq-css-shared';
        if (!document.getElementById(cssId)) {
            const mqCss = document.createElement('link');
            mqCss.id = cssId;
            mqCss.rel = 'stylesheet';
            mqCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.css';
            document.head.appendChild(mqCss);
        }

        const scriptId = 'mq-js-shared';
        const existing = document.getElementById(scriptId);
        if (existing) {
            if (typeof window.MathQuill !== 'undefined') {
                resolve();
                return;
            }
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', () => reject(new Error('MathQuill failed to load')));
            return;
        }

        const mqScript = document.createElement('script');
        mqScript.id = scriptId;
        mqScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.min.js';
        mqScript.onload = () => resolve();
        mqScript.onerror = () => reject(new Error('MathQuill failed to load'));
        document.head.appendChild(mqScript);
    }));
}

function initMathInputs() {
    if (typeof window.MathQuill === 'undefined') {
        return;
    }

    const MQ = window.MathQuill.getInterface(2);
    document.querySelectorAll('input.student-input, textarea.student-textarea').forEach((el) => {
        if (!el.name || mqFields[el.name]) {
            return;
        }

        const hasMathField = !!window.quizConfig
            && !!window.quizConfig.questions
            && !!window.quizConfig.questions[el.name]
            && window.quizConfig.questions[el.name].type === 'text';

        if (!hasMathField) {
            el.style.display = '';
            return;
        }

        const host = document.createElement('div');
        host.className = 'mathquill-host mathquill-editable';
        el.insertAdjacentElement('afterend', host);
        el.classList.add('mq-source-input');

        const field = MQ.MathField(host, {
            spaceBehavesLikeTab: true,
            leftRightIntoCmdGoes: 'up',
            restrictMismatchedBrackets: true,
            supSubsRequireOperand: true,
            charsThatBreakOutOfSupSub: '+-=<>',
            autoSubscriptNumerals: false,
            autoCommands: 'pi theta sqrt nthroot',
            handlers: {
                edit: () => {
                    el.value = field.latex();
                }
            }
        });

        if (el.value) {
            field.latex(el.value);
        }
        mqFields[el.name] = field;
        mqKeyboards[el.name] = createMathKeyboard(field, el.name);
    });

    // Keep any untouched text inputs visible as plain fallback.
    document.querySelectorAll('input.student-input:not(.mq-source-input), textarea.student-textarea:not(.mq-source-input)').forEach((el) => {
        el.style.display = '';
    });
}

function createMathKeyboard(field, inputName) {
    const root = field.el();
    const keyboard = document.createElement('div');
    keyboard.className = 'math-keyboard';
    keyboard.setAttribute('data-math-keyboard-for', inputName);

    MATH_KEYS.forEach((key) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'math-key-btn';
        btn.textContent = key.label;
        btn.addEventListener('click', () => {
            if (quizSubmitted) {
                return;
            }
            field.focus();
            if (key.action === 'cmd') {
                field.cmd(key.value);
            } else {
                field.write(key.value);
            }
            const hiddenInput = document.querySelector(`[name="${inputName}"]`);
            if (hiddenInput) {
                hiddenInput.value = field.latex();
            }
        });
        keyboard.appendChild(btn);
    });

    root.insertAdjacentElement('afterend', keyboard);
    return keyboard;
}

function getTextAnswer(name) {
    const mq = mqFields[name];
    if (mq) {
        return mq.latex();
    }

    const input = document.querySelector(`[name="${name}"]`);
    return input ? input.value : '';
}

function lockMathInputs() {
    Object.values(mqFields).forEach((field) => {
        field.blur();
        const root = field.el();
        if (root && root.classList) {
            root.classList.add('mq-locked');
        }
    });

    Object.values(mqKeyboards).forEach((keyboard) => {
        keyboard.classList.add('disabled');
        keyboard.querySelectorAll('button').forEach((btn) => {
            btn.disabled = true;
        });
    });
}

function normalizeAnswer(value) {
    if (value == null) {
        return '';
    }
    const ascii = latexToComparable(value);

    return String(ascii)
        .toLowerCase()
        .trim()
        .replace(/\u2212/g, '-')
        .replace(/\s+/g, '')
        .replace(/,\s*/g, ',')
        .replace(/\$/g, '')
        .replace(/\\times/g, 'x');
}

function getFeedbackMessage(score, total) {
    const percent = total === 0 ? 0 : (score / total) * 100;

    if (percent === 100) {
        return 'Outstanding work. Perfect score and excellent consistency across all topics.';
    }
    if (percent >= 80) {
        return 'Excellent effort. You showed strong understanding in most areas.';
    }
    if (percent >= 60) {
        return 'Great effort. You have a solid base and are close to mastering these questions.';
    }
    if (percent >= 40) {
        return 'Good persistence. Keep going and focus on the revision topics listed below.';
    }
    return 'Well done for completing the quiz. Review the revision topics and try again for a stronger result.';
}

function populateTopicList(listId, topics, emptyMessage) {
    const list = document.getElementById(listId);
    list.innerHTML = '';

    if (topics.length === 0) {
        const li = document.createElement('li');
        li.textContent = emptyMessage;
        list.appendChild(li);
        return;
    }

    topics.forEach((topic) => {
        const li = document.createElement('li');
        li.textContent = topic;
        list.appendChild(li);
    });
}

function populateMissedQuestionList(items) {
    const list = document.getElementById('improvement-list');
    list.innerHTML = '';

    if (items.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Excellent. No missed topics to revise.';
        list.appendChild(li);
        return;
    }

    items.forEach((item) => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#question-${item.key}`;
        link.textContent = `Q${item.number} - ${item.topic}`;
        li.appendChild(link);
        list.appendChild(li);
    });
}

function scrollToFeedback() {
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function formatTimestamp(date) {
    const pad = (n) => String(n).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());

    return {
        display: `${day}/${month}/${year} ${hour}:${minute}:${second}`,
        fileSafe: `${year}${month}${day}-${hour}${minute}${second}`
    };
}

function answerTextForQuestion(question) {
    if (question.type === 'mcq') {
        return question.correct.toUpperCase();
    }
    if (Array.isArray(question.answers) && question.answers.length > 0) {
        return question.answers[0];
    }
    return '';
}

function isCorrectTextAnswer(inputValue, question) {
    const candidate = normalizeAnswer(inputValue);
    if (!candidate) {
        return false;
    }
    return (question.answers || []).some((answer) => normalizeAnswer(answer) === candidate);
}

async function downloadWrongQuestionsPdf() {
    if (wrongQuestionData.length === 0) {
        return;
    }

    const jsPdfGlobal = window.jspdf;
    if (!jsPdfGlobal || !jsPdfGlobal.jsPDF || typeof window.html2canvas !== 'function') {
        alert('PDF generator failed to load. Please refresh and try again.');
        return;
    }

    const { jsPDF } = jsPdfGlobal;
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const leftMargin = 10;
    const maxImageWidth = 190;
    let y = 12;
    const createdAt = new Date();
    const timestamp = formatTimestamp(createdAt);

    const stagingRoot = document.createElement('div');
    stagingRoot.style.position = 'fixed';
    stagingRoot.style.left = '-10000px';
    stagingRoot.style.top = '0';
    stagingRoot.style.width = '820px';
    stagingRoot.style.padding = '10px';
    stagingRoot.style.background = '#ffffff';
    document.body.appendChild(stagingRoot);

    const form = document.getElementById('quiz-form');

    try {
        doc.setFontSize(14);
        doc.text(`${window.quizConfig.pdfTitle} - Wrong Questions for Reattempt`, leftMargin, y);
        y += 7;

        doc.setFontSize(10);
        doc.text(`Created: ${timestamp.display}`, leftMargin, y);
        y += 7;
        doc.text(`Total questions: ${wrongQuestionData.length}`, leftMargin, y);
        y += 5;

        for (const item of wrongQuestionData) {
            const originalBlock = form.querySelector(`[data-key="${item.key}"]`);
            if (!originalBlock) {
                continue;
            }

            const cloneBlock = originalBlock.cloneNode(true);
            cloneBlock.querySelectorAll('.correct-answer-display, .rationale').forEach((el) => el.remove());
            cloneBlock.querySelectorAll('.math-keyboard').forEach((el) => el.remove());
            cloneBlock.querySelectorAll('input[type="radio"]').forEach((input) => {
                input.checked = false;
                input.disabled = false;
            });
            cloneBlock.querySelectorAll('input[type="text"], textarea').forEach((input) => {
                input.value = '';
                input.disabled = false;
            });

            stagingRoot.appendChild(cloneBlock);
            cloneBlock.querySelectorAll('mjx-assistive-mml').forEach((el) => el.remove());

            const canvas = await window.html2canvas(cloneBlock, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = maxImageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (y + imgHeight > pageHeight - 10) {
                doc.addPage();
                y = 12;
            }

            doc.addImage(imgData, 'PNG', leftMargin, y, imgWidth, imgHeight);
            y += imgHeight + 5;
            stagingRoot.removeChild(cloneBlock);
        }

        doc.addPage();
        y = 14;
        doc.setFontSize(14);
        doc.text('Correct Answers for Selected Questions', leftMargin, y);
        y += 8;
        doc.setFontSize(10);
        doc.text(`Created: ${timestamp.display}`, leftMargin, y);
        y += 8;

        for (const item of wrongQuestionData) {
            const line = `Q${item.number}: ${item.correctAnswerText}`;
            const wrapped = doc.splitTextToSize(line, 186);

            if (y + (wrapped.length * 5) > pageHeight - 10) {
                doc.addPage();
                y = 14;
            }

            doc.text(wrapped, leftMargin, y);
            y += (wrapped.length * 5) + 2;
        }

        doc.save(`${window.quizConfig.pdfFilePrefix}-wrong-questions-${timestamp.fileSafe}.pdf`);
    } finally {
        document.body.removeChild(stagingRoot);
    }
}

function submitQuiz() {
    if (quizSubmitted) {
        return;
    }

    const config = window.quizConfig;
    const questionKeys = Object.keys(config.questions);
    let score = 0;
    const totalQuestions = questionKeys.length;
    const strengthsSet = new Set();
    wrongQuestionData = [];
    window.wrongQuestionData = wrongQuestionData;
    quizSubmitted = true;

    document.querySelectorAll('input, textarea').forEach((el) => {
        el.disabled = true;
    });
    lockMathInputs();

    questionKeys.forEach((key) => {
        const question = config.questions[key];
        const answerDisplay = document.getElementById(`ans-${key}`);
        const rationaleDisplay = document.getElementById(`rat-${key}`);
        const questionBlock = document.querySelector(`[data-key="${key}"]`);

        if (questionBlock) {
            questionBlock.id = `question-${key}`;
        }

        answerDisplay.style.display = 'block';
        rationaleDisplay.style.display = 'block';

        let isCorrect = false;
        let wasAnswered = false;
        let chosenText = '';

        if (question.type === 'mcq') {
            const selected = document.querySelector(`input[name="${key}"]:checked`);
            if (selected) {
                wasAnswered = true;
                chosenText = selected.value.toUpperCase();
                isCorrect = selected.value === question.correct;
            }
        } else {
            const value = getTextAnswer(key);
            if (value && value.trim().length > 0) {
                wasAnswered = true;
                chosenText = value.trim();
                isCorrect = isCorrectTextAnswer(value, question);
            }
        }

        if (isCorrect) {
            score++;
            strengthsSet.add(question.topic);
            answerDisplay.style.color = '#388e3c';
            answerDisplay.innerHTML = '✓ ' + answerDisplay.innerHTML;
        } else {
            wrongQuestionData.push({
                key,
                number: question.number,
                topic: question.topic,
                correctAnswerText: answerTextForQuestion(question)
            });

            if (wasAnswered) {
                answerDisplay.style.color = '#d32f2f';
                answerDisplay.innerHTML = '✗ ' + answerDisplay.innerHTML + ` (You entered: ${chosenText})`;
            } else {
                answerDisplay.style.color = '#f57c00';
                answerDisplay.innerHTML = '⚠ Unanswered. ' + answerDisplay.innerHTML;
            }
        }
    });

    window.currentQuizScore = score;
    document.getElementById('score').innerText = score;
    document.getElementById('feedback-summary').innerText = getFeedbackMessage(score, totalQuestions);

    populateTopicList(
        'strengths-list',
        Array.from(strengthsSet),
        'No fully-correct topics this time. Keep practising and try another attempt.'
    );
    populateMissedQuestionList(wrongQuestionData);

    window.wrongQuestionData = wrongQuestionData;

    const pdfButton = document.getElementById('download-wrong-pdf');
    if (wrongQuestionData.length > 0) {
        pdfButton.style.display = 'block';
        pdfButton.onclick = downloadWrongQuestionsPdf;
    }

    const backToFeedbackButton = document.getElementById('back-to-feedback-btn');
    backToFeedbackButton.style.display = 'block';
    backToFeedbackButton.onclick = scrollToFeedback;

    document.getElementById('results').style.display = 'block';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });

    const submitButton = document.getElementById('submit-btn');
    if (submitButton) {
        submitButton.style.display = 'none';
    }
}

window.submitQuiz = submitQuiz;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await ensureMathQuillAssets();
        initMathInputs();
    } catch (err) {
        // Fall back to plain inputs when MathQuill fails to load.
        console.warn('MathQuill unavailable. Using plain text inputs.', err);
        document.querySelectorAll('.student-input, .student-textarea').forEach((el) => {
            el.style.display = '';
        });
    }
});
