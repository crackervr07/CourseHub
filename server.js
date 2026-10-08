const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const db = require("./database");

const app = express();


// =========================================
// MIDDLEWARE
// =========================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// =========================================
// DATABASE MIGRATION
// =========================================

try {

    const userColumns = db.prepare(`
        PRAGMA table_info(users)
    `).all();

    const telegramColumnExists =
        userColumns.some(
            column => column.name === "telegram_username"
        );

    if (!telegramColumnExists) {

        db.prepare(`
            ALTER TABLE users
            ADD COLUMN telegram_username TEXT
        `).run();

        console.log(
            "Added telegram_username column to users table"
        );

    }

} catch (error) {

    console.log(
        "Database migration error:",
        error
    );

}


// =========================================
// HOME
// =========================================

app.get("/", (req, res) => {

    res.send("CourseHub Backend is Running 🚀");

});


// =========================================
// GET ALL COURSES
// =========================================

app.get("/api/courses", (req, res) => {

    try {

        const courses = db.prepare(`
            SELECT
                id,
                title,
                price,
                duration,
                level,
                lessons,
                description,
                image,
                category
            FROM courses
            ORDER BY id DESC
        `).all();

        res.json(courses);

    } catch (error) {

        console.log("Courses fetch error:", error);

        res.status(500).json({
            message: "Unable to fetch courses"
        });

    }

});


// =========================================
// GET SINGLE COURSE
// =========================================

app.get("/api/courses/:id", (req, res) => {

    const courseId = parseInt(req.params.id);

    try {

        const course = db.prepare(`
            SELECT
                id,
                title,
                price,
                duration,
                level,
                lessons,
                description,
                image,
                category
            FROM courses
            WHERE id = ?
        `).get(courseId);

        if (!course) {

            return res.status(404).json({
                message: "Course not found"
            });

        }

        res.json(course);

    } catch (error) {

        console.log("Single course error:", error);

        res.status(500).json({
            message: "Unable to fetch course"
        });

    }

});


// =========================================
// SIGNUP
// =========================================

app.post("/api/signup", (req, res) => {

    const {
        name,
        email,
        password
    } = req.body;

    if (!name || !email || !password) {

        return res.status(400).json({
            message: "All fields are required"
        });

    }

    try {

        const existingUser = db.prepare(`
            SELECT *
            FROM users
            WHERE email = ?
        `).get(email);

        if (existingUser) {

            return res.status(400).json({
                message: "Email already registered"
            });

        }

        const result = db.prepare(`
            INSERT INTO users
            (
                name,
                email,
                password
            )
            VALUES (?, ?, ?)
        `).run(
            name,
            email,
            password
        );

        res.json({
            message: "Signup successful",
            userId: result.lastInsertRowid
        });

    } catch (error) {

        console.log("Signup error:", error);

        res.status(500).json({
            message: "Signup failed"
        });

    }

});


// =========================================
// LOGIN
// =========================================

app.post("/api/login", (req, res) => {

    const {
        email,
        password
    } = req.body;

    if (!email || !password) {

        return res.status(400).json({
            message: "Email and password are required"
        });

    }

    try {

        const user = db.prepare(`
            SELECT *
            FROM users
            WHERE email = ?
            AND password = ?
        `).get(
            email,
            password
        );

        if (!user) {

            return res.status(401).json({
                message: "Invalid email or password"
            });

        }

        res.json({
            message: "Login successful",
            userId: user.id,
            name: user.name,
            email: user.email
        });

    } catch (error) {

        console.log("Login error:", error);

        res.status(500).json({
            message: "Login failed"
        });

    }

});


// =========================================
// ADMIN AUTHENTICATION
// =========================================

const adminTokens = new Map();

function generateAdminToken() {

    return crypto.randomBytes(32).toString("hex");

}

function requireAdmin(req, res, next) {

    const token =
        req.headers["x-admin-token"];

    if (!token || !adminTokens.has(token)) {

        return res.status(401).json({
            message: "Admin authentication required"
        });

    }

    next();

}


// =========================================
// ADMIN LOGIN
// =========================================

