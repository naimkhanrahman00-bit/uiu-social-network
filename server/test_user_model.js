const User = require('./models/userModel');

async function testUserModel() {
    try {
        console.log('Testing User.getAll()...\n');

        const result = await User.getAll({
            search: '',
            role: '',
            status: '',
            limit: 20,
            offset: 0
        });

        console.log('Success!');
        console.log('Total users:', result.total);
        console.log('Returned users:', result.users.length);

        if (result.users.length > 0) {
            console.log('\nFirst user:');
            console.log(result.users[0]);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

testUserModel();
