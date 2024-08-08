(function () {
    const storedTheme = localStorage.getItem("theme");
    const userPreferredTheme = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches
        ? "dracula"
        : "winter";
    const theme = storedTheme || userPreferredTheme;
    document.documentElement.setAttribute("data-theme", theme);
})();