app.post("/api/admin/login", (req, res) => {

    const {
        email,
        password
    } = req.body;

    if (!email || !password) {

        return res.status(400).json({
            message: "Email and password are required"
        });

    }

    try {

        const admin = db.prepare(`
            SELECT *
            FROM admins
            WHERE email = ?
            AND password = ?
        `).get(
            email,
            password
        );

        if (!admin) {

            return res.status(401).json({
                message: "Invalid admin credentials"
            });

        }

        const token = generateAdminToken();

        adminTokens.set(token, {
            adminId: admin.id,
            email: admin.email
        });

        res.json({
            message: "Admin login successful",
            adminId: admin.id,
            email: admin.email,
            token: token
        });

    } catch (error) {

        console.log("Admin login error:", error);

        res.status(500).json({
            message: "Admin login failed"
        });

    }

});


// =========================================
// ENROLL USER
// =========================================

app.post("/api/enroll", (req, res) => {

    const {
        userId,
        courseId
    } = req.body;

    if (!userId || !courseId) {

        return res.status(400).json({
            message: "User ID and Course ID are required"
        });

    }

    try {

        const existingEnrollment = db.prepare(`
            SELECT *
            FROM enrollments
            WHERE user_id = ?
            AND course_id = ?
        `).get(
            userId,
            courseId
        );

        if (existingEnrollment) {

            return res.json({
                message: "Already enrolled"
            });

        }

        db.prepare(`
            INSERT INTO enrollments
            (
                user_id,
                course_id
            )
            VALUES (?, ?)
        `).run(
            userId,
            courseId
        );

        res.json({
            message: "Enrollment successful"
        });

    } catch (error) {

        console.log("Enrollment error:", error);

        res.status(500).json({
            message: "Enrollment failed"
        });

    }

});


// =========================================
// USER ENROLLED COURSES
// =========================================

app.get("/api/enrollments/:userId", (req, res) => {

    const userId = parseInt(req.params.userId);

    try {

        const enrollments = db.prepare(`
            SELECT
                enrollments.id,
                courses.id AS course_id,
                courses.title,
                courses.price,
                courses.duration,
                courses.level,
                courses.lessons,
                courses.image,
                courses.description,
                courses.category
            FROM enrollments
            JOIN courses
                ON enrollments.course_id = courses.id
            WHERE enrollments.user_id = ?
        `).all(userId);

        res.json(enrollments);

    } catch (error) {

        console.log("Enrollments fetch error:", error);

        res.status(500).json({
            message: "Unable to fetch enrollments"
        });

    }

});


// =========================================
// CHECK COURSE ACCESS
// =========================================

app.get(
    "/api/course-access/:userId/:courseId",
    (req, res) => {

        const userId = parseInt(req.params.userId);
        const courseId = parseInt(req.params.courseId);

        try {

            const payment = db.prepare(`
                SELECT *
                FROM payments
                WHERE user_id = ?
                AND course_id = ?
                AND status = 'verified'
                ORDER BY id DESC
                LIMIT 1
            `).get(
                userId,
                courseId
            );

            if (!payment) {

                return res.json({
                    access: false
                });

            }

            res.json({
                access: true
            });

        } catch (error) {

            console.log("Course access error:", error);

            res.status(500).json({
                message: "Unable to check course access"
            });

        }

    }
);


// =========================================
// GET TELEGRAM LINK
// VERIFIED PAYMENT ONLY
// =========================================

app.get(
    "/api/course-telegram/:userId/:courseId",
    (req, res) => {

        const userId = parseInt(req.params.userId);
        const courseId = parseInt(req.params.courseId);

        if (!userId || !courseId) {

            return res.status(400).json({
                message: "User ID and Course ID are required"
            });

        }

        try {

            const payment = db.prepare(`
                SELECT id
                FROM payments
                WHERE user_id = ?
                AND course_id = ?
                AND status = 'verified'
                ORDER BY id DESC
                LIMIT 1
            `).get(
                userId,
                courseId
            );

            if (!payment) {

                return res.status(403).json({
                    access: false,
                    message: "Payment not verified"
                });

            }

            const course = db.prepare(`
                SELECT
                    id,
                    title,
                    telegram_link
                FROM courses
                WHERE id = ?
            `).get(courseId);

            if (!course) {

                return res.status(404).json({
                    message: "Course not found"
                });

            }

            if (!course.telegram_link) {

                return res.status(404).json({
                    access: true,
                    message: "Telegram link is not available yet"
                });

            }

            res.json({
                access: true,
                courseId: course.id,
                courseTitle: course.title,
                telegram_link: course.telegram_link
            });

        } catch (error) {

            console.log("Telegram access error:", error);

            res.status(500).json({
                message: "Unable to get Telegram access"
            });

        }

    }
);


