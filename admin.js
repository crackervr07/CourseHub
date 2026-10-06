// =========================================
// COURSEHUB ADMIN PANEL
// =========================================

const API_URL = "http://localhost:3000";

let allCourses = [];


// =========================================
// CHECK ADMIN LOGIN
// =========================================

const admin = localStorage.getItem("admin");

if (!admin) {
    window.location.href = "admin-login.html";
}
// =========================================
// ADMIN TOKEN
// =========================================

const adminData = JSON.parse(
    localStorage.getItem("admin") || "{}"
);

const adminToken =
    adminData.token || null;

// =========================================
// LOGOUT
// =========================================

const logoutButton = document.getElementById("admin-logout-btn");

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("admin");
        window.location.href = "admin-login.html";
    });
}


// =========================================
// LOAD COURSES
// =========================================

async function loadCourses() {

    try {

        const response = await fetch(
            `${API_URL}/api/admin/courses`,
            {
                headers: {
                    "x-admin-token": adminToken
                }
            }
        );

        if (!response.ok) {
            throw new Error("Unable to fetch courses");
        }

        const courses = await response.json();

        allCourses = courses;

        const totalCourses =
            document.getElementById("total-courses");

        if (totalCourses) {
            totalCourses.textContent = courses.length;
        }

        displayCourses(courses);

    } catch (error) {

        console.error(
            "Course loading error:",
            error
        );

        const courseList =
            document.getElementById(
                "admin-course-list"
            );

        if (courseList) {

            courseList.innerHTML = `
                <p style="color:red;">
                    Unable to load courses.
                </p>
            `;

        }

    }

}


// =========================================
// DISPLAY COURSES
// =========================================

function displayCourses(courses) {

    const courseList = document.getElementById("admin-course-list");

    if (!courseList) {
        return;
    }

    if (!courses || courses.length === 0) {

        courseList.innerHTML = `
            <p>No courses found.</p>
        `;

        return;
    }

    courseList.innerHTML = courses.map(course => {

        return `
            <div
                class="admin-course-item"
                style="
                    padding:20px;
                    margin-bottom:15px;
                    border:1px solid #e5e7eb;
                    border-radius:12px;
                    background:#ffffff;
                "
            >

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:flex-start;
                        gap:20px;
                        flex-wrap:wrap;
                    "
                >

                    <div>

                        <h3 style="margin-bottom:8px;">
                            ${course.title}
                        </h3>

                        <p>
                            ₹ Price:
                            <strong>₹${course.price}</strong>
                        </p>

                        <p>
                            ◆ Category:
                            ${course.category || "—"}
                        </p>

                        <p>
                            ◷  Duration:
                            ${course.duration || "—"}
                        </p>

                        <p>
                            ✦ Level:
                            ${course.level || "—"}
                        </p>

                        <p>
                            ➤ Telegram:
                            ${
                                course.telegram_link
                                    ? "Connected"
                                    : "Not added"
                            }
                        </p>

                    </div>


                    <div
                        style="
                            display:flex;
                            gap:10px;
                            flex-wrap:wrap;
                        "
                    >

                       <button
    onclick="editCourse(${course.id})"
    class="payment-action-btn verify-btn"
>
    ✦ Edit
</button>

                        <button
    onclick="deleteCourse(${course.id})"
    class="payment-action-btn delete-btn"
>
    ✕ Delete
</button>

                    </div>

                </div>

            </div>
        `;

    }).join("");
}


// =========================================
// EDIT COURSE
// =========================================

function editCourse(courseId) {

    const course = allCourses.find(
        item => Number(item.id) === Number(courseId)
    );

    if (!course) {
        alert("Course not found");
        return;
    }

    document.getElementById("edit-course-id").value = course.id;

    document.getElementById("edit-title").value =
        course.title || "";

    document.getElementById("edit-price").value =
        course.price || "";

    document.getElementById("edit-duration").value =
        course.duration || "";

    document.getElementById("edit-level").value =
        course.level || "";

    document.getElementById("edit-category").value =
        course.category || "";

    document.getElementById("edit-image").value =
        course.image || "";

    document.getElementById("edit-telegram").value =
        course.telegram_link || "";

    document.getElementById("edit-description").value =
        course.description || "";

    document.getElementById("edit-course-modal").style.display =
        "block";
}


