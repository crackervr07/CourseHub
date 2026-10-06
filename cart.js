const cartItemsContainer =
    document.getElementById("cart-items");

const emptyCart =
    document.getElementById("empty-cart");

const cartCount =
    document.getElementById("cart-count");

const cartSubtotal =
    document.getElementById("cart-subtotal");

const cartTotal =
    document.getElementById("cart-total");

const checkoutBtn =
    document.getElementById("checkout-btn");


// =========================================
// GET CART
// =========================================

function getCart() {

    try {

        return JSON.parse(
            localStorage.getItem("courseCart")
        ) || [];

    } catch (error) {

        console.error(
            "Cart error:",
            error
        );

        return [];

    }

}


// =========================================
// SAVE CART
// =========================================

function saveCart(cart) {

    localStorage.setItem(
        "courseCart",
        JSON.stringify(cart)
    );

}


// =========================================
// RENDER CART
// =========================================

function renderCart() {

    const cart = getCart();


    if (!cartItemsContainer) {
        return;
    }


    cartItemsContainer.innerHTML = "";


    // EMPTY CART

    if (cart.length === 0) {

        if (emptyCart) {
            emptyCart.style.display = "block";
        }


        if (cartCount) {
            cartCount.textContent = "0";
        }


        if (cartSubtotal) {
            cartSubtotal.textContent = "₹0";
        }


        if (cartTotal) {
            cartTotal.textContent = "₹0";
        }


        if (checkoutBtn) {
            checkoutBtn.disabled = true;
        }


        return;

    }


    // CART HAS ITEMS

    if (emptyCart) {
        emptyCart.style.display = "none";
    }


    if (checkoutBtn) {
        checkoutBtn.disabled = false;
    }


    let total = 0;


    cart.forEach(
        function (course, index) {

            const price =
                Number(course.price) || 0;


            total += price;


            const card =
                document.createElement("div");


            card.className =
                "cart-course-card";


            card.innerHTML = `

                <div class="cart-course-image">

                    <img
                        src="${
                            course.image ||
                            "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
                        }"
                        alt="${course.title || "Course"}"
                    >

                </div>


                <div class="cart-course-info">

                    <span class="cart-course-badge">
                        COURSE
                    </span>


                    <h3>
                        ${course.title || "Untitled Course"}
                    </h3>


                    <div class="cart-course-meta">

                        ${
                            course.duration
                                ? `⏱ ${course.duration}`
                                : ""
                        }

                        ${
                            course.level
                                ? ` • 🎓 ${course.level}`
                                : ""
                        }

                        ${
                            course.lessons
                                ? ` • 📚 ${course.lessons} Lessons`
                                : ""
                        }

                    </div>

                </div>


                <div class="cart-course-price">

                    <strong>
                        ₹${price}
                    </strong>


                    <button
                        type="button"
                        class="remove-cart-btn"
                        data-index="${index}"
                    >
                        Remove
                    </button>

                </div>

            `;


            cartItemsContainer.appendChild(
                card
            );

        }
    );


    // UPDATE SUMMARY

    if (cartCount) {

        cartCount.textContent =
            cart.length;

    }


    if (cartSubtotal) {

        cartSubtotal.textContent =
            `₹${total}`;

    }


    if (cartTotal) {

        cartTotal.textContent =
            `₹${total}`;

    }


    // REMOVE BUTTONS

    document
        .querySelectorAll(".remove-cart-btn")
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );


                        const currentCart =
                            getCart();


                        currentCart.splice(
                            index,
                            1
                        );


                        saveCart(
                            currentCart
                        );


                        renderCart();

                    }
                );

            }
        );

}


// =========================================
// CHECKOUT
// =========================================

if (checkoutBtn) {

    checkoutBtn.addEventListener(
        "click",
        function () {

            const cart =
                getCart();


            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            /*
             * Save complete cart
             * for checkout page
             */

            localStorage.setItem(
                "checkoutCart",
                JSON.stringify(cart)
            );


            /*
             * Keep first course ID
             * for compatibility
             * with existing checkout page
             */

            const firstCourse =
                cart[0];


            if (firstCourse && firstCourse.id) {

                window.location.href =
                    `checkout.html?id=${firstCourse.id}`;

            } else {

                window.location.href =
                    "checkout.html";

            }

        }
    );

}


// =========================================
// START
// =========================================

renderCart();