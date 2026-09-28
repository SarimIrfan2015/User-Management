import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const userForm = document.getElementById("userForm");
const usersTable = document.getElementById("usersTable");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeText = document.getElementById("welcomeText");
const userCount = document.getElementById("userCount");

const fullName = document.getElementById("fullName");
const userEmail = document.getElementById("userEmail");
const age = document.getElementById("age");
const city = document.getElementById("city");
const profession = document.getElementById("profession");

const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");

let editingId = null;

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userUID");
        localStorage.removeItem("userEmail");

        window.location.href = "index.html";
        return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userUID", user.uid);

    welcomeText.textContent = `Welcome, ${user.email}`;

    await loadUsers();
});

async function loadUsers() {

    usersTable.innerHTML = `
        <tr>
            <td colspan="6" class="empty-row">Loading users...</td>
        </tr>
    `;

    try {

        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);

        usersTable.innerHTML = "";

        let count = 0;

        snapshot.forEach((userDoc) => {

            const user = userDoc.data();

            if (!user.fullName && !user.email) {
                return;
            }

            count++;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${user.fullName || "-"}</td>
                <td>${user.email || "-"}</td>
                <td>${user.age || "-"}</td>
                <td>${user.city || "-"}</td>
                <td>${user.profession || "-"}</td>

                <td>
                    <button class="action-btn view-btn" data-id="${userDoc.id}">
                        View
                    </button>

                    <button class="action-btn edit-btn" data-id="${userDoc.id}">
                        Edit
                    </button>

                    <button class="action-btn delete-btn" data-id="${userDoc.id}">
                        Delete
                    </button>
                </td>
            `;

            usersTable.appendChild(row);
        });

        userCount.textContent = `${count} Users`;

        if (count === 0) {

            usersTable.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-row">
                        No users found.
                    </td>
                </tr>
            `;

        }

    } catch (error) {

        console.error(error);

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Unable to load users."
        });
    }
}

userForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const userData = {
        fullName: fullName.value.trim(),
        email: userEmail.value.trim(),
        age: age.value,
        city: city.value.trim(),
        profession: profession.value.trim()
    };

    try {

        if (editingId) {

            await updateDoc(
                doc(db, "users", editingId),
                userData
            );

            Swal.fire({
                icon: "success",
                title: "Updated!",
                text: "User information updated successfully.",
                confirmButtonColor: "#2563eb"
            });

        } else {

            await addDoc(
                collection(db, "users"),
                userData
            );

            Swal.fire({
                icon: "success",
                title: "Added!",
                text: "User added successfully.",
                confirmButtonColor: "#2563eb"
            });
        }

        resetForm();
        await loadUsers();

    } catch (error) {

        console.error(error);

        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message
        });

    }
});

usersTable.addEventListener("click", async (e) => {

    const id = e.target.dataset.id;

    if (!id) return;

    if (e.target.classList.contains("view-btn")) {
        await viewUser(id);
    }

    if (e.target.classList.contains("edit-btn")) {
        await editUser(id);
    }

    if (e.target.classList.contains("delete-btn")) {
        await deleteUser(id);
    }
});

async function viewUser(id) {

    try {

        const userRef = doc(db, "users", id);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
            return;
        }

        const user = snapshot.data();

        Swal.fire({
            title: "Complete User Information",
            html: `
                <div style="text-align:left;line-height:2;">
                    <b>Full Name:</b> ${user.fullName || "-"}<br>
                    <b>Email:</b> ${user.email || "-"}<br>
                    <b>Age:</b> ${user.age || "-"}<br>
                    <b>City:</b> ${user.city || "-"}<br>
                    <b>Profession:</b> ${user.profession || "-"}
                </div>
            `,
            confirmButtonColor: "#2563eb"
        });

    } catch (error) {

        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message
        });

    }
}

async function editUser(id) {

    try {

        const userRef = doc(db, "users", id);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
            return;
        }

        const user = snapshot.data();

        fullName.value = user.fullName || "";
        userEmail.value = user.email || "";
        age.value = user.age || "";
        city.value = user.city || "";
        profession.value = user.profession || "";

        editingId = id;

        formTitle.textContent = "Edit User Information";
        saveBtn.textContent = "Update User";
        cancelBtn.style.display = "inline-block";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message
        });

    }
}

async function deleteUser(id) {

    const result = await Swal.fire({
        icon: "warning",
        title: "Delete User?",
        text: "This user will be permanently deleted.",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc2626"
    });

    if (!result.isConfirmed) {
        return;
    }

    try {

        await deleteDoc(doc(db, "users", id));

        Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "User has been deleted.",
            confirmButtonColor: "#2563eb"
        });

        await loadUsers();

    } catch (error) {

        Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: error.message
        });

    }
}

cancelBtn.addEventListener("click", () => {
    resetForm();
});

function resetForm() {

    userForm.reset();

    editingId = null;

    formTitle.textContent = "Add User Information";
    saveBtn.textContent = "Add User";
    cancelBtn.style.display = "none";
}

logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userUID");
        localStorage.removeItem("userEmail");

        Swal.fire({
            icon: "success",
            title: "Logged Out",
            text: "You have been logged out successfully.",
            confirmButtonColor: "#2563eb"
        }).then(() => {
            window.location.href = "index.html";
        });

    } catch (error) {

        Swal.fire({
            icon: "error",
            title: "Logout Failed",
            text: error.message
        });

    }
});