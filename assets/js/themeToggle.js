const btn = document.querySelector("#theme-toggle");
if (!btn) return;
const label = btn.querySelector('#theme-label')
const body = document.body
// check to see if OS preferences for light or dark mode
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const prefersLightScheme = window.matchMedia("(prefers-color-scheme: light)");

// check to see if local storage has a theme preference
let currentTheme = null;
try { currentTheme = localStorage.getItem("theme"); } catch(e) {}

function setTheme() {
    //if no local storage check against system preferences
    if (currentTheme === null) {
        if (prefersDarkScheme.matches) {
            currentTheme = "dark"
        } else if (prefersLightScheme.matches) {
            currentTheme = "light"
        } else {
            // if no preferences, default to multi theme
            currentTheme = "multi"
        }
        // persist the auto-detected theme so detection doesn't re-run each page load
        try { localStorage.setItem("theme", currentTheme); } catch(e) {}
        setTheme()
    } else if (currentTheme === "dark") {
        body.classList.remove("light-mode");
        body.classList.remove("multi-mode");
        body.classList.add("dark-mode");
        body.dataset.bsTheme = "dark";
        label.innerHTML = "Change to Colourful";
    } else if (currentTheme === "multi") {
        body.classList.remove("dark-mode");
        body.classList.remove("light-mode");
        body.classList.add("multi-mode");
        body.dataset.bsTheme = "dark";
        label.innerHTML = "Change to Light Mode";
    } else if (currentTheme === "light") {
        body.classList.remove("dark-mode");
        body.classList.remove("multi-mode");
        body.classList.add("light-mode");
        body.dataset.bsTheme = "light";
        label.innerHTML = "Change to Dark Mode";
    }
}

btn.addEventListener("click", function () {
    if (currentTheme === "dark") {
        currentTheme = "multi"
        setTheme()
    } else if (currentTheme === "multi") {
        currentTheme = "light"
        setTheme()
    } else {
        currentTheme = "dark";
        setTheme()
    }
    try { localStorage.setItem("theme", currentTheme); } catch(e) {}
});

btn.addEventListener('mouseenter', () => label.classList.add('show-label'))
btn.addEventListener('mouseleave', () => label.classList.remove('show-label'))

setTheme()
