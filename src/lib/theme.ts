export const THEME_KEY = "jr-theme";

/**
 * Inlined in <head>: dark is the default for every visitor, regardless of
 * the OS / browser preference. Light is used only if the visitor picked it
 * with the toggle (saved in localStorage).
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}")==="light"?"light":"dark";document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","dark")}})();`;