// =========================================
// ADD COURSE LESSON
// LEGACY ROUTE
// =========================================

app.post("/api/lessons", (req, res) => {

    const {
        courseId,
        lessonNumber,
        title,
        description,
        videoUrl
    } = req.body;

    if (!courseId || !lessonNumber || !title) {

        return res.status(400).json({
            message: "Course ID, lesson number and title are required"
        });

    }

    try {

        const course = db.prepare(`
            SELECT *
            FROM courses
            WHERE id = ?
        `).get(courseId);

        if (!course) {

            return res.status(404).json({
                message: "Course not found"
            });

        }

        const result = db.prepare(`
            INSERT INTO lessons
            (
                course_id,
                lesson_number,
                title,
                description,
                video_url
            )
            VALUES (?, ?, ?, ?, ?)
        `).run(
            courseId,
            lessonNumber,
            title,
            description || "",
            videoUrl || ""
        );

        res.json({
            message: "Lesson added successfully",
            lessonId: result.lastInsertRowid
        });

    } catch (error) {

        console.log("Add lesson error:", error);

        res.status(500).json({
            message: "Unable to add lesson"
        });

    }

});


// =========================================
// GET COURSE LESSONS
// LEGACY ROUTE
// =========================================

app.get(
    "/api/lessons/:courseId",
    (req, res) => {

        const courseId = parseInt(req.params.courseId);

        try {

            const lessons = db.prepare(`
                SELECT
                    id,
                    course_id,
                    lesson_number,
                    title,
                    description,
                    video_url
                FROM lessons
                WHERE course_id = ?
                ORDER BY lesson_number ASC
            `).all(courseId);

            res.json(lessons);

        } catch (error) {

            console.log("Lessons fetch error:", error);

            res.status(500).json({
                message: "Unable to fetch lessons"
            });

        }

    }
);


// =========================================
// CREATE CART ORDER
// =========================================

app.post("/api/cart-order", (req, res) => {

    const {
        userId,
        courseIds
    } = req.body;

    if (!userId || !Array.isArray(courseIds) || courseIds.length === 0) {

        return res.status(400).json({
            message: "User ID and courses are required"
        });

    }

    try {

        const placeholders =
            courseIds.map(() => "?").join(",");

        const courses = db.prepare(`
            SELECT
                id,
                title,
                price
            FROM courses
            WHERE id IN (${placeholders})
        `).all(...courseIds);

        if (courses.length !== courseIds.length) {

            return res.status(400).json({
                message: "One or more courses not found"
            });

        }

        const totalAmount = courses.reduce(
            (total, course) =>
                total + Number(course.price),
            0
        );

        res.json({
            message: "Cart order created",
            courses,
            totalAmount
        });

    } catch (error) {

        console.log(
            "Cart order error:",
            error
        );

        res.status(500).json({
            message: "Unable to create cart order"
        });

    }

});


// =========================================
// SUBMIT PAYMENT
// GUEST CHECKOUT
// =========================================

