// Globale variabelen
let selectedDan = null;
let selectedCategory = null;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let technieken = {};
let examinatorVragen = {};

// Laad JSON data
async function loadData() {
    try {
        // Laad technieken.json
        const techniekenResponse = await fetch('technieken.json');
        technieken = await techniekenResponse.json();
        
        // Laad examinatorvragen.json
        const vragenResponse = await fetch('examinatorvragen.json');
        const vragenData = await vragenResponse.json();
        
        // Converteer examinatorvragen naar bruikbaar formaat
        examinatorVragen = {};
        vragenData.dan_eisen.forEach(dan => {
            const danNum = dan.dan_eis.toString();
            examinatorVragen[danNum] = {};
            
            dan.categorieën.forEach(cat => {
                examinatorVragen[danNum][cat.categorie] = cat.vragen;
            });
        });
        
        console.log('Data succesvol geladen');
    } catch (error) {
        console.error('Fout bij laden van data:', error);
        alert('Kon de data niet laden. Zorg ervoor dat technieken.json en examinatorvragen.json in dezelfde map staan.');
    }
}

// Selecteer dan niveau
function selectDan(dan) {
    selectedDan = dan;
    document.getElementById('setupScreen').classList.add('hidden');
    document.getElementById('categoryScreen').classList.remove('hidden');
}

// Selecteer categorie
function selectCategory(category) {
    selectedCategory = category;
    document.getElementById('startBtn').classList.remove('hidden');
}

// Genereer quiz vragen
function generateQuestions() {
    questions = [];
    const availableTechniques = [];
    
    // Verzamel beschikbare technieken op basis van dan niveau
    for (let i = 1; i <= selectedDan; i++) {
        const danTechnieken = technieken[i.toString()][selectedCategory];
        if (danTechnieken) {
            availableTechniques.push(...danTechnieken.map(t => ({
                ...t,
                danLevel: i
            })));
        }
    }
    
    // Shuffle technieken
    const shuffledTechniques = shuffleArray([...availableTechniques]);
    
    // Selecteer 8 techniek vragen
    for (let i = 0; i < 8 && i < shuffledTechniques.length; i++) {
        questions.push({
            type: 'technique',
            data: shuffledTechniques[i]
        });
    }
    
    // Verzamel examinator vragen
    const examinatorQuestions = [];
    for (let i = 1; i <= selectedDan; i++) {
        const danVragen = examinatorVragen[i.toString()][selectedCategory];
        if (danVragen) {
            examinatorQuestions.push(...danVragen);
        }
    }
    
    // Shuffle en selecteer 4 examinator vragen
    const shuffledExaminator = shuffleArray([...examinatorQuestions]);
    for (let i = 0; i < 4 && i < shuffledExaminator.length; i++) {
        questions.push({
            type: 'examinator',
            data: shuffledExaminator[i]
        });
    }
    
    // Shuffle alle vragen
    questions = shuffleArray(questions);
}

// Helper functie om array te shufflen
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Start quiz
function startQuiz() {
    generateQuestions();
    currentQuestionIndex = 0;
    score = 0;
    
    document.getElementById('categoryScreen').classList.add('hidden');
    document.getElementById('quizScreen').classList.remove('hidden');
    
    showQuestion();
}

// Toon vraag
function showQuestion() {
    const question = questions[currentQuestionIndex];
    
    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('questionCounter').textContent = `Vraag ${currentQuestionIndex + 1} van ${questions.length}`;
    
    // Reset visibility
    document.getElementById('techniqueQuestion').classList.add('hidden');
    document.getElementById('examinatorQuestion').classList.add('hidden');
    document.getElementById('imageContainer').classList.add('hidden');
    document.getElementById('showImageBtn').classList.remove('hidden');
    
    if (question.type === 'technique') {
        // Toon techniek vraag
        document.getElementById('techniqueQuestion').classList.remove('hidden');
        document.getElementById('techniqueName').textContent = question.data.techniek;
        document.getElementById('techniqueImage').src = question.data.afbeelding_url;
    } else {
        // Toon examinator vraag
        document.getElementById('examinatorQuestion').classList.remove('hidden');
        document.getElementById('examinatorText').textContent = question.data;
    }
}

// Toon afbeelding
function showImage() {
    document.getElementById('showImageBtn').classList.add('hidden');
    document.getElementById('imageContainer').classList.remove('hidden');
}

// Beantwoord vraag
function answerQuestion(answer) {
    if (answer) {
        score++;
    }
    
    currentQuestionIndex++;
    
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

// Toon resultaten
function showResults() {
    document.getElementById('quizScreen').classList.add('hidden');
    document.getElementById('resultsScreen').classList.remove('hidden');
    
    // Bepaal band kleur op basis van score
    const beltData = getBeltByScore(score);
    
    document.getElementById('scoreName').textContent = `${score} van ${questions.length} technieken`;
    document.getElementById('beltName').textContent = beltData.name;
    
    const beltIcon = document.getElementById('beltIcon');
    beltIcon.className = 'belt-icon ' + beltData.class;
    beltIcon.textContent = beltData.emoji;
}

// Bepaal band op basis van score
function getBeltByScore(score) {
    if (score === 0) return { name: 'Witte Band', class: 'belt-white', emoji: '⚪' };
    if (score === 2) return { name: 'Gele Band', class: 'belt-yellow', emoji: '🟡' };
    if (score === 4) return { name: 'Oranje Band', class: 'belt-orange', emoji: '🟠' };
    if (score === 6) return { name: 'Groene Band', class: 'belt-green', emoji: '🟢' };
    if (score === 8) return { name: 'Blauwe Band', class: 'belt-blue', emoji: '🔵' };
    if (score === 10) return { name: 'Bruine Band', class: 'belt-brown', emoji: '🟤' };
    if (score === 12) return { name: 'Zwarte Band', class: 'belt-black', emoji: '⚫' };
    
    // Fallback voor tussenliggende scores
    if (score >= 11) return { name: 'Zwarte Band', class: 'belt-black', emoji: '⚫' };
    if (score >= 9) return { name: 'Bruine Band', class: 'belt-brown', emoji: '🟤' };
    if (score >= 7) return { name: 'Blauwe Band', class: 'belt-blue', emoji: '🔵' };
    if (score >= 5) return { name: 'Groene Band', class: 'belt-green', emoji: '🟢' };
    if (score >= 3) return { name: 'Oranje Band', class: 'belt-orange', emoji: '🟠' };
    if (score >= 1) return { name: 'Gele Band', class: 'belt-yellow', emoji: '🟡' };
    
    return { name: 'Witte Band', class: 'belt-white', emoji: '⚪' };
}

// Reset quiz
function resetQuiz() {
    selectedDan = null;
    selectedCategory = null;
    questions = [];
    currentQuestionIndex = 0;
    score = 0;
    
    document.getElementById('resultsScreen').classList.add('hidden');
    document.getElementById('setupScreen').classList.remove('hidden');
    document.getElementById('startBtn').classList.add('hidden');
}

// Laad data bij pagina load
window.addEventListener('DOMContentLoaded', loadData);