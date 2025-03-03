document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.getElementById("nav-links");
    const backdrop = document.getElementById("backdrop");

    let isMenuVisible = false;

    function openMenu() {
        navLinks.classList.add("active");
        backdrop.style.display = "block";
        hamburger.classList.add("active");
        hamburger.setAttribute("aria-expanded", "true");
        isMenuVisible = true;
    }

    function closeMenu() {
        navLinks.classList.remove("active");
        backdrop.style.display = "none";
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        isMenuVisible = false;
    }

    function toggleMenu() {
        if (isMenuVisible) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    hamburger.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleMenu();
    });

    backdrop.addEventListener("click", closeMenu);

    document.addEventListener("click", (event) => {
        if (!hamburger.contains(event.target) && !navLinks.contains(event.target)) {
            closeMenu();
        }
    });

    // Handle page visibility change
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === 'visible') {
            if (isMenuVisible) {
                closeMenu(); // Ensure menu is closed when the document becomes visible
            }
        }
    });

    // Handle page navigation
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            closeMenu(); // Ensure menu is closed on page load
        }
    });

    // Initialize menu state
    function initializeMenuState() {
        // Ensure menu is properly set up on load
        navLinks.style.opacity = 0;
        navLinks.style.visibility = 'hidden';
        navLinks.classList.remove("active");

        // Use setTimeout to allow for reflow and apply the correct styles
        setTimeout(() => {
            navLinks.style.opacity = 1;
            navLinks.style.visibility = 'visible';
        }, 100); // Short delay to ensure styles are applied correctly
    }

    initializeMenuState();
});
