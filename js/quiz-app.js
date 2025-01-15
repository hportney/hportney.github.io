document.getElementById('year').textContent = new Date().getFullYear();

let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let selectedQuizType = '';
let lastClickedAnswer = null;  // Track the last clicked answer
let isAnswerSelected = false;  // Flag to track if an answer was selected

// Ensure the "Start New Quiz" button is hidden initially
document.getElementById('startNewQuizButton').style.display = 'none';
console.log('Start New Quiz button initially hidden.');

function updateButtonText() {
    const quizTypeSelect = document.getElementById('quizTypeSelect');
    const startButton = document.getElementById('startButton');
    selectedQuizType = quizTypeSelect.value;

    if (selectedQuizType) {
        startButton.disabled = false;
        setTimeout(function () {
            startButton.textContent = `Start ${selectedQuizType.charAt(0).toUpperCase() + selectedQuizType.slice(1)} Quiz`;
            startButton.style.backgroundColor = "#425968"; // Active background color
            startButton.style.color = "#a9d3e8"; // Active font color
        }, 200);
    } else {
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
    event.preventDefault();
    const filePath = `js/json/quizzes/${selectedQuizType}-quiz.json`;
    document.getElementById('feedbackMessage').textContent = 'Loading quiz...';
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
            document.getElementById('startNewQuizButton').style.display = 'none'; // Hide "Start New Quiz" button
        })
        .catch(error => {
            document.getElementById('feedbackMessage').textContent = 'Sorry, we couldn’t load the quiz data. Please try again later.';
        });
}

// Fisher-Yates shuffle to randomize the array
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Randomize the order and pick 10 random questions from the pool
function getRandomQuestions(arr, num) {
    const shuffled = shuffleArray([...arr]);
    return shuffled.slice(0, num);
}

// Display current question
function displayQuestion() {
    const currentQuestion = questions[currentQuestionIndex];

    // Shuffle the answer options for the current question and store original indices
    const shuffledOptions = shuffleArray([...currentQuestion.options]);
    const correctOptionIndex = shuffledOptions.indexOf(currentQuestion.answer);

    // Store the original index of the correct answer in the current question
    currentQuestion.shuffledAnswerIndex = correctOptionIndex;

    document.getElementById('questionNumber').textContent = `Question ${currentQuestionIndex + 1}`;
    const questionContainer = document.getElementById('questionContainer');
    questionContainer.innerHTML = `
        <p>${currentQuestion.question}</p>
        ${shuffledOptions.map((option, index) => {
            return `<button class="answerButton" onclick="checkAnswer(${index}, this)">${option}</button>`;
        }).join('')}
    `;
    toggleNavigationButtons();
    resetFeedbackMessage();
    checkForFinalQuestion(); // Check if this is the last question
    isAnswerSelected = false; // Reset answer selection state
}

// Reset the feedback message styles before displaying the next question
function resetFeedbackMessage() {
    const feedbackMessage = document.getElementById('feedbackMessage');
    feedbackMessage.textContent = '';
    feedbackMessage.style.backgroundColor = '';
    feedbackMessage.style.color = '';
    feedbackMessage.style.textShadow = '';
    feedbackMessage.style.opacity = 1; // Ensure it's fully visible initially
    feedbackMessage.style.visibility = 'hidden'; // Ensure visibility is controlled programmatically
}

