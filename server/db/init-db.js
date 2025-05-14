const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function initializeDatabase() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        console.log('Connected to MySQL server');

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema
        await connection.query(schema);

        console.log('Database initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing database:', error);
        return false;
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}

if (require.main === module) {
    initializeDatabase()
        .then(success => process.exit(success ? 0 : 1))
        .catch(() => process.exit(1));
}

module.exports = { initializeDatabase };
