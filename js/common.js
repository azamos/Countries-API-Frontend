const DARK_MODE = "DarkMode";

let darkMode = JSON.parse(localStorage.getItem(DARK_MODE))||false;

const applyTheme = () => {
  document.body.classList.toggle("dark-theme");
  let iconEl;
  if (!darkMode) {
    document.getElementsByClassName("theme-text")[0].innerText = "Dark mode";
    iconEl = document.getElementsByClassName("fa-sun")[0];
  } else {
    document.getElementsByClassName("theme-text")[0].innerText = "Light mode";
    iconEl = document.getElementsByClassName("fa-moon")[0];
  }
  iconEl.classList.toggle("fa-moon");
  iconEl.classList.toggle("fa-sun");
};

const setThemeIfNeeded = () => {
  if(darkMode==true){
    applyTheme();
  }
}

const toggleTheme = () => {
  darkMode = !darkMode;
  localStorage.setItem(DARK_MODE,JSON.stringify(darkMode));
  applyTheme();
};

const formatInteger = numStr => parseInt(numStr).toLocaleString();

const SELECTED_COUNTRY = "SELECTED_COUNTRY";
const STATE = { SELECTED_COUNTRY : null }