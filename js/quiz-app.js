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
    feedbackMessage.classList.add('hidden'); // Hide it using the hidden class
}

// Check answer
function checkAnswer(selectedOptionIndex, buttonElement) {
    if (lastClickedAnswer !== null && lastClickedAnswer !== selectedOptionIndex) {
        // Hide the previous feedback if the user changes their answer
        resetFeedbackMessage();
    }

    const currentQuestion = questions[currentQuestionIndex];
    const feedbackMessage = document.getElementById('feedbackMessage');
    const finalAnswerReminderElement = document.getElementById('finalAnswerReminder');
    const answerSelectionReminderElement = document.getElementById('answerSelectionReminder');

    // Highlight the clicked button
    buttonElement.classList.add('clicked');
    lastClickedAnswer = selectedOptionIndex;

    // Show feedback for this answer
    if (selectedOptionIndex === currentQuestion.shuffledAnswerIndex) {
        feedbackMessage.textContent = 'Correct!';
        feedbackMessage.style.color = '#FFFFFF';
        feedbackMessage.style.backgroundColor = 'rgba(76, 175, 80, 0.8)';
        score++;  // Increment score if the answer is correct
    } else {
        feedbackMessage.textContent = 'Incorrect!';
        feedbackMessage.style.color = '#FFFFFF';
        feedbackMessage.style.backgroundColor = 'rgba(244, 67, 54, 0.8)';
    }

    // Ensure the feedback message is visible
    feedbackMessage.classList.remove('hidden');  // Make sure it's visible
    feedbackMessage.style.transition = 'opacity 1s ease-out';
    feedbackMessage.style.opacity = 1;

    // Wait for 3 seconds before starting to fade out
    setTimeout(function() {
        feedbackMessage.style.transition = 'opacity 1s ease-out';
        feedbackMessage.style.opacity = 0;
        // After fading out, hide the feedback completely
        setTimeout(() => {
            feedbackMessage.classList.add('hidden'); // Use the hidden class to completely hide it
        }, 1000); // Match the opacity transition time
    }, 3000); // Delay the fade out for 3 seconds

    // Hide the final question reminder message (if any)
    if (finalAnswerReminderElement && finalAnswerReminderElement.style.visibility === 'visible') {
        finalAnswerReminderElement.style.visibility = 'hidden';
        finalAnswerReminderElement.style.opacity = '0';
    }

    // Hide the reminder message immediately after selecting an answer
    if (answerSelectionReminderElement) {
        answerSelectionReminderElement.style.visibility = 'hidden';
        answerSelectionReminderElement.style.opacity = '0';
    }

    // Mark that an answer has been selected
    isAnswerSelected = true;
}

// Proceed to the next question immediately, and fade-out the feedback in the background
function nextQuestion() {
    const answerSelectionReminderElement = document.getElementById('answerSelectionReminder');
    const currentQuestionOptions = document.querySelectorAll('.answerButton');

    // If no answer is selected, show the reminder message and prevent moving forward
    if (!isAnswerSelected) {
        answerSelectionReminderElement.innerHTML = `
            <span class="warning-icon">!</span> Please select an answer before moving to the next question.
        `;
        answerSelectionReminderElement.style.visibility = 'visible';  // Make it visible
        answerSelectionReminderElement.style.opacity = '1';  // Ensure it's fully visible
        return;  // Prevent moving to the next question
    }

    // Proceed to next question and reset the feedback message visibility
    resetFeedbackMessage();

    currentQuestionIndex++;  // Move to the next question

    if (currentQuestionIndex < questions.length) {
        // Display the next question
        displayQuestion();
    } else {
        // End the quiz if it's the last question
        endQuiz();
    }

    // Clear button selections
    currentQuestionOptions.forEach(option => {
        option.classList.remove('clicked');
    });

    // Reset the flag to false for the next question
    isAnswerSelected = false;
}

// Enable or disable the Submit button based on whether the final answer is selected
function checkFinalAnswer() {
    const submitButton = document.getElementById("submitQuizButton");
    const finalAnswerReminder = document.getElementById("finalAnswerReminder");
    const currentQuestion = questions[currentQuestionIndex]; // Get the current question (last question in this case)

    // If the final question is answered, enable the submit button
    if (isAnswerSelected && currentQuestionIndex === questions.length - 1) {
        submitButton.disabled = false;
        finalAnswerReminder.style.visibility = "hidden"; // Hide reminder if the final answer is selected
    } else {
        submitButton.disabled = true;
        finalAnswerReminder.style.visibility = "visible"; // Show reminder if no answer selected
        finalAnswerReminder.style.opacity = "1"; // Ensure visibility
    }
}

