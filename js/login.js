console.log("Javascript Connected");

const loginForm = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");

console.log(loginForm);

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const emailValue = email.value.trim().toLowerCase();
    const passwordValue = password.value;

    console.log(emailValue);
    console.log(passwordValue);

    try {

        const response = await fetch("https://focusflow-api-6cxu.onrender.com/users");

        const users = await response.json();

        const existingUser = users.find(function (user) {
            return user.email === emailValue;
        });

        // Check if email exists
        if (!existingUser) {
            alert("Email does not exist!");
            return;
        }

        // Check password
        if (existingUser.password !== passwordValue) {
            alert("Incorrect Password!");
            return;
        }

        localStorage.setItem("loggedInUser", JSON.stringify(existingUser));

        alert("Login Successful!");
        window.location.href = "dashboard.html";
    } catch (error) {

        console.log(error);
        alert("Server not running!");

    }

});