// =========================================
// CLOSE EDIT MODAL
// =========================================

function closeEditModal() {

    const modal = document.getElementById("edit-course-modal");

    if (modal) {
        modal.style.display = "none";
    }
}


// =========================================
// SAVE EDITED COURSE
// =========================================

const editCourseForm =
    document.getElementById("edit-course-form");

if (editCourseForm) {

    editCourseForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const courseId =
            document.getElementById("edit-course-id").value;

        const courseData = {

            title:
                document.getElementById("edit-title").value.trim(),

            price:
                Number(
                    document.getElementById("edit-price").value
                ),

            duration:
                document.getElementById("edit-duration").value.trim(),

            level:
                document.getElementById("edit-level").value.trim(),

            category:
                document.getElementById("edit-category").value.trim(),

            image:
                document.getElementById("edit-image").value.trim(),

            telegram_link:
                document.getElementById("edit-telegram").value.trim(),

            description:
                document.getElementById("edit-description").value.trim()
        };


        if (!courseData.title) {
            alert("Please enter course title.");
            return;
        }


        if (!courseData.price) {
            alert("Please enter course price.");
            return;
        }


        try {

            const response = await fetch(
                `${API_URL}/api/courses/${courseId}`,
                {
                    method: "PUT",

                   headers: {
    "Content-Type": "application/json",
    "x-admin-token": adminToken
},

                    body: JSON.stringify(courseData)
                }
            );


            const data = await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Course update failed."
                );

                return;
            }


            alert("Course updated successfully! ✅");

            closeEditModal();

            await loadCourses();

        } catch (error) {

            console.error("Edit course error:", error);

            alert("Server connection failed.");
        }

    });
}


// =========================================
// DELETE COURSE
// =========================================

