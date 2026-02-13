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
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const config = connectionString
  ? {
    connectionString,
    // Crucial for Render's managed PostgreSQL to work with Node.js
    ssl: { rejectUnauthorized: false }
  }
  : {
    // Your existing local fallback logic
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    // Other pool settings...
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

const pool = new Pool(config);


// operations on auth

const insertOtpQuery = async (client, user_id, email, otpHash, otp_type, expiresAt) => {
  const result = await client.query(`
    INSERT INTO user_otps
    (user_id, contact, otp_code, otp_type, expires_at)
    VALUES
    ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [user_id, email, otpHash, otp_type, expiresAt]
  );
  return result.rows[0];
}

const findLatestValidQuery = async (client, contact, otp_type, otpHash) => {
  const result = await client.query(
    `
      SELECT id, user_id
      FROM user_otps
      WHERE contact = $1
        AND otp_type = $2
        AND otp_code = $3
        AND is_verified = false
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
      `,
    [contact, otp_type, otpHash]
  );
  return result.rows[0];
}


const markOtpAsVerifiedQuery = async (client, otpId, userId) => {
  await client.query(
    `
      UPDATE user_otps
      SET is_verified = true,
          verified_at = NOW()
      WHERE id = $1
      `,
    [otpId]
  );

  await client.query(
    `UPDATE users SET active = true WHERE id = $1`,
    [userId]
  );
}


// ------------------operations on user ------------------


const getAllUsersQuery = async (limit, offset) => {

  const res = await pool.query(`SELECT 
    id, 
    username, 
    email, 
    phone, 
    avatar,
	role,
	active,
    registered_at,
	deleted_at,
	updated_at
    FROM users WHERE role = $3 AND deleted_at IS NULL
	order by registered_at desc
  LIMIT $1 OFFSET $2;`,
    [limit, offset, 'user']);

  const count = await pool.query(`SELECT COUNT(*) AS total_count FROM users WHERE role = $1;`, ['user']);
  return { res: res.rows, total_count: count.rows[0].total_count };
}

const insertNewUserQuery = async (username, email, password, phone, imageUrl, publicId, active) => {
  const insertedUser = await pool.query(`INSERT INTO users 
    (username, email, password,phone, avatar, avatar_id, active)
     VALUES ($1, $2, $3, $4, $5,$6,$7) 
     RETURNING id, username, email, phone, avatar, avatar_id`,
    [username, email, password, phone, imageUrl, publicId, active]);
  return insertedUser.rows[0];
}

const findUserByEmailQuery = async (email) => {
  const res = await pool.query('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
  return res.rows[0];
}

const findUserByUserIdQuery = async (id) => {
  const res = await pool.query('SELECT id, role, active, avatar, avatar_id FROM users WHERE id = $1', [id]);
  return res.rows[0];
}

const updateUserQuery = async (userId, fields, values) => {
  // console.log([...values,userId]);
  const update = await pool.query(`UPDATE users 
   SET ${fields.join(', ')} 
   WHERE id = $${values.length + 1}
   RETURNING id,username, email, phone, avatar, active;`,
    [...values, userId]);
  return update.rows[0];
}

const deactivateAccQuery = async (id) => {
  await pool.query(
    `UPDATE users 
   SET active = false 
   WHERE id = $1 
   RETURNING username, avatar, active;`,
    [id]
  );
}

const activateAccQuery = async (id) => {

  const result = await pool.query(
    `UPDATE users 
   SET active = true 
   WHERE id = $1 
   RETURNING username, avatar, active;;`,
    [id]
  );
  return result.rows[0];
}

const getSpecificUserQuery = async (id) => {
  const res = await pool.query('SELECT id,username,email,phone,avatar,role,active FROM users WHERE id = $1', [id]);
  return res.rows[0];
}

const deleteUserQuery = async (id) => {
  const res = await pool.query('UPDATE users SET deleted_at = NOW() WHERE id = $1 RETURNING *', [id]);
  return res.rows[0];
}

const searchUserQuery = async (value, limit, offset) => {
  const searchValue = await pool.query(`
SELECT *
FROM (
  SELECT 
  id, 
    username, 
    email, 
    phone, 
    avatar,
	  role,
	  active,
    registered_at,
	  deleted_at,
	  updated_at
  FROM users
  ORDER BY registered_at DESC
  LIMIT $2 OFFSET $3
) page_window
WHERE role = 'user'
  AND (
  CAST(phone AS TEXT) ILIKE $1 OR
  CAST(id AS TEXT) ILIKE $1 OR
  username ILIKE $1 OR
  email ILIKE $1
)
ORDER BY registered_at DESC;
`, [`%${value}%`, limit, offset]);

const total_count = await pool.query(`
    SELECT COUNT(*) AS total_count
    FROM users
    WHERE role = 'user'
    `)

  return { res: searchValue.rows, total_count: total_count.rows[0].total_count };
}

// -------------------operations on user------------------- 

//-------------------operation on products-------------------

// do joining with varient
const getAllProductsVariantAdminQuery = async (limit, offset) => {
  const res = await pool.query(`
SELECT 
p.id as product_id,
pv.id as productVariant_id,
v.id as variant_id,
pv.sku,
p.name,
v.variant_ml as ml,
p.type,
pv.price,
pv.stock,
pv.img_urls,
pv.published_at,
pv.created_at,
pv.updated_at,
pv.delete_at
FROM products p
LEFT JOIN product_variants pv ON pv.product_id = p.id
LEFT JOIN variant v ON pv.variant_id = v.id
WHERE pv.delete_at IS NULL

ORDER BY pv.id
LIMIT $1 OFFSET $2;

`,

    [limit, offset]);

  const count = await pool.query(`
select count(*) as total_count from product_variants
`,);

  return { res: res.rows, total_count: count.rows[0].total_count };
}

const getAllDeletedProductsAdminQuery = async (limit, offset) => {
  const res = await pool.query(`
    
    SELECT 
p.id as product_id,
pv.id as productVariant_id,
v.id as variant_id,
pv.sku,
p.name,
v.variant_ml as ml,
p.type,
pv.price,
pv.stock,
pv.img_urls,
pv.published_at,
pv.created_at,
pv.updated_at,
pv.delete_at
FROM products p
LEFT JOIN product_variants pv ON pv.product_id = p.id
LEFT JOIN variant v ON pv.variant_id = v.id
WHERE pv.delete_at IS NOT NULL
LIMIT $1 OFFSET $2;`, [limit, offset]);
  const count = await pool.query(`
select count(*) as total_count from product_variants
WHERE delete_at IS NOT NULL
`,);

  return { res: res.rows, total_count: count.rows[0].total_count };

}

const getAllProductsAdminQuery = async (limit, offset) => {
  const res = await pool.query('SELECT * FROM products WHERE delete_at IS NULL LIMIT $1 OFFSET $2;', [limit, offset]);
  return res.rows;
}

const getSpecificProductAdminQuery = async (id) => {
  const res = await pool.query(`SELECT * FROM products WHERE id = $1`, [id]);
  return res.rows[0];
}

export const getSpecificProductByNameQuery = async (name) => {
  const res = await pool.query(`SELECT * FROM products 
    WHERE name ilike $1
    `, [name])
  return res.rows[0];
}

export const getAllProductVariantAdminQuery = async (limit, offset) =>{
  const res = await pool.query(`
    SELECT 
p.id as product_id,
pv.id as productVariant_id,
v.id as variant_id,
pv.sku,
p.name,
v.variant_ml as ml,
img.image_url,
img.image_id,
p.type,
pv.price,
pv.stock,
pv.published_at,
pv.created_at,
pv.updated_at,
pv.delete_at
FROM products p
LEFT JOIN product_variants pv ON pv.product_id = p.id
LEFT JOIN variant v ON pv.variant_id = v.id
LEFT JOIN product_images img on pv.id = img.product_variant_id
WHERE img.isprimary = true AND pv.delete_at IS NULL
LIMIT $1 OFFSET $2 `,
[limit, offset]
)

const count = await pool.query(`SELECT COUNT(*) AS total_count FROM product_variants WHERE delete_at IS NULL;`);
return {res: res.rows, total_count: count.rows[0].total_count};
}

const getSpecificProductVariantAdminQuery = async (id) => {
  const prod = await pool.query(`
SELECT 
pv.id as id,
pv.sku,
p.name,
v.variant_ml as ml,
p.type,
pv.price,
pv.stock,
pv.published_at,
pv.created_at,
pv.updated_at,
pv.delete_at
FROM products p
LEFT JOIN product_variants pv ON pv.product_id = p.id
LEFT JOIN variant v ON pv.variant_id = v.id
WHERE pv.id = $1
`, [id]);
const img = await pool.query(`
  SELECT id, image_url, image_id, isprimary from product_images where product_variant_id = $1
  `,[prod.rows[0].id]);

  return {data: {...prod.rows[0], images:img.rows}};
}


const insertNewProductQuery = async (client, name, type, description, productCode) => {
  const res = await client.query(
    `INSERT INTO products (name, type , description, product_code)
                   VALUES ($1, $2, $3, $4)
                   RETURNING *`,
    [name, type, description, productCode]
  );

  return res.rows[0];
}

const insertNewProductVariant = async (client, payload) => {
  const queryText = payload.map((_,i) => `
  (
  $${i*9+1},
  $${i*9+2},
  $${i*9+3},
  $${i*9+4},
  $${i*9+5},
  $${i*9+6},
  $${i*9+7},
  $${i*9+8},
  $${i*9+9}
  )`)
  .join(', ');
  // productId, variant.variant_id, variant.price, variant.stock, sku, slug
  const res =  await client.query(
    `INSERT INTO 
    product_variants 
    (
    product_id, 
    variant_id, 
    price, 
    stock, 
    sku, 
    slug,
    seoTitle, 
    seoDescription, 
    seoTags
    )
    VALUES ${queryText} RETURNING id`,
    payload.flat()
  );

  return res.rows;
}

const updateProductQuery = async (id, feild, value) => {
  const updatedProduct = await pool.query(`UPDATE products 
    SET ${feild.join(",")} WHERE id = $${value.length + 1}
    RETURNING *`, [...value, id])

  return updatedProduct.rows[0];
}

const updateProductVariantsQuery = async (id, feild, value) => {
  const updatedProduct = await pool.query(`UPDATE product_variants 
    SET ${feild.join(",")} WHERE id = $${value.length + 1}
    RETURNING *`, [...value, id])

  return updatedProduct.rows[0];
}

const deleteProductQuery = async (id) => {
  const deleted = await pool.query(`
UPDATE products
SET delete_at = NOW()
WHERE id = $1
  AND delete_at IS NULL
RETURNING *;

     `, [id]);
  return deleted.rows[0];
}

const deleteProductVariantOnProductDeleteQuery = async (id) => {
  const deleted = await pool.query(`
    UPDATE product_variants 
    SET delete_at = NOW(), published_at= NULL 
    WHERE product_id = $1 AND delete_at IS NULL RETURNING *
     `, [id]);
  return deleted.rows;
}

const deleteProductVariantQuery = async (id) => {
  const deleted = await pool.query(`
    UPDATE product_variants 
    SET delete_at = NOW(), published_at= NULL 
    WHERE id = $1 AND delete_at IS NULL RETURNING *
     `, [id]);
  return deleted.rows[0];
}

const recoverProductQuery = async (id) => {
  const result = await pool.query(`
  UPDATE products 
  Set delete_at = NULL 
  WHERE id = $1 AND delete_at IS NOT NULL RETURNING *;
    `, [id]);
  return result.rows[0];
}

const recoverProductVariantOnProductDeleteQuery = async (id) => {
  const recovered = await pool.query(`
    UPDATE product_variants 
    SET delete_at = NULL
    WHERE product_id = $1 AND delete_at IS NOT NULL RETURNING *
     `, [id]);
  return recovered.rows[0];
}


const recoverProductVariantQuery = async (id) => {
  const result = await pool.query(`
  UPDATE product_variants 
  SET delete_at = NULL 
  WHERE id = $1 AND delete_at IS NOT NULL RETURNING *
    `, [id]);
  return result.rows[0];
}

const parmanentDeletedProductQuery = async (id) => {
  const parmanentDelete = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
  return parmanentDelete.rows[0];
}

const publishProductQuery = async (id) => {
  const published = await pool.query("UPDATE product_variants SET published_at = NOW() WHERE id = $1 AND published_at IS NULL RETURNING *", [id]);
  return published.rows[0];
}

const unPublishProductQuery = async (id) => {
  const unPublished = await pool.query("UPDATE product_variants SET published_at = NULL WHERE id = $1 AND published_at IS NOT NULL RETURNING *", [id]);
  return unPublished.rows[0];
}

const searchProductQuery = async (value, limit, offset) => {
  const searchValue = await pool.query(`
    SELECT 
p.id as product_id,
pv.id as productVariant_id,
v.id as variant_id,
pv.sku,
p.name,
v.variant_ml as ml,
p.type,
pv.price,
pv.stock,
pv.img_urls,
pv.published_at,
pv.created_at,
pv.updated_at,
pv.delete_at
FROM products p
LEFT JOIN product_variants pv ON pv.product_id = p.id
LEFT JOIN variant v ON pv.variant_id = v.id
WHERE p.name ILIKE $1 OR pv.sku ILIKE $1
ORDER BY p.name
     LIMIT $2 OFFSET $3`, [`%${value}%`, limit, offset]);


  return searchValue.rows;
}

export const getVariantDetails = async (client, variant_ml_arr) => {
  const res = await client.query(`
    SELECT * FROM variant WHERE variant_ml = ANY ($1)`, [variant_ml_arr]);
  return res.rows;
} 

const getAllVariantsQuery = async () => {
  const res = await pool.query('SELECT * FROM variant;');
  return res.rows;
}

const createVariantQuery = async (variant_ml) => {
  await pool.query('INSERT INTO variant (variant_ml) VALUES ($1);', [variant_ml]);
}

export const productImageUploadQuery = async (client, imgpayload, queryText) =>{
  // productVariantId, result.url, result.publicId
  await client.query(`
    INSERT INTO product_images
    (product_variant_id, image_url, image_id, isprimary)
    VALUES
    ${queryText}
  `, imgpayload)
}

export const deleteImageQuery = async (client, imageIds, id) =>{
  const result = await client.query(`
    DELETE FROM product_images WHERE id = ANY($1::int[]) AND product_variant_id = $2  RETURNING *
    `,[imageIds, id]);
  return result.rows;
}
//-------------------operation on products-------------------


export default pool;

export {
  insertOtpQuery,
  findLatestValidQuery,
  markOtpAsVerifiedQuery,
  getAllUsersQuery,
  insertNewUserQuery,
  findUserByEmailQuery,
  findUserByUserIdQuery,
  updateUserQuery,
  deactivateAccQuery,
  activateAccQuery,
  getSpecificUserQuery,
  deleteUserQuery,
  searchUserQuery,
  getAllProductsAdminQuery,
  getAllProductsVariantAdminQuery,
  getAllDeletedProductsAdminQuery,
  getSpecificProductAdminQuery,
  getSpecificProductVariantAdminQuery,
  insertNewProductQuery,
  insertNewProductVariant,
  updateProductQuery,
  updateProductVariantsQuery,
  deleteProductQuery,
  deleteProductVariantOnProductDeleteQuery,
  deleteProductVariantQuery,
  recoverProductQuery,
  recoverProductVariantOnProductDeleteQuery,
  recoverProductVariantQuery,
  parmanentDeletedProductQuery,
  publishProductQuery,
  unPublishProductQuery,
  searchProductQuery,
  getAllVariantsQuery,
  createVariantQuery
};

// Example query
// const result = await pool.query("SELECT * FROM products");
// console.log(result.rows);
