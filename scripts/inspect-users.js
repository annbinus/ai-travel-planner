import pool from '../backend/db.js';

async function inspect() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users'");
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

inspect();
