// =========================================
// COURSE ACCESS CHECK
// =========================================

const API_URL =
    "https://coursehub-production-83e3.up.railway.app";

const userData =
    localStorage.getItem("user");

if (!userData) {
    window.location.href = "login.html";
    throw new Error("User not logged in");
}


// =========================================
// GET USER + COURSE ID
// =========================================

const user =
    JSON.parse(userData);

const params =
    new URLSearchParams(
        window.location.search
    );

const courseId =
    params.get("id");


// =========================================
// ELEMENTS
// =========================================

const courseTitle =
    document.getElementById("course-title");

const lessonTitle =
    document.getElementById("lesson-title");

const lessonDescription =
    document.getElementById("lesson-description");

const telegramButton =
    document.getElementById("telegram-button");


// =========================================
// CHECK COURSE ACCESS
// =========================================

async function checkCourseAccess() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/course-access/${user.userId}/${courseId}`
            );

        if (!response.ok) {
            throw new Error(
                "Access check failed"
            );
        }

        const data =
            await response.json();

        if (!data.access) {

            alert(
                "Your payment is not verified yet. Please wait for admin verification."
            );

            window.location.href =
                `course.html?id=${courseId}`;

            return false;
        }

        return true;

    } catch (error) {

        console.log(
            "Access check error:",
            error
        );

        alert(
            "Unable to verify course access."
        );

        window.location.href =
            "dashboard.html";

        return false;
    }
}


// =========================================
// LOAD TELEGRAM ACCESS
// =========================================

async function loadTelegramAccess() {

    if (!telegramButton) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/api/course-telegram/${user.userId}/${courseId}`
            );

        const data =
            await response.json();

        console.log(
            "Telegram access:",
            data
        );


        // =====================================
        // VERIFIED PAYMENT + TELEGRAM AVAILABLE
        // =====================================

        if (
            response.ok &&
            data.access &&
            data.telegram_link
        ) {

            telegramButton.href =
                data.telegram_link;

            telegramButton.target =
                "_blank";

            telegramButton.rel =
                "noopener noreferrer";

            telegramButton.style.display =
                "inline-block";

            return;
        }


        // =====================================
        // TELEGRAM NOT AVAILABLE
        // =====================================

        telegramButton.style.display =
            "none";

    } catch (error) {

        console.log(
            "Telegram access error:",
            error
        );

        telegramButton.style.display =
            "none";
    }
}


// =========================================
// LOAD COURSE
// =========================================

async function loadCourse() {

    if (!courseId) {

        window.location.href =
            "dashboard.html";

        return;
    }


    // =====================================
    // CHECK PAYMENT / ACCESS
    // =====================================

    const hasAccess =
        await checkCourseAccess();

    if (!hasAccess) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/courses/${courseId}`
            );


        if (!response.ok) {

            throw new Error(
                "Course not found"
            );
        }


        const course =
            await response.json();


        // =====================================
        // COURSE TITLE
        // =====================================

        if (courseTitle) {

            courseTitle.textContent =
                course.title;
        }


        // =====================================
        // BROWSER TITLE
        // =====================================

        document.title =
            `${course.title} | CourseHub`;


        // =====================================
        // COURSE INFO
        // =====================================

        if (lessonTitle) {

            lessonTitle.textContent =
                "Course Access";
        }


        if (lessonDescription) {

            lessonDescription.textContent =
                "Your payment has been verified. You now have access to this course and its private Telegram community.";
        }


        // =====================================
        // LOAD PRIVATE TELEGRAM LINK
        // =====================================

        await loadTelegramAccess();

    } catch (error) {

        console.log(
            "Course loading error:",
            error
        );

        alert(
            "Course load nahi ho paya."
        );

        window.location.href =
            "dashboard.html";
    }

}


// =========================================
// START
// =========================================

loadCourse();