// Check answer
function checkAnswer(selectedOptionIndex, buttonElement) {
    if (lastClickedAnswer !== null && lastClickedAnswer !== selectedOptionIndex) {
        // Hide the previous feedback if user changes their answer
        resetFeedbackMessage();
    }

    const currentQuestion = questions[currentQuestionIndex];
    const feedbackMessage = document.getElementById('feedbackMessage');
    const finalAnswerReminderElement = document.getElementById('finalAnswerReminder');  // Find the reminder message element

    // Highlight the clicked button
    buttonElement.classList.add('clicked');
    lastClickedAnswer = selectedOptionIndex;

    // Show feedback for this answer
    if (selectedOptionIndex === currentQuestion.shuffledAnswerIndex) {
        feedbackMessage.textContent = 'Correct!';
        feedbackMessage.style.color = '#FFFFFF';
        feedbackMessage.style.backgroundColor = 'rgba(76, 175, 80, 0.8)';
    } else {
        feedbackMessage.textContent = 'Incorrect!';
        feedbackMessage.style.color = '#FFFFFF';
        feedbackMessage.style.backgroundColor = 'rgba(244, 67, 54, 0.8)';
    }

    // Ensure feedback is visible for 3 seconds
    feedbackMessage.style.visibility = 'visible';
    feedbackMessage.style.transition = 'opacity 1s ease-out';
    feedbackMessage.style.opacity = 1;

    // Wait for 3 seconds before starting to fade out
    setTimeout(function() {
        feedbackMessage.style.transition = 'opacity 1s ease-out';
        feedbackMessage.style.opacity = 0;
    }, 3000); // Delay the fade out for 3 seconds

    // Hide the final question reminder message (if any)
    if (finalAnswerReminderElement && finalAnswerReminderElement.style.visibility === 'visible') {
        finalAnswerReminderElement.style.visibility = 'hidden';
        finalAnswerReminderElement.style.opacity = '0';
    }

    // Mark that an answer has been selected
    isAnswerSelected = true;
}

// Proceed to the next question immediately, and fade-out the feedback in the background
function nextQuestion() {
    console.log('nextQuestion function called'); // Debugging to check if the function is invoked

    const answerSelectionReminderElement = document.getElementById('answerSelectionReminder');

    // Check if an answer is selected
    if (!isAnswerSelected) {
        // If no answer is selected, show the reminder message and prevent moving forward
        console.log('No answer selected. Showing reminder message.');
        answerSelectionReminderElement.textContent = "Please select an answer before moving to the next question.";
        answerSelectionReminderElement.style.visibility = 'visible';  // Make it visible
        answerSelectionReminderElement.style.opacity = '1';  // Ensure it's fully visible
        return;  // Prevent moving to the next question
    } else {
        // If an answer is selected, hide the reminder message
        console.log('Answer selected. Hiding reminder message.');
        answerSelectionReminderElement.style.visibility = 'hidden';
        answerSelectionReminderElement.style.opacity = '0';
    }

    // Get all the answer buttons for the current question
    const currentQuestionOptions = document.querySelectorAll('.answerButton');  // Adjusted to select all answer buttons

    // Loop through the options to find the selected (clicked) answer
    let selectedAnswer = null;
    currentQuestionOptions.forEach((option) => {
        if (option.classList.contains('clicked')) {
            selectedAnswer = option.textContent; // Assuming the answer's text is its value
        }
    });

    console.log('Selected Answer:', selectedAnswer); // Log the selected answer

    if (selectedAnswer) {
        const currentQuestion = questions[currentQuestionIndex];

        // Check if the selected answer is correct
        if (selectedAnswer === currentQuestion.answer) {
            score++;
            console.log('Answer is correct. Incrementing score.');
        }
    }

    // Proceed to the next question after checking the answer
    currentQuestionIndex++;  // Move to the next question
    console.log('currentQuestionIndex:', currentQuestionIndex);
    console.log('Total Questions:', questions.length);

    if (currentQuestionIndex < questions.length) {
        // Display the next question
        displayQuestion();
    } else {
        // End the quiz if it's the last question
        endQuiz();
    }

    // Clear any feedback message after proceeding
    const feedbackMessage = document.getElementById('feedbackMessage');
    feedbackMessage.style.visibility = 'hidden';
    feedbackMessage.style.opacity = '0';

    // Clear button selections
    currentQuestionOptions.forEach(option => {
        option.classList.remove('clicked');  // Remove clicked style
    });

    // Reset the flag to false for the next question
    isAnswerSelected = false;
}

function toggleNavigationButtons() {
    const nextButton = document.getElementById('nextButton');
    const prevButton = document.getElementById('prevButton');

    // Show next button if we're not on the last question, hide it otherwise
    nextButton.style.display = currentQuestionIndex < questions.length - 1 ? 'inline-block' : 'none';
    prevButton.style.display = currentQuestionIndex > 0 ? 'inline-block' : 'none';
}

