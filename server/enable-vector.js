const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
      rejectUnauthorized: false
  }
});

async function enableVector() {
  try {
    await client.connect();
    await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log("Success: 'vector' extension enabled!");
  } catch (err) {
    console.error("Error enabling vector extension:", err);
  } finally {
    await client.end();
  }
}

enableVector();