const courseList = document.getElementById("course-list");
const searchCourseList = document.getElementById("search-course-list");
const searchResultsSection = document.getElementById("search-results-section");
const searchInput = document.getElementById("course-search");

let allCourses = [];

function getCart() {
    try {
        return JSON.parse(localStorage.getItem("courseCart")) || [];
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem("courseCart", JSON.stringify(cart));
    updateCartCount();
}

function createCartButton() {
    const navbar = document.querySelector(".nav-links");

    if (!navbar) return;

    let cartButton = document.getElementById("navbar-cart");

    if (cartButton) return;

    cartButton = document.createElement("a");
    cartButton.id = "navbar-cart";
    cartButton.href = "cart.html";
    cartButton.className = "cart-nav-btn";

    cartButton.innerHTML = "🛒 Cart <span class=\"cart-count\">0</span>";

    const loginButton = navbar.querySelector(".login-btn");

    if (loginButton) {
        navbar.insertBefore(cartButton, loginButton);
    } else {
        navbar.appendChild(cartButton);
    }
}

function updateCartCount() {
    createCartButton();

    const cartButton = document.getElementById("navbar-cart");

    if (!cartButton) return;

    const cart = getCart();

    cartButton.innerHTML =
        "🛒 Cart <span class=\"cart-count\">" +
        cart.length +
        "</span>";
}

function showCartMessage(message) {
    let messageBox = document.getElementById("cart-message");

    if (!messageBox) {
        messageBox = document.createElement("div");
        messageBox.id = "cart-message";
        document.body.appendChild(messageBox);
    }

    messageBox.textContent = "✓ " + message;
    messageBox.classList.add("show");

    clearTimeout(window.cartMessageTimer);

    window.cartMessageTimer = setTimeout(function () {
        messageBox.classList.remove("show");
    }, 2200);
}

function addToCart(course) {
    const cart = getCart();

    const exists = cart.some(function (item) {
        return String(item.id) === String(course.id);
    });

    if (exists) {
        showCartMessage("This course is already in your cart");
        updateCartCount();
        return;
    }

    cart.push(course);
    saveCart(cart);

    showCartMessage(
        (course.title || "Course") + " added to cart"
    );
}

function displayCourses(courses, targetList) {
    if (!targetList) return;

    targetList.innerHTML = "";

    if (!courses || courses.length === 0) {
        targetList.innerHTML =
            "<div class=\"no-course\">" +
            "<h3>No courses found</h3>" +
            "<p>Try another search or category.</p>" +
            "</div>";

        return;
    }

    courses.forEach(function (course) {
        const card = document.createElement("div");

        card.className = "course-card";

        const title = course.title || "Untitled Course";
        const description =
            course.description ||
            "Learn practical skills with CourseHub.";

        const image =
            course.image ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3";

        const price =
            course.price !== undefined
                ? course.price
                : 0;

        const duration =
            course.duration || "Self-paced";

        const level =
            course.level || "All Levels";

        const lessons =
            course.lessons || 0;

        card.innerHTML =
            "<div class=\"course-image-wrapper\">" +

                "<img " +
                "src=\"" + image + "\" " +
                "alt=\"" + title + "\" " +
                "class=\"course-image\" " +
                "loading=\"lazy\">" +

            "</div>" +

            "<div class=\"course-card-content\">" +

                "<h3>" + title + "</h3>" +

                "<p class=\"course-description\">" +
                    description +
                "</p>" +

                "<div class=\"course-meta\">" +

                    "<span>⏱️ " +
                        duration +
                    "</span>" +

                    "<span>📚 " +
                        lessons +
                        " Lessons" +
                    "</span>" +

                    "<span>🎯 " +
                        level +
                    "</span>" +

                "</div>" +

                "<div class=\"course-card-bottom\">" +

                    "<div class=\"price\">" +
                        "₹" + price +
                    "</div>" +

                    "<button " +
                    "type=\"button\" " +
                    "class=\"course-btn add-to-cart-btn\">" +
                        "Add to Cart" +
                    "</button>" +

                "</div>" +

            "</div>";

        const addButton =
            card.querySelector(".add-to-cart-btn");

        addButton.addEventListener("click", function () {
            addToCart(course);
        });

        targetList.appendChild(card);
    });
}

async function loadCourses() {
    if (courseList) {
        courseList.innerHTML =
            "<div class=\"no-course\">" +
            "<h3>Loading courses...</h3>" +
            "<p>Please wait.</p>" +
            "</div>";
    }

    try {
        const response = await fetch(
          "https://coursehub-production-83e3.up.railway.app/api/courses"
        );

        if (!response.ok) {
            throw new Error("Failed to load courses");
        }

        allCourses = await response.json();

        console.log("Courses loaded:", allCourses);

        displayCourses(allCourses, courseList);

    } catch (error) {
        console.error("Error loading courses:", error);

        if (courseList) {
            courseList.innerHTML =
                "<div class=\"no-course\">" +
                "<h3>Courses load nahi ho paye</h3>" +
                "<p>Please make sure CourseHub server is running.</p>" +
                "</div>";
        }
    }
}

if (searchInput) {
    searchInput.addEventListener("input", function () {
        const searchText =
            this.value.toLowerCase().trim();

        if (!searchText) {
            if (searchResultsSection) {
                searchResultsSection.style.display = "none";
            }

            displayCourses(allCourses, courseList);
            return;
        }

        const filteredCourses =
            allCourses.filter(function (course) {
                const title =
                    (course.title || "").toLowerCase();

                const category =
                    (course.category || "").toLowerCase();

                const description =
                    (course.description || "").toLowerCase();

                const level =
                    (course.level || "").toLowerCase();

                return (
                    title.includes(searchText) ||
                    category.includes(searchText) ||
                    description.includes(searchText) ||
                    level.includes(searchText)
                );
            });

        if (searchResultsSection) {
            searchResultsSection.style.display = "block";
        }

        displayCourses(
            filteredCourses,
            searchCourseList
        );
    });
}

const categoryButtons =
    document.querySelectorAll(".category-card");

categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const selectedCategory =
            (this.dataset.category || "")
                .toLowerCase()
                .trim();

        const filteredCourses =
            allCourses.filter(function (course) {
                const category =
                    (course.category || "")
                        .toLowerCase()
                        .trim();

                return category === selectedCategory;
            });

        if (searchResultsSection) {
            searchResultsSection.style.display = "none";
        }

        if (searchInput) {
            searchInput.value = "";
        }

        displayCourses(filteredCourses, courseList);

        const coursesSection =
            document.getElementById("courses");

        if (coursesSection) {
            coursesSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
});

createCartButton();
updateCartCount();
loadCourses();
