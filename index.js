/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from '@google/genai';
// @ts-ignore
const API_KEY = window.API_KEY;
if (!API_KEY) {
    console.error("API_KEY environment variable not set.");
    const statusArea = document.getElementById('status-area');
    if (statusArea) {
        statusArea.textContent = 'Configuration error: API Key is missing. Please contact support.';
    }
    // Disable functionality if API key is missing
    const beginButton = document.getElementById('begin-journey-button');
    if (beginButton)
        beginButton.disabled = true;
}
const ai = new GoogleGenAI({ apiKey: API_KEY });
// Step Containers
const welcomeStep = document.getElementById('welcome-step');
const transformationChoiceStep = document.getElementById('transformation-choice-step');
const questionsStep = document.getElementById('questions-step');
const roomDescriptionStep = document.getElementById('room-description-step');
const resultsStep = document.getElementById('results-step');
// Interactive Elements
const beginJourneyButton = document.getElementById('begin-journey-button');
const choiceButtons = document.querySelectorAll('.choice-button');
const questionsContainer = document.getElementById('questions-container');
const questionsTitle = document.getElementById('questions-title');
const nextToRoomDescriptionButton = document.getElementById('next-to-room-description-button');
const roomDescriptionInput = document.getElementById('room-description-input');
const getThemeIdeasButton = document.getElementById('get-theme-ideas-button');
// Display Areas
const responseArea = document.getElementById('response-area');
const statusArea = document.getElementById('status-area');
const headerSubtitle = document.getElementById('header-subtitle');
// After the responseArea is filled in handleFinalSubmit, show the new button
const getRoomChangesButton = document.getElementById('get-room-changes-button');
const roomImageUpload = document.getElementById('room-image-upload');
const aiImageResult = document.getElementById('ai-image-result');
let currentStep = 'welcome';
const userData = { questions: {} };
const SYSTEM_INSTRUCTION = `You are **"Theme You"**, a friendly and insightful AI assistant specializing in **personalized interior color therapy and design**.

Your purpose is to help users **transform their living or working space** based on:

1. 🧠 Personality type  
2. 🧘‍♀️ Mental wellness goals  
3. 🧭 Vastu principles  
4. 🎨 Trending modern aesthetics  
5. ✍️ Custom user preferences  

---

After receiving the user's inputs, here's what you must provide:

### 🎨 1. 2–3 Distinct Color Palette Suggestions
For each palette:
- List **main colors** with creative names (e.g., *Soft Mint*, *Cloud White*, *Warm Clay*).
- Describe the **mood or vibe** the palette creates (e.g., "promotes focus and balance").
- Explain why the colors work well together **based on the user's input**.

---

### 🛋️ 2. Optional Decor Ideas
Suggest 1–2 **theme directions or decor elements** (e.g., wood accents, light curtains, indoor plants) that:
- Complement the palette
- Align with the user's selected transformation type (e.g., Vastu, Wellness)

---

### 💡 3. Personalized Rationale (Explain WHY this fits them)
Tailor your response based on the selected user intent:

- 👤 *If Personality Type*: Match colors with traits (e.g., extrovert, introvert).
- 🧘 *If Mental Wellness*: Explain therapeutic effects (e.g., colors for anxiety, calm).
- 🧭 *If Vastu*: Suggest colors aligned to room direction and element (e.g., east–green/blue).
- ✨ *If Trend-Based*: Align with interior trends (e.g., Japandi, Scandi-pop).
- 🛠️ *If Custom*: Address the user's specific needs with practical color insight.

---

### 💬 Important Style Guidelines:
- Use a **warm, friendly, encouraging tone**
- Avoid jargon; explain simply if technical terms are used
- Use **markdown formatting** (headings, bold text, bullet points) to enhance readability
- Keep answers **visually clear** and **actionable**
- Do **not** ask for image uploads — rely only on the user's room description

---

Example Response Structure:

**Palette 1: Calm Focus**  
- *Colors:* Misty Blue, Vanilla Beige, Olive Gray  
- *Mood:* Grounded, fresh, and calm — great for a work+relax room  
- *Why This Works:* Your introverted personality and desire for focus led to this palette. These colors soften overstimulation and help maintain clarity.

Let your colors tell your story — *Theme You* is here to paint your space with purpose. 🎨✨

`;
// Quiz step logic
const quizStepOrder = [
    'transformation-choice-step',
    'questions-step',
    'room-description-step',
    'results-step',
];
function showQuizStep(stepId) {
    quizStepOrder.forEach((id, idx) => {
        const el = document.getElementById(id);
        if (el)
            el.style.display = id === stepId ? '' : 'none';
    });
    // Progress bar and stepper
    const stepNum = quizStepOrder.indexOf(stepId) + 1;
    const totalSteps = quizStepOrder.length - 1; // Don't count results as a step
    const progress = document.getElementById('quiz-progress');
    const stepNumEl = document.getElementById('quiz-step-num');
    if (progress)
        progress.style.width = `${Math.min(stepNum, totalSteps) / totalSteps * 100}%`;
    if (stepNumEl)
        stepNumEl.textContent = `${Math.min(stepNum, totalSteps)}`;
}
function updateUIForStep(step) {
    currentStep = step;
    [welcomeStep, transformationChoiceStep, questionsStep, roomDescriptionStep, resultsStep].forEach(s => s?.classList.add('hidden'));
    if (statusArea)
        statusArea.textContent = ''; // Clear status on step change
    switch (step) {
        case 'welcome':
            welcomeStep?.classList.remove('hidden');
            if (headerSubtitle)
                headerSubtitle.textContent = "Your personal guide to a beautifully themed space.";
            break;
        case 'transformationChoice':
            transformationChoiceStep?.classList.remove('hidden');
            if (headerSubtitle)
                headerSubtitle.textContent = "Let's start with your core inspiration.";
            break;
        case 'questions':
            questionsStep?.classList.remove('hidden');
            renderQuestions();
            break;
        case 'roomDescription':
            roomDescriptionStep?.classList.remove('hidden');
            if (headerSubtitle)
                headerSubtitle.textContent = "Tell us about the canvas for your transformation.";
            roomDescriptionInput?.focus();
            break;
        case 'results':
            resultsStep?.classList.remove('hidden');
            if (headerSubtitle)
                headerSubtitle.textContent = "Here are your personalized suggestions!";
            break;
    }
}
function createQuestionElement(id, labelText, type, options) {
    const qDiv = document.createElement('div');
    qDiv.className = 'input-group';
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = labelText;
    qDiv.appendChild(label);
    let inputElement;
    if (type === 'textarea') {
        inputElement = document.createElement('textarea');
        inputElement.rows = 3;
    }
    else if (type === 'select' && options) {
        inputElement = document.createElement('select');
        options.forEach(opt => {
            const optionEl = document.createElement('option');
            optionEl.value = opt.value;
            optionEl.textContent = opt.text;
            inputElement.appendChild(optionEl);
        });
    }
    else {
        inputElement = document.createElement('input');
        inputElement.type = 'text';
    }
    inputElement.id = id;
    inputElement.name = id;
    qDiv.appendChild(inputElement);
    return qDiv;
}
function renderQuestions() {
    if (!questionsContainer || !questionsTitle || !userData.transformationType)
        return;
    questionsContainer.innerHTML = ''; // Clear previous questions
    userData.questions = {}; // Reset stored answers for this section
    let questionsConfig = [];
    let titleText = '';
    switch (userData.transformationType) {
        case 'personality':
            titleText = '🌟 Understanding Your Vibe';
            questionsConfig = [
                { id: 'personality-scale', label: 'How would you describe yourself? (1: Calm | 5: Energetic)', type: 'select', options: Array.from({ length: 5 }, (_, i) => ({ value: (i + 1).toString(), text: (i + 1).toString() })) },
                { id: 'color-preference', label: 'Do you prefer light or bold colors?', type: 'text' },
                { id: 'current-mood', label: "What's your current mood most days? (Happy / Anxious / Focused / Tired / Balanced)", type: 'text' },
                { id: 'room-reflection', label: 'Would you like your room to reflect your work personality or your relaxed self?', type: 'text' },
                { id: 'favorite-color', label: "What's your favorite color and why?", type: 'textarea' },
            ];
            break;
        case 'wellness':
            titleText = '🧘 Aligning Space with Mind';
            questionsConfig = [
                { id: 'wellness-goal', label: 'Choose what you want your room to support:', type: 'select', options: [
                        { value: 'sleep', text: 'Better Sleep' }, { value: 'productivity', text: 'Productivity' },
                        { value: 'focus', text: 'Focus' }, { value: 'emotional-balance', text: 'Emotional Balance' },
                        { value: 'creativity', text: 'Creativity' }
                    ] },
                { id: 'current-space-impact', label: 'Do you feel your current space is helping or hurting your mental health?', type: 'textarea' },
            ];
            break;
        case 'vastu':
            titleText = '🧭 Designing with Ancient Wisdom';
            questionsConfig = [
                { id: 'room-direction', label: 'Which direction does your room face? (North / South / East / West / Unsure)', type: 'text' },
                { id: 'room-type-vastu', label: 'Is this a bedroom, living room, kitchen, or workspace?', type: 'text' },
                { id: 'vastu-goal', label: 'Would you like the design to enhance prosperity, peace, focus, or relationships?', type: 'text' },
                { id: 'vastu-current-practice', label: 'Do you follow Vastu currently? (Yes / No / Somewhat)', type: 'text' },
            ];
            break;
        case 'trend':
            titleText = "Let's Go Trendy!";
            questionsConfig = [
                { id: 'trend-theme', label: 'Choose a theme you like most:', type: 'select', options: [
                        { value: 'minimalist', text: 'Minimalist' }, { value: 'coastal', text: 'Coastal' },
                        { value: 'boho-chic', text: 'Boho Chic' }, { value: 'modern-dark', text: 'Modern Dark' },
                        { value: 'scandinavian', text: 'Scandinavian' }
                    ] },
                { id: 'trend-vibe', label: 'What kind of vibe do you want in your space? (Elegant / Cozy / Energetic / Serene)', type: 'text' },
            ];
            break;
        case 'custom':
            titleText = '✍️ Your Vision, Your Words';
            questionsConfig = [
                { id: 'custom-ideas', label: 'Great! Tell me in your own words what you want for your space:', type: 'textarea' },
            ];
            break;
    }
    questionsTitle.textContent = titleText;
    questionsConfig.forEach(q => {
        questionsContainer.appendChild(createQuestionElement(q.id, q.label, q.type, q.options));
    });
}
function collectQuestionAnswers() {
    if (!questionsContainer)
        return;
    userData.questions = {};
    const inputs = questionsContainer.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
        if (input instanceof HTMLInputElement ||
            input instanceof HTMLTextAreaElement ||
            input instanceof HTMLSelectElement) {
            userData.questions[input.id] = input.value;
        }
    });
}
// Show the button after results are generated
function showGetRoomChangesButton() {
    if (getRoomChangesButton) {
        getRoomChangesButton.style.display = 'block';
    }
}
// Hide the button and image result on new search
function hideGetRoomChangesButton() {
    if (getRoomChangesButton)
        getRoomChangesButton.style.display = 'none';
    if (roomImageUpload)
        roomImageUpload.style.display = 'none';
    if (aiImageResult)
        aiImageResult.innerHTML = '';
}
// Add event listener for the button
getRoomChangesButton?.addEventListener('click', () => {
    if (roomImageUpload) {
        roomImageUpload.style.display = 'block';
        roomImageUpload.value = '';
        roomImageUpload.click();
    }
});
async function resizeImage(file, maxSize) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target?.result) {
                return reject(new Error("FileReader did not read the file."));
            }
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                }
                else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error("Could not get canvas context."));
                }
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    }
                    else {
                        reject(new Error("Canvas to Blob conversion failed."));
                    }
                }, 'image/jpeg');
            };
            img.onerror = (err) => reject(err);
            img.src = event.target.result;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}
