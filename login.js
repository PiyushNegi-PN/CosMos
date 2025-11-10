const signUpContainer = document.getElementById("signup");
const signInContainer = document.getElementById("signIn");
const signUpButton = document.getElementById("signUpButton");
const signInButton = document.getElementById("signInButton");

window.addEventListener("DOMContentLoaded", () => {
  signInContainer.style.display = "block";
  signUpContainer.style.display = "none";
});

if (signUpButton) {
  signUpButton.addEventListener("click", () => {
    signInContainer.style.display = "none";
    signUpContainer.style.display = "block";
  });
}

if (signInButton) {
  signInButton.addEventListener("click", () => {
    signUpContainer.style.display = "none";
    signInContainer.style.display = "block";
  });
}

function fadeIn(element) {
  element.style.opacity = 0;
  element.style.display = "block";
  let opacity = 0;
  const timer = setInterval(() => {
    if (opacity >= 1) clearInterval(timer);
    element.style.opacity = opacity;
    opacity += 0.1;
  }, 30);
}

function fadeOut(element) {
  let opacity = 1;
  const timer = setInterval(() => {
    if (opacity <= 0) {
      clearInterval(timer);
      element.style.display = "none";
    }
    element.style.opacity = opacity;
    opacity -= 0.1;
  }, 30);
}