app.post("/api/payments", (req, res) => {

    const {
        userId,
        name,
        email,
        password,
        telegramUsername,
        courseIds,
        utr,
        amount
    } = req.body;


    // =========================================
    // BASIC VALIDATION
    // =========================================

    if (
        !Array.isArray(courseIds) ||
        courseIds.length === 0 ||
        !utr
    ) {

        return res.status(400).json({
            message: "Courses and UTR are required"
        });

    }


    // Guest checkout requires customer details

    if (
        !userId &&
        (
            !name ||
            !email ||
            !password ||
            !telegramUsername
        )
    ) {

        return res.status(400).json({
            message:
                "Name, email, password and Telegram username are required"
        });

    }


    try {


        // =========================================
        // FIND / CREATE USER
        // =========================================

        let customerUserId;
        let customerName;
        let customerEmail;
        let customerTelegram;


        if (userId) {


            // Existing logged-in user

            const existingUser = db.prepare(`
                SELECT *
                FROM users
                WHERE id = ?
            `).get(userId);


            if (!existingUser) {

                return res.status(404).json({
                    message: "User not found"
                });

            }


            customerUserId =
                existingUser.id;

            customerName =
                existingUser.name;

            customerEmail =
                existingUser.email;

            customerTelegram =
                existingUser.telegram_username || "";


        } else {


            // =========================================
            // GUEST CUSTOMER DETAILS
            // =========================================

            customerEmail =
                String(email)
                    .trim()
                    .toLowerCase();

            customerName =
                String(name)
                    .trim();

            customerTelegram =
                String(telegramUsername)
                    .trim()
                    .replace(/^@+/, "");


            // =========================================
            // CHECK EXISTING EMAIL
            // =========================================

            const existingUser = db.prepare(`
                SELECT *
                FROM users
                WHERE email = ?
            `).get(customerEmail);


            if (existingUser) {


                customerUserId =
                    existingUser.id;


                // Update customer details

                db.prepare(`
                    UPDATE users
                    SET
                        name = ?,
                        password = ?,
                        telegram_username = ?
                    WHERE id = ?
                `).run(
                    customerName,
                    password,
                    customerTelegram,
                    existingUser.id
                );


            } else {


                // =========================================
                // CREATE CUSTOMER ACCOUNT
                // =========================================

                const newUser = db.prepare(`
                    INSERT INTO users
                    (
                        name,
                        email,
                        password,
                        telegram_username
                    )
                    VALUES (?, ?, ?, ?)
                `).run(
                    customerName,
                    customerEmail,
                    password,
                    customerTelegram
                );


                customerUserId =
                    newUser.lastInsertRowid;

            }

        }


        // =========================================
        // CHECK ALL COURSES
        // =========================================

        const placeholders =
            courseIds.map(() => "?").join(",");


        const courses = db.prepare(`
            SELECT *
            FROM courses
            WHERE id IN (${placeholders})
        `).all(...courseIds);


        if (courses.length !== courseIds.length) {

            return res.status(400).json({
                message:
                    "One or more courses not found"
            });

        }


        // =========================================
        // CHECK DUPLICATE UTR
        // =========================================

        const existingPayment = db.prepare(`
            SELECT *
            FROM payments
            WHERE utr = ?
        `).get(utr);


        if (existingPayment) {

            return res.status(400).json({
                message:
                    "This UTR has already been submitted"
            });

        }


        // =========================================
        // CREATE PAYMENT FOR ALL COURSES
        // =========================================

        const insertPayment = db.prepare(`
            INSERT INTO payments
            (
                user_id,
                course_id,
                utr,
                amount,
                status
            )
            VALUES (?, ?, ?, ?, ?)
        `);


        const createPayments =
            db.transaction(() => {

                const paymentIds = [];


                for (const course of courses) {

                    const payment =
                        insertPayment.run(
                            customerUserId,
                            course.id,
                            utr,
                            course.price,
                            "pending"
                        );


                    paymentIds.push(
                        payment.lastInsertRowid
                    );

                }


                return paymentIds;

            });


        const paymentIds =
            createPayments();


        // =========================================
        // SUCCESS RESPONSE
        // =========================================

        res.json({

            message:
                "Payment submitted successfully",

            userId:
                customerUserId,

            userName:
                customerName,

            userEmail:
                customerEmail,

            telegramUsername:
                customerTelegram,

            paymentIds:
                paymentIds,

            courseIds:
                courseIds,

            totalAmount:
                amount || courses.reduce(
                    (total, course) =>
                        total + Number(course.price),
                    0
                ),

            status:
                "pending"

        });


    } catch (error) {


        console.log(
            "Payment submit error:",
            error
        );


        res.status(500).json({
            message:
                "Payment submission failed"
        });

    }

});