roomImageUpload?.addEventListener('change', async () => {
    const file = roomImageUpload.files?.[0];
    if (!file)
        return;
    if (aiImageResult) {
        aiImageResult.innerHTML = 'Resizing image and generating your new room... (This may take a moment)';
    }
    try {
        const resizedBlob = await resizeImage(file, 1024);
        const formData = new FormData();
        formData.append('prompt', 'A photo of the room, but transformed with the following design: ' + userData.roomDescription + '. Apply the color palette and theme suggestions from the AI recommendations.');
        formData.append('image', resizedBlob, 'image.jpg');
        // IMPORTANT: Replace this with your actual Cloudflare Worker URL after you deploy it.
        const workerUrl = 'https://theme-you-image-generator.themeyou123.workers.dev';
        const response = await fetch(workerUrl, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error(`AI Worker failed: ${response.status} ${response.statusText}`);
        }
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        if (aiImageResult) {
            aiImageResult.innerHTML = `<img src="${imageUrl}" alt="AI generated room" style="max-width:100%;margin-top:10px;" />`;
        }
    }
    catch (err) {
        if (aiImageResult) {
            aiImageResult.innerHTML = `<em>Failed to process image. Please try a different image or check the console.</em>`;
        }
        console.error(err);
    }
});
function markdownToHtml(md) {
    return md
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '<br/>')
        .replace(/\- (.*?)(?=\n|$)/g, '<li>$1</li>')
        .replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>');
}
async function handleFinalSubmit() {
    hideGetRoomChangesButton();
    if (!API_KEY) {
        if (statusArea)
            statusArea.textContent = 'API Key is not configured. Cannot process request.';
        return;
    }
    userData.roomDescription = roomDescriptionInput.value.trim();
    if (!userData.roomDescription) {
        if (statusArea)
            statusArea.textContent = 'Please describe your room.';
        roomDescriptionInput.focus();
        return;
    }
    if (responseArea)
        responseArea.textContent = '';
    // QUOTE ROTATOR
    const quotes = [
        "Color is a power which directly influences the soul.<br><span class='quote-author'>— Wassily Kandinsky</span>",
        "Colors, like features, follow the changes of the emotions.<br><span class='quote-author'>— Pablo Picasso</span>",
        "Colors express the main psychic functions of man.<br><span class='quote-author'>— Carl Jung</span>",
        "Color is a means of exerting direct influence on the soul.<br><span class='quote-author'>— Wassily Kandinsky</span>",
        "Color can sway thinking, change actions, and cause reactions.<br><span class='quote-author'>— Faber Birren (Color theorist)</span>",
        "Color helps to express light—not the physical phenomenon, but the only light that really exists, that in the artist's brain.<br><span class='quote-author'>— Henri Matisse</span>",
        "Color is a language that speaks to our emotions.<br><span class='quote-author'>— Unknown</span>",
        "Colours are the smiles of nature.<br><span class='quote-author'>— Leigh Hunt</span>",
        "The purest and most thoughtful minds are those which love color the most.<br><span class='quote-author'>— John Ruskin</span>",
        "Color is the place where our brain and the universe meet.<br><span class='quote-author'>— Paul Klee</span>",
        "The soul becomes dyed with the color of its thoughts.<br><span class='quote-author'>— Marcus Aurelius</span>",
        "Color is the music of the eyes.<br><span class='quote-author'>— Unknown</span>",
        "Colors have a profound effect on your mood, behavior, and stress levels.<br><span class='quote-author'>— Unknown</span>",
        "Colors, in essence, are nature's own language of healing.<br><span class='quote-author'>— Unknown</span>",
        "Light is the first color, the color that contains all others.<br><span class='quote-author'>— Goethe</span>"
    ];
    // Shuffle quotes array
    function shuffleQuotes(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    shuffleQuotes(quotes);
    let quoteIndex = 0;
    let quoteInterval;
    function showNextQuote() {
        if (statusArea) {
            statusArea.innerHTML = `<div class='loading-quote'>${quotes[quoteIndex]}</div>`;
        }
        quoteIndex = (quoteIndex + 1) % quotes.length;
    }
    showNextQuote();
    quoteInterval = window.setInterval(showNextQuote, 7000);
    getThemeIdeasButton.disabled = true;
    showQuizStep('results-step');
    let detailedPrompt = `User's transformation focus: ${userData.transformationType}.\n`;
    if (userData.questions && Object.keys(userData.questions).length > 0) {
        detailedPrompt += "Answers to specific questions:\n";
        for (const key in userData.questions) {
            detailedPrompt += `- ${key.replace(/-/g, ' ')}: ${userData.questions[key]}\n`;
        }
    }
    detailedPrompt += `\nRoom Description: \"${userData.roomDescription}\"\n\nPlease provide personalized color palette and theme suggestions based on all this information.`;
    try {
        const requestPayload = {
            model: 'gemini-2.5-flash-preview-04-17',
            contents: detailedPrompt,
            config: { systemInstruction: SYSTEM_INSTRUCTION },
        };
        const responseStream = await ai.models.generateContentStream(requestPayload);
        if (statusArea) {
            statusArea.textContent = '';
            if (typeof quoteInterval !== 'undefined')
                clearInterval(quoteInterval);
        }
        let firstChunkReceived = false;
        let resultText = '';
        for await (const chunk of responseStream) {
            if (!firstChunkReceived && (!('text' in chunk) || chunk.text === undefined || chunk.text.trim() === "")) {
                continue;
            }
            firstChunkReceived = true;
            if (chunk.text !== undefined) {
                resultText += chunk.text;
            }
        }
        if (responseArea) {
            responseArea.innerHTML = markdownToHtml(resultText.trim());
        }
        if (responseArea && resultText.trim() === "") {
            responseArea.innerHTML = "<em>Apologies, I couldn't generate specific suggestions this time. Could you try rephrasing or providing more details?</em>";
        }
        else {
            showGetRoomChangesButton();
        }
    }
    catch (error) {
        console.error('Error generating content:', error);
        if (statusArea) {
            statusArea.textContent = `Error: ${error instanceof Error ? error.message : 'An unknown error occurred.'}`;
        }
        if (responseArea) {
            responseArea.innerHTML = '<em>Failed to get response from AI. Please try again.</em>';
        }
    }
    finally {
        getThemeIdeasButton.disabled = false;
    }
}
// Event Listeners
beginJourneyButton?.addEventListener('click', () => {
    showQuizStep('transformation-choice-step');
});
choiceButtons.forEach(button => {
    button.addEventListener('click', () => {
        userData.transformationType = button.dataset.choice;
        showQuizStep('questions-step');
        renderQuestions();
    });
});
nextToRoomDescriptionButton?.addEventListener('click', () => {
    collectQuestionAnswers();
    // Basic validation: check if at least one question was answered for relevant types
    if (userData.transformationType !== 'custom' && userData.questions && Object.values(userData.questions).every(val => val.trim() === '')) {
        if (statusArea)
            statusArea.textContent = 'Please answer at least one question to help personalize your theme.';
        return;
    }
    if (userData.transformationType === 'custom' && (!userData.questions || !userData.questions['custom-ideas'] || userData.questions['custom-ideas'].trim() === '')) {
        if (statusArea)
            statusArea.textContent = 'Please describe your custom vision.';
        return;
    }
    showQuizStep('room-description-step');
});
getThemeIdeasButton?.addEventListener('click', async () => {
    await handleFinalSubmit();
    showQuizStep('results-step');
});
const testPrototypeBtn = document.getElementById('test-prototype-btn');
const comingSoonMain = document.querySelector('.coming-soon-main');
const quizSteps = document.getElementById('quiz-steps');
if (quizSteps)
    quizSteps.style.display = 'none';
if (comingSoonMain)
    comingSoonMain.style.display = '';
testPrototypeBtn?.addEventListener('click', () => {
    if (comingSoonMain)
        comingSoonMain.style.display = 'none';
    if (quizSteps)
        quizSteps.style.display = '';
    showQuizStep('transformation-choice-step');
});
const letsBeginBtn = document.getElementById('lets-begin-btn');
if (letsBeginBtn) {
    letsBeginBtn.addEventListener('click', () => {
        if (letsBeginBtn.parentElement)
            letsBeginBtn.parentElement.style.display = 'none';
        if (quizSteps)
            quizSteps.style.display = '';
        showQuizStep('transformation-choice-step');
    });
}
// Initial setup
if (API_KEY) {
    updateUIForStep('welcome');
}
else {
    if (welcomeStep)
        welcomeStep.classList.remove('hidden'); // Show welcome but button will be disabled
    if (beginJourneyButton)
        beginJourneyButton.disabled = true;
    if (statusArea)
        statusArea.innerHTML = '<strong>API Key Missing:</strong> Application features are limited. Please contact administrator.';
}
