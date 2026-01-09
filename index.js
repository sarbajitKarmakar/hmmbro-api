import express from 'express';
import bodyParser from 'body-parser';
import dotenv from "dotenv";
import cors from 'cors';

import users from './routes/api.routes.user.js';
import admins from './routes/api.routes.admin.js';
import products from './routes/api.routes.products.js';
import auth from './routes/api.routes.auth.js';

import apiAuthenticator from './middleware/apiAuthenticator.js';
import authenticateUser from './middleware/authenticateUser.js';
import checkAdmin from './middleware/checkAdmin.js';
// import pool from './model/connection'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


// Body parser middleware
app.use(cors()); //to be update
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Example route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use('/api/auth', apiAuthenticator, auth);

app.use('/api/user',apiAuthenticator, authenticateUser, users); 

app.use('/api/admin/user', apiAuthenticator, authenticateUser, checkAdmin, admins);

app.use('/api/products', apiAuthenticator, products);

  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});