const form = document.getElementById("admin-login-form");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document.getElementById("admin-email").value;
    const password = document.getElementById("admin-password").value;

    try {

        const response = await fetch(
            "http://localhost:3000/api/admin/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

           localStorage.setItem(
    "admin",
    JSON.stringify({
        adminId: data.adminId,
        email: data.email,
        token: data.token
    })
);

            window.location.href = "admin.html";

        } else {

            document.getElementById(
                "admin-login-message"
            ).textContent = data.message;

        }

    } catch (error) {

        console.log("Admin Login Error:", error);

        document.getElementById(
            "admin-login-message"
        ).textContent =
            "Server से connection नहीं हो पाया.";

    }

});