// Toggle the visibility of the navigation buttons
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
    const buttonContainer = document.getElementById('buttonContainer');
    let submitButton = document.getElementById('submitAllButton'); // Check if submit button already exists

    // Create the Submit button if not already present
    if (!submitButton) {
        submitButton = document.createElement('button');
        submitButton.id = 'submitAllButton';
        submitButton.textContent = 'Submit Quiz';
        submitButton.onclick = submitQuiz; // Attach the submitQuiz function here
        buttonContainer.appendChild(submitButton);
        console.log("Submit button created and event listener attached.");
    }

    // Show Submit button on the last question, hide Next button
    if (currentQuestionIndex === questions.length - 1) {
        nextButton.style.display = 'none';
        submitButton.style.display = 'inline-block'; // Show submit button
    } else {
        submitButton.style.display = 'none';
        nextButton.style.display = 'inline-block'; // Show next button
    }
}

// End quiz and show the results
function endQuiz() {
    const scoreCard = document.getElementById('scoreCard');
    const quizSection = document.getElementById('quizSection');
    const finalScore = document.getElementById('finalScore');
    const accuracyMessage = document.getElementById('accuracyMessage');
    const startNewQuizButton = document.getElementById('startNewQuizButton');
    
    // Ensure all elements exist before manipulating them
    if (!scoreCard || !finalScore || !accuracyMessage || !startNewQuizButton) {
        console.error('One or more elements are missing!');
        return;  // Exit if any required element is missing
    }

    // Update the scorecard with the user's score
    finalScore.textContent = `${score}/${questions.length}`;

    // Calculate accuracy percentage
    const percentage = Math.round((score / questions.length) * 100);

    // Add accuracy feedback based on percentage
    let accuracyText = '';
    if (percentage === 100) {
        accuracyText = `Accuracy: 100% correct! 🎉`;
    } else if (percentage >= 80) {
        accuracyText = `Accuracy: ${percentage}% (Great job!)`;
    } else if (percentage >= 50) {
        accuracyText = `Accuracy: ${percentage}% (Good effort!)`;
    } else {
        accuracyText = `Accuracy: ${percentage}% (Keep trying! You'll get it next time!)`;
    }

    // Clear previous content and set new text
    accuracyMessage.textContent = accuracyText;

    // Fade out the quiz section
    quizSection.style.transition = 'opacity 0.5s ease-out';
    quizSection.style.opacity = 0;

    setTimeout(() => {
        quizSection.style.display = 'none'; // Hide the quiz section after fade-out

        // Show the scorecard with a fade-in effect
        scoreCard.style.display = 'block';
        scoreCard.style.transition = 'opacity 0.5s ease-in';
        scoreCard.style.opacity = 1;

        // Ensure the "Start New Quiz" button is visible
        startNewQuizButton.style.display = 'inline-block'; // Show button
    }, 500); // Wait for the opacity transition to complete before hiding the quiz section
}

// Submit the quiz and display the results
function submitQuiz() {
    console.log("Submit button clicked");

    const answerSelectionReminder = document.getElementById('answerSelectionReminder');
    const finalAnswerReminder = document.getElementById('finalAnswerReminder');
    const currentQuestionOptions = document.querySelectorAll('.answerButton');

    // Ensure that these elements exist
    if (!answerSelectionReminder || !finalAnswerReminder) {
        console.error("Reminder elements not found!");
        return;  // Exit the function if elements are not found
    }

    // Check if the user is on the last question and if no answer is selected
    if (currentQuestionIndex === questions.length - 1 && !isAnswerSelected) {
        // Show reminder message before submitting the final quiz
        finalAnswerReminder.innerHTML = '<span class="warning-icon">!</span> Please select an answer before retrieving your score.';
        finalAnswerReminder.style.visibility = 'visible';  // Make it visible
        finalAnswerReminder.style.opacity = '1';  // Ensure it's fully visible
    } else {
        // If everything is okay (final question answered or any question answered)
        finalAnswerReminder.style.visibility = 'hidden';  // Hide the reminder
        finalAnswerReminder.style.opacity = '0';  // Ensure it's hidden

        // Proceed to calculate the score and show the result
        endQuiz();
    }
}

// Function to clear quiz questions and answers
function clearQuizQuestions() {
    // Example: Remove all the questions and answers from the page
    const questionContainer = document.getElementById('quizQuestions');
    if (questionContainer) {
        questionContainer.innerHTML = ''; // Clear the container
    }

    // You can also clear the individual question elements if needed
    const allAnswers = document.querySelectorAll('.quiz-answer');
    allAnswers.forEach(answer => {
        answer.checked = false; // Uncheck any selected answers
    });

    // Optionally, clear any other quiz-related state
    const scoreCard = document.getElementById('scoreCard');
    if (scoreCard) {
        scoreCard.style.display = 'none';  // Hide the score card before resetting the quiz
        scoreCard.style.opacity = '0';  // Reset opacity for the next time
    }
}

// Function to start a new quiz
function startNewQuiz() {
    console.log('Starting a new quiz...');
    
    // Reload the page to reset everything
    location.reload();
}