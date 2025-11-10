import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { addDoc, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

//Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTuZD5H2nvTKA4-iTLCPsyl0DJ7Gan1zI",
  authDomain: "roshan-3139a.firebaseapp.com",
  projectId: "roshan-3139a",
  storageBucket: "roshan-3139a.firebasestorage.app",
  messagingSenderId: "920064613682",
  appId: "1:920064613682:web:e5e504cc49445e33434b2b",
  measurementId: "G-JVYTER2243",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth();
const db = getFirestore();

function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  if (!messageDiv) return;
  messageDiv.style.display = "block";
  messageDiv.innerText = message;
  messageDiv.style.opacity = 1;

  setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 4000);
}

function getFriendlyMessage(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address format.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Try again.";
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/missing-password":
      return "Please enter your password.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// sign up 
const signUp = document.getElementById("submitSignUp");
if (signUp) {
  signUp.addEventListener("click", (event) => {
    event.preventDefault();

    const email = document.getElementById("rEmail").value.trim();
    const password = document.getElementById("rPassword").value;
    const firstName = document.getElementById("fName").value.trim();
    const lastName = document.getElementById("lName").value.trim();

    if (!email || !password || !firstName || !lastName) {
      showMessage("Please fill all fields.", "signUpMessage");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        // verification email
        try {
          await sendEmailVerification(user);
          showMessage(
            "Account created! Verification email sent. Please verify before logging in.",
            "signUpMessage"
          );
        } catch (error) {
          console.error("Error sending verification email:", error);
          showMessage("Failed to send verification email.", "signUpMessage");
        }

        // Save user data to Firestore
        try {
          const userData = { email, firstName, lastName };
          const docRef = doc(db, "users", user.uid);
          await setDoc(docRef, userData);
          console.log("User data saved in Firestore");
        } catch (error) {
          console.error("Error writing document:", error);
        }

        // Clear fields
        document.getElementById("rEmail").value = "";
        document.getElementById("rPassword").value = "";
        document.getElementById("fName").value = "";
        document.getElementById("lName").value = "";
      })
      .catch((error) => {
        showMessage(getFriendlyMessage(error.code), "signUpMessage");
      });
  });
}

// sign in
const signIn = document.getElementById("submitSignIn");
if (signIn) {
  signIn.addEventListener("click", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showMessage("Please enter both email and password.", "signInMessage");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        if (!user.emailVerified) {
          showMessage(
            "Please verify your email before signing in. Check your inbox.",
            "signInMessage"
          );
          return;
        }

        showMessage("Login successful! Redirecting...", "signInMessage");
        localStorage.setItem("loggedInUserId", user.uid);

        setTimeout(() => {
          window.location.href = "homepage/main.html";
        }, 1500);
      })
      .catch((error) => {
        showMessage(getFriendlyMessage(error.code), "signInMessage");
      });
  });
}

// recover password
const recoverLink = document.getElementById("recoverPassword");
if (recoverLink) {
  recoverLink.addEventListener("click", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    if (!email) {
      showMessage("Please enter your registered email first.", "signInMessage");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showMessage(
        "Password reset email sent! Check your inbox or spam folder.",
        "signInMessage"
      );
    } catch (error) {
      showMessage(getFriendlyMessage(error.code), "signInMessage");
    }
  });
}
const logoutButton = document.getElementById("logoutBtn");
if (logoutButton) {
  logoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth)
      .then(() => {
        alert("You have been logged out successfully!");
        window.location.href = "../login.html"; // redirect to login page
      })
      .catch((error) => {
        console.error("Logout Error:", error);
        alert("Something went wrong while logging out.");
      });
  });
}

if (window.location.pathname.includes("/homepage/")) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "../index.html";
    }
  });
}

//histroy for chatbot
// Save chat message
export async function saveChatMessage(userId, text, sender) {
  try {
    const chatRef = collection(db, "users", userId, "chatHistory");
    await addDoc(chatRef, {
      text,
      sender,
      timestamp: new Date()
    });
    console.log("Chat saved:", text);
  } catch (error) {
    console.error("Error saving message:", error);
  }
}

// Load chat history
export async function loadChatHistory(userId) {
  try {
    const chatRef = collection(db, "users", userId, "chatHistory");
    const q = query(chatRef, orderBy("timestamp", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error loading chat history:", error);
    return [];
  }
}