// =========================================
// GET ALL PAYMENTS
// =========================================

app.get("/api/payments", requireAdmin, (req, res) => {

    try {

        const payments = db.prepare(`
            SELECT
                MIN(payments.id) AS id,

                payments.user_id,

                users.name AS user_name,

                users.email AS user_email,

                users.telegram_username AS telegram_username,

                payments.utr,

                GROUP_CONCAT(
                    courses.title,
                    '||'
                ) AS course_titles,

                SUM(
                    CAST(payments.amount AS INTEGER)
                ) AS amount,

                payments.status,

                MAX(payments.payment_date)
                    AS payment_date

            FROM payments

            JOIN users
                ON payments.user_id = users.id

            JOIN courses
                ON payments.course_id = courses.id

            GROUP BY
                payments.user_id,
                payments.utr

            ORDER BY
                MAX(payments.id) DESC

        `).all();


        res.json(payments);


    } catch (error) {


        console.log(
            "Payments fetch error:",
            error
        );


        res.status(500).json({
            message:
                "Unable to fetch payments"
        });

    }

});


// =========================================
// VERIFY PAYMENT
// =========================================

app.put(
    "/api/payments/:id/verify",
    requireAdmin,
    (req, res) => {

        const paymentId =
            parseInt(req.params.id);


        try {


            // =========================================
            // FIND PAYMENT
            // =========================================

            const payment = db.prepare(`
                SELECT *
                FROM payments
                WHERE id = ?
            `).get(paymentId);


            if (!payment) {

                return res.status(404).json({
                    message: "Payment not found"
                });

            }


            // =========================================
            // FIND ALL COURSES OF PAYMENT
            // SAME USER + SAME UTR
            // =========================================

            const payments = db.prepare(`
                SELECT *
                FROM payments
                WHERE user_id = ?
                AND utr = ?
            `).all(
                payment.user_id,
                payment.utr
            );


            if (!payments.length) {

                return res.status(404).json({
                    message:
                        "Payment courses not found"
                });

            }


            // =========================================
            // VERIFY + ENROLL
            // =========================================

            const verifyPayment =
                db.transaction(() => {


                    // Mark payments verified

                    db.prepare(`
                        UPDATE payments
                        SET status = 'verified'
                        WHERE user_id = ?
                        AND utr = ?
                    `).run(
                        payment.user_id,
                        payment.utr
                    );


                    // Enrollment statements

                    const checkEnrollment =
                        db.prepare(`
                            SELECT *
                            FROM enrollments
                            WHERE user_id = ?
                            AND course_id = ?
                        `);


                    const addEnrollment =
                        db.prepare(`
                            INSERT INTO enrollments
                            (
                                user_id,
                                course_id
                            )
                            VALUES (?, ?)
                        `);


                    // Enroll every purchased course

                    for (const item of payments) {

                        const existingEnrollment =
                            checkEnrollment.get(
                                payment.user_id,
                                item.course_id
                            );


                        if (!existingEnrollment) {

                            addEnrollment.run(
                                payment.user_id,
                                item.course_id
                            );

                        }

                    }

                });


            verifyPayment();


            // =========================================
            // SUCCESS
            // =========================================

            res.json({

                message:
                    "Payment verified and all courses enrolled successfully",

                courses:
                    payments.map(
                        item => item.course_id
                    )

            });


        } catch (error) {


            console.log(
                "Payment verification error:",
                error
            );


            res.status(500).json({
                message:
                    "Payment verification failed"
            });

        }

    }
);


// =========================================
// REJECT PAYMENT
// =========================================

