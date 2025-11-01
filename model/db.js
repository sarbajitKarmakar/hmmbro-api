// // Import the 'pg' library
// import { Client } from 'pg';

// // PostgreSQL connection configuration
// const client = new Client({
//   host: process.env.HOST || 'localhost',       // Hostname of the PostgreSQL server
//   port: process.env.PORT ||5432,              // Default PostgreSQL port
//   user: process.env.USER || 'my_user',         // Database username
//   password: process.env.PASSWORD ||'my_password', // Database password
//   database: process.env.DATABASE || 'my_database', // Name of the database
// });

// export default client;

import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',       // Hostname of the PostgreSQL server
  port: process.env.DB_PORT || 5432,              // Default PostgreSQL port
  user: process.env.DB_USER || 'postgres',         // Database username
  password: process.env.DB_PASSWORD || 'sarb1928', // Database password
  database: process.env.DB_DATABASE || 'HmmBro', // Name of the database
  max: 20, // number of clients in pool
  idleTimeoutMillis: 30000, // close idle clients after 30s
  connectionTimeoutMillis: 2000, // return error after 2s if no connection
});

const getAllUsersQuery = async () => {
  const res = await pool.query('SELECT * FROM users');
  return res.rows;
}

const insertNewUserQuery = async (username, email, password, phone, pic) => {
  await pool.query('INSERT INTO users (username, email, password,phone, pic) VALUES ($1, $2, $3, $4, $5)', [username, email, password, phone, pic]);
}

const findUserByUsernameQuery = async (email) => {
  const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0];
}

const updateUserQuery = async (userId, fields, values) => {
  // console.log([...values,userId]);
  
  const update = await pool.query(`UPDATE users 
   SET ${fields.join(', ')} 
   WHERE id = $${values.length + 1}
   RETURNING *;`,
    [...values, userId]);
  return update.rows[0];
}

const deactivateAccQuery = async (id) =>{
  await pool.query(
  `UPDATE users 
   SET active = false 
   WHERE id = $1 
   RETURNING *;`,
  [id]
);
}


export default pool;

export {
  getAllUsersQuery,
  insertNewUserQuery,
  findUserByUsernameQuery,
  updateUserQuery,
  deactivateAccQuery
};

// Example query
// const result = await pool.query("SELECT * FROM products");
// console.log(result.rows);
