document.getElementById('year').textContent = new Date().getFullYear();

let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let selectedQuizType = '';

// Ensure the "Start New Quiz" button is hidden initially
document.getElementById('startNewQuizButton').style.display = 'none';
console.log('Start New Quiz button initially hidden.');

function updateButtonText() {
    const quizTypeSelect = document.getElementById('quizTypeSelect');
    const startButton = document.getElementById('startButton');
    selectedQuizType = quizTypeSelect.value;

    if (selectedQuizType) {
        // Enable the button when a quiz is selected
        startButton.disabled = false;

        // Add a 200ms delay before updating the text and color together
        setTimeout(function () {
            // Update both text and color after the delay
            startButton.textContent = `Start ${selectedQuizType.charAt(0).toUpperCase() + selectedQuizType.slice(1)} Quiz`;
            startButton.style.backgroundColor = "#425968"; // Active background color
            startButton.style.color = "#a9d3e8"; // Active font color
        }, 200); // Delay for both color and text change

    } else {
        // Reset the button appearance and disable it if no quiz type is selected
        startButton.disabled = true;
        startButton.textContent = "Select a Quiz Type";
        startButton.style.backgroundColor = "#ccc"; // Disabled background color
        startButton.style.color = "#666"; // Disabled font color
    }
}

// Ensure the "Start Quiz" button triggers the quiz correctly
document.getElementById('startButton').addEventListener('click', startQuiz);

// Fetch quiz data and start the quiz
function startQuiz(event) {
    event.preventDefault(); // Prevent form submission and page refresh
    const filePath = `js/json/quizzes/${selectedQuizType}-quiz.json`;
    document.getElementById('feedbackMessage').textContent = 'Loading quiz...'; // Show loading message
    fetch(filePath)
        .then(response => response.json())
        .then(data => {
            questions = data.questions;
            questions = getRandomQuestions(questions, 10); // Get 10 random questions
            currentQuestionIndex = 0;
            score = 0;
            displayQuestion();
            document.getElementById('quizTypeSection').style.display = 'none';
            document.getElementById('quizSection').style.display = 'block';
            document.getElementById('scoreCard').style.display = 'none'; // Hide scorecard initially
            console.log('Quiz started. Hiding the "Start New Quiz" button.');
            // Make sure the Start New Quiz button is hidden before quiz starts
            document.getElementById('startNewQuizButton').style.display = 'none';
        })
        .catch(error => {
            document.getElementById('feedbackMessage').textContent = 'Sorry, we couldn’t load the quiz data. Please try again later.';
        });
}

// Fisher-Yates shuffle to randomize the array
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
        [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
    }
    return arr;
}

// Randomize the order and pick 10 random questions from the pool
function getRandomQuestions(arr, num) {
    const shuffled = shuffleArray([...arr]); // Shuffle a copy of the array
    return shuffled.slice(0, num); // Get first 'num' questions
}

// Display current question
function displayQuestion() {
    const currentQuestion = questions[currentQuestionIndex];

    // Shuffle the answer options for the current question and store original indices
    const shuffledOptions = shuffleArray([...currentQuestion.options]);
    const correctOptionIndex = shuffledOptions.indexOf(currentQuestion.answer); // Find the index of the correct answer after shuffling

    // Store the original index of the correct answer in the current question
    currentQuestion.shuffledAnswerIndex = correctOptionIndex;

    document.getElementById('questionNumber').textContent = `Question ${currentQuestionIndex + 1}`;
    const questionContainer = document.getElementById('questionContainer');
    questionContainer.innerHTML = `
        <p>${currentQuestion.question}</p>
        ${shuffledOptions.map((option, index) => {
            return `<button class="answerButton" onclick="checkAnswer(${index})">${option}</button>`;
        }).join('')}
    `;
    toggleNavigationButtons(); // Toggle navigation buttons
    document.getElementById('feedbackMessage').textContent = ''; // Reset feedback message
    clearButtonStyles(); // Clear any previous button styles
}

// Check answer
function checkAnswer(selectedOptionIndex) {
    const currentQuestion = questions[currentQuestionIndex];
    const selectedButton = document.querySelectorAll('.answerButton')[selectedOptionIndex];

    // Check if the selected answer matches the correct answer
    if (selectedOptionIndex === currentQuestion.shuffledAnswerIndex) {
        score++;
        selectedButton.classList.add('correct');
        document.getElementById('feedbackMessage').textContent = 'Correct!';
    } else {
        selectedButton.classList.add('incorrect');
        document.getElementById('feedbackMessage').textContent = 'Incorrect!';
    }

    // Check if it's the last question after answering, and show the scorecard if it is
    if (currentQuestionIndex === questions.length - 1) {
        endQuiz(); // Directly call endQuiz after the last question
    } else {
        toggleNavigationButtons(); // Update visibility of navigation buttons
    }
}

