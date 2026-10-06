const form = document.querySelector("form");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    try {

const response = await fetch("https://coursehub-production-83e3.up.railway.app/api/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {

            localStorage.setItem("user", JSON.stringify(data));

            alert("Login successful! 🎉");

           window.location.href = "dashboard.html";

        } else {

            alert(data.message);
        }

    } catch (error) {

        console.log("Error:", error);

        alert("Server से connection नहीं हो पाया.");
    }

});
