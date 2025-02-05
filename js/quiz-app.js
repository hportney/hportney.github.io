// Wait for DOM content to be fully loaded before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ DOM fully loaded");

    // Ensure 'startNewQuizButton' exists before adding the event listener
    const startButton = document.getElementById('startNewQuizButton');
    if (startButton) {
        // Ensure the button is visible before attaching event listener
        startButton.style.display = 'block';  // Make sure the button is visible
        startButton.addEventListener('click', startQuiz);
        console.log("✅ Start button event listener added.");
    } else {
        console.error("❌ Start button not found in the DOM!");
    }

    // Set up event listener for quiz type selection
    const quizTypeSelect = document.getElementById('quizTypeSelect');
    if (quizTypeSelect) {
        quizTypeSelect.addEventListener('change', function() {
            selectedQuizType = this.value;  // Set the selected quiz type based on the dropdown value
            console.log('Selected quiz type:', selectedQuizType);
            
            // Enable the start button only if a quiz type is selected
            startButton.disabled = !selectedQuizType;  // Disable the button if no quiz type is selected
        });
        console.log("✅ Quiz type selection event listener added.");
    } else {
        console.error("❌ Quiz type dropdown not found in the DOM!");
    }

    // Update the button text and show it when a quiz category is selected
    updateButtonText();  // Call to update the button based on the initial state (in case a quiz type is pre-selected)
});

let currentQuestionIndex = 0;  // Initialize the current question index
let score = 0;
let questions = [];
let selectedQuizType = '';
let lastClickedAnswer = null;  // Track the last clicked answer
let isAnswerSelected = false;  // Flag to track if an answer was selected
let quizDataLoaded = false;  // Track if quiz data is loaded

// Function to update button text and show it
function updateButtonText() {
    const quizTypeSelect = document.getElementById('quizTypeSelect');
    const startButton = document.getElementById('startNewQuizButton');
    
    let selectedQuizType = quizTypeSelect.value;

    // Update the button text based on the selected quiz type
    if (selectedQuizType) {
        startButton.textContent = `Start ${selectedQuizType.charAt(0).toUpperCase() + selectedQuizType.slice(1)} Quiz`;
        startButton.disabled = false;
    } else {
        startButton.disabled = true;
        startButton.textContent = 'Select a quiz category to start';
    }
}

// Ensure the "Start Quiz" button triggers the quiz correctly
document.getElementById('startNewQuizButton').addEventListener('click', startQuiz);

// Fetch quiz data and start the quiz
let questionsLoaded = false;

