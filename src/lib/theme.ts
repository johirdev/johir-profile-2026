export const THEME_KEY = "jr-theme";

/** Inlined in <head>: picks the saved theme (or the OS one) before paint. */
export const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem("${THEME_KEY}");var t=s==="light"||s==="dark"?s:(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.setAttribute("data-theme",t)}catch(e){}})();`;
