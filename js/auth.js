import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

if (signupForm) {

    signupForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value;

        try {

            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            await setDoc(doc(db, "users", result.user.uid), {
                fullName: name,
                email: email,
                age: "",
                city: "",
                profession: "",
                createdAt: new Date()
            });

            Swal.fire({
                icon: "success",
                title: "Account Created!",
                text: "Your account has been created successfully.",
                confirmButtonColor: "#2563eb"
            }).then(() => {
                window.location.href = "index.html";
            });

        } catch (error) {

            Swal.fire({
                icon: "error",
                title: "Signup Failed",
                text: error.message
            });

        }

    });
}

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {

            const result = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userUID", result.user.uid);
            localStorage.setItem("userEmail", result.user.email);

            Swal.fire({
                icon: "success",
                title: "Login Successfully!",
                text: "Welcome to your dashboard.",
                confirmButtonColor: "#2563eb"
            }).then(() => {
                window.location.href = "dashboard.html";
            });

        } catch (error) {

            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: "Invalid email or password."
            });

        }

    });
}