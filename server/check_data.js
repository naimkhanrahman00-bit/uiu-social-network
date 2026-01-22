const db = require('./config/db');

async function checkData() {
    try {
        const [users] = await db.execute('SELECT id, email, full_name, role FROM users LIMIT 5');
        console.log('Users:', users);

        const [listings] = await db.execute('SELECT id, title, user_id FROM marketplace_listings LIMIT 5');
        console.log('Listings:', listings);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkData();
