const signUpContainer = document.getElementById("signup");
const signInContainer = document.getElementById("signIn");
const signUpButton = document.getElementById("signUpButton");
const signInButton = document.getElementById("signInButton");

window.addEventListener("DOMContentLoaded", () => {
  signInContainer.className = "container panel-active";
  signUpContainer.className = "container panel-hidden";
  signInContainer.style.display = "";
  signUpContainer.style.display = "";
});

if (signUpButton) {
  signUpButton.addEventListener("click", () => {
    signInContainer.className = "container panel-hidden";
    signUpContainer.className = "container panel-active";
  });
}

if (signInButton) {
  signInButton.addEventListener("click", () => {
    signUpContainer.className = "container panel-hidden";
    signInContainer.className = "container panel-active";
  });
}

