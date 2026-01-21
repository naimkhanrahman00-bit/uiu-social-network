const db = require('../config/db');

const createTables = async () => {
    try {
        console.log('Creating ResourceHub tables...');

        // 1. departments
        await db.query(`
      CREATE TABLE IF NOT EXISTS departments (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL UNIQUE,
          code VARCHAR(10) NOT NULL UNIQUE,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Created departments table.');

        // 2. courses
        await db.query(`
      CREATE TABLE IF NOT EXISTS courses (
          id INT PRIMARY KEY AUTO_INCREMENT,
          code VARCHAR(20) NOT NULL UNIQUE,
          name VARCHAR(150) NOT NULL,
          department_id INT NOT NULL,
          trimester VARCHAR(20) NOT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (department_id) REFERENCES departments(id)
      );
    `);
        // Add Indexes if needed (Usually handled by FK, but adding explicitly if schema requested)
        // await db.query('CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department_id);'); 
        // MySQL adds index for FK automatically usually.

        console.log('Created courses table.');

        // 3. resources
        await db.query(`
      CREATE TABLE IF NOT EXISTS resources (
          id INT PRIMARY KEY AUTO_INCREMENT,
          course_id INT NOT NULL,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          file_path VARCHAR(255) NOT NULL,
          file_size BIGINT NOT NULL,
          download_count INT NOT NULL DEFAULT 0,
          uploaded_by INT NOT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (course_id) REFERENCES courses(id),
          FOREIGN KEY (uploaded_by) REFERENCES users(id)
      );
    `);
        console.log('Created resources table.');

        // Seed Data
        await seedDepartments();
        await seedCourses();

        console.log('ResourceHub DB setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating tables:', error);
        process.exit(1);
    }
};

const seedDepartments = async () => {
    const departments = [
        { name: 'Computer Science & Engineering', code: 'CSE' },
        { name: 'Electrical & Electronic Engineering', code: 'EEE' },
        { name: 'Business Administration', code: 'BBA' },
        { name: 'Civil Engineering', code: 'CE' },
        { name: 'Economics', code: 'ECO' },
        { name: 'English', code: 'ENG' }
    ];

    for (const dept of departments) {
        // Check if exists
        const [rows] = await db.query('SELECT id FROM departments WHERE code = ?', [dept.code]);
        if (rows.length === 0) {
            await db.query('INSERT INTO departments (name, code) VALUES (?, ?)', [dept.name, dept.code]);
            console.log(`Seeded department: ${dept.code}`);
        }
    }
};

const seedCourses = async () => {
    // Get Dept IDs
    const [deptRows] = await db.query('SELECT id, code FROM departments');
    const deptMap = {};
    deptRows.forEach(row => deptMap[row.code] = row.id);

    if (!deptMap['CSE']) return;

    const courses = [
        { code: 'CSE 1111', name: 'Structured Programming Language', dept: 'CSE', trimester: '1st' },
        { code: 'CSE 1112', name: 'Structured Programming Language Lab', dept: 'CSE', trimester: '1st' },
        { code: 'CSE 2213', name: 'Discrete Mathematics', dept: 'CSE', trimester: '3rd' },
        { code: 'CSE 2215', name: 'Data Structure and Algorithms I', dept: 'CSE', trimester: '4th' },
        { code: 'EEE 1101', name: 'Electrical Circuits I', dept: 'EEE', trimester: '1st' }
    ];

    for (const course of courses) {
        const deptId = deptMap[course.dept];
        if (deptId) {
            const [rows] = await db.query('SELECT id FROM courses WHERE code = ?', [course.code]);
            if (rows.length === 0) {
                await db.query('INSERT INTO courses (code, name, department_id, trimester) VALUES (?, ?, ?, ?)',
                    [course.code, course.name, deptId, course.trimester]);
                console.log(`Seeded course: ${course.code}`);
            }
        }
    }
};

createTables();
