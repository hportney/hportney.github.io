document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
        const answer = button.nextElementSibling;
        const isOpen = button.getAttribute("aria-expanded") === "true";

        // Close all other FAQ answers
        document.querySelectorAll(".faq-answer").forEach((el) => {
            if (el !== answer) {
                el.style.transform = 'scaleY(0)';  // Collapse the others
                el.classList.remove("open");
                el.previousElementSibling.setAttribute("aria-expanded", "false");
                el.previousElementSibling.querySelector(".toggle-icon").textContent = "+";
            }
        });

        if (!isOpen) {
            answer.style.transform = 'scaleY(1)';  // Expand smoothly
            answer.classList.add("open");

            button.setAttribute("aria-expanded", "true");
            button.querySelector(".toggle-icon").textContent = "−";
        } else {
            answer.style.transform = 'scaleY(0)';  // Collapse back to zero
            answer.classList.remove("open");

            button.setAttribute("aria-expanded", "false");
            button.querySelector(".toggle-icon").textContent = "+";
        }
    });
});