const form = document.querySelector("form");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    try {

const response = await fetch("https://coursehub-production-83e3.up.railway.app/api/signup", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Account created successfully! 🎉");
            form.reset();
            window.location.href = "login.html";
        } else {
            alert(data.message);
        }

    } catch (error) {

        console.log("Error:", error);

        alert("Server से connection नहीं हो पाया.");
    }
});
