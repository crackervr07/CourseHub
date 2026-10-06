const Database = require("better-sqlite3");

const db = new Database("coursehub.db");


// =========================================
// USERS TABLE
// =========================================

db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
`).run();

console.log("Database connected successfully!");


// =========================================
// ENROLLMENTS TABLE
// =========================================

db.prepare(`
    CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();


// =========================================
// COURSES TABLE
// =========================================

db.prepare(`
    CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        price INTEGER NOT NULL,
        duration TEXT,
        level TEXT,
        lessons INTEGER,
        description TEXT,
        image TEXT,
        category TEXT,
        telegram_link TEXT
    )
`).run();


// =========================================
// DEFAULT COURSES
// =========================================

const courseCount = db
    .prepare("SELECT COUNT(*) AS count FROM courses")
    .get();


if (courseCount.count === 0) {

    const insertCourse = db.prepare(`
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
    `);


    insertCourse.run(
        "Web Development",
        499,
        "30 Hours",
        "Beginner to Advanced",
        50,
        "Learn HTML, CSS and JavaScript and build modern websites.",
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
        "Web Development",
        "TELEGRAM_LINK_HERE"
    );


    insertCourse.run(
        "Python Programming",
        399,
        "25 Hours",
        "Beginner to Advanced",
        40,
        "Learn Python programming from basics to practical projects.",
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
        "Programming",
        "TELEGRAM_LINK_HERE"
    );


    insertCourse.run(
        "Data Science",
        699,
        "40 Hours",
        "Beginner to Advanced",
        60,
        "Learn Python, data analysis and machine learning basics.",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
        "Data Science",
        "TELEGRAM_LINK_HERE"
    );

}


// =========================================
// LESSONS TABLE
// =========================================

db.prepare(`
    CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        lesson_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        video_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

console.log("Lessons table ready!");


// =========================================
// ADMINS TABLE
// =========================================

db.prepare(`
    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
`).run();


// =========================================
// DEFAULT ADMIN
// =========================================

const adminCount = db
    .prepare("SELECT COUNT(*) AS count FROM admins")
    .get();


if (adminCount.count === 0) {

    db.prepare(`
        INSERT INTO admins (
            email,
            password
        )
        VALUES (?, ?)
    `).run(
        "admin@coursehub.com",
        "admin123"
    );

}


// =========================================
// PAYMENTS TABLE
// =========================================

db.prepare(`
    CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        utr TEXT NOT NULL,
        amount INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

console.log("Payments table ready!");
// =========================================
// SAMPLE DATA SCIENCE LESSONS
// =========================================

const lessonCount = db
    .prepare(`
        SELECT COUNT(*) AS count
        FROM lessons
        WHERE course_id = 3
    `)
    .get();


if (lessonCount.count === 0) {

    const insertLesson = db.prepare(`
        INSERT INTO lessons
        (
            course_id,
            lesson_number,
            title,
            description,
            video_url
        )
        VALUES (?, ?, ?, ?, ?)
    `);


    insertLesson.run(
        3,
        1,
        "Introduction to Data Science",
        "Learn what Data Science is and understand the complete Data Science roadmap.",
        ""
    );


    insertLesson.run(
        3,
        2,
        "Python for Data Science",
        "Learn the Python basics required for Data Science and data analysis.",
        ""
    );


    insertLesson.run(
        3,
        3,
        "Introduction to Pandas",
        "Learn how Pandas is used to work with datasets and perform data analysis.",
        ""
    );

}

// =========================================
// EXPORT DATABASE
// =========================================
// =========================================
// UPDATE DATA SCIENCE TELEGRAM LINK
// =========================================

db.prepare(`
    UPDATE courses
    SET telegram_link = ?
    WHERE id = 3
`).run(
    "https://t.me/+roB7F5lH7lo4YTM1"
);
module.exports = db;