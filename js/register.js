const registerForm = document.getElementById("registerForm");

const fullName = document.getElementById("fullname");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const fullNameValue = fullName.value;
    const emailValue = email.value;
    const passwordValue = password.value;
    const confirmPasswordValue = confirmPassword.value;

    if (passwordValue !== confirmPasswordValue) {
        alert("Passwords do not match!");
        return;
    }


    try {
        //get all users
        const getResponse = await fetch("http://localhost:3000/users");
        //convert response into array
        const users = await getResponse.json();
        const existingUser = users.find(function (user) {
            return user.email === emailValue
        });
        if (existingUser) {
            alert("Email already exists!");
            return;
        }
        const user = {
            fullname: fullNameValue,
            email: emailValue,
            password: passwordValue
        };

        //save user
        const postResponse = await fetch("http://localhost:3000/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        if (postResponse.ok) {
            alert("Registration Successful!");

            registerForm.reset();
        }
        else {
            alert("Something went wrong!");
        }

    } catch (error) {
        console.log(error);
        alert("Server not running!");
    }

});