// Clear button styles
function clearButtonStyles() {
    const buttons = document.querySelectorAll('.answerButton');
    buttons.forEach(button => {
        button.classList.remove('correct', 'incorrect');
    });
}

// Toggle next/prev buttons visibility
function toggleNavigationButtons() {
    const nextButton = document.getElementById('nextButton');
    const prevButton = document.getElementById('prevButton');
    nextButton.style.display = currentQuestionIndex < questions.length - 1 ? 'inline-block' : 'none';
    prevButton.style.display = currentQuestionIndex > 0 ? 'inline-block' : 'none';
}

// Go to next question
function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        endQuiz();  // Ensure endQuiz is called after the last question
    }
}

// Go to previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

// End the quiz and show the scorecard
function endQuiz() {
    console.log('End Quiz Triggered');
    
    // Calculate percentage
    const percentage = Math.round((score / questions.length) * 100);
    console.log(`Score: ${score} / ${questions.length}, Percentage: ${percentage}%`);

    // Show the scorecard
    const scoreCardElement = document.getElementById('scoreCard');
    scoreCardElement.style.display = 'block';  // Ensure the score card is shown
    console.log('Scorecard should be visible now.');

    // Clear previous content in the scoreCard, in case there is anything left from previous quizzes
    scoreCardElement.innerHTML = '';  // This removes all existing content inside #scoreCard

    // Add the final score message
    const finalScoreElement = document.createElement('h3');
    finalScoreElement.textContent = `Your score: ${score} / ${questions.length}`;
    scoreCardElement.appendChild(finalScoreElement); // Append the new score text

    // Accuracy feedback
    const accuracyElement = document.createElement('p');
    if (percentage === 100) {
        accuracyElement.textContent = `Accuracy: 100% correct! 🎉`;
    } else if (percentage >= 80) {
        accuracyElement.textContent = `Accuracy: ${percentage}% (Great job!)`;
    } else if (percentage >= 50) {
        accuracyElement.textContent = `Accuracy: ${percentage}% (Good effort!)`;
    } else {
        accuracyElement.textContent = `Accuracy: ${percentage}% (Keep trying! You'll get it next time!)`;
    }
    scoreCardElement.appendChild(accuracyElement); // Append the accuracy feedback

    // Show the "Start New Quiz" button after the quiz ends
    const startNewQuizButton = document.getElementById('startNewQuizButton');
    console.log("Displaying 'Start New Quiz' button...");

    // Use direct styling to show the button
    startNewQuizButton.style.display = 'inline-block';
    
    // Check if the button's display style was correctly updated
    console.log('Start New Quiz button display:', startNewQuizButton.style.display);

    // Ensure that the computed styles reflect the correct visibility
    const computedStyle = window.getComputedStyle(startNewQuizButton);
    console.log('Computed display style:', computedStyle.display);

    // Hide navigation buttons after the quiz is finished
    const nextButton = document.getElementById('nextButton');
    const prevButton = document.getElementById('prevButton');
    nextButton.style.display = 'none';
    prevButton.style.display = 'none';
    
    // Clear feedback and reset button styles
    document.getElementById('feedbackMessage').textContent = '';  // Clear feedback message
    clearButtonStyles(); // Clear any button styles
}

// Function to reset and start a new quiz
function startNewQuiz() {
    console.log('Starting New Quiz...');
    
    // Reset the state
    currentQuestionIndex = 0;
    score = 0;
    questions = [];
    selectedQuizType = '';
    
    // Hide the score card and the "Start New Quiz" button
    document.getElementById('scoreCard').style.display = 'none';  // Ensure score card is hidden
    document.getElementById('startNewQuizButton').style.display = 'none';
    
    // Show the quiz type selection again
    document.getElementById('quizTypeSection').style.display = 'block';
    document.getElementById('quizSection').style.display = 'none';
    
    // Reset the "Start Quiz" button
    const startButton = document.getElementById('startButton');
    startButton.disabled = true;
    startButton.textContent = "Please choose a quiz category";

    // Reset feedback message
    document.getElementById('feedbackMessage').textContent = '';
}