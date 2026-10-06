const params = new URLSearchParams(window.location.search);
const courseId = params.get("id");

const courseTitle =
    document.querySelector(".course-hero-content h1");

const courseDescription =
    document.querySelector(".course-description");

const coursePrice =
    document.querySelector(".course-price");

const courseDurations =
    document.querySelectorAll(".course-duration");

const courseLevels =
    document.querySelectorAll(".course-level");

const courseLessons =
    document.querySelectorAll(".course-lessons");

const courseButton =
    document.querySelector("#buy-now-btn");

const courseCategory =
    document.querySelector(".course-category-badge");

const courseImage =
    document.querySelector(".course-hero-image img");


async function loadCourse() {

    if (!courseId) {

        alert("Course ID missing.");

        window.location.href = "index.html";

        return;
    }


    try {

        const response = await fetch(
            `http://localhost:3000/api/courses/${courseId}`
        );


        if (!response.ok) {

            throw new Error("Course not found");

        }


        const course = await response.json();

        console.log("Course loaded:", course);


        /* COURSE DETAILS */

        if (courseTitle) {

            courseTitle.textContent =
                course.title;

        }


        if (courseDescription) {

            courseDescription.textContent =
                course.description || "";

        }


        if (coursePrice) {

            coursePrice.textContent =
                `₹${course.price}`;

        }


        courseDurations.forEach(element => {

            element.textContent =
                course.duration || "—";

        });


        courseLevels.forEach(element => {

            element.textContent =
                course.level || "—";

        });


        courseLessons.forEach(element => {

            element.textContent =
                course.lessons
                    ? `${course.lessons} Lessons`
                    : "—";

        });


        if (courseCategory) {

            courseCategory.textContent =
                course.category || "COURSE";

        }


        if (courseImage && course.image) {

            courseImage.src =
                course.image;

            courseImage.alt =
                course.title;

        }


        document.title =
            `${course.title} | CourseHub`;


        /* BUY NOW */

        if (courseButton) {

            courseButton.onclick = function () {

                window.location.href =
                    `payment.html?id=${course.id}`;

            };

        } else {

            console.error(
                "Buy Now button not found."
            );

        }


    } catch (error) {

        console.error(
            "Course loading error:",
            error
        );

        alert(
            "Course load nahi ho paya. Backend check karo."
        );

    }

}


loadCourse();