// Check if it's the last question and display a submit button
function checkForFinalQuestion() {
    const nextButton = document.getElementById('nextButton');
    const buttonContainer = document.getElementById('buttonContainer'); // Use the correct ID
    let submitButton = document.getElementById('submitAllButton'); // Check if submit button already exists

    // Hide the next button if it's the last question
    if (currentQuestionIndex === questions.length - 1) {
        nextButton.style.display = 'none';

        // Create and append the submit button only if it doesn't exist
        if (!submitButton) {
            submitButton = document.createElement('button');
            submitButton.textContent = 'Submit All Answers';
            submitButton.id = 'submitAllButton';
            submitButton.onclick = endQuiz; // Call endQuiz when the button is clicked
            buttonContainer.appendChild(submitButton); // Append to the button container
        }
    } else {
        // Ensure the submit button is hidden if not on the last question
        if (submitButton) {
            submitButton.style.display = 'none';
        }
    }
}

// End the quiz and show the scorecard
function endQuiz() {
    console.log('endQuiz function called'); // Debugging

    // Get the final question (last question)
    const currentQuestion = questions[currentQuestionIndex];
    console.log('Current Question:', currentQuestion); // Log the current question

    // Check if the last question has an answer selected
    const currentQuestionOptions = document.querySelectorAll('.answerButton');
    const isAnswerSelected = Array.from(currentQuestionOptions).some(button => button.classList.contains('clicked'));
    console.log('Is Answer Selected:', isAnswerSelected); // Log whether the answer is selected

    // Get the final answer reminder element
    const finalAnswerReminderElement = document.getElementById('finalAnswerReminder');
    if (finalAnswerReminderElement) {
        // If the final question is not answered, show the final answer reminder message
        if (!isAnswerSelected && currentQuestionIndex === questions.length - 1) {
            finalAnswerReminderElement.textContent = "Please select an answer for the final question before retrieving your score.";
            finalAnswerReminderElement.style.visibility = 'visible';  // Make it visible
            finalAnswerReminderElement.style.opacity = '1';  // Make sure it's fully visible
            console.log('Final Answer Reminder Message Displayed'); // Log that the reminder was shown
            return;  // Prevent score retrieval until final answer is selected
        } else {
            // Hide the final answer reminder if the final answer is selected
            finalAnswerReminderElement.style.visibility = 'hidden';
            finalAnswerReminderElement.style.opacity = '0';
            console.log('Final Answer Reminder Message Hidden'); // Log that the reminder was hidden
        }
    } else {
        console.error('Error: #finalAnswerReminder element not found!');
        return; // Exit early to avoid proceeding with score calculation
    }

    // Proceed with calculating score if final question is answered
    const percentage = Math.round((score / questions.length) * 100);
    console.log('Final Score Percentage:', percentage); // Log the final score percentage

    // Find the scoreCard element
    const scoreCardElement = document.getElementById('scoreCard');

    // Check if the element exists
    if (!scoreCardElement) {
        console.error('Error: #scoreCard element not found!');
        return;
    }

    // Update scoreCard content and show it
    scoreCardElement.style.display = 'block';
    scoreCardElement.style.visibility = 'visible';
    scoreCardElement.innerHTML = `<h3>Your Score: ${score} / ${questions.length}</h3>`;

    // Add accuracy feedback based on percentage
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
    scoreCardElement.appendChild(accuracyElement);

    console.log('ScoreCard updated:', scoreCardElement.innerHTML);

    // Show the "Start New Quiz" button
    const startNewQuizButton = document.getElementById('startNewQuizButton');
    if (startNewQuizButton) {
        startNewQuizButton.style.display = 'block';
    }

    // Hide navigation buttons
    const nextButton = document.getElementById('nextButton');
    const prevButton = document.getElementById('prevButton');
    if (nextButton) nextButton.style.display = 'none';
    if (prevButton) prevButton.style.display = 'none';
}

// Start a new quiz
function startNewQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    questions = [];
    selectedQuizType = '';

    document.getElementById('scoreCard').style.display = 'none';
    document.getElementById('startNewQuizButton').style.display = 'none';
    document.getElementById('quizTypeSection').style.display = 'block';
    document.getElementById('quizSection').style.display = 'none';

    const startButton = document.getElementById('startButton');
    startButton.disabled = true;
    startButton.textContent = "Please choose a quiz category";
    document.getElementById('feedbackMessage').textContent = '';
}
