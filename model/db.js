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

// import { Pool } from "pg";

// const pool = new Pool({
//   host: process.env.DB_HOST || 'localhost',       // Hostname of the PostgreSQL server
//   port: process.env.DB_PORT || 5432,              // Default PostgreSQL port
//   user: process.env.DB_USER || 'postgres',         // Database username
//   password: process.env.DB_PASSWORD || 'sarb1928', // Database password
//   database: process.env.DB || 'HmmBro', // Name of the database
//   max: 20, // number of clients in pool
//   idleTimeoutMillis: 30000, // close idle clients after 30s
//   connectionTimeoutMillis: 2000, // return error after 2s if no connection
// });


import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const config = connectionString 
    ? { 
        connectionString,
        // Crucial for Render's managed PostgreSQL to work with Node.js
        ssl: { rejectUnauthorized: false } 
    } 
    : {
        // Your existing local fallback logic
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'sarb1928',
        database: process.env.DB || 'HmmBro',
        // Other pool settings...
        max: 20, 
        idleTimeoutMillis: 30000, 
        connectionTimeoutMillis: 2000,
    };

const pool = new Pool(config);

// ... rest of your code ...

// ------------------operations on user ------------------

const getAllUsersQuery = async (limit, offset) => {
  const res = await pool.query('SELECT u.id, u.username, u.email, u.phone, u.active, u.role, c.total_count FROM (SELECT * FROM users WHERE role = $3 ORDER BY id DESC LIMIT $1 OFFSET $2) u CROSS JOIN (SELECT COUNT(*) AS total_count  FROM users WHERE role = $3) c;', [limit, offset, 'user']);
  return res.rows;
}

const insertNewUserQuery = async (username, email, password, phone, pic) => {
  const insertedUser = await pool.query('INSERT INTO users (username, email, password,phone, pic) VALUES ($1, $2, $3, $4, $5) RETURNING *', [username, email, password, phone, pic]);
  return insertedUser.rows[0];
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

const deactivateAccQuery = async (id) => {
  await pool.query(
    `UPDATE users 
   SET active = false 
   WHERE id = $1 
   RETURNING *;`,
    [id]
  );
}

const activateAccQuery = async (id) => {
  await pool.query(
    `UPDATE users 
   SET active = true 
   WHERE id = $1 
   RETURNING *;`,
    [id]
  );
}

const getSpecificUserQuery = async (id) => {
  const res = await pool.query('SELECT * FROM users WHERE id = $1 RETURNING *', [id]);
  return res.rows[0];
}

const deleteUserQuery = async (id) => {
  await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
}

const searchUserQuery = async (value, limit, offset) =>{
  const searchValue = await pool.query(`SELECT *, COUNT(*) OVER() AS total_count FROM users WHERE username ILIKE $1 LIMIT $2 OFFSET $3`, [`%${value}%`, limit, offset]);
  
  
  return searchValue.rows;
}

// -------------------operations on user------------------- 

//-------------------operation on products-------------------

// do joining with varient
const getAllProductsQuery = async (limit, offset) => {
  const res = await pool.query('SELECT p.id,p.name,p.price,p.prod_img,p.isdelete,p.stock,p.ispublish,v.variant_ml as ml,v.description, COUNT(*) OVER() AS total_count FROM products p LEFT JOIN variant v ON p.variant_id = v.id ORDER BY p.name LIMIT $1 OFFSET $2', [limit, offset]);
  return res.rows;
}

const getProductQuery = async (id) => {
  const res = await pool.query('SELECT p.id,p.name,p.price,p.prod_img,p.isdelete,p.stock,p.ispublish,v.variant_ml as ml,v.description FROM products p LEFT JOIN variant v ON p.variant_id = v.id WHERE p.id = $1', [id])
  return res.rows[0];
}

const insertNewProductQuery = async (name, price, prod_img, status, isdelete, stock, variant_id) => {
  const instertedValue = await pool.query('INSERT INTO products (name, price, prod_img, status, isdelete, stock, variant_id) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, price, prod_img, status, isdelete, stock, variant_id]);
  return instertedValue.rows[0];
}

const updateProductQuery = async (id, feild, value) => {
  const updatedProduct = await pool.query(`UPDATE products 
    SET ${feild.join(",")} WHERE id = $${value.length + 1}
    RETURNING *`, [...value, id])

  return updatedProduct.rows[0];
}

const deleteProductQuery = async (id) => {
  const deleted = await pool.query("UPDATE products SET isdelete = true, ispublish = false WHERE id = $1 RETURNING *", [id]);
  return deleted.rows[0];
}

const parmanentDeletedProductQuery = async (id) => {
  const parmanentDelete = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
  return parmanentDelete.rows[0];
}

const publishProductQuery = async (id) => {
  const published = await pool.query("UPDATE products SET ispublish = true WHERE id = $1 RETURNING *", [id]);
  return published.rows[0];
}

const unPublishProductQuery = async (id) => {
  const unPublished = await pool.query("UPDATE products SET ispublish = false WHERE id = $1 RETURNING *", [id]);
  return unPublished.rows[0];
}

const searchProductQuery = async (value, limit, offset) =>{
  const searchValue = await pool.query(`SELECT p.id,p.name,p.price,p.prod_img,p.isdelete,p.stock,p.ispublish,v.variant_ml as ml,v.description, COUNT(*) OVER() AS total_count FROM products p LEFT JOIN variant v ON p.variant_id = v.id WHERE p.name ILIKE $1 ORDER BY p.name LIMIT $2 OFFSET $3`, [`%${value}%`, limit, offset]);
  
  
  return searchValue.rows;
}
//-------------------operation on products-------------------


export default pool;

export {
  getAllUsersQuery,
  insertNewUserQuery,
  findUserByUsernameQuery,
  updateUserQuery,
  deactivateAccQuery,
  activateAccQuery,
  getSpecificUserQuery,
  deleteUserQuery,
  searchUserQuery,
  getAllProductsQuery,
  getProductQuery,
  insertNewProductQuery,
  updateProductQuery,
  deleteProductQuery,
  parmanentDeletedProductQuery,
  publishProductQuery,
  unPublishProductQuery,
  searchProductQuery
};

// Example query
// const result = await pool.query("SELECT * FROM products");
// console.log(result.rows);
