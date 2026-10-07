const form = document.getElementById("admin-login-form");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("admin-email").value.trim();

    const password =
        document.getElementById("admin-password").value;

    const message =
        document.getElementById("admin-login-message");

    try {

        const response = await fetch(
            "https://coursehub-production-83e3.up.railway.app/api/admin/login",
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

            message.textContent =
                data.message || "Invalid admin credentials.";

        }

    } catch (error) {

        console.log("Admin Login Error:", error);

        message.textContent =
            "Server se connection nahi ho paya.";

    }

});
