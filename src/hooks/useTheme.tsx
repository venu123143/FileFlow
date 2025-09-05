import { useState, useEffect } from "react";

export type Theme = "light" | "dark";

// Retrieve the stored theme from localStorage
function getStoredTheme(): Theme | null {
    return localStorage.getItem("theme") as Theme | null;
}

// Determine the system preferred theme
function getSystemPreferredTheme(): Theme {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }
    return "light";
}

// Get the initial theme from localStorage or fallback to the system preference
function getInitialTheme(): Theme {
    return getStoredTheme() || getSystemPreferredTheme();
}

export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        const root = window.document.documentElement;
        root.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    return { theme, setTheme };
};
