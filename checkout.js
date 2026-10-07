const checkoutItems = document.getElementById("checkout-items");
const summaryCourse = document.getElementById("summary-course");
const summaryPrice = document.getElementById("summary-price");
const summaryTotal = document.getElementById("summary-total");
const proceedPayment = document.getElementById("proceed-payment");

// ===============================
// GET CART
// ===============================

function getCart() {
    try {
        return JSON.parse(localStorage.getItem("courseCart")) || [];
    } catch (error) {
        console.log("Cart error:", error);
        return [];
    }
}

// ===============================
// DISPLAY CHECKOUT
// ===============================

function displayCheckout() {

    const cart = getCart();

    if (!cart.length) {
        alert("Your cart is empty.");
        window.location.href = "index.html";
        return;
    }

    let total = 0;

    checkoutItems.innerHTML = "";

    cart.forEach((course) => {

        const price = Number(course.price) || 0;

        total += price;

        const item = document.createElement("div");

        item.className = "checkout-course";

        item.innerHTML = `
            <img
                src="${
                    course.image ||
                    "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
                }"
                alt="${course.title || "Course"}"
            >

            <div class="checkout-course-info">

                <span>
                    ${course.category || "COURSE"}
                </span>

                <h3>
                    ${course.title || "Untitled Course"}
                </h3>

                <p>
                    ${
                        course.description ||
                        "Learn practical skills with CourseHub."
                    }
                </p>

                <div class="checkout-meta">

                    <span>
                        ⏱️ ${course.duration || "Self-paced"}
                    </span>

                    <span>
                        🎓 ${course.level || "All Levels"}
                    </span>

                    <span>
                        📚 ${course.lessons || 0} Lessons
                    </span>

                </div>

            </div>

            <strong class="checkout-course-price">
                ₹${price}
            </strong>
        `;

        checkoutItems.appendChild(item);
    });

    if (summaryCourse) {
        summaryCourse.textContent =
            `${cart.length} Course${cart.length > 1 ? "s" : ""}`;
    }

    if (summaryPrice) {
        summaryPrice.textContent = `₹${total}`;
    }

    if (summaryTotal) {
        summaryTotal.textContent = `₹${total}`;
    }
}

// ===============================
// PROCEED TO PAYMENT
// ===============================

if (proceedPayment) {

    proceedPayment.addEventListener("click", function () {

        const name =
            document.getElementById("customer-name")?.value.trim();

        const email =
            document.getElementById("customer-email")?.value.trim();

        const password =
            document.getElementById("customer-password")?.value;

        const confirmPassword =
            document.getElementById("customer-confirm-password")?.value;

        const telegramUsername =
            document.getElementById("telegram-username")?.value.trim();


        // ===============================
        // VALIDATION
        // ===============================

        if (!name) {
            alert("Please enter your full name.");
            return;
        }

        if (!email) {
            alert("Please enter your email.");
            return;
        }

        if (!password) {
            alert("Please create a password.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        if (!confirmPassword) {
            alert("Please confirm your password.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (!telegramUsername) {
            alert("Please enter your Telegram username.");
            return;
        }


        // ===============================
        // CART CHECK
        // ===============================

        const cart = getCart();

        if (!cart.length) {
            alert("Your cart is empty.");
            return;
        }


        // ===============================
        // CLEAN TELEGRAM USERNAME
        // ===============================

        const cleanTelegramUsername =
            telegramUsername.replace(/^@+/, "");


        // ===============================
        // SAVE CUSTOMER DETAILS
        // ===============================

        localStorage.setItem(
            "customerName",
            name
        );

        localStorage.setItem(
            "customerEmail",
            email
        );

        localStorage.setItem(
            "customerPassword",
            password
        );

        localStorage.setItem(
            "customerTelegram",
            cleanTelegramUsername
        );

        localStorage.setItem(
            "checkoutCart",
            JSON.stringify(cart)
        );


        // ===============================
        // GO TO PAYMENT
        // ===============================

        window.location.href = "payment.html";

    });
}

// ===============================
// START
// ===============================

displayCheckout();