async function deleteCourse(courseId) {

    const course = allCourses.find(
        item => Number(item.id) === Number(courseId)
    );

    if (!course) {
        alert("Course not found.");
        return;
    }


    const confirmDelete = confirm(
        `Are you sure you want to delete "${course.title}"?`
    );


    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/api/courses/${courseId}`,
          {
    method: "DELETE",
    headers: {
        "x-admin-token": adminToken
    }
}
        );


        const data = await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Course deletion failed."
            );

            return;
        }


        alert("Course deleted successfully! 🗑️");

        await loadCourses();

    } catch (error) {

        console.error("Delete course error:", error);

        alert("Server connection failed.");
    }
}


// =========================================
// ADD NEW COURSE
// =========================================

const courseForm =
    document.getElementById("course-form");

if (courseForm) {

    courseForm.addEventListener("submit", async function(event) {

        event.preventDefault();


        const courseData = {

            title:
                document.getElementById("title").value.trim(),

            price:
                Number(
                    document.getElementById("price").value
                ),

            duration:
                document.getElementById("duration").value.trim(),

            level:
                document.getElementById("level").value.trim(),

            lessons:
                Number(
                    document.getElementById("lessons").value
                ) || 0,

            category:
                document.getElementById("category").value.trim(),

            image:
                document.getElementById("image").value.trim(),

            telegram_link:
                document.getElementById("telegram_link").value.trim(),

            description:
                document.getElementById("description").value.trim()
        };


        if (!courseData.title) {

            alert("Please enter course title.");

            return;
        }


        if (!courseData.price) {

            alert("Please enter course price.");

            return;
        }


        try {

            const response = await fetch(
                `${API_URL}/api/courses`,
                {
                    method: "POST",

                   headers: {
    "Content-Type": "application/json",
    "x-admin-token": adminToken
},

                    body: JSON.stringify(courseData)
                }
            );


            const data = await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Course could not be added."
                );

                return;
            }


            alert("Course added successfully! 🎉");

            courseForm.reset();

            await loadCourses();

        } catch (error) {

            console.error("Add course error:", error);

            alert("Server connection failed.");
        }

    });
}


// =========================================
// COURSE SEARCH
// =========================================

const searchInput =
    document.getElementById("admin-course-search");

if (searchInput) {

    searchInput.addEventListener("input", function() {

        const search =
            this.value.toLowerCase().trim();


        const filtered =
            allCourses.filter(course => {

                const title =
                    (course.title || "").toLowerCase();

                const category =
                    (course.category || "").toLowerCase();


                return (
                    title.includes(search) ||
                    category.includes(search)
                );

            });


        displayCourses(filtered);

    });
}


// =========================================
// LOAD PAYMENT REQUESTS
// =========================================

async function loadPaymentRequests() {

    const paymentList =
        document.getElementById("payment-request-list");

    if (!paymentList) {
        return;
    }

    try {

        const response =
            await fetch(`${API_URL}/api/payments`, {
                headers: {
                    "x-admin-token": adminToken
                }
            });

        if (!response.ok) {
            throw new Error(
                "Unable to load payments"
            );
        }

        const payments =
            await response.json();

        if (!payments || payments.length === 0) {

            paymentList.innerHTML = `
                <p>No payment requests found.</p>
            `;

            return;
        }

        paymentList.innerHTML =
            payments.map(payment => {

                // Convert courses string into list
                const courseTitles =
                    payment.course_titles
                        ? payment.course_titles
                            .split("||")
                        : [];

                const courseList =
                    courseTitles.length
                        ? courseTitles.map(title => `
                            <li>
                                ${title}
                            </li>
                        `).join("")
                        : "<li>Course information unavailable</li>";

                return `
                    <div
                        style="
                            padding:20px;
                            margin-bottom:15px;
                            border:1px solid #e5e7eb;
                            border-radius:12px;
                            background:#ffffff;
                        "
                    >

                        <h3>
                            📚 Purchased Courses
                        </h3>

                        <ul
                            style="
                                margin:10px 0;
                                padding-left:22px;
                            "
                        >
                            ${courseList}
                        </ul>

                        <p>
                            ♙ ${payment.user_name}
                        </p>

                        <p>
                            ✉ ${payment.user_email}
                        </p>

                        <p>
                            💰 Total:
                            <strong>
                                ₹${payment.amount}
                            </strong>
                        </p>

                        <p>
                            ⌁ UTR:
                            <strong>
                                ${payment.utr}
                            </strong>
                        </p>

                        <p>
                            ● Status:
                            <strong>
                                ${(payment.status || "")
                                    .toUpperCase()}
                            </strong>
                        </p>

                        ${
                            payment.status === "pending"
                                ? `
                                    <div
                                        style="
                                            margin-top:12px;
                                        "
                                    >

                                        <button
                                            onclick="verifyPayment(${payment.id})"
                                            class="payment-action-btn verify-btn"
                                        >
                                            ✓ Verify
                                        </button>

                                        <button
                                            onclick="rejectPayment(${payment.id})"
                                            class="payment-action-btn reject-btn"
                                        >
                                            ✕ Reject
                                        </button>

                                    </div>
                                `
                                : ""
                        }

                    </div>
                `;

            }).join("");

    } catch (error) {

        console.error(
            "Payment loading error:",
            error
        );

        paymentList.innerHTML = `
            <p style="color:red;">
                Unable to load payment requests.
            </p>
        `;
    }
}

// =========================================
// VERIFY PAYMENT
// =========================================

async function verifyPayment(paymentId) {

    try {

        const response = await fetch(
            `${API_URL}/api/payments/${paymentId}/verify`,
           {
    method: "PUT",
    headers: {
        "x-admin-token": adminToken
    }
}
        );


        const data = await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Payment verification failed."
            );

            return;
        }


        alert(
            data.message ||
            "Payment verified successfully! ✅"
        );


        await loadPaymentRequests();

    } catch (error) {

        console.error(
            "Verify payment error:",
            error
        );

        alert("Server connection failed.");
    }
}


// =========================================
// REJECT PAYMENT
// =========================================

async function rejectPayment(paymentId) {

    try {

        const response = await fetch(
            `${API_URL}/api/payments/${paymentId}/reject`,
           {
    method: "PUT",
    headers: {
        "x-admin-token": adminToken
    }
}
        );


        const data = await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Payment rejection failed."
            );

            return;
        }


        alert(
            data.message ||
            "Payment rejected."
        );


        await loadPaymentRequests();

    } catch (error) {

        console.error(
            "Reject payment error:",
            error
        );

        alert("Server connection failed.");
    }
}


// =========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// =========================================

window.addEventListener("click", function(event) {

    const modal =
        document.getElementById("edit-course-modal");


    if (
        modal &&
        event.target === modal
    ) {

        closeEditModal();

    }

});


// =========================================
// INITIAL LOAD
// =========================================

loadCourses();

loadPaymentRequests();