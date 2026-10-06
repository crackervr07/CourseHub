// =========================================
// LOGIN CHECK
// =========================================

const userData = localStorage.getItem("user");

if (!userData) {

    window.location.href = "login.html";

} else {

    const user = JSON.parse(userData);


    // =========================================
    // USER INFORMATION
    // =========================================

    document.getElementById("user-name").textContent =
        `Welcome, ${user.name}! 👋`;

    document.getElementById("user-email").textContent =
        user.email;


    // =========================================
    // LOAD ENROLLED COURSES
    // =========================================

    fetch(
        `http://localhost:3000/api/enrollments/${user.userId}`
    )

        .then(response => response.json())

        .then(courses => {

            const courseGrid =
                document.querySelector(
                    ".dashboard-course-grid"
                );


            const emptyCourse =
                document.querySelector(
                    ".empty-course"
                );


            // =========================================
            // UPDATE MY COURSES COUNT
            // =========================================

            const statCards =
                document.querySelectorAll(
                    ".student-stat-card"
                );


            if (statCards.length > 0) {

                statCards[0]
                    .querySelector("h2")
                    .textContent =
                    courses.length;

            }


            // =========================================
            // NO COURSES
            // =========================================

            if (courses.length === 0) {

                return;

            }


            // Remove empty message

            if (emptyCourse) {
                emptyCourse.remove();
            }


            // =========================================
            // DISPLAY COURSES
            // =========================================

            courses.forEach(course => {

                const card =
                    document.createElement("div");


                card.className =
                    "dashboard-course-card";


                card.innerHTML = `

                    <div class="dashboard-course-image">

                        ◈

                    </div>


                    <div class="dashboard-course-content">

                        <h3>
                            ${course.title}
                        </h3>


                        <p>
                            ${course.duration}
                            •
                            ${course.lessons}+ Lessons
                        </p>


                        <div class="progress-bar">

                            <div
                                class="progress-fill"
                                style="width: 0%;"
                            ></div>

                        </div>


                        <small>
                            0% Completed
                        </small>
<a
   href="course-learning.html?id=${course.course_id}"
    class="start-learning-btn"
>
    ▶ Start Learning
</a>
                    </div>

                `;


                courseGrid.appendChild(card);

            });


        })

        .catch(error => {

            console.log(
                "Course loading error:",
                error
            );

        });

}


// =========================================
// LOGOUT
// =========================================

const logoutButton =
    document.getElementById("logout-btn");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem("user");

            alert(
                "Logged out successfully!"
            );

            window.location.href =
                "login.html";

        }
    );

}