const btn = document.querySelector("#theme-toggle");
const label = btn.querySelector('#theme-label')
// check to see if OS preferences for light or dark mode
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const prefersLightScheme = window.matchMedia("(prefers-color-scheme: light)");

// check to see if local storage has a theme preference
let currentTheme = localStorage.getItem("theme");

function setTheme() {
    console.log("Setting theme to: " + currentTheme);
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
        setTheme()
    } else if (currentTheme === "dark") {
        document.body.classList.remove("light-mode");
        document.body.classList.remove("multi-mode");
        document.body.classList.add("dark-mode");
        label.innerHTML = "Change to Colourful";
    } else if (currentTheme === "multi") {
        document.body.classList.remove("dark-mode");
        document.body.classList.remove("light-mode");
        document.body.classList.add("multi-mode");
        label.innerHTML = "Change to Light Mode";
    } else if (currentTheme === "light") {
        document.body.classList.remove("dark-mode");
        document.body.classList.remove("multi-mode");
        document.body.classList.add("light-mode");
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
    localStorage.setItem("theme", currentTheme);
});

btn.addEventListener('mouseenter', () => label.classList.add('show-label'))
btn.addEventListener('mouseleave', () => label.classList.remove('show-label'))

setTheme()
