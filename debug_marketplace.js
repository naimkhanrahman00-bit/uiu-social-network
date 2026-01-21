const Marketplace = require('./server/models/Marketplace');

console.log('Marketplace model loaded.');
console.log('Keys:', Object.keys(Marketplace));
console.log('createCategory type:', typeof Marketplace.createCategory);

if (typeof Marketplace.createCategory !== 'function') {
    console.error('❌ createCategory is NOT a function!');
} else {
    console.log('✅ createCategory is a function.');
}

async function testHelp() {
    try {
        console.log('Attempting to call params validation on getAll...');
        // Just checking if other methods exist too
        console.log('getAll type:', typeof Marketplace.getAll);
    } catch (e) {
        console.error(e);
    }
}

testHelp();