app.put(
    "/api/payments/:id/reject",
    requireAdmin,
    (req, res) => {

        const paymentId =
            parseInt(req.params.id);


        try {


            // =========================================
            // FIND PAYMENT
            // =========================================

            const payment = db.prepare(`
                SELECT *
                FROM payments
                WHERE id = ?
            `).get(paymentId);


            if (!payment) {

                return res.status(404).json({
                    message: "Payment not found"
                });

            }


            // =========================================
            // REJECT ALL COURSES
            // SAME USER + SAME UTR
            // =========================================

            db.prepare(`
                UPDATE payments
                SET status = 'rejected'
                WHERE user_id = ?
                AND utr = ?
            `).run(
                payment.user_id,
                payment.utr
            );


            // =========================================
            // SUCCESS
            // =========================================

            res.json({

                message:
                    "Payment rejected successfully"

            });


        } catch (error) {


            console.log(
                "Reject payment error:",
                error
            );


            res.status(500).json({
                message:
                    "Unable to reject payment"
            });

        }

    }
);


// =========================================
// ADMIN COURSES
// =========================================

app.get(
    "/api/admin/courses",
    requireAdmin,
    (req, res) => {

        try {

            const courses = db.prepare(`
                SELECT *
                FROM courses
                ORDER BY id DESC
            `).all();

            res.json(courses);

        } catch (error) {

            console.log(
                "Admin courses error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to load admin courses"
            });

        }

    }
);


// =========================================
// ADD COURSE
// =========================================

app.post(
    "/api/courses",
    requireAdmin,
    (req, res) => {

        const {
            title,
            price,
            duration,
            level,
            lessons,
            description,
            image,
            category,
            telegram_link
        } = req.body;


        if (!title || price === undefined) {

            return res.status(400).json({
                message:
                    "Title and price are required"
            });

        }


        try {

            const result = db.prepare(`
                INSERT INTO courses
                (
                    title,
                    price,
                    duration,
                    level,
                    lessons,
                    description,
                    image,
                    category,
                    telegram_link
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                title,
                price,
                duration || "",
                level || "",
                lessons || 0,
                description || "",
                image || "",
                category || "",
                telegram_link || ""
            );


            res.json({
                message:
                    "Course added successfully",

                courseId:
                    result.lastInsertRowid
            });


        } catch (error) {


            console.log(
                "Add course error:",
                error
            );


            res.status(500).json({
                message:
                    "Unable to add course"
            });

        }

    }
);


// =========================================
// DELETE COURSE
// =========================================

app.delete(
    "/api/courses/:id",
    requireAdmin,
    (req, res) => {

        const courseId =
            parseInt(req.params.id);


        try {

            const course = db.prepare(`
                SELECT *
                FROM courses
                WHERE id = ?
            `).get(courseId);


            if (!course) {

                return res.status(404).json({
                    message:
                        "Course not found"
                });

            }


            db.prepare(`
                DELETE FROM courses
                WHERE id = ?
            `).run(courseId);


            res.json({
                message:
                    "Course deleted successfully"
            });


        } catch (error) {


            console.log(
                "Delete course error:",
                error
            );


            res.status(500).json({
                message:
                    "Unable to delete course"
            });

        }

    }
);


// =========================================
// UPDATE COURSE
// =========================================

app.put(
    "/api/courses/:id",
    requireAdmin,
    (req, res) => {

        const courseId =
            parseInt(req.params.id);


        const {
            title,
            price,
            duration,
            level,
            lessons,
            description,
            image,
            category,
            telegram_link
        } = req.body;


        try {

            const course = db.prepare(`
                SELECT *
                FROM courses
                WHERE id = ?
            `).get(courseId);


            if (!course) {

                return res.status(404).json({
                    message:
                        "Course not found"
                });

            }


            db.prepare(`
                UPDATE courses
                SET
                    title = ?,
                    price = ?,
                    duration = ?,
                    level = ?,
                    lessons = ?,
                    description = ?,
                    image = ?,
                    category = ?,
                    telegram_link = ?
                WHERE id = ?
            `).run(
                title,
                price,
                duration,
                level,
                lessons,
                description,
                image,
                category,
                telegram_link,
                courseId
            );


            res.json({
                message:
                    "Course updated successfully"
            });


        } catch (error) {


            console.log(
                "Update course error:",
                error
            );


            res.status(500).json({
                message:
                    "Unable to update course"
            });

        }

    }
);


// =========================================
// SERVER START
// =========================================

const PORT = 3000;

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});