function startQuiz(event) {
    event.preventDefault();
    if (!selectedQuizType) {
        console.error('❌ No quiz type selected!');
        return;
    }
    const filePath = `js/json/quizzes/${selectedQuizType}-quiz.json`;
    document.getElementById('feedbackMessage').textContent = 'Loading quiz...';
    
    fetch(filePath)
        .then(response => response.json())
        .then(data => {
            if (data && data.questions) {
                questions = getRandomQuestions(data.questions, 10); // Randomize 10 questions
                currentQuestionIndex = 0;
                score = 0;
                displayQuestion();
                
                document.getElementById('quizTypeSection').style.display = 'none';
                document.getElementById('quizSection').style.display = 'block';
                document.getElementById('scoreCard').style.display = 'none'; // Hide scorecard
                document.getElementById('startNewQuizButton').style.display = 'none'; // Hide start button
            } else {
                document.getElementById('feedbackMessage').textContent = 'Invalid quiz data. Please try again later.';
            }
        })
        .catch(error => {
            document.getElementById('feedbackMessage').textContent = 'Sorry, we couldn’t load the quiz data. Please try again later.';
            console.error('❌ Error loading quiz data:', error);
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
    const questionContainer = document.getElementById('question');
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
    const currentQuestion = questions[currentQuestionIndex];
    const feedbackMessage = document.getElementById('feedbackMessage');
    const finalAnswerReminderElement = document.getElementById('finalAnswerReminder');
    const answerSelectionReminderElement = document.getElementById('answerSelectionReminder');

    // If the answer was changed, reset the previous feedback message
    if (lastClickedAnswer !== null && lastClickedAnswer !== selectedOptionIndex) {
        resetFeedbackMessage();
    }

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

    // Ensure the feedback message is visible and animated
    feedbackMessage.classList.remove('hidden');
    feedbackMessage.style.transition = 'opacity 1s ease-out';
    feedbackMessage.style.opacity = 1;

    // Wait for 3 seconds before fading out feedback message
    setTimeout(function() {
        feedbackMessage.style.transition = 'opacity 1s ease-out';
        feedbackMessage.style.opacity = 0;
        setTimeout(() => {
            feedbackMessage.classList.add('hidden'); // Hide the feedback message after fading
        }, 1000);
    }, 3000); // Wait 3 seconds before starting to fade out

    // Mark this question's answer for scoring
    currentQuestion.selectedAnswerIndex = selectedOptionIndex; // Store the selected answer
    currentQuestion.isAnswered = true; // Mark the question as answered

    // Hide the final answer reminder message (if any)
    if (finalAnswerReminderElement && finalAnswerReminderElement.style.visibility === 'visible') {
        finalAnswerReminderElement.style.visibility = 'hidden';
        finalAnswerReminderElement.style.opacity = '0';
    }

    // Hide the answer selection reminder message immediately after selecting an answer
    if (answerSelectionReminderElement) {
        answerSelectionReminderElement.style.visibility = 'hidden';
        answerSelectionReminderElement.style.opacity = '0';
    }

    // Mark that an answer has been selected
    isAnswerSelected = true;
}

// Add the event listener for the "Previous" button
document.getElementById('prevButton').addEventListener('click', previousQuestion);

// Proceed to the next question immediately, and fade-out the feedback in the background
function nextQuestion() {
    const answerSelectionReminderElement = document.getElementById('answerSelectionReminder');
    const currentQuestionOptions = document.querySelectorAll('.answerButton');

    // If no answer is selected, show the reminder message and prevent moving forward
    if (!isAnswerSelected) {
        answerSelectionReminderElement.innerHTML = `
            <span class="warning-icon">!</span> Please select an answer before moving to the next question.
        `;
        answerSelectionReminderElement.style.visibility = 'visible';
        answerSelectionReminderElement.style.opacity = '1';
        return; // Prevent moving to the next question
    }

    // Ensure the last clicked answer is correctly evaluated before moving to the next question
    const currentQuestion = questions[currentQuestionIndex];

    if (lastClickedAnswer !== null) {
        // Set correctness for the question based on the last clicked answer
        currentQuestion.isCorrect = lastClickedAnswer === currentQuestion.shuffledAnswerIndex;
    }

    // Move to the next question
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        endQuiz();
    }

    // Reset tracking for the next question
    lastClickedAnswer = null;
    isAnswerSelected = false;
}

// Go to the previous question
function displayQuestion() {
    console.log('Displaying question for index:', currentQuestionIndex);  // Log the current question index

    const currentQuestion = questions[currentQuestionIndex];
    console.log('Current Question:', currentQuestion); // Log the current question to verify it's correct

    const shuffledOptions = shuffleArray([...currentQuestion.options]);
    const correctOptionIndex = shuffledOptions.indexOf(currentQuestion.answer);
    currentQuestion.shuffledAnswerIndex = correctOptionIndex;

    document.getElementById('questionNumber').textContent = `Question ${currentQuestionIndex + 1}`;
    const questionContainer = document.getElementById('question');
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
    const startAnotherNewQuizButton = document.getElementById('startAnotherNewQuizButton');

    console.log('Ending quiz...');

    // Ensure all elements exist before manipulating them
    if (!scoreCard || !finalScore || !accuracyMessage || !startAnotherNewQuizButton) {
        console.error('One or more elements are missing!');
        return;
    }

    // Recalculate the score based on correctly answered questions
    score = questions.filter(q => q.isCorrect).length;

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

    // Update accuracy message
    accuracyMessage.textContent = accuracyText;

    // Fade out the quiz section
    quizSection.style.transition = 'opacity 0.5s ease-out';
    quizSection.style.opacity = 0;

    setTimeout(() => {
        quizSection.style.display = 'none'; 

        // Show the scorecard with a fade-in effect
        scoreCard.style.display = 'block';
        scoreCard.style.transition = 'opacity 0.5s ease-in';
        scoreCard.style.opacity = 1;

        // Show the "Start Another New Quiz" button
        startAnotherNewQuizButton.style.display = 'inline-block';
    }, 500);
}

// Submit the quiz and display the results
function submitQuiz() {
    const finalAnswerReminder = document.getElementById('finalAnswerReminder');

    // Ensure the user selected an answer before submitting
    if (!isAnswerSelected) {
        finalAnswerReminder.innerHTML = `
            <span class="warning-icon">!</span> Please select an answer before retrieving your score.
        `;
        finalAnswerReminder.style.visibility = 'visible';
        finalAnswerReminder.style.opacity = '1';
        return; // Stop submission if no answer is selected
    }

    // ✅ **Final answer check (same logic as `nextQuestion()`)**
    const currentQuestion = questions[currentQuestionIndex];
    if (lastClickedAnswer !== null) {
        currentQuestion.isCorrect = lastClickedAnswer === currentQuestion.shuffledAnswerIndex;
    }

    // ✅ **Proceed to end the quiz**
    endQuiz();
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
    // Reload the page to reset everything
    location.reload();
}
document.getElementById('startNewQuizButton').style.display = 'block';